import React, { useState, useEffect, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { getDictionary } from '../utils/translations';
import { Search, X, Video, FileText, Folder, Layers, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  onSelectBatch: (batchId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ onSelectBatch }) => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    batches, 
    setActiveBatchId, 
    setActiveChapterId, 
    setActiveVideoPlayer,
    setActivePdfViewer,
    language 
  } = useStudy();

  const [query, setQuery] = useState('');
  const dict = getDictionary(language);

  // Global keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const results: {
      type: 'batch' | 'chapter' | 'video' | 'pdf';
      id: string;
      title: string;
      subtitle: string;
      batchId: string;
      chapterId?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      item: any;
    }[] = [];

    batches.forEach(b => {
      if (b.title.toLowerCase().includes(q) || b.subject.toLowerCase().includes(q) || b.targetExam.toLowerCase().includes(q)) {
        results.push({
          type: 'batch',
          id: b.id,
          title: b.title,
          subtitle: `${b.subject} · ${b.targetExam}`,
          batchId: b.id,
          item: b,
        });
      }

      b.chapters.forEach(c => {
        if (c.title.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q))) {
          results.push({
            type: 'chapter',
            id: c.id,
            title: c.title,
            subtitle: `${b.title} · Chapter ${c.chapterNumber}`,
            batchId: b.id,
            chapterId: c.id,
            item: c,
          });
        }

        c.videos.forEach(v => {
          if (v.title.toLowerCase().includes(q) || (v.description && v.description.toLowerCase().includes(q))) {
            results.push({
              type: 'video',
              id: v.id,
              title: v.title,
              subtitle: `${b.title} › ${c.title} · ${v.durationFormatted || 'Video'}`,
              batchId: b.id,
              chapterId: c.id,
              item: v,
            });
          }
        });

        c.pdfs.forEach(p => {
          if (p.title.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))) {
            results.push({
              type: 'pdf',
              id: p.id,
              title: p.title,
              subtitle: `${b.title} › ${c.title} · ${p.fileSizeFormatted || 'PDF'}`,
              batchId: b.id,
              chapterId: c.id,
              item: p,
            });
          }
        });
      });
    });

    return results.slice(0, 15);
  }, [query, batches]);

  if (!isSearchOpen) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectResult = (res: any) => {
    setActiveBatchId(res.batchId);
    if (res.chapterId) {
      setActiveChapterId(res.chapterId);
    }

    if (res.type === 'video') {
      setActiveVideoPlayer(res.item);
    } else if (res.type === 'pdf') {
      setActivePdfViewer(res.item);
    } else {
      onSelectBatch(res.batchId);
    }

    setIsSearchOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'batch':
        return <Layers className="w-4 h-4 text-indigo-500" />;
      case 'chapter':
        return <Folder className="w-4 h-4 text-emerald-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-rose-500" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-cyan-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        className="fixed inset-0"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[70vh] transition-colors">
        
        {/* Search Input bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder={dict.searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {searchResults.length > 0 ? (
            <div className="space-y-1">
              {searchResults.map((res) => (
                <button
                  key={`${res.type}-${res.id}`}
                  onClick={() => handleSelectResult(res)}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-3 group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      {getIcon(res.type)}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate block">
                        {res.title}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block font-mono">
                        {res.subtitle}
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500">
              <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p>{language === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No matching results found'}</p>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
              <p>{language === 'hi' ? 'बैच, चैप्टर, वीडियो या PDF का नाम टाइप करें' : 'Type to search across batches, chapters, videos, or PDFs'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
