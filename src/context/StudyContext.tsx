import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  Batch, 
  Chapter, 
  ColorTheme, 
  Language, 
  PdfCategory, 
  PdfResource, 
  VideoNote, 
  VideoResource,
  AttachedPdf,
  UserRole,
  ThemeMode,
  BookmarkItem,
  RecentActivity
} from '../types';
import { initialBatches } from '../data/initialData';
import { extractYoutubeId } from '../utils/helpers';
import { deleteVideoFromStorage } from '../utils/mediaStorage';

const STORAGE_KEY = 'shiksha_study_batches_v2';
const LANG_STORAGE_KEY = 'shiksha_study_lang_v1';
const THEME_STORAGE_KEY = 'shiksha_study_theme_v1';
const ROLE_STORAGE_KEY = 'shiksha_study_role_v1';
const BOOKMARKS_STORAGE_KEY = 'shiksha_study_bookmarks_v1';
const RECENTS_STORAGE_KEY = 'shiksha_study_recents_v1';

interface StudyContextType {
  batches: Batch[];
  activeBatchId: string | null;
  activeChapterId: string | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  setActiveBatchId: (id: string | null) => void;
  setActiveChapterId: (id: string | null) => void;

  // Role & Theme
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;

  // Student features: Bookmarks & Recents
  bookmarks: BookmarkItem[];
  toggleBookmark: (item: Omit<BookmarkItem, 'id' | 'addedAt'> & { id?: string }) => void;
  isBookmarked: (type: 'video' | 'pdf', resourceId: string) => boolean;
  recentActivities: RecentActivity[];
  logRecentActivity: (activity: Omit<RecentActivity, 'timestamp'>) => void;
  
  // Modals & Active Viewers
  isAddBatchOpen: boolean;
  setIsAddBatchOpen: (open: boolean) => void;
  editingBatch: Batch | null;
  setEditingBatch: (batch: Batch | null) => void;

  isAddChapterOpen: boolean;
  setIsAddChapterOpen: (open: boolean) => void;
  targetBatchForChapter: string | null;
  setTargetBatchForChapter: (batchId: string | null) => void;
  editingChapter: Chapter | null;
  setEditingChapter: (chap: Chapter | null) => void;

  isAddVideoOpen: boolean;
  setIsAddVideoOpen: (open: boolean) => void;
  targetChapterForVideo: { batchId: string; chapterId: string } | null;
  setTargetChapterForVideo: (val: { batchId: string; chapterId: string } | null) => void;

  isAddPdfOpen: boolean;
  setIsAddPdfOpen: (open: boolean) => void;
  targetChapterForPdf: { batchId: string; chapterId: string } | null;
  setTargetChapterForPdf: (val: { batchId: string; chapterId: string } | null) => void;

  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  activeVideoPlayer: VideoResource | null;
  setActiveVideoPlayer: (video: VideoResource | null) => void;

  activePdfViewer: PdfResource | null;
  setActivePdfViewer: (pdf: PdfResource | null) => void;

  // Actions
  createBatch: (data: {
    title: string;
    subject: string;
    targetExam: string;
    instructor: string;
    description: string;
    colorTheme: ColorTheme;
    imageUrl?: string;
  }) => string;
  updateBatch: (id: string, data: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;

  createChapter: (batchId: string, data: {
    title: string;
    chapterNumber?: number;
    description?: string;
    imageUrl?: string;
  }) => string;
  updateChapter: (batchId: string, chapterId: string, data: Partial<Chapter>) => void;
  deleteChapter: (batchId: string, chapterId: string) => void;
  toggleChapterCompletion: (batchId: string, chapterId: string) => void;

  createVideo: (batchId: string, chapterId: string, data: {
    title: string;
    videoUrl: string;
    thumbnailUrl?: string;
    durationMinutes?: number;
    durationFormatted?: string;
    instructor?: string;
    description?: string;
    attachedPdfs?: AttachedPdf[];
    videoType?: 'youtube' | 'direct' | 'embed' | 'file';
    localFileName?: string;
    fileSizeBytes?: number;
    fileSizeFormatted?: string;
  }) => string;
  updateVideo: (batchId: string, chapterId: string, videoId: string, data: Partial<VideoResource>) => void;
  deleteVideo: (batchId: string, chapterId: string, videoId: string) => void;
  toggleVideoCompletion: (batchId: string, chapterId: string, videoId: string) => void;
  attachPdfToVideo: (batchId: string, chapterId: string, videoId: string, pdf: AttachedPdf) => void;
  removeAttachedPdfFromVideo: (batchId: string, chapterId: string, videoId: string, attachedPdfId: string) => void;
  addVideoNote: (batchId: string, chapterId: string, videoId: string, note: Omit<VideoNote, 'id' | 'createdAt'>) => void;
  deleteVideoNote: (batchId: string, chapterId: string, videoId: string, noteId: string) => void;

  createPdf: (batchId: string, chapterId: string, data: {
    title: string;
    pdfUrl: string;
    coverImageUrl?: string;
    category: PdfCategory;
    fileSizeBytes?: number;
    fileSizeFormatted?: string;
    pageCount?: number;
    description?: string;
    localFileName?: string;
  }) => string;
  updatePdf: (batchId: string, chapterId: string, pdfId: string, data: Partial<PdfResource>) => void;
  deletePdf: (batchId: string, chapterId: string, pdfId: string) => void;
  togglePdfCompletion: (batchId: string, chapterId: string, pdfId: string) => void;
  savePdfNotes: (batchId: string, chapterId: string, pdfId: string, notes: string) => void;

  // Global utilities
  activeBatch: Batch | null;
  activeChapter: Chapter | null;
  stats: {
    totalBatches: number;
    totalChapters: number;
    totalVideos: number;
    totalPdfs: number;
    completedItems: number;
    totalItems: number;
    progressPercentage: number;
  };
  clearAllBatches: () => void;
  resetToDemo: () => void;
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => boolean;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [batches, setBatches] = useState<Batch[]>(() => {
    try {
      // Purge any legacy demo mock data
      localStorage.removeItem('shiksha_study_batches_v1');
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Exclude any legacy sample IDs
          const userCreated = parsed.filter((b: Batch) => !['batch-physics-12', 'batch-maths-jee', 'batch-web-dev'].includes(b.id));
          return userCreated;
        }
      }
    } catch {
      // fallback
    }
    return initialBatches; // which is empty []
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(LANG_STORAGE_KEY);
      if (stored === 'en' || stored === 'hi') return stored;
    } catch {
      // fallback
    }
    return 'hi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  // User Role (Admin / Student)
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    try {
      const stored = localStorage.getItem(ROLE_STORAGE_KEY);
      if (stored === 'admin' || stored === 'student') return stored;
    } catch {
      // fallback
    }
    return 'admin';
  });

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    try {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    } catch (e) {
      console.error(e);
    }
  };

  // Theme Mode (Light / Dark)
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // fallback
    }
    return 'light';
  });

  useEffect(() => {
    try {
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (e) {
      console.error(e);
    }
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const toggleTheme = () => {
    setThemeModeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Bookmarks for students/revision
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const toggleBookmark = (item: Omit<BookmarkItem, 'id' | 'addedAt'> & { id?: string }) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.type === item.type && b.resourceId === item.resourceId);
      const bookmarkId = item.id || `bm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const updated = exists 
        ? prev.filter(b => !(b.type === item.type && b.resourceId === item.resourceId))
        : [{ ...item, id: bookmarkId, addedAt: new Date().toISOString() }, ...prev];
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const isBookmarked = (type: 'video' | 'pdf', resourceId: string) => {
    return bookmarks.some(b => b.type === type && b.resourceId === resourceId);
  };

  // Recent activity tracking (videos watched / pdfs opened)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(() => {
    try {
      const stored = localStorage.getItem(RECENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [];
  });

  const logRecentActivity = (activity: Omit<RecentActivity, 'timestamp'>) => {
    setRecentActivities(prev => {
      // Filter out duplicate if already in recents, then prepend
      const filtered = prev.filter(a => !(a.type === activity.type && a.resourceId === activity.resourceId));
      const updated = [{ ...activity, timestamp: new Date().toISOString() }, ...filtered].slice(0, 10);
      try {
        localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const [activeBatchId, setActiveBatchId] = useState<string | null>(() => {
    return batches.length > 0 ? batches[0].id : null;
  });

  const [activeChapterId, setActiveChapterId] = useState<string | null>(() => {
    if (batches.length > 0 && batches[0].chapters.length > 0) {
      return batches[0].chapters[0].id;
    }
    return null;
  });

  // Modals state
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const [isAddChapterOpen, setIsAddChapterOpen] = useState(false);
  const [targetBatchForChapter, setTargetBatchForChapter] = useState<string | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);

  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [targetChapterForVideo, setTargetChapterForVideo] = useState<{ batchId: string; chapterId: string } | null>(null);

  const [isAddPdfOpen, setIsAddPdfOpen] = useState(false);
  const [targetChapterForPdf, setTargetChapterForPdf] = useState<{ batchId: string; chapterId: string } | null>(null);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeVideoPlayer, setActiveVideoPlayer] = useState<VideoResource | null>(null);
  const [activePdfViewer, setActivePdfViewer] = useState<PdfResource | null>(null);

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
    } catch (e) {
      console.error('Failed to save study batches to localStorage', e);
    }
  }, [batches]);

  // Derived current batch & chapter
  const activeBatch = useMemo(() => {
    return batches.find(b => b.id === activeBatchId) || null;
  }, [batches, activeBatchId]);

  const activeChapter = useMemo(() => {
    if (!activeBatch || !activeChapterId) return null;
    return activeBatch.chapters.find(c => c.id === activeChapterId) || null;
  }, [activeBatch, activeChapterId]);

  // Make sure active chapter stays valid when batch changes
  useEffect(() => {
    if (activeBatch && activeChapterId) {
      const exists = activeBatch.chapters.some(c => c.id === activeChapterId);
      if (!exists) {
        setActiveChapterId(null);
      }
    }
  }, [activeBatchId, activeBatch, activeChapterId]);

  // Overall stats
  const stats = useMemo(() => {
    let totalChapters = 0;
    let totalVideos = 0;
    let totalPdfs = 0;
    let completedItems = 0;

    batches.forEach(b => {
      totalChapters += b.chapters.length;
      b.chapters.forEach(c => {
        totalVideos += c.videos.length;
        totalPdfs += c.pdfs.length;
        c.videos.forEach(v => {
          if (v.isCompleted) completedItems++;
        });
        c.pdfs.forEach(p => {
          if (p.isCompleted) completedItems++;
        });
      });
    });

    const totalItems = totalVideos + totalPdfs;
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      totalBatches: batches.length,
      totalChapters,
      totalVideos,
      totalPdfs,
      completedItems,
      totalItems,
      progressPercentage,
    };
  }, [batches]);

  // Batch actions
  const createBatch = (data: {
    title: string;
    subject: string;
    targetExam: string;
    instructor: string;
    description: string;
    colorTheme: ColorTheme;
    imageUrl?: string;
  }) => {
    const id = `batch-${Date.now()}`;
    const newBatch: Batch = {
      id,
      title: data.title,
      subject: data.subject,
      targetExam: data.targetExam || 'General',
      instructor: data.instructor || 'Instructor',
      description: data.description,
      colorTheme: data.colorTheme,
      imageUrl: data.imageUrl,
      chapters: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBatches(prev => [newBatch, ...prev]);
    setActiveBatchId(id);
    return id;
  };

  const updateBatch = (id: string, data: Partial<Batch>) => {
    setBatches(prev =>
      prev.map(b => (b.id === id ? { ...b, ...data, updatedAt: new Date().toISOString() } : b))
    );
  };

  const deleteBatch = (id: string) => {
    setBatches(prev => {
      const filtered = prev.filter(b => b.id !== id);
      if (activeBatchId === id) {
        setActiveBatchId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  // Chapter actions
  const createChapter = (batchId: string, data: {
    title: string;
    chapterNumber?: number;
    description?: string;
    imageUrl?: string;
  }) => {
    const chapId = `chap-${Date.now()}`;
    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        const currentCount = b.chapters.length;
        const newChap: Chapter = {
          id: chapId,
          batchId,
          chapterNumber: data.chapterNumber ?? currentCount + 1,
          title: data.title,
          description: data.description || '',
          imageUrl: data.imageUrl,
          videos: [],
          pdfs: [],
          createdAt: new Date().toISOString(),
          isCompleted: false,
        };
        return {
          ...b,
          chapters: [...b.chapters, newChap],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    setActiveChapterId(chapId);
    return chapId;
  };

  const updateChapter = (batchId: string, chapterId: string, data: Partial<Chapter>) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => (c.id === chapterId ? { ...c, ...data } : c)),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteChapter = (batchId: string, chapterId: string) => {
    if (activeChapterId === chapterId) {
      setActiveChapterId(null);
    }
    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        const filtered = b.chapters.filter(c => c.id !== chapterId);
        return {
          ...b,
          chapters: filtered,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const toggleChapterCompletion = (batchId: string, chapterId: string) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            const totalItems = c.videos.length + c.pdfs.length;
            const completedItems = 
              c.videos.filter(v => v.isCompleted).length + 
              c.pdfs.filter(p => p.isCompleted).length;
            const currentlyComplete = (totalItems > 0 && completedItems === totalItems) || !!c.isCompleted;
            const nextStatus = !currentlyComplete;

            return {
              ...c,
              isCompleted: nextStatus,
              videos: c.videos.map(v => ({ ...v, isCompleted: nextStatus })),
              pdfs: c.pdfs.map(p => ({ ...p, isCompleted: nextStatus })),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Video actions
  const createVideo = (batchId: string, chapterId: string, data: {
    title: string;
    videoUrl: string;
    thumbnailUrl?: string;
    durationMinutes?: number;
    durationFormatted?: string;
    instructor?: string;
    description?: string;
    attachedPdfs?: AttachedPdf[];
    videoType?: 'youtube' | 'direct' | 'embed' | 'file';
    localFileName?: string;
    fileSizeBytes?: number;
    fileSizeFormatted?: string;
  }) => {
    const videoId = `vid-${Date.now()}`;
    const ytId = extractYoutubeId(data.videoUrl);
    const videoType = data.videoType || (ytId ? 'youtube' : (data.videoUrl.startsWith('idb:') || data.videoUrl.startsWith('blob:') ? 'file' : 'direct'));

    const newVideo: VideoResource = {
      id: videoId,
      batchId,
      chapterId,
      title: data.title,
      videoUrl: data.videoUrl,
      videoType,
      youtubeId: ytId || undefined,
      thumbnailUrl: data.thumbnailUrl,
      durationMinutes: data.durationMinutes || 30,
      durationFormatted: data.durationFormatted || (data.durationMinutes ? `${data.durationMinutes} min` : '30 min'),
      instructor: data.instructor || '',
      description: data.description || '',
      isCompleted: false,
      notes: [],
      attachedPdfs: data.attachedPdfs || [],
      addedAt: new Date().toISOString(),
      localFileName: data.localFileName,
      fileSizeBytes: data.fileSizeBytes,
      fileSizeFormatted: data.fileSizeFormatted,
    };

    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return {
              ...c,
              videos: [...c.videos, newVideo],
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    return videoId;
  };

  const updateVideo = (batchId: string, chapterId: string, videoId: string, data: Partial<VideoResource>) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return {
              ...c,
              videos: c.videos.map(v => (v.id === videoId ? { ...v, ...data } : v)),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteVideo = (batchId: string, chapterId: string, videoId: string) => {
    // Clean up indexedDB stored video file if present
    const batch = batches.find(b => b.id === batchId);
    const chap = batch?.chapters.find(c => c.id === chapterId);
    const vid = chap?.videos.find(v => v.id === videoId);
    if (vid?.videoUrl?.startsWith('idb://video/')) {
      deleteVideoFromStorage(vid.videoUrl).catch(console.error);
    }

    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return {
              ...c,
              videos: c.videos.filter(v => v.id !== videoId),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    if (activeVideoPlayer?.id === videoId) {
      setActiveVideoPlayer(null);
    }
  };

  const toggleVideoCompletion = (batchId: string, chapterId: string, videoId: string) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return {
              ...c,
              videos: c.videos.map(v => (v.id === videoId ? { ...v, isCompleted: !v.isCompleted } : v)),
            };
          }),
        };
      })
    );
    if (activeVideoPlayer?.id === videoId) {
      setActiveVideoPlayer(prev => (prev ? { ...prev, isCompleted: !prev.isCompleted } : null));
    }
  };

  const attachPdfToVideo = (batchId: string, chapterId: string, videoId: string, pdf: AttachedPdf) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return {
              ...c,
              videos: c.videos.map(v => {
                if (v.id !== videoId) return v;
                return {
                  ...v,
                  attachedPdfs: [...(v.attachedPdfs || []), pdf],
                };
              }),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    if (activeVideoPlayer?.id === videoId) {
      setActiveVideoPlayer(prev => (prev ? {
        ...prev,
        attachedPdfs: [...(prev.attachedPdfs || []), pdf]
      } : null));
    }
  };

  const removeAttachedPdfFromVideo = (batchId: string, chapterId: string, videoId: string, attachedPdfId: string) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return {
              ...c,
              videos: c.videos.map(v => {
                if (v.id !== videoId) return v;
                return {
                  ...v,
                  attachedPdfs: (v.attachedPdfs || []).filter(p => p.id !== attachedPdfId),
                };
              }),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    if (activeVideoPlayer?.id === videoId) {
      setActiveVideoPlayer(prev => (prev ? {
        ...prev,
        attachedPdfs: (prev.attachedPdfs || []).filter(p => p.id !== attachedPdfId)
      } : null));
    }
  };

  const addVideoNote = (batchId: string, chapterId: string, videoId: string, note: Omit<VideoNote, 'id' | 'createdAt'>) => {
    const noteId = `note-${Date.now()}`;
    const fullNote: VideoNote = {
      ...note,
      id: noteId,
      createdAt: new Date().toISOString(),
    };

    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return {
              ...c,
              videos: c.videos.map(v => {
                if (v.id !== videoId) return v;
                return {
                  ...v,
                  notes: [...(v.notes || []), fullNote],
                };
              }),
            };
          }),
        };
      })
    );

    if (activeVideoPlayer?.id === videoId) {
      setActiveVideoPlayer(prev =>
        prev ? { ...prev, notes: [...(prev.notes || []), fullNote] } : null
      );
    }
  };

  const deleteVideoNote = (batchId: string, chapterId: string, videoId: string, noteId: string) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return {
              ...c,
              videos: c.videos.map(v => {
                if (v.id !== videoId) return v;
                return {
                  ...v,
                  notes: (v.notes || []).filter(n => n.id !== noteId),
                };
              }),
            };
          }),
        };
      })
    );

    if (activeVideoPlayer?.id === videoId) {
      setActiveVideoPlayer(prev =>
        prev ? { ...prev, notes: (prev.notes || []).filter(n => n.id !== noteId) } : null
      );
    }
  };

  // PDF actions
  const createPdf = (batchId: string, chapterId: string, data: {
    title: string;
    pdfUrl: string;
    coverImageUrl?: string;
    category: PdfCategory;
    fileSizeBytes?: number;
    fileSizeFormatted?: string;
    pageCount?: number;
    description?: string;
    localFileName?: string;
  }) => {
    const pdfId = `pdf-${Date.now()}`;
    const newPdf: PdfResource = {
      id: pdfId,
      batchId,
      chapterId,
      title: data.title,
      pdfUrl: data.pdfUrl,
      coverImageUrl: data.coverImageUrl,
      category: data.category,
      fileSizeBytes: data.fileSizeBytes,
      fileSizeFormatted: data.fileSizeFormatted || '1.5 MB',
      pageCount: data.pageCount || 10,
      description: data.description || '',
      isCompleted: false,
      notes: '',
      localFileName: data.localFileName,
      addedAt: new Date().toISOString(),
    };

    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return {
              ...c,
              pdfs: [...c.pdfs, newPdf],
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    return pdfId;
  };

  const updatePdf = (batchId: string, chapterId: string, pdfId: string, data: Partial<PdfResource>) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return {
              ...c,
              pdfs: c.pdfs.map(p => (p.id === pdfId ? { ...p, ...data } : p)),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deletePdf = (batchId: string, chapterId: string, pdfId: string) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return {
              ...c,
              pdfs: c.pdfs.filter(p => p.id !== pdfId),
            };
          }),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    if (activePdfViewer?.id === pdfId) {
      setActivePdfViewer(null);
    }
  };

  const togglePdfCompletion = (batchId: string, chapterId: string, pdfId: string) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return {
              ...c,
              pdfs: c.pdfs.map(p => (p.id === pdfId ? { ...p, isCompleted: !p.isCompleted } : p)),
            };
          }),
        };
      })
    );
    if (activePdfViewer?.id === pdfId) {
      setActivePdfViewer(prev => (prev ? { ...prev, isCompleted: !prev.isCompleted } : null));
    }
  };

  const savePdfNotes = (batchId: string, chapterId: string, pdfId: string, notes: string) => {
    setBatches(prev =>
      prev.map(b => {
        if (b.id !== batchId) return b;
        return {
          ...b,
          chapters: b.chapters.map(c => {
            if (c.id !== chapterId) return c;
            return {
              ...c,
              pdfs: c.pdfs.map(p => (p.id === pdfId ? { ...p, notes } : p)),
            };
          }),
        };
      })
    );
    if (activePdfViewer?.id === pdfId) {
      setActivePdfViewer(prev => (prev ? { ...prev, notes } : null));
    }
  };

  const clearAllBatches = () => {
    setBatches([]);
    setActiveBatchId(null);
    setActiveChapterId(null);
    setActiveVideoPlayer(null);
    setActivePdfViewer(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('shiksha_study_batches_v1');
    } catch (e) {
      console.error(e);
    }
  };

  const resetToDemo = () => {
    setBatches(initialBatches);
    setActiveBatchId(initialBatches.length > 0 ? initialBatches[0].id : null);
    setActiveChapterId(initialBatches.length > 0 && initialBatches[0].chapters.length > 0 ? initialBatches[0].chapters[0].id : null);
  };

  const exportDataJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(batches, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `shiksha_study_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id && parsed[0].title) {
        setBatches(parsed);
        setActiveBatchId(parsed[0].id);
        setActiveChapterId(parsed[0].chapters?.[0]?.id || null);
        return true;
      }
    } catch (e) {
      console.error('Invalid JSON file', e);
    }
    return false;
  };

  const handleSetActiveVideoPlayer = (video: VideoResource | null) => {
    setActiveVideoPlayer(video);
    if (video) {
      const batch = batches.find(b => b.id === video.batchId);
      const chapter = batch?.chapters.find(c => c.id === video.chapterId);
      logRecentActivity({
        type: 'video',
        batchId: video.batchId,
        batchTitle: batch?.title || 'Study Batch',
        chapterId: video.chapterId,
        chapterTitle: chapter?.title || 'Chapter',
        resourceId: video.id,
        title: video.title,
      });
    }
  };

  const handleSetActivePdfViewer = (pdf: PdfResource | null) => {
    setActivePdfViewer(pdf);
    if (pdf) {
      const batch = batches.find(b => b.id === pdf.batchId);
      const chapter = batch?.chapters.find(c => c.id === pdf.chapterId);
      logRecentActivity({
        type: 'pdf',
        batchId: pdf.batchId,
        batchTitle: batch?.title || 'Study Batch',
        chapterId: pdf.chapterId,
        chapterTitle: chapter?.title || 'Chapter',
        resourceId: pdf.id,
        title: pdf.title,
      });
    }
  };

  return (
    <StudyContext.Provider
      value={{
        batches,
        activeBatchId,
        activeChapterId,
        language,
        setLanguage,
        setActiveBatchId,
        setActiveChapterId,

        // Role & Theme
        userRole,
        setUserRole,
        themeMode,
        setThemeMode,
        toggleTheme,

        // Student features
        bookmarks,
        toggleBookmark,
        isBookmarked,
        recentActivities,
        logRecentActivity,

        isAddBatchOpen,
        setIsAddBatchOpen,
        editingBatch,
        setEditingBatch,

        isAddChapterOpen,
        setIsAddChapterOpen,
        targetBatchForChapter,
        setTargetBatchForChapter,
        editingChapter,
        setEditingChapter,

        isAddVideoOpen,
        setIsAddVideoOpen,
        targetChapterForVideo,
        setTargetChapterForVideo,

        isAddPdfOpen,
        setIsAddPdfOpen,
        targetChapterForPdf,
        setTargetChapterForPdf,

        isSearchOpen,
        setIsSearchOpen,

        activeVideoPlayer,
        setActiveVideoPlayer: handleSetActiveVideoPlayer,

        activePdfViewer,
        setActivePdfViewer: handleSetActivePdfViewer,

        createBatch,
        updateBatch,
        deleteBatch,

        createChapter,
        updateChapter,
        deleteChapter,
        toggleChapterCompletion,

        createVideo,
        updateVideo,
        deleteVideo,
        toggleVideoCompletion,
        attachPdfToVideo,
        removeAttachedPdfFromVideo,
        addVideoNote,
        deleteVideoNote,

        createPdf,
        updatePdf,
        deletePdf,
        togglePdfCompletion,
        savePdfNotes,

        activeBatch,
        activeChapter,
        stats,
        clearAllBatches,
        resetToDemo,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
