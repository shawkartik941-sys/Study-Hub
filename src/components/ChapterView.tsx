import React, { useState } from 'react';
import { Chapter, ColorTheme, PdfResource, VideoResource, AttachedPdf } from '../types';
import { useStudy } from '../context/StudyContext';
import { getDictionary } from '../utils/translations';
import { themeStyles, getYoutubeThumbnail } from '../utils/helpers';
import { 
  Video, 
  FileText, 
  Plus, 
  Play, 
  CheckCircle, 
  CheckCircle2,
  Circle, 
  Trash2, 
  Download, 
  BookOpen, 
  MessageSquareQuote, 
  Pencil,
  Bookmark,
  BookmarkCheck,
  Paperclip,
  ExternalLink,
  Folder,
  FolderOpen,
  ArrowLeft
} from 'lucide-react';

interface ChapterViewProps {
  chapter: Chapter;
  batchTheme: ColorTheme;
}

export const ChapterView: React.FC<ChapterViewProps> = ({ chapter, batchTheme }) => {
  const { 
    language, 
    setActiveChapterId,
    setIsAddVideoOpen, 
    setTargetChapterForVideo, 
    setIsAddPdfOpen, 
    setTargetChapterForPdf,
    setActiveVideoPlayer,
    setActivePdfViewer,
    toggleVideoCompletion,
    togglePdfCompletion,
    toggleChapterCompletion,
    deleteVideo,
    deletePdf,
    setEditingChapter,
    setIsAddChapterOpen,
    deleteChapter,
    userRole,
    isBookmarked,
    toggleBookmark,
    activeBatch,
    attachPdfToVideo,
    removeAttachedPdfFromVideo
  } = useStudy();

  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'pdfs' | 'completed'>('all');
  const dict = getDictionary(language);
  const theme = themeStyles[batchTheme] || themeStyles.indigo;

  const handleOpenAttachedPdf = (video: VideoResource, attPdf: AttachedPdf) => {
    const convertedPdf: PdfResource = {
      id: attPdf.id,
      chapterId: video.chapterId,
      batchId: video.batchId,
      title: attPdf.title,
      pdfUrl: attPdf.pdfUrl,
      fileSizeFormatted: attPdf.fileSizeFormatted,
      pageCount: attPdf.pageCount,
      category: attPdf.category || 'lecture_notes',
      coverImageUrl: attPdf.coverImageUrl,
      addedAt: new Date().toISOString(),
    };
    setActivePdfViewer(convertedPdf);
  };

  const handleAddVideo = () => {
    setTargetChapterForVideo({ batchId: chapter.batchId, chapterId: chapter.id });
    setIsAddVideoOpen(true);
  };

  const handleAddPdf = () => {
    setTargetChapterForPdf({ batchId: chapter.batchId, chapterId: chapter.id });
    setIsAddPdfOpen(true);
  };

  const handleEditChapter = () => {
    setEditingChapter(chapter);
    setIsAddChapterOpen(true);
  };

  const handleDeleteChapter = () => {
    if (confirm(dict.confirmDeleteChapter)) {
      deleteChapter(chapter.batchId, chapter.id);
    }
  };

  // Filter items
  const showVideos = activeTab === 'all' || activeTab === 'videos' || activeTab === 'completed';
  const showPdfs = activeTab === 'all' || activeTab === 'pdfs' || activeTab === 'completed';

  const displayedVideos = chapter.videos.filter(v => 
    activeTab === 'completed' ? v.isCompleted : true
  );

  const displayedPdfs = chapter.pdfs.filter(p => 
    activeTab === 'completed' ? p.isCompleted : true
  );

  const totalVideos = chapter.videos.length;
  const totalPdfs = chapter.pdfs.length;
  const totalCompleted = chapter.videos.filter(v => v.isCompleted).length + chapter.pdfs.filter(p => p.isCompleted).length;
  const totalItems = totalVideos + totalPdfs;
  const isChapterDone = (totalItems > 0 && totalCompleted === totalItems) || !!chapter.isCompleted;
  const progressPercent = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : (isChapterDone ? 100 : 0);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'lecture_notes':
        return { label: dict.categoryLectureNotes, color: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800' };
      case 'assignment':
        return { label: dict.categoryAssignment, color: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' };
      case 'formula_sheet':
        return { label: dict.categoryFormulaSheet, color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' };
      case 'previous_questions':
        return { label: dict.categoryPyq, color: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800' };
      default:
        return { label: dict.categoryHandwritten, color: 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Folder Navigation Bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
        <button
          onClick={() => setActiveChapterId(null)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{dict.backToFolders || (language === 'hi' ? 'सभी चैप्टर फ़ोल्डर्स देखें' : 'Back to All Folders')}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <FolderOpen className="w-4 h-4 text-amber-500" />
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400">
            {language === 'hi' ? 'वर्तमान चैप्टर फ़ोल्डर:' : 'Current Folder:'}
          </span>
          <span className="text-indigo-600 dark:text-indigo-400 font-bold truncate max-w-[200px]">
            {chapter.title}
          </span>
        </div>
      </div>

      {/* Chapter Title Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs transition-colors overflow-hidden relative">
        {/* If chapter has cover image, display header banner */}
        {chapter.imageUrl && (
          <div className="relative h-28 sm:h-36 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-5 overflow-hidden bg-slate-950">
            <img
              src={chapter.imageUrl}
              alt={chapter.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
            <div className="absolute bottom-3 left-5 sm:left-6 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-600/90 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1">
                <Folder className="w-3 h-3 text-amber-400" />
                <span>{language === 'hi' ? `अध्याय ${chapter.chapterNumber} फ़ोल्डर` : `Chapter ${chapter.chapterNumber} Folder`}</span>
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-bold">
                <Folder className="w-3 h-3 text-amber-500" />
                <span>{language === 'hi' ? 'चैप्टर फ़ोल्डर' : 'Chapter Folder'}</span>
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className={`font-mono tabular-nums ${theme.text}`}>
                {language === 'hi' ? `अध्याय ${chapter.chapterNumber}` : `Chapter ${chapter.chapterNumber}`}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400">{totalVideos} {language === 'hi' ? 'वीडियो' : 'Videos'}</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-400">{totalPdfs} {language === 'hi' ? 'PDFs' : 'PDFs'}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {chapter.title}
            </h2>

            {chapter.description && (
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl pt-1">
                {chapter.description}
              </p>
            )}
          </div>

          {/* Actions for Chapter: Completion Tick Button + Admin Controls */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Chapter Folder Complete Tick Button */}
            <button
              onClick={() => toggleChapterCompletion(chapter.batchId, chapter.id)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs border ${
                isChapterDone
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 ring-2 ring-emerald-400/30'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600'
              }`}
              title={isChapterDone ? (language === 'hi' ? 'चैप्टर अधूरा करें' : 'Mark folder incomplete') : (language === 'hi' ? 'पूरा चैप्टर फ़ोल्डर पूर्ण करें (Tick)' : 'Mark chapter folder complete (Tick)')}
            >
              {isChapterDone ? (
                <CheckCircle2 className="w-4 h-4 text-white fill-emerald-800" />
              ) : (
                <Circle className="w-4 h-4 text-slate-400" />
              )}
              <span>{isChapterDone ? (language === 'hi' ? 'चैप्टर पूर्ण ✓' : 'Folder Done ✓') : (language === 'hi' ? 'चैप्टर पूरा करें (Tick)' : 'Mark Folder Complete')}</span>
            </button>

            {userRole === 'admin' && (
              <>
                <button
                  onClick={handleEditChapter}
                  className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                  title={dict.editChapter}
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'hi' ? 'संपादित करें' : 'Edit'}</span>
                </button>

                <button
                  onClick={handleDeleteChapter}
                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5"
                  title={dict.deleteChapter}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'hi' ? 'हटाएं' : 'Delete'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Chapter Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {language === 'hi' ? 'फ़ोल्डर प्रगति:' : 'Folder Progress:'}
            </span>
            <span className="font-mono tabular-nums text-slate-900 dark:text-white font-semibold">
              {progressPercent}%
            </span>
            <span className="text-slate-400 font-mono tabular-nums">
              ({totalCompleted}/{totalItems})
            </span>
          </div>

          <div className="w-36 sm:w-48 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-300`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Bar: Filter Tabs & Add Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
            <span>{dict.allMaterial} ({totalItems})</span>
          </button>

          <button
            onClick={() => setActiveTab('videos')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'videos'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-rose-500" />
            <span>{language === 'hi' ? 'वीडियो फ़ोल्डर' : 'Videos Folder'} ({totalVideos})</span>
          </button>

          <button
            onClick={() => setActiveTab('pdfs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pdfs'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-cyan-600" />
            <span>{language === 'hi' ? 'PDF फ़ोल्डर' : 'PDFs Folder'} ({totalPdfs})</span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>{dict.completed} ({totalCompleted})</span>
          </button>
        </div>

        {/* Primary Action Buttons (Admin only): Add Video & Add PDF */}
        {userRole === 'admin' && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddVideo}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-950 border border-rose-200 dark:border-rose-900 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <Video className="w-3.5 h-3.5" />
              <span>{dict.addVideo}</span>
            </button>

            <button
              onClick={handleAddPdf}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-950 border border-cyan-200 dark:border-cyan-900 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <FileText className="w-3.5 h-3.5" />
              <span>{dict.addPdf}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* Videos Section */}
        {showVideos && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-rose-500" />
                <span>{language === 'hi' ? 'वीडियो लेक्चर्स फ़ोल्डर' : 'Videos Folder'}</span>
                <span className="text-xs font-mono tabular-nums text-slate-400 font-normal">
                  ({displayedVideos.length})
                </span>
              </h3>
              {userRole === 'admin' && (
                <button
                  onClick={handleAddVideo}
                  className="text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{language === 'hi' ? '+ वीडियो जोड़ें' : '+ Add Video'}</span>
                </button>
              )}
            </div>

            {displayedVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedVideos.map((video: VideoResource) => {
                  const thumbnail = video.thumbnailUrl || (video.youtubeId ? getYoutubeThumbnail(video.youtubeId) : null);
                  const isSaved = isBookmarked('video', video.id);

                  return (
                    <div
                      key={video.id}
                      className={`group bg-white dark:bg-slate-900 rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                        video.isCompleted 
                          ? 'border-teal-200/80 dark:border-teal-900 bg-teal-50/10 dark:bg-teal-950/10' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                      }`}
                    >
                      {/* Video Media Container */}
                      <div 
                        onClick={() => setActiveVideoPlayer(video)}
                        className="relative aspect-video bg-slate-900 cursor-pointer overflow-hidden flex items-center justify-center"
                      >
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={video.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-400">
                            <Video className="w-10 h-10 opacity-40" />
                          </div>
                        )}

                        {/* Dark overlay with play affordance */}
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/95 text-rose-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 fill-current translate-x-0.5" />
                          </div>
                        </div>

                        {/* Duration badge */}
                        {video.durationFormatted && (
                          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[11px] tabular-nums">
                            {video.durationFormatted}
                          </div>
                        )}

                        {/* Interactive Tick Button on Video Thumbnail */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVideoCompletion(chapter.batchId, chapter.id, video.id);
                          }}
                          className={`absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-md shadow-md ${
                            video.isCompleted
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/50'
                              : 'bg-black/65 hover:bg-black/85 text-white/90 border border-white/20'
                          }`}
                          title={video.isCompleted ? (language === 'hi' ? 'अधूरा करें' : 'Mark unwatched') : (language === 'hi' ? 'वीडियो पूरा करें (Tick)' : 'Mark video complete (Tick)')}
                        >
                          {video.isCompleted ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-white fill-emerald-800" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-white/80" />
                          )}
                          <span>{video.isCompleted ? (language === 'hi' ? 'पूर्ण ✓' : 'Watched ✓') : (language === 'hi' ? 'टिक करें' : 'Tick')}</span>
                        </button>
                      </div>

                      {/* Content details */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 
                              onClick={() => setActiveVideoPlayer(video)}
                              className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-2 transition-colors"
                            >
                              {video.title}
                            </h4>

                            {/* Bookmark Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark({
                                  type: 'video',
                                  batchId: video.batchId,
                                  batchTitle: activeBatch?.title || 'Batch',
                                  chapterId: video.chapterId,
                                  chapterTitle: chapter.title,
                                  resourceId: video.id,
                                  title: video.title
                                });
                              }}
                              className={`p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                                isSaved 
                                  ? 'text-amber-500 hover:text-amber-600' 
                                  : 'text-slate-400 hover:text-amber-500'
                              }`}
                              title={isSaved ? dict.removeBookmark : dict.saveBookmark}
                            >
                              {isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                            </button>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap mb-2 text-xs">
                            {video.instructor && (
                              <p className="text-slate-500 dark:text-slate-400">
                                {language === 'hi' ? 'शिक्षक: ' : 'Instructor: '}{video.instructor}
                              </p>
                            )}
                            {video.localFileName && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-[10px] font-medium font-mono">
                                <span>📱 {video.localFileName}</span>
                                {video.fileSizeFormatted && <span className="opacity-75">({video.fileSizeFormatted})</span>}
                              </span>
                            )}
                          </div>

                          {video.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                              {video.description}
                            </p>
                          )}

                          {/* Attached PDFs for this lecture */}
                          {video.attachedPdfs && video.attachedPdfs.length > 0 && (
                            <div className="mb-3 p-2.5 bg-teal-50/70 dark:bg-teal-950/30 rounded-xl border border-teal-200/60 dark:border-teal-900/60 space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-bold text-teal-900 dark:text-teal-200">
                                <span className="flex items-center gap-1.5">
                                  <Paperclip className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                  <span>{language === 'hi' ? 'संलग्न PDF नोट्स' : 'Attached PDF Notes'}</span>
                                </span>
                                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                                  {video.attachedPdfs.length}
                                </span>
                              </div>

                              <div className="space-y-1.5">
                                {video.attachedPdfs.map((attPdf) => (
                                  <div
                                    key={attPdf.id}
                                    className="flex items-center justify-between gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-teal-200/50 dark:border-teal-800/40 text-xs shadow-2xs hover:border-teal-400 dark:hover:border-teal-700 transition-colors"
                                  >
                                    <div 
                                      onClick={() => handleOpenAttachedPdf(video, attPdf)}
                                      className="flex items-center gap-2 min-w-0 cursor-pointer flex-1 group/item"
                                    >
                                      <div className="w-5 h-5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                                        <FileText className="w-3 h-3 group-hover/item:scale-110 transition-transform" />
                                      </div>
                                      <span className="truncate font-semibold text-slate-800 dark:text-slate-200 group-hover/item:text-teal-600 dark:group-hover/item:text-teal-400 text-[11px]">
                                        {attPdf.title}
                                      </span>
                                      {attPdf.fileSizeFormatted && (
                                        <span className="text-[10px] text-slate-400 font-mono shrink-0 hidden sm:inline">
                                          {attPdf.fileSizeFormatted}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        onClick={() => handleOpenAttachedPdf(video, attPdf)}
                                        className="px-2 py-0.5 text-[10px] font-bold bg-teal-600 hover:bg-teal-700 text-white rounded cursor-pointer transition-colors"
                                        title="Open PDF"
                                      >
                                        {language === 'hi' ? 'खोलें' : 'Read'}
                                      </button>
                                      {attPdf.pdfUrl.startsWith('data:') ? (
                                        <a
                                          href={attPdf.pdfUrl}
                                          download={`${attPdf.title || 'lecture_notes'}.pdf`}
                                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                                          title="Download PDF"
                                        >
                                          <Download className="w-3 h-3" />
                                        </a>
                                      ) : (
                                        <a
                                          href={attPdf.pdfUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                                          title="Open in new window"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                      {userRole === 'admin' && (
                                        <button
                                          onClick={() => removeAttachedPdfFromVideo(chapter.batchId, chapter.id, video.id, attPdf.id)}
                                          className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                                          title="Remove attachment"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Footer row */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            {/* Completion Tick Button */}
                            <button
                              onClick={() => toggleVideoCompletion(chapter.batchId, chapter.id, video.id)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-2xs border ${
                                video.isCompleted 
                                  ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100' 
                                  : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600'
                              }`}
                              title={video.isCompleted ? dict.markIncomplete : (language === 'hi' ? 'वीडियो पूरा करें (Tick)' : 'Mark complete (Tick)')}
                            >
                              {video.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-400" />
                              )}
                              <span>{video.isCompleted ? (language === 'hi' ? 'पूरा हुआ ✓' : 'Completed ✓') : (language === 'hi' ? 'पूरा करें (Tick)' : 'Mark Complete')}</span>
                            </button>

                            {/* Timestamped notes indicator */}
                            {video.notes && video.notes.length > 0 && (
                              <span 
                                onClick={() => setActiveVideoPlayer(video)}
                                className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 font-mono tabular-nums cursor-pointer hover:underline"
                                title="Timestamped notes available"
                              >
                                <MessageSquareQuote className="w-3 h-3" />
                                <span>{video.notes.length} notes</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setActiveVideoPlayer(video)}
                              className="px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors cursor-pointer"
                            >
                              {dict.playLecture}
                            </button>

                            {userRole === 'admin' && (
                              <button
                                onClick={() => {
                                  if (confirm(dict.confirmDeleteVideo)) {
                                    deleteVideo(chapter.batchId, chapter.id, video.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors cursor-pointer"
                                title={dict.confirmDeleteVideo}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center">
                <Video className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{dict.noVideos}</p>
                {userRole === 'admin' && (
                  <button
                    onClick={handleAddVideo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{dict.addVideo}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* PDFs & Notes Section */}
        {showPdfs && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{language === 'hi' ? 'PDF नोट्स व डॉक्युमेंट्स फ़ोल्डर' : 'PDF Notes & Documents Folder'}</span>
                <span className="text-xs font-mono tabular-nums text-slate-400 font-normal">
                  ({displayedPdfs.length})
                </span>
              </h3>
              {userRole === 'admin' && (
                <button
                  onClick={handleAddPdf}
                  className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{language === 'hi' ? '+ PDF जोड़ें' : '+ Add PDF'}</span>
                </button>
              )}
            </div>

            {displayedPdfs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedPdfs.map((pdf: PdfResource) => {
                  const badge = getCategoryBadge(pdf.category);
                  const isSaved = isBookmarked('pdf', pdf.id);

                  return (
                    <div
                      key={pdf.id}
                      className={`bg-white dark:bg-slate-900 rounded-xl border p-4.5 transition-all duration-200 flex flex-col justify-between ${
                        pdf.isCompleted 
                          ? 'border-teal-200/80 dark:border-teal-900 bg-teal-50/10 dark:bg-teal-950/10' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                      }`}
                    >
                      <div>
                        {/* Header: Category Badge, File Size & Bookmark */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${badge.color}`}>
                            {badge.label}
                          </span>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                              {pdf.fileSizeFormatted && <span>{pdf.fileSizeFormatted}</span>}
                              {pdf.pageCount && (
                                <>
                                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                                  <span>{pdf.pageCount} pgs</span>
                                </>
                              )}
                            </div>

                            {/* Bookmark PDF */}
                            <button
                              onClick={() => toggleBookmark({
                                type: 'pdf',
                                batchId: pdf.batchId,
                                batchTitle: activeBatch?.title || 'Batch',
                                chapterId: pdf.chapterId,
                                chapterTitle: chapter.title,
                                resourceId: pdf.id,
                                title: pdf.title
                              })}
                              className={`p-1 rounded-md transition-colors cursor-pointer ${
                                isSaved 
                                  ? 'text-amber-500 hover:text-amber-600' 
                                  : 'text-slate-400 hover:text-amber-500'
                              }`}
                              title={isSaved ? dict.removeBookmark : dict.saveBookmark}
                            >
                              {isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* If PDF has custom cover image */}
                        {pdf.coverImageUrl && (
                          <div 
                            onClick={() => setActivePdfViewer(pdf)}
                            className="relative h-28 w-full rounded-lg overflow-hidden mb-3 bg-slate-900 cursor-pointer group/pdf-img"
                          >
                            <img
                              src={pdf.coverImageUrl}
                              alt={pdf.title}
                              className="w-full h-full object-cover group-hover/pdf-img:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2">
                              <span className="text-[10px] text-white font-medium bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                                <FileText className="w-3 h-3 text-cyan-400" /> {language === 'hi' ? 'दस्तावेज़' : 'Document'}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Title */}
                        <h4 
                          onClick={() => setActivePdfViewer(pdf)}
                          className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-2 transition-colors mb-1.5"
                        >
                          {pdf.title}
                        </h4>

                        {pdf.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                            {pdf.description}
                          </p>
                        )}

                        {pdf.notes && (
                          <div className="p-2.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 mb-3">
                            <span className="font-semibold block mb-0.5">
                              {language === 'hi' ? 'स्टडी नोट्स:' : 'Study Takeaways:'}
                            </span>
                            <p className="text-slate-700 dark:text-slate-300 line-clamp-2">{pdf.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        {/* Completion Tick Button */}
                        <button
                          onClick={() => togglePdfCompletion(chapter.batchId, chapter.id, pdf.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-2xs border ${
                            pdf.isCompleted 
                              ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100' 
                              : 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-600'
                          }`}
                          title={pdf.isCompleted ? dict.markIncomplete : (language === 'hi' ? 'PDF पूरा करें (Tick)' : 'Mark complete (Tick)')}
                        >
                          {pdf.isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400" />
                          )}
                          <span>{pdf.isCompleted ? (language === 'hi' ? 'पूरा हुआ ✓' : 'Completed ✓') : (language === 'hi' ? 'पूरा करें (Tick)' : 'Mark Complete')}</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* Open Viewer */}
                          <button
                            onClick={() => setActivePdfViewer(pdf)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900 rounded-md transition-colors cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{dict.viewPdf}</span>
                          </button>

                          {/* Direct download link */}
                          <a
                            href={pdf.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={pdf.title + '.pdf'}
                            className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                            title={dict.downloadPdf}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>

                          {userRole === 'admin' && (
                            <button
                              onClick={() => {
                                if (confirm(dict.confirmDeletePdf)) {
                                  deletePdf(chapter.batchId, chapter.id, pdf.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-md transition-colors cursor-pointer"
                              title={dict.confirmDeletePdf}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center">
                <FileText className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">{dict.noPdfs}</p>
                {userRole === 'admin' && (
                  <button
                    onClick={handleAddPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{dict.addPdf}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
