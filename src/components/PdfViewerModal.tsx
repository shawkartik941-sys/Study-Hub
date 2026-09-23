import React, { useState, useEffect, useRef } from 'react';
import { useStudy } from '../context/StudyContext';
import { getDictionary } from '../utils/translations';
import { resolvePdfUrl } from '../utils/mediaStorage';
import { PdfCanvasReader } from './PdfCanvasReader';
import { 
  X, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Save, 
  BookOpen, 
  FileText, 
  Maximize2, 
  Minimize2, 
  PanelRightClose, 
  PanelRightOpen, 
  Globe, 
  Monitor, 
  BookCheck, 
  Check
} from 'lucide-react';

export const PdfViewerModal: React.FC = () => {
  const { 
    activePdfViewer, 
    setActivePdfViewer, 
    togglePdfCompletion, 
    savePdfNotes,
    language 
  } = useStudy();

  const [notes, setNotes] = useState('');
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resolvedPdfSrc, setResolvedPdfSrc] = useState<string>('');
  const [isResolving, setIsResolving] = useState<boolean>(true);
  const [viewEngine, setViewEngine] = useState<'canvas' | 'browser' | 'google'>('canvas');
  const containerRef = useRef<HTMLDivElement>(null);
  const dict = getDictionary(language);

  // Sync and resolve PDF source when activePdfViewer changes
  useEffect(() => {
    let isCancelled = false;
    if (activePdfViewer) {
      setNotes(activePdfViewer.notes || '');
      setShowNotesDrawer(false);
      setIsResolving(true);
      setViewEngine('canvas');

      resolvePdfUrl(activePdfViewer.pdfUrl)
        .then((resolved) => {
          if (!isCancelled) {
            setResolvedPdfSrc(resolved);
            setIsResolving(false);
          }
        })
        .catch((err) => {
          console.error('Error resolving PDF URL:', err);
          if (!isCancelled) {
            setResolvedPdfSrc(activePdfViewer.pdfUrl);
            setIsResolving(false);
          }
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [activePdfViewer]);

  // Keyboard shortcut to close or toggle fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          setActivePdfViewer(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActivePdfViewer]);

  // Track browser native fullscreen changes
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  if (!activePdfViewer) return null;

  // Toggle browser fullscreen
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsBrowserFullscreen(true);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    savePdfNotes(activePdfViewer.batchId, activePdfViewer.chapterId, activePdfViewer.id, notes);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const isOnlineUrl = activePdfViewer.pdfUrl.startsWith('http://') || activePdfViewer.pdfUrl.startsWith('https://');

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col w-screen h-screen bg-slate-950 text-white overflow-hidden select-none"
    >
      {/* Top Fullscreen Header Navigation Bar */}
      <header className="h-14 px-3 sm:px-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2 sm:gap-3 shrink-0 z-20 shadow-md">
        
        {/* Left: Document Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 shadow-xs border border-cyan-500/30">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md lg:max-w-lg">
              {activePdfViewer.title}
            </h2>
            <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-400 font-mono">
              {activePdfViewer.fileSizeFormatted && (
                <span className="bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                  {activePdfViewer.fileSizeFormatted}
                </span>
              )}
              {activePdfViewer.pageCount && (
                <span>· {activePdfViewer.pageCount} {language === 'hi' ? 'पेज' : 'pages'}</span>
              )}
              {activePdfViewer.category && (
                <span className="capitalize text-teal-400 hidden md:inline">
                  · {activePdfViewer.category.replace('_', ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right: Engine Switcher & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Reader Engine Switcher (In-App PDF.js vs Native Browser vs Google Docs) */}
          <div className="hidden sm:flex items-center p-0.5 bg-slate-800/90 rounded-lg border border-slate-750 text-[11px]">
            <button
              type="button"
              onClick={() => setViewEngine('canvas')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                viewEngine === 'canvas'
                  ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Built-in Canvas PDF Reader (Recommended)"
            >
              <BookCheck className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'इन-ऐप रीडर' : 'In-App Reader'}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewEngine('browser')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                viewEngine === 'browser'
                  ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Native Browser PDF Viewer"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'ब्राउज़र व्यू' : 'Browser'}</span>
            </button>

            {isOnlineUrl && (
              <button
                type="button"
                onClick={() => setViewEngine('google')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewEngine === 'google'
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Google Docs Cloud Viewer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Google Docs</span>
              </button>
            )}
          </div>

          {/* Mark Complete (Tick Button) */}
          <button
            type="button"
            onClick={() => togglePdfCompletion(activePdfViewer.batchId, activePdfViewer.chapterId, activePdfViewer.id)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs rounded-xl font-bold transition-all cursor-pointer shadow-xs border ${
              activePdfViewer.isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 ring-2 ring-emerald-400/30'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700 hover:border-emerald-500 hover:text-emerald-400'
            }`}
            title={activePdfViewer.isCompleted ? dict.markIncomplete : (language === 'hi' ? 'PDF पूरा करें (Tick)' : 'Mark Complete (Tick)')}
          >
            {activePdfViewer.isCompleted ? (
              <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-800 text-white" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="hidden sm:inline">
              {activePdfViewer.isCompleted ? (language === 'hi' ? 'पूर्ण हुआ ✓' : 'Completed ✓') : (language === 'hi' ? 'पूरा करें (Tick)' : 'Mark Done')}
            </span>
          </button>

          {/* Toggle Study Notes Sidebar */}
          <button
            type="button"
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-xl font-semibold transition-colors cursor-pointer border ${
              showNotesDrawer
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750 border-slate-700'
            }`}
            title={language === 'hi' ? 'स्टडी नोट्स साइडबार' : 'Toggle Study Notes'}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {language === 'hi' ? 'नोट्स' : 'Notes'}
            </span>
            {showNotesDrawer ? (
              <PanelRightClose className="w-3.5 h-3.5 ml-0.5" />
            ) : (
              <PanelRightOpen className="w-3.5 h-3.5 ml-0.5" />
            )}
          </button>

          {/* Direct Download Button */}
          <a
            href={resolvedPdfSrc || activePdfViewer.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={`${activePdfViewer.title}.pdf`}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-800"
            title={dict.downloadPdf}
          >
            <Download className="w-4 h-4" />
          </a>

          {/* Open in New Window Tab */}
          <a
            href={resolvedPdfSrc || activePdfViewer.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-800"
            title={language === 'hi' ? 'नए टैब में खोलें' : 'Open in new tab'}
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Native Browser Fullscreen Button */}
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-800"
            title={isBrowserFullscreen ? (language === 'hi' ? 'फुलस्क्रीन से बाहर आएं' : 'Exit Fullscreen') : (language === 'hi' ? 'फुलस्क्रीन व्यू' : 'Fullscreen')}
          >
            {isBrowserFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Modal */}
          <button
            type="button"
            onClick={() => setActivePdfViewer(null)}
            className="p-2 text-slate-400 hover:text-white hover:bg-rose-950/60 hover:border-rose-800 rounded-xl transition-colors cursor-pointer border border-slate-800"
            title={language === 'hi' ? 'बंद करें (Esc)' : 'Close (Esc)'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Fullscreen PDF Content Canvas Area + Sliding Study Notes Drawer */}
      <div className="flex-1 w-full h-[calc(100vh-3.5rem)] relative flex overflow-hidden bg-slate-950">
        
        {/* PDF VIEW CANVAS / OBJECT (100% Full Screen!) */}
        <div className="flex-1 h-full w-full relative bg-slate-950 flex flex-col overflow-hidden">
          {isResolving ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6">
              <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-semibold text-slate-300">
                {language === 'hi' ? 'दस्तावेज़ तैयार किया जा रहा है...' : 'Preparing PDF document...'}
              </p>
            </div>
          ) : viewEngine === 'canvas' ? (
            /* In-App HTML5 Canvas Reader (PDF.js) */
            <PdfCanvasReader
              pdfUrl={resolvedPdfSrc}
              title={activePdfViewer.title}
              language={language}
            />
          ) : viewEngine === 'browser' ? (
            /* Native Browser PDF Object / Embed */
            <div className="w-full h-full bg-slate-900">
              <object
                data={resolvedPdfSrc}
                type="application/pdf"
                className="w-full h-full"
              >
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-300">
                  <p className="text-sm mb-3">
                    {language === 'hi' ? 'ब्राउज़र में PDF प्लगइन उपलब्ध नहीं है।' : 'Native PDF viewer not available in this browser.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setViewEngine('canvas')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
                  >
                    {language === 'hi' ? 'इन-ऐप रीडर में खोलें' : 'Switch to In-App Reader'}
                  </button>
                </div>
              </object>
            </div>
          ) : (
            /* Google Docs Cloud Viewer */
            <div className="w-full h-full bg-slate-900">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(resolvedPdfSrc)}&embedded=true`}
                className="w-full h-full border-0"
                title={activePdfViewer.title}
              />
            </div>
          )}
        </div>

        {/* Collapsible Study Notes Drawer on Right */}
        {showNotesDrawer && (
          <div className="w-80 sm:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-30 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">
                  {dict.studyNotes}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowNotesDrawer(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                title="Close Notes"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body Form */}
            <form onSubmit={handleSaveNotes} className="flex-1 p-3.5 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 flex flex-col mb-3">
                <label className="text-[11px] font-semibold text-slate-400 mb-1.5 block">
                  {language === 'hi' ? 'महत्वपूर्ण सूत्र, शॉर्टकट व रिवीज़न पॉइंट्स:' : 'Key formulas & study takeaways:'}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? '1. महत्वपूर्ण सूत्र:\n2. इस PDF से आने वाले प्रश्न:\n3. रिवीजन पॉइंट्स...'
                      : '1. Important formulas...\n2. High-yield exam points...\n3. Review notes...'
                  }
                  className="w-full flex-1 p-3 text-xs text-white bg-slate-800/80 border border-slate-700 rounded-xl resize-none focus:outline-hidden focus:border-indigo-500 focus:bg-slate-800 leading-relaxed font-sans"
                />
              </div>

              {/* Drawer Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                {saveSuccess ? (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'सेव हो गया!' : 'Saved!'}</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">
                    {language === 'hi' ? 'लोकल डिवाइस पर सुरक्षित' : 'Saved locally'}
                  </span>
                )}

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{dict.saveNotes}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
