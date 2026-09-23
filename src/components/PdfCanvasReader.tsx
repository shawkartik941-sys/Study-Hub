import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize, 
  FileText, 
  AlertCircle, 
  ExternalLink, 
  Download,
  RefreshCw,
  Eye,
  Rows
} from 'lucide-react';

// Initialize PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface PdfCanvasReaderProps {
  pdfUrl: string;
  title: string;
  language: string;
}

export const PdfCanvasReader: React.FC<PdfCanvasReaderProps> = ({
  pdfUrl,
  title,
  language,
}) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.25);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'single' | 'scroll'>('single');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load the PDF document
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setLoading(false);
        }
      } catch (err: any) {
        console.warn('PDF.js loading note:', err);
        if (!isCancelled) {
          setError(err?.message || 'Failed to load PDF document');
          setLoading(false);
        }
      }
    };

    if (pdfUrl) {
      loadPdf();
    }

    return () => {
      isCancelled = true;
    };
  }, [pdfUrl]);

  // Render the current page onto HTML5 canvas
  useEffect(() => {
    if (!pdfDoc || viewMode !== 'single') return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Cancel previous render task if active
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        const viewport = page.getViewport({ scale, rotation });
        const pixelRatio = window.devicePixelRatio || 1;

        // High DPI canvas rendering for sharp fonts & formulas
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(pixelRatio, pixelRatio);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
          canvas: canvas,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        renderTaskRef.current = null;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, currentPage, scale, rotation, viewMode]);

  // Keyboard navigation for pages (Left/Right arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'single') return;
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage((prev) => Math.min(prev + 1, numPages));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [numPages, viewMode]);

  // Page navigation handlers
  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, numPages));
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.25);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-200">
          {language === 'hi' ? 'PDF लोड हो रही है...' : 'Rendering PDF pages...'}
        </p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">
          {language === 'hi' ? 'उच्च रिज़ॉल्यूशन में पेज तैयार किए जा रहे हैं' : 'Processing document in high-DPI reader'}
        </p>
      </div>
    );
  }

  // Fallback UI if PDF.js encounters CORS or format issue
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-white mb-2 text-center">
          {language === 'hi' ? 'PDF सीधे लोड नहीं हो सकी' : 'PDF couldn\'t load in Canvas Reader'}
        </h3>
        <p className="text-xs text-slate-400 max-w-md text-center mb-6 leading-relaxed">
          {language === 'hi'
            ? 'यह फ़ाइल बाहरी वेबसाइट या ब्राउज़र सुरक्षा नीति के कारण सीधे नहीं खुल पाई। आप इसे नीचे दिए गए विकल्पों से तुरंत देख सकते हैं:'
            : 'External security policy restricted direct canvas rendering. You can view or download it using the options below:'}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 shadow-md"
          >
            <Eye className="w-4 h-4" />
            <span>{language === 'hi' ? 'Google Docs Viewer में देखें' : 'Open in Google Docs Viewer'}</span>
          </a>

          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 border border-slate-700"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{language === 'hi' ? 'नए टैब में खोलें' : 'Open in New Tab'}</span>
          </a>

          <a
            href={pdfUrl}
            download={`${title}.pdf`}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2 border border-slate-700"
          >
            <Download className="w-4 h-4" />
            <span>{language === 'hi' ? 'डाउनलोड करें' : 'Download PDF'}</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden select-none">
      
      {/* Floating / Sticky PDF Reader Control Toolbar */}
      <div className="h-11 px-3 sm:px-6 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0 z-20 backdrop-blur-xs">
        
        {/* Page Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors cursor-pointer"
            title="Previous Page (←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-850 border border-slate-750 text-xs font-mono">
            <input
              type="number"
              min={1}
              max={numPages}
              value={currentPage}
              onChange={(e) => {
                const p = parseInt(e.target.value);
                if (p >= 1 && p <= numPages) setCurrentPage(p);
              }}
              className="w-10 text-center bg-transparent text-white font-bold focus:outline-hidden"
            />
            <span className="text-slate-500 font-sans">/</span>
            <span className="text-slate-400 font-bold">{numPages}</span>
          </div>

          <button
            type="button"
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 transition-colors cursor-pointer"
            title="Next Page (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom Percentage */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors cursor-pointer"
            title="Reset Zoom to 100%"
          >
            {Math.round(scale * 100)}%
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Rotate */}
          <button
            type="button"
            onClick={handleRotate}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Rotate Page"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Document View Canvas Area */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 w-full h-full overflow-auto bg-slate-950 p-2 sm:p-6 flex items-start justify-center"
      >
        <div className="relative shadow-2xl rounded-sm overflow-hidden bg-white border border-slate-700/60 my-auto">
          <canvas
            ref={canvasRef}
            className="block"
          />
        </div>
      </div>
    </div>
  );
};
