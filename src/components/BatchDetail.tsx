import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { getDictionary } from '../utils/translations';
import { themeStyles } from '../utils/helpers';
import { ChapterView } from './ChapterView';
import { 
  ChevronRight, 
  ArrowLeft, 
  FolderPlus, 
  Folder, 
  FolderOpen,
  Video, 
  FileText, 
  CheckCircle,
  CheckCircle2,
  Circle,
  Pencil,
  BookOpen,
  Sparkles,
  Shield,
  GraduationCap,
  Plus,
  Trash2,
  ExternalLink,
  Layers
} from 'lucide-react';

interface BatchDetailProps {
  onBackToBatches: () => void;
}

export const BatchDetail: React.FC<BatchDetailProps> = ({ onBackToBatches }) => {
  const { 
    activeBatch, 
    activeChapter, 
    setActiveChapterId, 
    language,
    setIsAddChapterOpen,
    setTargetBatchForChapter,
    setEditingChapter,
    setEditingBatch,
    setIsAddBatchOpen,
    setIsAddVideoOpen,
    setTargetChapterForVideo,
    setIsAddPdfOpen,
    setTargetChapterForPdf,
    deleteChapter,
    toggleChapterCompletion,
    userRole
  } = useStudy();

  const dict = getDictionary(language);

  if (!activeBatch) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 dark:text-slate-400 mb-4">{dict.noBatches}</p>
        <button
          onClick={onBackToBatches}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          {dict.allBatches}
        </button>
      </div>
    );
  }

  const theme = themeStyles[activeBatch.colorTheme] || themeStyles.indigo;

  const handleAddNewChapter = () => {
    setEditingChapter(null);
    setTargetBatchForChapter(activeBatch.id);
    setIsAddChapterOpen(true);
  };

  const handleEditBatch = () => {
    setEditingBatch(activeBatch);
    setIsAddBatchOpen(true);
  };

  const handleQuickAddVideo = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetChapterForVideo({ batchId: activeBatch.id, chapterId });
    setIsAddVideoOpen(true);
  };

  const handleQuickAddPdf = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargetChapterForPdf({ batchId: activeBatch.id, chapterId });
    setIsAddPdfOpen(true);
  };

  const handleDeleteChapterClick = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(dict.confirmDeleteChapter)) {
      deleteChapter(activeBatch.id, chapterId);
    }
  };

  const handleEditChapterClick = (chapter: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChapter(chapter);
    setIsAddChapterOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Breadcrumbs & Navigation Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <button
            onClick={onBackToBatches}
            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{dict.allBatches}</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
          <button
            onClick={() => setActiveChapterId(null)}
            className={`transition-colors truncate max-w-[200px] cursor-pointer ${
              !activeChapter ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            {activeBatch.title}
          </button>
          {activeChapter && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
              <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[220px]">
                <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{activeChapter.title}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Batch Header Banner */}
      <div className={`rounded-2xl sm:rounded-3xl p-6 sm:p-7 text-white shadow-sm mb-6 relative overflow-hidden ${
        !activeBatch.imageUrl ? `bg-gradient-to-r ${theme.gradient}` : 'bg-slate-950'
      }`}>
        {activeBatch.imageUrl && (
          <img
            src={activeBatch.imageUrl}
            alt={activeBatch.title}
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent" />
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${theme.gradient}`} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            {/* Metadata row */}
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-100 flex-wrap">
              <span className="bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-xs">{activeBatch.subject}</span>
              <span aria-hidden="true">·</span>
              <span>{activeBatch.targetExam}</span>
              {activeBatch.instructor && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{activeBatch.instructor}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-md font-mono">
                {activeBatch.chapters.length} {language === 'hi' ? 'चैप्टर फ़ोल्डर्स' : 'Chapter Folders'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {activeBatch.title}
            </h1>

            {activeBatch.description && (
              <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed pt-1">
                {activeBatch.description}
              </p>
            )}
          </div>

          {/* Actions depending on role */}
          <div className="flex items-center gap-2 shrink-0">
            {userRole === 'admin' ? (
              <>
                <button
                  onClick={handleEditBatch}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{dict.editBatch}</span>
                </button>
                <button
                  onClick={handleAddNewChapter}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-900 hover:bg-slate-50 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === 'hi' ? '+ नया चैप्टर फ़ोल्डर' : '+ New Chapter Folder'}</span>
                </button>
              </>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-xl text-xs font-semibold backdrop-blur-xs">
                <GraduationCap className="w-4 h-4" />
                <span>{dict.studentPanel}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout: Left Chapter Folders Sidebar + Right Folder Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Chapter Folder Navigation Tree */}
        <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Folder className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'hi' ? 'चैप्टर फ़ोल्डर्स' : 'Chapter Folders'}</span>
              <span className="font-mono tabular-nums text-slate-400 font-normal">
                ({activeBatch.chapters.length})
              </span>
            </div>

            {userRole === 'admin' && (
              <button
                onClick={handleAddNewChapter}
                className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-md transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title={dict.addChapter}
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span className="text-[11px]">{language === 'hi' ? '+ नया' : '+ New'}</span>
              </button>
            )}
          </div>

          {/* Top Quick Action: All Chapter Folders */}
          <button
            onClick={() => setActiveChapterId(null)}
            className={`w-full text-left p-2.5 mb-2 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 font-bold text-xs ${
              !activeChapter
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-amber-300" />
            <span className="flex-1">{dict.allChapterFolders || (language === 'hi' ? 'सभी चैप्टर फ़ोल्डर्स' : 'All Chapter Folders')}</span>
            <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
              !activeChapter ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              {activeBatch.chapters.length}
            </span>
          </button>

          {/* Chapters List */}
          {activeBatch.chapters.length > 0 ? (
            <div className="space-y-1.5 max-h-[550px] overflow-y-auto pr-1">
              {activeBatch.chapters.map((chap, idx) => {
                const isActive = activeChapter?.id === chap.id;
                const vCount = chap.videos.length;
                const pCount = chap.pdfs.length;
                const completedCount = 
                  chap.videos.filter(v => v.isCompleted).length + 
                  chap.pdfs.filter(p => p.isCompleted).length;
                const totalInChap = vCount + pCount;
                const isAllDone = totalInChap > 0 && completedCount === totalInChap;

                return (
                  <button
                    key={chap.id}
                    onClick={() => setActiveChapterId(chap.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200 font-medium shadow-2xs'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {/* Chapter folder image or index numbering */}
                    {chap.imageUrl ? (
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                        <img src={chap.imageUrl} alt={chap.title} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0 right-0 bg-black/75 text-white text-[9px] font-mono px-1 rounded-tl-sm font-semibold">
                          {chap.chapterNumber || idx + 1}
                        </span>
                      </div>
                    ) : (
                      <span className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                        isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        📁
                      </span>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold truncate block">
                          {chap.title}
                        </span>
                        
                        {/* Interactive Chapter Complete Tick Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleChapterCompletion(activeBatch.id, chap.id);
                          }}
                          className={`p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
                            isAllDone
                              ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60'
                              : 'text-slate-300 dark:text-slate-600 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                          title={isAllDone ? (language === 'hi' ? 'चैप्टर अधूरा करें' : 'Mark incomplete') : (language === 'hi' ? 'चैप्टर पूरा करें (Tick)' : 'Mark complete (Tick)')}
                        >
                          {isAllDone ? (
                            <CheckCircle2 className="w-4 h-4 fill-emerald-100 dark:fill-emerald-950 text-emerald-600" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-400 hover:text-emerald-500" />
                          )}
                        </button>
                      </div>

                      {/* Content summary badges */}
                      <div className="flex items-center gap-2.5 text-[11px] text-slate-400 dark:text-slate-500 font-mono tabular-nums">
                        <span className="flex items-center gap-1" title={`${vCount} Videos in this folder`}>
                          <Video className="w-3 h-3 text-rose-500" />
                          <span>{vCount}</span>
                        </span>
                        <span className="flex items-center gap-1" title={`${pCount} PDFs in this folder`}>
                          <FileText className="w-3 h-3 text-cyan-600" />
                          <span>{pCount}</span>
                        </span>
                        {totalInChap > 0 && (
                          <span className="ml-auto text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                            {completedCount}/{totalInChap}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 px-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Folder className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{dict.noChapters}</p>
              {userRole === 'admin' && (
                <button
                  onClick={handleAddNewChapter}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                >
                  {dict.addChapter}
                </button>
              )}
            </div>
          )}
        </aside>

        {/* Right Column: Chapter Workspace OR Chapter Folders Overview */}
        <div className="lg:col-span-8 xl:col-span-9">
          {activeChapter ? (
            /* Open Specific Chapter Folder */
            <ChapterView 
              key={activeChapter.id} 
              chapter={activeChapter} 
              batchTheme={activeBatch.colorTheme} 
            />
          ) : (
            /* ALL CHAPTER FOLDERS GRID VIEW */
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold">
                        <Folder className="w-4 h-4" />
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        {language === 'hi' ? 'बैच के चैप्टर फ़ोल्डर्स' : 'Batch Chapter Folders'}
                      </h2>
                      <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                        {activeBatch.chapters.length} {language === 'hi' ? 'फ़ोल्डर' : 'Folders'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {dict.chapterFolderOverview}
                    </p>
                  </div>

                  {userRole === 'admin' && (
                    <button
                      onClick={handleAddNewChapter}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>{language === 'hi' ? '+ नया चैप्टर फ़ोल्डर' : '+ New Chapter Folder'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of Chapter Folder Cards */}
              {activeBatch.chapters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {activeBatch.chapters.map((chap, idx) => {
                    const vCount = chap.videos.length;
                    const pCount = chap.pdfs.length;
                    const totalInChap = vCount + pCount;
                    const completedCount = 
                      chap.videos.filter(v => v.isCompleted).length + 
                      chap.pdfs.filter(p => p.isCompleted).length;
                    const isAllDone = (totalInChap > 0 && completedCount === totalInChap) || !!chap.isCompleted;
                    const progressPercent = totalInChap > 0 ? Math.round((completedCount / totalInChap) * 100) : (isAllDone ? 100 : 0);

                    return (
                      <div
                        key={chap.id}
                        className={`group bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col ${
                          isAllDone
                            ? 'border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600'
                        }`}
                      >
                        {/* Folder Top Visual Banner / Cover */}
                        {chap.imageUrl ? (
                          <div className="relative h-28 w-full overflow-hidden bg-slate-950">
                            <img
                              src={chap.imageUrl}
                              alt={chap.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
                            <div className="absolute top-2.5 left-3 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono font-bold flex items-center gap-1">
                                <Folder className="w-3 h-3 text-amber-400" />
                                <span>{language === 'hi' ? `अध्याय ${chap.chapterNumber || idx + 1}` : `Chapter ${chap.chapterNumber || idx + 1}`}</span>
                              </span>

                              {/* Top Banner Tick Complete Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleChapterCompletion(activeBatch.id, chap.id);
                                }}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer backdrop-blur-md shadow-xs ${
                                  isAllDone
                                    ? 'bg-emerald-600 text-white ring-1 ring-white/40'
                                    : 'bg-black/60 hover:bg-black/80 text-white/90 border border-white/20'
                                }`}
                                title={isAllDone ? (language === 'hi' ? 'चैप्टर अधूरा करें' : 'Mark incomplete') : (language === 'hi' ? 'चैप्टर पूरा करें (Tick)' : 'Mark chapter complete')}
                              >
                                {isAllDone ? (
                                  <CheckCircle2 className="w-3 h-3 text-white fill-emerald-800" />
                                ) : (
                                  <Circle className="w-3 h-3 text-white/70" />
                                )}
                                <span>{isAllDone ? (language === 'hi' ? 'पूर्ण ✓' : 'Done ✓') : (language === 'hi' ? 'पूरा करें' : 'Mark Done')}</span>
                              </button>
                            </div>

                            {userRole === 'admin' && (
                              <div className="absolute top-2.5 right-3 flex items-center gap-1">
                                <button
                                  onClick={(e) => handleEditChapterClick(chap, e)}
                                  className="p-1.5 rounded-md bg-black/60 hover:bg-black/80 text-white text-xs transition-colors cursor-pointer"
                                  title={dict.editChapter}
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteChapterClick(chap.id, e)}
                                  className="p-1.5 rounded-md bg-black/60 hover:bg-rose-600 text-white text-xs transition-colors cursor-pointer"
                                  title={dict.deleteChapter}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                <Folder className="w-4 h-4 text-amber-500" />
                              </div>
                              <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-mono font-bold">
                                {language === 'hi' ? `अध्याय ${chap.chapterNumber || idx + 1}` : `Chapter ${chap.chapterNumber || idx + 1}`}
                              </span>

                              {/* Header Tick Complete Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleChapterCompletion(activeBatch.id, chap.id);
                                }}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer shadow-2xs ${
                                  isAllDone
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-1 ring-emerald-500'
                                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                }`}
                                title={isAllDone ? (language === 'hi' ? 'चैप्टर अधूरा करें' : 'Mark incomplete') : (language === 'hi' ? 'चैप्टर पूरा करें (Tick)' : 'Mark chapter complete')}
                              >
                                {isAllDone ? (
                                  <CheckCircle2 className="w-3 h-3 text-white fill-emerald-800" />
                                ) : (
                                  <Circle className="w-3 h-3 text-slate-400" />
                                )}
                                <span>{isAllDone ? (language === 'hi' ? 'पूर्ण ✓' : 'Done ✓') : (language === 'hi' ? 'पूरा करें' : 'Mark Done')}</span>
                              </button>
                            </div>

                            {userRole === 'admin' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => handleEditChapterClick(chap, e)}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
                                  title={dict.editChapter}
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteChapterClick(chap.id, e)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                                  title={dict.deleteChapter}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Folder Body */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <h3 
                              onClick={() => setActiveChapterId(chap.id)}
                              className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                            >
                              {chap.title}
                            </h3>
                            {chap.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                {chap.description}
                              </p>
                            )}
                          </div>

                          {/* Inside Folder Preview (Videos & PDFs) */}
                          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                                <Video className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                <span>{language === 'hi' ? 'वीडियो फ़ोल्डर' : 'Videos'}</span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                                {vCount} {language === 'hi' ? 'लेक्चर्स' : 'Lectures'}
                              </p>
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                                <FileText className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                <span>{language === 'hi' ? 'PDF फ़ोल्डर' : 'PDF Notes'}</span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                                {pCount} {language === 'hi' ? 'डॉक्युमेंट्स' : 'Documents'}
                              </p>
                            </div>
                          </div>

                          {/* Progress */}
                          {totalInChap > 0 && (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                                <span>{language === 'hi' ? 'पूर्णता' : 'Progress'}</span>
                                <span>{progressPercent}% ({completedCount}/{totalInChap})</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full transition-all"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Action Row */}
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                            <button
                              onClick={() => setActiveChapterId(chap.id)}
                              className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>{language === 'hi' ? 'फ़ोल्डर खोलें' : 'Open Folder'}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            {/* Chapter Folder Complete Tick Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleChapterCompletion(activeBatch.id, chap.id);
                              }}
                              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 border shadow-2xs shrink-0 ${
                                isAllDone
                                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600'
                              }`}
                              title={isAllDone ? (language === 'hi' ? 'चैप्टर अधूरा करें' : 'Mark incomplete') : (language === 'hi' ? 'चैप्टर पूरा करें (Tick)' : 'Mark chapter complete')}
                            >
                              {isAllDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-400" />
                              )}
                              <span>{isAllDone ? (language === 'hi' ? 'पूर्ण ✓' : 'Done ✓') : (language === 'hi' ? 'टिक करें' : 'Tick')}</span>
                            </button>

                            {userRole === 'admin' && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => handleQuickAddVideo(chap.id, e)}
                                  className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer border border-rose-200 dark:border-rose-900/60"
                                  title={dict.addVideo}
                                >
                                  <Video className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleQuickAddPdf(chap.id, e)}
                                  className="p-2 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 rounded-xl transition-colors cursor-pointer border border-cyan-200 dark:border-cyan-900/60"
                                  title={dict.addPdf}
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-2xs">
                  <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {dict.noChapters}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-md mx-auto">
                    {language === 'hi' 
                      ? 'इस बैच में अभी कोई चैप्टर फ़ोल्डर नहीं है। वीडियो और PDF रखने के लिए पहला चैप्टर फ़ोल्डर बनाएं।' 
                      : 'No chapter folders in this batch yet. Create a chapter folder to organize your video lectures and PDFs.'}
                  </p>
                  {userRole === 'admin' && (
                    <button
                      onClick={handleAddNewChapter}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
                    >
                      <FolderPlus className="w-4 h-4" />
                      <span>{dict.addChapter}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
