import React, { useState, useRef, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { getDictionary } from '../utils/translations';
import { formatSecondsToTime } from '../utils/helpers';
import { resolveVideoUrl } from '../utils/mediaStorage';
import { AttachedPdf, PdfResource } from '../types';
import { 
  X, 
  CheckCircle, 
  CheckCircle2,
  Circle, 
  Clock, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  MessageSquareQuote,
  Paperclip,
  FileText,
  Download,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export const VideoPlayerModal: React.FC = () => {
  const { 
    activeVideoPlayer, 
    setActiveVideoPlayer, 
    activeChapter, 
    toggleVideoCompletion,
    addVideoNote,
    deleteVideoNote,
    setActivePdfViewer,
    language 
  } = useStudy();

  const [noteTimestamp, setNoteTimestamp] = useState('00:00');
  const [noteText, setNoteText] = useState('');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [sideTab, setSideTab] = useState<'notes' | 'pdfs'>('notes');
  const [resolvedMediaSrc, setResolvedMediaSrc] = useState<string>('');
  const [isLoadingMedia, setIsLoadingMedia] = useState<boolean>(false);
  const dict = getDictionary(language);

  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!activeVideoPlayer) return;
    let isCancelled = false;

    if (activeVideoPlayer.videoUrl.startsWith('idb://video/')) {
      setIsLoadingMedia(true);
      resolveVideoUrl(activeVideoPlayer.videoUrl).then((src) => {
        if (!isCancelled) {
          setResolvedMediaSrc(src);
          setIsLoadingMedia(false);
        }
      });
    } else {
      setResolvedMediaSrc(activeVideoPlayer.videoUrl);
      setIsLoadingMedia(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [activeVideoPlayer?.videoUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveVideoPlayer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveVideoPlayer]);

  if (!activeVideoPlayer) return null;

  // Find next and previous video in the active chapter
  const currentChapterVideos = activeChapter?.videos || [];
  const currentIndex = currentChapterVideos.findIndex(v => v.id === activeVideoPlayer.id);
  const prevVideo = currentIndex > 0 ? currentChapterVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex !== -1 && currentIndex < currentChapterVideos.length - 1 ? currentChapterVideos[currentIndex + 1] : null;

  const handleOpenAttachedPdf = (att: AttachedPdf) => {
    const convertedPdf: PdfResource = {
      id: att.id,
      chapterId: activeVideoPlayer.chapterId,
      batchId: activeVideoPlayer.batchId,
      title: att.title,
      pdfUrl: att.pdfUrl,
      fileSizeFormatted: att.fileSizeFormatted,
      pageCount: att.pageCount,
      category: att.category || 'lecture_notes',
      coverImageUrl: att.coverImageUrl,
      addedAt: new Date().toISOString(),
    };
    setActivePdfViewer(convertedPdf);
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const handleCaptureCurrentTime = () => {
    if (videoRef.current) {
      const current = Math.floor(videoRef.current.currentTime);
      setNoteTimestamp(formatSecondsToTime(current));
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    // parse timestamp
    const parts = noteTimestamp.split(':').map(Number);
    let totalSecs = 0;
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      totalSecs = parts[0] * 60 + parts[1];
    }

    addVideoNote(activeVideoPlayer.batchId, activeVideoPlayer.chapterId, activeVideoPlayer.id, {
      timestampSeconds: totalSecs,
      timestampFormatted: noteTimestamp || '00:00',
      content: noteText.trim(),
    });

    setNoteText('');
  };

  const seekToTimestamp = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    } else if (activeVideoPlayer.youtubeId) {
      // For YouTube, update iframe src to start at timestamp
      if (iframeRef.current) {
        iframeRef.current.src = `https://www.youtube.com/embed/${activeVideoPlayer.youtubeId}?autoplay=1&start=${seconds}`;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs">
      <div 
        className="fixed inset-0"
        onClick={() => setActiveVideoPlayer(null)}
      />

      <div className="relative z-10 w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
            <h3 className="text-sm font-bold truncate">
              {activeVideoPlayer.title}
            </h3>
            {activeVideoPlayer.localFileName && (
              <span className="px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800/80 text-[10px] font-semibold shrink-0 hidden sm:inline-flex items-center gap-1">
                <span>📱 {language === 'hi' ? 'गैलरी वीडियो' : 'Gallery Video'}</span>
                {activeVideoPlayer.fileSizeFormatted && (
                  <span className="opacity-75">· {activeVideoPlayer.fileSizeFormatted}</span>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => toggleVideoCompletion(activeVideoPlayer.batchId, activeVideoPlayer.chapterId, activeVideoPlayer.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl font-bold transition-all cursor-pointer shadow-2xs border ${
                activeVideoPlayer.isCompleted
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 ring-2 ring-emerald-400/30'
                  : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 hover:border-emerald-500 hover:text-emerald-400'
              }`}
              title={activeVideoPlayer.isCompleted ? dict.markIncomplete : (language === 'hi' ? 'वीडियो पूरा करें (Tick)' : 'Mark video complete (Tick)')}
            >
              {activeVideoPlayer.isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-800 text-white" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{activeVideoPlayer.isCompleted ? (language === 'hi' ? 'पूर्ण हुआ ✓' : 'Watched ✓') : (language === 'hi' ? 'पूरा करें (Tick)' : 'Mark Complete')}</span>
            </button>

            <button
              onClick={() => setActiveVideoPlayer(null)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Stage + Notes Split Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-slate-900">
          
          {/* Left Column: Player (70% on desktop) */}
          <div className="lg:col-span-8 flex flex-col justify-between bg-black">
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {activeVideoPlayer.youtubeId ? (
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-0"
                  src={`https://www.youtube.com/embed/${activeVideoPlayer.youtubeId}?autoplay=1&rel=0`}
                  title={activeVideoPlayer.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : isLoadingMedia ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <div className="w-10 h-10 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs font-medium text-slate-300">
                    {language === 'hi' ? 'गैलरी से वीडियो लोड हो रहा है...' : 'Loading video from gallery storage...'}
                  </p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  src={resolvedMediaSrc || activeVideoPlayer.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full max-h-[500px]"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {/* Video Controls Bar */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Speed:</span>
                {[0.75, 1, 1.25, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono tabular-nums transition-colors cursor-pointer ${
                      playbackRate === rate ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Attached PDFs Quick Toggle if available */}
              {activeVideoPlayer.attachedPdfs && activeVideoPlayer.attachedPdfs.length > 0 && (
                <button
                  onClick={() => setSideTab('pdfs')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                    sideTab === 'pdfs' 
                      ? 'bg-teal-600 text-white shadow-2xs' 
                      : 'bg-teal-950/80 hover:bg-teal-900 text-teal-300 border border-teal-800/80'
                  }`}
                >
                  <Paperclip className="w-3.5 h-3.5 text-teal-400" />
                  <span>{language === 'hi' ? 'संलग्न PDF' : 'PDF Notes'}</span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-teal-800 text-teal-100 font-bold">
                    {activeVideoPlayer.attachedPdfs.length}
                  </span>
                </button>
              )}

              {/* Prev / Next video buttons */}
              <div className="flex items-center gap-2">
                {prevVideo && (
                  <button
                    onClick={() => setActiveVideoPlayer(prevVideo)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                )}
                {nextVideo && (
                  <button
                    onClick={() => setActiveVideoPlayer(nextVideo)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors cursor-pointer font-medium"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Lecture Notes & Attached PDFs Deck */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 flex flex-col h-full border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
            {/* Header Tabs */}
            <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/80 p-2 gap-1.5">
              <button
                onClick={() => setSideTab('notes')}
                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  sideTab === 'notes'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'टाइमस्टैम्प नोट्स' : 'Notes'}</span>
                {activeVideoPlayer.notes && activeVideoPlayer.notes.length > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    {activeVideoPlayer.notes.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setSideTab('pdfs')}
                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  sideTab === 'pdfs'
                    ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'संलग्न PDF' : 'Attached PDFs'}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  (activeVideoPlayer.attachedPdfs?.length || 0) > 0
                    ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}>
                  {activeVideoPlayer.attachedPdfs?.length || 0}
                </span>
              </button>
            </div>

            {/* TAB CONTENT: ATTACHED PDFS */}
            {sideTab === 'pdfs' && (
              <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[300px] lg:max-h-[420px]">
                <div className="p-3 bg-teal-50/70 dark:bg-teal-950/40 rounded-xl border border-teal-200/60 dark:border-teal-900/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-200 mb-1">
                    <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>{language === 'hi' ? 'वीडियो के साथ जुड़े अध्ययन नोट्स' : 'Attached Lecture Notes'}</span>
                  </div>
                  <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80">
                    {language === 'hi'
                      ? 'इस वीडियो के साथ अटैच किए गए सभी नोट्स व फॉर्मूला शीट्स यहाँ उपलब्ध हैं।'
                      : 'All documents, DPPs, and handwritten lecture notes linked to this video.'}
                  </p>
                </div>

                {activeVideoPlayer.attachedPdfs && activeVideoPlayer.attachedPdfs.length > 0 ? (
                  <div className="space-y-2">
                    {activeVideoPlayer.attachedPdfs.map((att) => (
                      <div
                        key={att.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 transition-colors shadow-2xs space-y-2.5"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                              {att.title}
                            </h5>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                              {att.fileSizeFormatted && <span>{att.fileSizeFormatted}</span>}
                              {att.category && (
                                <span className="capitalize text-teal-600 dark:text-teal-400 font-sans">
                                  · {att.category.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2">
                          <button
                            onClick={() => handleOpenAttachedPdf(att)}
                            className="flex-1 py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{language === 'hi' ? 'PDF खोलें व पढ़ें' : 'Open in Reader'}</span>
                          </button>

                          {att.pdfUrl.startsWith('data:') ? (
                            <a
                              href={att.pdfUrl}
                              download={`${att.title || 'lecture_notes'}.pdf`}
                              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          ) : (
                            <a
                              href={att.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
                              title="Open link in new tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-xs text-slate-400 dark:text-slate-500 space-y-1">
                    <Paperclip className="w-6 h-6 mx-auto opacity-40 text-slate-400" />
                    <p className="font-medium">
                      {language === 'hi' ? 'इस वीडियो के साथ कोई PDF संलग्न नहीं है' : 'No PDFs attached to this video'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {language === 'hi' ? 'वीडियो जोड़ते समय आप PDF नोट्स अटैच कर सकते हैं।' : 'You can attach PDFs when adding a video.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: TIMESTAMP NOTES */}
            {sideTab === 'notes' && (
              <>
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'hi'
                      ? 'महत्वपूर्ण पलों के नोट्स बनाएं और उन पर क्लिक करके तुरंत पहुंचे।'
                      : 'Add timestamped takeaways. Click any time to jump to that moment.'}
                  </p>
                </div>

                {/* Notes List */}
                <div className="flex-1 p-4 overflow-y-auto space-y-2.5 max-h-[250px] lg:max-h-[300px]">
                  {activeVideoPlayer.notes && activeVideoPlayer.notes.length > 0 ? (
                    activeVideoPlayer.notes.map(note => (
                      <div
                        key={note.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-start justify-between gap-2 group"
                      >
                        <div className="space-y-1 flex-1">
                          <button
                            onClick={() => seekToTimestamp(note.timestampSeconds)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded cursor-pointer tabular-nums"
                          >
                            <Clock className="w-3 h-3" />
                            <span>{note.timestampFormatted}</span>
                          </button>
                          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                            {note.content}
                          </p>
                        </div>

                        <button
                          onClick={() => deleteVideoNote(activeVideoPlayer.batchId, activeVideoPlayer.chapterId, activeVideoPlayer.id, note.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                      <Clock className="w-5 h-5 mx-auto mb-1.5 opacity-50" />
                      <p>{language === 'hi' ? 'कोई नोट नहीं जोड़ा गया है' : 'No timestamp notes yet'}</p>
                    </div>
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="02:30"
                      value={noteTimestamp}
                      onChange={(e) => setNoteTimestamp(e.target.value)}
                      className="w-20 px-2 py-1.5 text-xs font-mono tabular-nums bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-hidden focus:border-indigo-500"
                    />
                    {!activeVideoPlayer.youtubeId && (
                      <button
                        type="button"
                        onClick={handleCaptureCurrentTime}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        {language === 'hi' ? 'चालू समय लें' : 'Current time'}
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={language === 'hi' ? 'महत्वपूर्ण सूत्र या टॉपिक...' : 'Takeaway or topic note...'}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white focus:outline-hidden focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!noteText.trim()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'जोड़ें' : 'Add'}</span>
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
