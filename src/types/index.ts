export type ColorTheme = 'indigo' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'violet' | 'blue';

export type PdfCategory = 'lecture_notes' | 'assignment' | 'formula_sheet' | 'previous_questions' | 'handwritten';

export interface VideoNote {
  id: string;
  timestampSeconds: number;
  timestampFormatted: string;
  content: string;
  createdAt: string;
}

export interface AttachedPdf {
  id: string;
  title: string;
  pdfUrl: string;
  fileSizeFormatted?: string;
  pageCount?: number;
  coverImageUrl?: string;
  category?: PdfCategory;
  localFileName?: string;
}

export interface VideoResource {
  id: string;
  chapterId: string;
  batchId: string;
  title: string;
  videoUrl: string;
  videoType: 'youtube' | 'direct' | 'embed' | 'file';
  youtubeId?: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  durationFormatted?: string;
  instructor?: string;
  description?: string;
  isCompleted?: boolean;
  notes?: VideoNote[];
  attachedPdfs?: AttachedPdf[];
  addedAt: string;
  localFileName?: string;
  fileSizeBytes?: number;
  fileSizeFormatted?: string;
}

export interface PdfResource {
  id: string;
  chapterId: string;
  batchId: string;
  title: string;
  pdfUrl: string;
  coverImageUrl?: string;
  fileSizeBytes?: number;
  fileSizeFormatted?: string;
  pageCount?: number;
  category: PdfCategory;
  description?: string;
  isCompleted?: boolean;
  notes?: string;
  localFileName?: string;
  addedAt: string;
}

export interface Chapter {
  id: string;
  batchId: string;
  chapterNumber: number;
  title: string;
  description?: string;
  imageUrl?: string;
  videos: VideoResource[];
  pdfs: PdfResource[];
  createdAt: string;
  isCompleted?: boolean;
}

export interface Batch {
  id: string;
  title: string;
  subject: string;
  targetExam: string;
  instructor: string;
  description: string;
  colorTheme: ColorTheme;
  imageUrl?: string;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'batches' | 'batch-detail';

export type Language = 'hi' | 'en';

export type UserRole = 'admin' | 'student';

export type ThemeMode = 'light' | 'dark';

export interface BookmarkItem {
  id: string;
  type: 'video' | 'pdf';
  batchId: string;
  batchTitle: string;
  chapterId: string;
  chapterTitle: string;
  resourceId: string;
  title: string;
  addedAt: string;
}

export interface RecentActivity {
  type: 'video' | 'pdf';
  batchId: string;
  batchTitle: string;
  chapterId: string;
  chapterTitle: string;
  resourceId: string;
  title: string;
  timestamp: string;
}
