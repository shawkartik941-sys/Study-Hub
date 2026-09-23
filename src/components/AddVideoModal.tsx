import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { getDictionary } from '../utils/translations';
import { extractYoutubeId, getYoutubeThumbnail, formatBytes } from '../utils/helpers';
import { saveVideoToStorage, savePdfToStorage, generateVideoMetadata } from '../utils/mediaStorage';
import { AttachedPdf, PdfCategory, PdfResource } from '../types';
import { ImagePicker } from './ImagePicker';
import { 
  X, 
  Video, 
  Play, 
  Sparkles, 
  Check, 
  FileText, 
  Paperclip, 
  Upload, 
  Link as LinkIcon, 
  Trash2, 
  Plus, 
  CheckCircle2,
  BookOpen,
  Folder,
  Film,
  HardDrive,
  RefreshCw,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';

export const AddVideoModal: React.FC = () => {
  const { 
    isAddVideoOpen, 
    setIsAddVideoOpen, 
    targetChapterForVideo, 
    createVideo, 
    batches,
    activeBatch,
    language 
  } = useStudy();

  // Video source: 'gallery' (from device storage/gallery) or 'url' (YouTube / online video)
  const [videoSource, setVideoSource] = useState<'gallery' | 'url'>('gallery');

  // Gallery video states
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>('');
  const [isExtractingMeta, setIsExtractingMeta] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Common metadata states
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [durationFormatted, setDurationFormatted] = useState<string>('30 min');
  const [instructor, setInstructor] = useState('');
  const [description, setDescription] = useState('');

  // Attached PDFs state
  const [attachedPdfs, setAttachedPdfs] = useState<AttachedPdf[]>([]);
  const [showAttachForm, setShowAttachForm] = useState(false);
  const [attachTab, setAttachTab] = useState<'upload' | 'url' | 'existing'>('upload');
  const [newPdfTitle, setNewPdfTitle] = useState('');
  const [newPdfUrl, setNewPdfUrl] = useState('');
  const [newPdfCategory, setNewPdfCategory] = useState<PdfCategory>('lecture_notes');
  const [isReadingFile, setIsReadingFile] = useState(false);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  const dict = getDictionary(language);
  const detectedYtId = extractYoutubeId(videoUrl);

  // Find target chapter to access existing PDFs
  const targetChapter = useMemo(() => {
    if (!targetChapterForVideo) return null;
    const b = batches.find(batch => batch.id === targetChapterForVideo.batchId);
    return b?.chapters.find(c => c.id === targetChapterForVideo.chapterId) || null;
  }, [batches, targetChapterForVideo]);

  // Reset state when modal opens
  useEffect(() => {
    if (isAddVideoOpen) {
      setVideoSource('gallery');
      setVideoFile(null);
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      setVideoPreviewUrl('');
      setIsExtractingMeta(false);
      setIsSaving(false);
      setTitle('');
      setVideoUrl('');
      setThumbnailUrl('');
      setDurationMinutes(30);
      setDurationFormatted('30 min');
      setInstructor(activeBatch?.instructor || '');
      setDescription('');
      setAttachedPdfs([]);
      setShowAttachForm(false);
      setNewPdfTitle('');
      setNewPdfUrl('');
      setNewPdfCategory('lecture_notes');
      setAttachTab('upload');
    }
  }, [isAddVideoOpen, activeBatch]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  if (!isAddVideoOpen || !targetChapterForVideo) return null;

  // Handle Video file picked from device gallery / local file picker
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    const objUrl = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoPreviewUrl(objUrl);
    setIsExtractingMeta(true);

    // Auto populate clean title from filename if title is empty
    if (!title.trim()) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .trim();
      setTitle(cleanName);
    }

    try {
      const meta = await generateVideoMetadata(file);
      if (meta.thumbnailUrl && !thumbnailUrl) {
        setThumbnailUrl(meta.thumbnailUrl);
      }
      if (meta.durationMinutes) {
        setDurationMinutes(meta.durationMinutes);
        setDurationFormatted(meta.durationFormatted);
      }
    } catch (err) {
      console.warn('Metadata extraction note:', err);
    } finally {
      setIsExtractingMeta(false);
    }
  };

  // PDF attachment helpers
  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cleanTitle = newPdfTitle.trim() || file.name.replace(/\.[^/.]+$/, '');
    const formattedSize = formatBytes(file.size);
    setIsReadingFile(true);

    try {
      const attId = `att-${Date.now()}`;
      const storedUrl = await savePdfToStorage(attId, file);

      const item: AttachedPdf = {
        id: attId,
        title: cleanTitle,
        pdfUrl: storedUrl,
        fileSizeFormatted: formattedSize,
        category: newPdfCategory,
        localFileName: file.name,
      };
      setAttachedPdfs(prev => [...prev, item]);
      setNewPdfTitle('');
      setNewPdfUrl('');
      setShowAttachForm(false);
      if (pdfFileInputRef.current) pdfFileInputRef.current.value = '';
    } catch (err) {
      console.error('Error storing attached PDF:', err);
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleAddUrlPdf = () => {
    if (!newPdfUrl.trim()) return;
    const item: AttachedPdf = {
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newPdfTitle.trim() || (language === 'hi' ? 'लेक्चर नोट्स (PDF)' : 'Lecture Notes PDF'),
      pdfUrl: newPdfUrl.trim(),
      fileSizeFormatted: 'Online Doc',
      category: newPdfCategory,
    };
    setAttachedPdfs(prev => [...prev, item]);
    setNewPdfTitle('');
    setNewPdfUrl('');
    setShowAttachForm(false);
  };

  const handleAttachExistingPdf = (pdf: PdfResource) => {
    if (attachedPdfs.some(p => p.pdfUrl === pdf.pdfUrl || p.title === pdf.title)) {
      return;
    }
    const item: AttachedPdf = {
      id: `att-${Date.now()}-${pdf.id}`,
      title: pdf.title,
      pdfUrl: pdf.pdfUrl,
      fileSizeFormatted: pdf.fileSizeFormatted,
      pageCount: pdf.pageCount,
      category: pdf.category,
      coverImageUrl: pdf.coverImageUrl,
    };
    setAttachedPdfs(prev => [...prev, item]);
  };

  const handleRemoveAttachedPdf = (id: string) => {
    setAttachedPdfs(prev => prev.filter(p => p.id !== id));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    if (videoSource === 'gallery') {
      if (!videoFile) {
        alert(language === 'hi' ? 'कृपया गैलरी से वीडियो फ़ाइल चुनें।' : 'Please select a video file from your device gallery.');
        return;
      }

      setIsSaving(true);
      try {
        const vidId = `vid-${Date.now()}`;
        // Store video binary file in IndexedDB
        const storedUrl = await saveVideoToStorage(vidId, videoFile);

        createVideo(targetChapterForVideo.batchId, targetChapterForVideo.chapterId, {
          title: title.trim(),
          videoUrl: storedUrl,
          videoType: 'file',
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          durationMinutes: Number(durationMinutes) || 30,
          durationFormatted: durationFormatted || `${durationMinutes} min`,
          instructor: instructor.trim(),
          description: description.trim(),
          localFileName: videoFile.name,
          fileSizeBytes: videoFile.size,
          fileSizeFormatted: formatBytes(videoFile.size),
          attachedPdfs,
        });

        setIsAddVideoOpen(false);
      } catch (err) {
        console.error('Error saving video:', err);
        alert(language === 'hi' ? 'वीडियो सेव करने में त्रुटि हुई।' : 'Error saving video file.');
      } finally {
        setIsSaving(false);
      }
    } else {
      // URL Source
      if (!videoUrl.trim()) return;

      createVideo(targetChapterForVideo.batchId, targetChapterForVideo.chapterId, {
        title: title.trim(),
        videoUrl: videoUrl.trim(),
        videoType: detectedYtId ? 'youtube' : 'direct',
        thumbnailUrl: thumbnailUrl.trim() || (detectedYtId ? getYoutubeThumbnail(detectedYtId) : undefined),
        durationMinutes: Number(durationMinutes) || 30,
        durationFormatted: `${durationMinutes} min`,
        instructor: instructor.trim(),
        description: description.trim(),
        attachedPdfs,
      });

      setIsAddVideoOpen(false);
    }
  };

  const handleUseSample = (sampleUrl: string, sampleTitle: string, mins: number) => {
    setVideoUrl(sampleUrl);
    setTitle(sampleTitle);
    setDurationMinutes(mins);
    setDurationFormatted(`${mins} min`);
    const ytId = extractYoutubeId(sampleUrl);
    if (ytId) {
      setThumbnailUrl(getYoutubeThumbnail(ytId));
    }
  };

  const handleAddSamplePdf = () => {
    const sampleItem: AttachedPdf = {
      id: `att-${Date.now()}-sample`,
      title: `${title.trim() || 'Lecture'} - Complete Study Notes & PYQs`,
      pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
      fileSizeFormatted: '2.1 MB',
      pageCount: 12,
      category: 'lecture_notes',
    };
    setAttachedPdfs(prev => [...prev, sampleItem]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        className="fixed inset-0"
        onClick={() => !isSaving && setIsAddVideoOpen(false)}
      />

      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-2xs">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'hi' ? 'नया वीडियो जोड़ें' : 'Add Video Lecture'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                📁 {targetChapter?.title || (language === 'hi' ? 'चैप्टर फ़ोल्डर' : 'Chapter Folder')}
              </p>
            </div>
          </div>
          <button
            onClick={() => !isSaving && setIsAddVideoOpen(false)}
            disabled={isSaving}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Target Chapter Folder info */}
          <div className="flex items-center justify-between p-2.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shrink-0">
                <Folder className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-amber-800 dark:text-amber-400 block">
                  {language === 'hi' ? 'फ़ोल्डर लोकेशन:' : 'Folder location:'}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                  {targetChapter?.title || (language === 'hi' ? 'चैप्टर फ़ोल्डर' : 'Chapter Folder')}
                </span>
              </div>
            </div>
            {targetChapter && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold">
                {language === 'hi' ? `अध्याय ${targetChapter.chapterNumber || 1}` : `Chapter ${targetChapter.chapterNumber || 1}`}
              </span>
            )}
          </div>

          {/* VIDEO SOURCE SELECTOR TABS: GALLERY (PRIMARY) vs ONLINE URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'hi' ? 'वीडियो का स्रोत चुनें (Video Source)' : 'Choose Video Source'}
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setVideoSource('gallery')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  videoSource === 'gallery'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? '📱 गैलरी से अपलोड करें' : '📱 Gallery Upload'}</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoSource('url')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  videoSource === 'url'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? '🔗 वीडियो लिंक / YouTube' : '🔗 Video URL'}</span>
              </button>
            </div>
          </div>

          {/* GALLERY UPLOAD SECTION */}
          {videoSource === 'gallery' && (
            <div className="space-y-3">
              {/* Hidden file input */}
              <input
                ref={videoFileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                className="hidden"
              />

              {!videoFile ? (
                /* Drag & Drop / Click Upload Box */
                <div
                  onClick={() => videoFileInputRef.current?.click()}
                  className="border-2 border-dashed border-rose-300 dark:border-rose-900/60 hover:border-rose-500 dark:hover:border-rose-600 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 rounded-2xl p-6 text-center transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {language === 'hi' ? 'फोन / डिवाइस की गैलरी से वीडियो चुनें' : 'Choose Video from Device Gallery'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 max-w-xs mx-auto">
                    {language === 'hi'
                      ? 'MP4, WebM, MOV, MKV आदि सभी वीडियो फॉर्मेट समर्थित हैं।'
                      : 'Supports MP4, WebM, MOV, MKV and all common video formats.'}
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors">
                    <Film className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'गैलरी खोलें (Browse Gallery)' : 'Browse Gallery'}</span>
                  </span>
                </div>
              ) : (
                /* Selected Video Preview Card */
                <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-700 text-white space-y-3">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="font-bold text-emerald-400">
                        {language === 'hi' ? 'गैलरी वीडियो चयनित ✓' : 'Gallery Video Selected ✓'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{language === 'hi' ? 'वीडियो बदलें' : 'Change Video'}</span>
                    </button>
                  </div>

                  {/* Video Player Preview */}
                  {videoPreviewUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 shadow-md">
                      <video
                        src={videoPreviewUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Metadata extraction loader */}
                  {isExtractingMeta ? (
                    <div className="flex items-center justify-center gap-2 py-2 text-xs text-rose-400 font-medium">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'hi' ? 'वीडियो थंबनेल व अवधि तैयार हो रही है...' : 'Extracting thumbnail & duration...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-1">
                      <span className="truncate max-w-[200px]" title={videoFile.name}>
                        📁 {videoFile.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                          {formatBytes(videoFile.size)}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-semibold">
                          ⏱ {durationFormatted}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ONLINE URL SECTION */}
          {videoSource === 'url' && (
            <div className="space-y-3">
              {/* Quick preset samples */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'hi' ? 'त्वरित टेस्ट हेतु उदाहरण वीडियो:' : 'Quick Sample Video Links:'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleUseSample('https://www.youtube.com/watch?v=MD4r06wK24Y', 'Physics Lecture: Charges & Coulomb Law', 45)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-md text-[11px] text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                  >
                    Physics Lecture
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseSample('https://www.youtube.com/watch?v=kJQP7kiw5Fk', 'Maths Lecture: Trigonometry Trick', 40)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-md text-[11px] text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                  >
                    Maths Trigonometry
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseSample('https://www.youtube.com/watch?v=SqcY0GlETPk', 'React 19 & TypeScript Masterclass', 60)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-md text-[11px] text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                  >
                    React Tutorial
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {dict.videoUrl} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder={dict.videoUrlHint}
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
                />
              </div>

              {/* YouTube Preview if valid ID found */}
              {detectedYtId && (
                <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl text-white text-xs border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="relative w-20 aspect-video rounded-md overflow-hidden bg-black shrink-0">
                      <img
                        src={getYoutubeThumbnail(detectedYtId)}
                        alt="YouTube Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white fill-current" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> YouTube Video Detected
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">ID: {detectedYtId}</span>
                    </div>
                  </div>

                  {!thumbnailUrl && (
                    <button
                      type="button"
                      onClick={() => setThumbnailUrl(getYoutubeThumbnail(detectedYtId))}
                      className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg cursor-pointer shrink-0"
                    >
                      {language === 'hi' ? 'थंबनेल सेट करें' : 'Set as Poster'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* LECTURE TITLE INPUT */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'वीडियो का शीर्षक (Lecture Title)' : 'Lecture Title'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={language === 'hi' ? 'उदा. Lecture 01: Coulomb\'s Law and Electric Dipole' : 'e.g. Lecture 01: Basics & Derivations'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
            />
          </div>

          {/* VIDEO THUMBNAIL / POSTER PICKER */}
          <ImagePicker
            label={language === 'hi' ? 'वीडियो थंबनेल / पोस्टर' : (dict.videoThumbnail || 'Video Poster / Thumbnail')}
            description={
              videoSource === 'gallery' && thumbnailUrl
                ? (language === 'hi' ? '✓ वीडियो से ऑटो-थंबनेल तैयार किया गया है। आप चाहें तो नीचे से नया थंबनेल चुन सकते हैं।' : '✓ Auto thumbnail captured from video. You can also pick a custom image.')
                : dict.videoThumbnailDesc
            }
            imageUrl={thumbnailUrl}
            onChange={setThumbnailUrl}
            presetCategory="video"
            aspectRatio="video"
            language={language}
          />

          {/* DURATION & INSTRUCTOR ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>{language === 'hi' ? 'अवधि (मिनट में)' : 'Duration (Minutes)'}</span>
                {durationFormatted && (
                  <span className="text-[10px] text-slate-400 font-mono">({durationFormatted})</span>
                )}
              </label>
              <input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(e) => {
                  const mins = parseInt(e.target.value) || 1;
                  setDurationMinutes(mins);
                  setDurationFormatted(`${mins} min`);
                }}
                className="w-full px-3.5 py-2 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {dict.instructor}
              </label>
              <input
                type="text"
                placeholder={language === 'hi' ? 'उदा. Sharma Sir' : 'e.g. Lead Instructor'}
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {dict.description}
            </label>
            <textarea
              rows={2}
              placeholder={language === 'hi' ? 'इस व्याख्यान में पढ़ाए गए मुख्य सूत्र व विषय...' : 'Summary of topics covered in this video lecture...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-indigo-500 font-sans resize-none"
            />
          </div>

          {/* ATTACHED PDFS SECTION (DPP, Notes for this video) */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <Paperclip className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{dict.attachedPdfs}</span>
                    {attachedPdfs.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-mono font-semibold">
                        {attachedPdfs.length}
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {dict.attachedPdfDesc}
                  </p>
                </div>
              </div>

              {!showAttachForm && (
                <button
                  type="button"
                  onClick={() => setShowAttachForm(true)}
                  className="px-2.5 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:text-teal-800 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{dict.attachPdf}</span>
                </button>
              )}
            </div>

            {/* List of currently attached PDFs */}
            {attachedPdfs.length > 0 ? (
              <div className="space-y-2">
                {attachedPdfs.map((att) => (
                  <div 
                    key={att.id}
                    className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {att.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {att.fileSizeFormatted && <span>{att.fileSizeFormatted}</span>}
                          {att.category && (
                            <span className="capitalize text-teal-600 dark:text-teal-400">
                              · {att.category.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachedPdf(att.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer shrink-0"
                      title="Remove attached PDF"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Attach Form Sub-panel */}
            {showAttachForm && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {language === 'hi' ? 'नया PDF नोट्स जोड़ें' : 'Attach New PDF Document'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAttachForm(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sub-tabs for PDF */}
                <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <button
                    type="button"
                    onClick={() => setAttachTab('upload')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                      attachTab === 'upload'
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {language === 'hi' ? 'डिवाइस से PDF' : 'Upload File'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachTab('url')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                      attachTab === 'url'
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {language === 'hi' ? 'PDF लिंक' : 'Web Link'}
                  </button>
                  {targetChapter && targetChapter.pdfs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAttachTab('existing')}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                        attachTab === 'existing'
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-semibold'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {language === 'hi' ? `चैप्टर के PDFs (${targetChapter.pdfs.length})` : `Existing (${targetChapter.pdfs.length})`}
                    </button>
                  )}
                </div>

                {/* PDF Category & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'hi' ? 'दस्तावेज़ का नाम (Title)' : 'Document Title'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'hi' ? 'उदा. DPP 01 Solved' : 'e.g. Formula Sheet'}
                      value={newPdfTitle}
                      onChange={(e) => setNewPdfTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {dict.category}
                    </label>
                    <select
                      value={newPdfCategory}
                      onChange={(e) => setNewPdfCategory(e.target.value as PdfCategory)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="lecture_notes">{dict.categoryLectureNotes}</option>
                      <option value="assignment">{dict.categoryAssignment}</option>
                      <option value="formula_sheet">{dict.categoryFormulaSheet}</option>
                      <option value="previous_questions">{dict.categoryPyq}</option>
                      <option value="handwritten">{dict.categoryHandwritten}</option>
                    </select>
                  </div>
                </div>

                {/* Upload File Mode */}
                {attachTab === 'upload' && (
                  <div>
                    <input
                      ref={pdfFileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => pdfFileInputRef.current?.click()}
                      disabled={isReadingFile}
                      className="w-full py-3 border border-dashed border-teal-300 dark:border-teal-700/80 bg-teal-50/40 dark:bg-teal-950/30 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>
                        {isReadingFile 
                          ? (language === 'hi' ? 'PDF लोड हो रहा है...' : 'Reading PDF...') 
                          : (language === 'hi' ? 'डिवाइस से PDF फ़ाइल चुनें' : 'Choose PDF from device')}
                      </span>
                    </button>
                  </div>
                )}

                {/* URL Mode */}
                {attachTab === 'url' && (
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://example.com/notes.pdf"
                      value={newPdfUrl}
                      onChange={(e) => setNewPdfUrl(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrlPdf}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg cursor-pointer shrink-0"
                    >
                      {language === 'hi' ? 'जोड़ें' : 'Attach'}
                    </button>
                  </div>
                )}

                {/* Existing PDFs in Chapter */}
                {attachTab === 'existing' && targetChapter && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {targetChapter.pdfs.map(p => {
                      const isAlreadyAttached = attachedPdfs.some(att => att.pdfUrl === p.pdfUrl);
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <span className="truncate pr-2">{p.title}</span>
                          <button
                            type="button"
                            onClick={() => handleAttachExistingPdf(p)}
                            disabled={isAlreadyAttached}
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                              isAlreadyAttached
                                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300'
                                : 'bg-slate-200 hover:bg-teal-600 hover:text-white text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                            }`}
                          >
                            {isAlreadyAttached ? 'Attached ✓' : '+ Attach'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Sample Attachment */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAddSamplePdf}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{language === 'hi' ? 'टेस्ट के लिए सैंपल PDF जोड़ें' : 'Attach Sample Study PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAttachForm(false)}
                    className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    {language === 'hi' ? 'पूर्ण' : 'Done'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsAddVideoOpen(false)}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {dict.cancel}
            </button>
            <button
              type="submit"
              disabled={isSaving || isExtractingMeta || (videoSource === 'gallery' && !videoFile) || (videoSource === 'url' && !videoUrl)}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'hi' ? 'गैलरी वीडियो सेव हो रहा है...' : 'Saving Video...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{language === 'hi' ? 'वीडियो फ़ोल्डर में जोड़ें' : 'Add Video to Folder'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
