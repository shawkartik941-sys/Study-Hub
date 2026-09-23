import React from 'react';
import { Batch } from '../types';
import { themeStyles } from '../utils/helpers';
import { useStudy } from '../context/StudyContext';
import { getDictionary } from '../utils/translations';
import { 
  Folder, 
  Video, 
  FileText, 
  MoreVertical, 
  ArrowRight, 
  Pencil, 
  Trash2,
  Plus,
  BookOpen
} from 'lucide-react';

interface BatchCardProps {
  batch: Batch;
  onOpenBatch: (batchId: string) => void;
}

export const BatchCard: React.FC<BatchCardProps> = ({ batch, onOpenBatch }) => {
  const { 
    language, 
    setEditingBatch, 
    setIsAddBatchOpen, 
    deleteBatch,
    setTargetBatchForChapter,
    setIsAddChapterOpen,
    userRole
  } = useStudy();
  
  const [menuOpen, setMenuOpen] = React.useState(false);
  const dict = getDictionary(language);
  const theme = themeStyles[batch.colorTheme] || themeStyles.indigo;

  // Calculate totals
  const totalChapters = batch.chapters.length;
  let totalVideos = 0;
  let totalPdfs = 0;
  let completed = 0;

  batch.chapters.forEach(c => {
    totalVideos += c.videos.length;
    totalPdfs += c.pdfs.length;
    c.videos.forEach(v => {
      if (v.isCompleted) completed++;
    });
    c.pdfs.forEach(p => {
      if (p.isCompleted) completed++;
    });
  });

  const totalItems = totalVideos + totalPdfs;
  const progressPercent = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    setEditingBatch(batch);
    setIsAddBatchOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (confirm(dict.confirmDeleteBatch)) {
      deleteBatch(batch.id);
    }
  };

  const handleAddChapterQuick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetBatchForChapter(batch.id);
    setIsAddChapterOpen(true);
  };

  return (
    <div 
      onClick={() => onOpenBatch(batch.id)}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
    >
      {/* If custom batch cover image exists, render image header */}
      {batch.imageUrl ? (
        <div className="relative h-36 w-full overflow-hidden bg-slate-950">
          <img
            src={batch.imageUrl}
            alt={batch.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.gradient}`} />
          
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
            <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[11px] font-semibold">
              {batch.subject}
            </span>
            <span className="text-[11px] font-medium text-slate-300">
              {batch.targetExam}
            </span>
          </div>

          {/* Quick Menu Button (admin only) */}
          {userRole === 'admin' && (
            <div className="absolute top-2.5 right-2.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="p-1.5 text-white bg-black/50 hover:bg-black/80 rounded-lg backdrop-blur-xs transition-colors cursor-pointer"
                title="Options"
                aria-label="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                    }}
                  />
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs">
                    <button
                      onClick={handleAddChapterQuick}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>{dict.addChapter}</span>
                    </button>
                    <button
                      onClick={handleEdit}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-500" />
                      <span>{dict.editBatch}</span>
                    </button>
                    <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-600 dark:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{dict.deleteBatch}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Decorative top accent band fallback */
        <div className={`h-2.5 w-full bg-gradient-to-r ${theme.gradient}`} />
      )}

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: Only show if NO image (since image already displays subject/exam) */}
          {!batch.imageUrl && (
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 flex-wrap">
                <span className={`font-semibold ${theme.text}`}>{batch.subject}</span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                <span>{batch.targetExam}</span>
              </div>

              {/* Menu trigger (admin only) */}
              {userRole === 'admin' && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(!menuOpen);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                    title="Options"
                    aria-label="Options"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {menuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                        }}
                      />
                      <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs">
                        <button
                          onClick={handleAddChapterQuick}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          <span>{dict.addChapter}</span>
                        </button>
                        <button
                          onClick={handleEdit}
                          className="w-full text-left px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5 text-slate-500" />
                          <span>{dict.editBatch}</span>
                        </button>
                        <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                        <button
                          onClick={handleDelete}
                          className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-600 dark:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{dict.deleteBatch}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Batch Title */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
            {batch.title}
          </h3>

          {/* Instructor & Description */}
          {batch.instructor && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
              <span className="text-slate-400 dark:text-slate-500 font-normal">{language === 'hi' ? 'शिक्षक: ' : 'Instructor: '}</span>
              <span className="text-slate-700 dark:text-slate-300">{batch.instructor}</span>
            </p>
          )}

          {batch.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
              {batch.description}
            </p>
          )}
        </div>

        {/* Resources count & Progress */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-mono tabular-nums" title={dict.chapters}>
                <Folder className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{totalChapters}</span>
              </span>
              <span className="flex items-center gap-1 font-mono tabular-nums" title={dict.videos}>
                <Video className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                <span>{totalVideos}</span>
              </span>
              <span className="flex items-center gap-1 font-mono tabular-nums" title={dict.pdfs}>
                <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{totalPdfs}</span>
              </span>
            </div>

            <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
              {progressPercent}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
            <div 
              className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-300`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* CTA Footer */}
          <div className="flex items-center justify-between pt-1">
            {userRole === 'admin' ? (
              <button
                onClick={handleAddChapterQuick}
                className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? '+ नया चैप्टर' : '+ Chapter'}</span>
              </button>
            ) : (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                <span>{language === 'hi' ? 'पाठ्यक्रम' : 'Curriculum'}</span>
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
              <span>{userRole === 'student' ? (language === 'hi' ? 'अध्ययन शुरू करें' : 'Start Study') : (language === 'hi' ? 'बैच खोलें' : 'Open Batch')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
