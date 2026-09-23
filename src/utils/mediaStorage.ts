/**
 * IndexedDB storage for video and PDF files uploaded from user device.
 * Bypasses localStorage 5MB quota restrictions and handles files of any size.
 */

const DB_NAME = 'shiksha_study_media_db_v2';
const VIDEO_STORE = 'videos';
const PDF_STORE = 'pdfs';
const DB_VERSION = 2;

// In-memory cache of resolved Object URLs to avoid re-generating blobs frequently
const objectUrlCache = new Map<string, string>();

/**
 * Initializes and gets the IndexedDB instance
 */
const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(VIDEO_STORE)) {
        db.createObjectStore(VIDEO_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(PDF_STORE)) {
        db.createObjectStore(PDF_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Converts a base64 Data URL (e.g. data:application/pdf;base64,...) to a standard Blob
 */
export const dataUrlToBlob = (dataUrl: string): Blob => {
  try {
    const parts = dataUrl.split(';base64,');
    const contentType = parts[0].split(':')[1] || 'application/pdf';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);
    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], { type: contentType });
  } catch (err) {
    console.warn('Failed to convert dataUrl to Blob:', err);
    return new Blob([], { type: 'application/pdf' });
  }
};

/**
 * Stores a video file/blob in IndexedDB
 */
export const saveVideoToStorage = async (id: string, file: File | Blob): Promise<string> => {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(VIDEO_STORE, 'readwrite');
      const store = tx.objectStore(VIDEO_STORE);

      const record = {
        id,
        blob: file,
        name: (file as File).name || 'gallery_video.mp4',
        type: file.type || 'video/mp4',
        size: file.size,
        updatedAt: Date.now(),
      };

      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    const objUrl = URL.createObjectURL(file);
    objectUrlCache.set(id, objUrl);

    return `idb://video/${id}`;
  } catch (error) {
    console.error('Failed to store video in IndexedDB:', error);
    const fallbackUrl = URL.createObjectURL(file);
    objectUrlCache.set(id, fallbackUrl);
    return `idb://video/${id}`;
  }
};

/**
 * Resolves a video URL. If it's stored in IndexedDB (starts with 'idb://video/'),
 * it fetches the Blob and returns an active playable Object URL.
 */
export const resolveVideoUrl = async (url: string): Promise<string> => {
  if (!url) return '';
  
  if (!url.startsWith('idb://video/')) {
    return url;
  }

  const id = url.replace('idb://video/', '');

  if (objectUrlCache.has(id)) {
    const cached = objectUrlCache.get(id);
    if (cached) return cached;
  }

  try {
    const db = await getDB();
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(VIDEO_STORE, 'readonly');
      const store = tx.objectStore(VIDEO_STORE);
      const req = store.get(id);

      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });

    if (blob) {
      const objUrl = URL.createObjectURL(blob);
      objectUrlCache.set(id, objUrl);
      return objUrl;
    }
  } catch (error) {
    console.error('Failed to retrieve video from IndexedDB:', error);
  }

  return url;
};

/**
 * Deletes a video file from IndexedDB
 */
export const deleteVideoFromStorage = async (urlOrId: string): Promise<void> => {
  try {
    const id = urlOrId.startsWith('idb://video/') ? urlOrId.replace('idb://video/', '') : urlOrId;
    if (objectUrlCache.has(id)) {
      const cached = objectUrlCache.get(id);
      if (cached) URL.revokeObjectURL(cached);
      objectUrlCache.delete(id);
    }

    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(VIDEO_STORE, 'readwrite');
      const store = tx.objectStore(VIDEO_STORE);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error('Failed to delete video from storage:', error);
  }
};

/**
 * Stores a PDF file or blob in IndexedDB
 */
export const savePdfToStorage = async (id: string, file: File | Blob): Promise<string> => {
  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PDF_STORE, 'readwrite');
      const store = tx.objectStore(PDF_STORE);

      const record = {
        id,
        blob: file,
        name: (file as File).name || 'document.pdf',
        type: file.type || 'application/pdf',
        size: file.size,
        updatedAt: Date.now(),
      };

      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    const objUrl = URL.createObjectURL(file);
    objectUrlCache.set(`pdf_${id}`, objUrl);

    return `idb://pdf/${id}`;
  } catch (error) {
    console.error('Failed to store PDF in IndexedDB:', error);
    const fallbackUrl = URL.createObjectURL(file);
    objectUrlCache.set(`pdf_${id}`, fallbackUrl);
    return `idb://pdf/${id}`;
  }
};

/**
 * Resolves a PDF URL.
 * - If stored in IndexedDB ('idb://pdf/...'): fetches Blob and creates Blob URL
 * - If base64 data URI ('data:application/pdf...'): converts to Blob URL so browsers don't block it!
 * - If external URL: returns as is
 */
export const resolvePdfUrl = async (url: string): Promise<string> => {
  if (!url) return '';

  // If it's already an active Blob URL, return it
  if (url.startsWith('blob:')) {
    return url;
  }

  // If it's a data URL, convert to Blob URL to bypass browser iframe data: restrictions
  if (url.startsWith('data:application/pdf') || url.startsWith('data:;base64,')) {
    const cacheKey = `data_${url.slice(0, 50)}_${url.length}`;
    if (objectUrlCache.has(cacheKey)) {
      return objectUrlCache.get(cacheKey)!;
    }
    const blob = dataUrlToBlob(url);
    const objUrl = URL.createObjectURL(blob);
    objectUrlCache.set(cacheKey, objUrl);
    return objUrl;
  }

  // If stored in IndexedDB
  if (url.startsWith('idb://pdf/')) {
    const id = url.replace('idb://pdf/', '');
    const cacheKey = `pdf_${id}`;

    if (objectUrlCache.has(cacheKey)) {
      const cached = objectUrlCache.get(cacheKey);
      if (cached) return cached;
    }

    try {
      const db = await getDB();
      const blob = await new Promise<Blob | null>((resolve, reject) => {
        const tx = db.transaction(PDF_STORE, 'readonly');
        const store = tx.objectStore(PDF_STORE);
        const req = store.get(id);

        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            resolve(req.result.blob);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => reject(req.error);
      });

      if (blob) {
        const objUrl = URL.createObjectURL(blob);
        objectUrlCache.set(cacheKey, objUrl);
        return objUrl;
      }
    } catch (error) {
      console.error('Failed to retrieve PDF from IndexedDB:', error);
    }
  }

  return url;
};

/**
 * Deletes a PDF file from IndexedDB
 */
export const deletePdfFromStorage = async (urlOrId: string): Promise<void> => {
  try {
    const id = urlOrId.startsWith('idb://pdf/') ? urlOrId.replace('idb://pdf/', '') : urlOrId;
    const cacheKey = `pdf_${id}`;
    if (objectUrlCache.has(cacheKey)) {
      const cached = objectUrlCache.get(cacheKey);
      if (cached) URL.revokeObjectURL(cached);
      objectUrlCache.delete(cacheKey);
    }

    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PDF_STORE, 'readwrite');
      const store = tx.objectStore(PDF_STORE);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (error) {
    console.error('Failed to delete PDF from storage:', error);
  }
};

/**
 * Generates an automatic video thumbnail and extracts exact duration
 * directly from the selected video file in browser!
 */
export const generateVideoMetadata = (file: File): Promise<{
  thumbnailUrl: string;
  durationMinutes: number;
  durationFormatted: string;
}> => {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const objUrl = URL.createObjectURL(file);
      video.src = objUrl;

      let hasResolved = false;

      const finish = (thumb: string, durSec: number) => {
        if (hasResolved) return;
        hasResolved = true;
        URL.revokeObjectURL(objUrl);

        const durMin = Math.max(1, Math.round(durSec / 60));
        let durationFormatted = `${durMin} min`;
        if (durMin >= 60) {
          const hrs = Math.floor(durMin / 60);
          const remMins = durMin % 60;
          durationFormatted = remMins > 0 ? `${hrs} hr ${remMins} min` : `${hrs} hr`;
        }

        resolve({
          thumbnailUrl: thumb,
          durationMinutes: durMin,
          durationFormatted,
        });
      };

      const timeoutId = setTimeout(() => {
        finish('', 30 * 60);
      }, 5000);

      video.onloadedmetadata = () => {
        const seekTime = Math.min(1.5, Math.max(0.1, video.duration * 0.15));
        video.currentTime = seekTime;
      };

      video.onseeked = () => {
        clearTimeout(timeoutId);
        try {
          const canvas = document.createElement('canvas');
          const targetWidth = 480;
          const aspect = (video.videoHeight || 9) / (video.videoWidth || 16);
          canvas.width = targetWidth;
          canvas.height = Math.round(targetWidth * aspect);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumb = canvas.toDataURL('image/jpeg', 0.85);
            finish(thumb, video.duration || 60);
            return;
          }
        } catch (e) {
          console.warn('Canvas thumbnail capture failed:', e);
        }
        finish('', video.duration || 60);
      };

      video.onerror = () => {
        clearTimeout(timeoutId);
        finish('', 30 * 60);
      };
    } catch (e) {
      resolve({
        thumbnailUrl: '',
        durationMinutes: 30,
        durationFormatted: '30 min',
      });
    }
  });
};
