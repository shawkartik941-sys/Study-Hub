import { ColorTheme } from '../types';

export function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function getYoutubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}

export function formatBytes(bytes?: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function parseTimeToSeconds(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

/**
 * Resizes and compresses image to lightweight JPEG Data URI to keep localStorage footprint minimal
 */
export function compressImageFile(file: File, maxWidth = 900, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const STUDY_IMAGE_PRESETS = {
  batch: [
    { label: 'Science & Physics', url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80' },
    { label: 'Maths & Formulas', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80' },
    { label: 'Chemistry Lab', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80' },
    { label: 'Biology & Medical', url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80' },
    { label: 'Library & Books', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80' },
    { label: 'Coding & Tech', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80' },
  ],
  chapter: [
    { label: 'Course Module', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80' },
    { label: 'Study Desk', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80' },
    { label: 'Blueprint & Plan', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80' },
    { label: 'Notes & Highlights', url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=600&q=80' },
  ],
  video: [
    { label: 'Lecture Session', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80' },
    { label: 'Blackboard Theory', url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80' },
    { label: 'Online Classroom', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=600&q=80' },
    { label: 'Science Experiment', url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80' },
  ],
  pdf: [
    { label: 'Formula Sheet', url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80' },
    { label: 'Assignment / DPP', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80' },
    { label: 'Study Material', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80' },
    { label: 'Exam Notes', url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80' },
  ],
};

export const themeStyles: Record<
  ColorTheme,
  {
    gradient: string;
    bgSubtle: string;
    text: string;
    border: string;
    accent: string;
    button: string;
    badge: string;
  }
> = {
  indigo: {
    gradient: 'from-indigo-600 via-indigo-700 to-slate-900',
    bgSubtle: 'bg-indigo-50/70',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    accent: '#4f46e5',
    button: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    badge: 'bg-indigo-100 text-indigo-800',
  },
  emerald: {
    gradient: 'from-emerald-600 via-teal-700 to-slate-900',
    bgSubtle: 'bg-emerald-50/70',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    accent: '#059669',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    badge: 'bg-emerald-100 text-emerald-800',
  },
  amber: {
    gradient: 'from-amber-600 via-orange-700 to-slate-900',
    bgSubtle: 'bg-amber-50/70',
    text: 'text-amber-800',
    border: 'border-amber-200',
    accent: '#d97706',
    button: 'bg-amber-600 hover:bg-amber-700 text-white',
    badge: 'bg-amber-100 text-amber-800',
  },
  rose: {
    gradient: 'from-rose-600 via-pink-700 to-slate-900',
    bgSubtle: 'bg-rose-50/70',
    text: 'text-rose-700',
    border: 'border-rose-200',
    accent: '#e11d48',
    button: 'bg-rose-600 hover:bg-rose-700 text-white',
    badge: 'bg-rose-100 text-rose-800',
  },
  cyan: {
    gradient: 'from-cyan-600 via-sky-700 to-slate-900',
    bgSubtle: 'bg-cyan-50/70',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    accent: '#0891b2',
    button: 'bg-cyan-600 hover:bg-cyan-700 text-white',
    badge: 'bg-cyan-100 text-cyan-800',
  },
  violet: {
    gradient: 'from-violet-600 via-purple-700 to-slate-900',
    bgSubtle: 'bg-violet-50/70',
    text: 'text-violet-700',
    border: 'border-violet-200',
    accent: '#7c3aed',
    button: 'bg-violet-600 hover:bg-violet-700 text-white',
    badge: 'bg-violet-100 text-violet-800',
  },
  blue: {
    gradient: 'from-blue-600 via-indigo-800 to-slate-900',
    bgSubtle: 'bg-blue-50/70',
    text: 'text-blue-700',
    border: 'border-blue-200',
    accent: '#2563eb',
    button: 'bg-blue-600 hover:bg-blue-700 text-white',
    badge: 'bg-blue-100 text-blue-800',
  },
};
