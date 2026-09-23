import React, { useState } from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Navbar } from './components/Navbar';
import { BatchList } from './components/BatchList';
import { StudentHub } from './components/StudentHub';
import { BatchDetail } from './components/BatchDetail';
import { AddBatchModal } from './components/AddBatchModal';
import { AddChapterModal } from './components/AddChapterModal';
import { AddVideoModal } from './components/AddVideoModal';
import { AddPdfModal } from './components/AddPdfModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { SearchModal } from './components/SearchModal';
import { getDictionary } from './utils/translations';
import { GraduationCap, Shield } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'batches' | 'batch-detail'>('batches');
  const { setActiveBatchId, setActiveChapterId, language, userRole } = useStudy();
  const dict = getDictionary(language);

  const handleOpenBatch = (batchId: string) => {
    setActiveBatchId(batchId);
    setActiveChapterId(null);
    setCurrentView('batch-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToBatches = () => {
    setCurrentView('batches');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Top Bar with 3-Zone Contract */}
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentView === 'batches' ? (
          userRole === 'admin' ? (
            <BatchList onOpenBatch={handleOpenBatch} />
          ) : (
            <StudentHub onOpenBatch={handleOpenBatch} />
          )
        ) : (
          <BatchDetail onBackToBatches={handleBackToBatches} />
        )}
      </main>

      {/* Modals & Viewers */}
      <AddBatchModal />
      <AddChapterModal />
      <AddVideoModal />
      <AddPdfModal />
      <VideoPlayerModal />
      <PdfViewerModal />
      <SearchModal onSelectBatch={handleOpenBatch} />

      {/* Quiet footer with theme & role indicator */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-[10px]">
              {userRole === 'admin' ? <Shield className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">ShikshaBatch</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span>{dict.appTagline}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              {userRole === 'admin' ? dict.adminPanel : dict.studentPanel}
            </span>
          </div>

          <p className="text-slate-400 dark:text-slate-500">
            {language === 'hi' 
              ? 'सभी बैच और सामग्री आपके डिवाइस में सुरक्षित रूप से संग्रहीत हैं।' 
              : 'All study batches and materials are saved locally on your device.'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <MainAppContent />
    </StudyProvider>
  );
}
