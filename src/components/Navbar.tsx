import React, { useRef, useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { getDictionary } from '../utils/translations';
import { 
  Menu,
  X,
  GraduationCap, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  FolderTree, 
  BookOpen, 
  Trash2,
  Shield,
  Sun,
  Moon,
  Bookmark,
  Check
} from 'lucide-react';

interface NavbarProps {
  currentView: 'batches' | 'batch-detail';
  setCurrentView: (view: 'batches' | 'batch-detail') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView }) => {
  const { 
    batches,
    language, 
    setLanguage, 
    setIsAddBatchOpen, 
    setEditingBatch, 
    setIsSearchOpen, 
    activeBatch,
    exportDataJson,
    importDataJson,
    clearAllBatches,
    userRole,
    setUserRole,
    themeMode,
    toggleTheme,
    bookmarks
  } = useStudy();
  
  const dict = getDictionary(language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Close drawer with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleCreateNewBatch = () => {
    setEditingBatch(null);
    setIsAddBatchOpen(true);
    setIsDrawerOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDataJson(content);
        if (success) {
          alert(language === 'hi' ? 'डेटा सफलतापूर्वक रीस्टोर हो गया!' : 'Data restored successfully!');
          setIsDrawerOpen(false);
        } else {
          alert(language === 'hi' ? 'गलत फ़ाइल प्रारूप (Invalid JSON)' : 'Invalid JSON file format');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleNavigate = (view: 'batches' | 'batch-detail') => {
    setCurrentView(view);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Left Zone: 3-Line Menu Button + Brand Logo */}
          <div className="flex items-center gap-3">
            {/* 3-Line Hamburger Menu Button on Left */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 cursor-pointer flex items-center gap-2 group"
              title={dict.menu || 'Menu'}
              aria-label={dict.menu || 'Menu'}
            >
              <Menu className="w-6 h-6 transition-transform group-hover:scale-105" />
              <span className="hidden md:inline-block text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {dict.menu || 'Menu'}
              </span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            {/* Wordmark brand */}
            <button 
              onClick={() => handleNavigate('batches')} 
              className="flex items-center gap-2.5 text-left group focus-visible:outline-hidden cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-xs group-hover:bg-indigo-700 transition-colors">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-sans block leading-tight">
                    ShikshaBatch
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md ${
                    userRole === 'admin' 
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                      : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                  }`}>
                    {userRole === 'admin' ? dict.adminPanel : dict.studentPanel}
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                  {language === 'hi' ? 'स्मार्ट स्टडी पोर्टल' : 'Smart LMS Portal'}
                </span>
              </div>
            </button>
          </div>

          {/* Right Zone: Clean, minimalist header (quick search trigger) */}
          <div className="flex items-center gap-2">
            {/* Quick Search Shortcut */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-lg transition-colors cursor-pointer border border-slate-200/60 dark:border-slate-700/50"
              title={dict.searchPlaceholder}
            >
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="hidden sm:inline">{dict.searchPlaceholder.slice(0, 18)}...</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-sm text-slate-400 dark:text-slate-400">
                Ctrl K
              </kbd>
            </button>
          </div>

        </div>
      </header>

      {/* Hidden File Input for Data Restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      {/* Slide-over Left Drawer Menu for All Controls */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar Drawer Container */}
          <aside 
            className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full shadow-2xl flex flex-col z-10 border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200 ease-out overflow-hidden"
            aria-label="Navigation Drawer"
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                    ShikshaBatch
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {dict.menu} &middot; {dict.appTagline}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title={dict.closeMenu}
                aria-label={dict.closeMenu}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
              
              {/* SECTION 1: Active Role Switcher */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {dict.currentRole}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    userRole === 'admin' 
                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                  }`}>
                    {userRole === 'admin' ? dict.adminBadge : dict.studentBadge}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <button
                    onClick={() => setUserRole('admin')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      userRole === 'admin'
                        ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-sm border border-amber-200/50 dark:border-amber-900/50'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-amber-500" />
                    <span>{dict.adminPanel}</span>
                  </button>

                  <button
                    onClick={() => setUserRole('student')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      userRole === 'student'
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-200/50 dark:border-emerald-900/50'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 text-emerald-500" />
                    <span>{dict.studentPanel}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 px-1">
                  {userRole === 'admin' ? dict.roleAdminDesc : dict.roleStudentDesc}
                </p>
              </div>

              {/* SECTION 2: Role Primary Action (Create Batch or Go to Learning) */}
              <div>
                {userRole === 'admin' ? (
                  <button
                    onClick={handleCreateNewBatch}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{dict.createBatch}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleNavigate('batches')}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{language === 'hi' ? 'मेरा अध्ययन हब' : 'My Learning Hub'}</span>
                  </button>
                )}
              </div>

              {/* SECTION 3: Quick Navigation */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                  {dict.quickNavigation}
                </span>

                <div className="space-y-1">
                  <button
                    onClick={() => handleNavigate('batches')}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      currentView === 'batches'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <FolderTree className="w-4 h-4 text-indigo-500" />
                      <span>{dict.allBatches}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-200/60 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                      {batches.length}
                    </span>
                  </button>

                  {activeBatch && (
                    <button
                      onClick={() => handleNavigate('batch-detail')}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        currentView === 'batch-detail'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate">{activeBatch.title}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {activeBatch.chapters.length} chap
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="w-4 h-4 text-slate-400" />
                      <span>{language === 'hi' ? 'खोजें (Search)' : 'Search All Material'}</span>
                    </div>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-200/60 dark:bg-slate-800 rounded text-slate-500">
                      Ctrl K
                    </kbd>
                  </button>

                  {userRole === 'student' && bookmarks.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-medium">
                        <Bookmark className="w-4 h-4 text-amber-500" />
                        <span>{dict.myBookmarks}</span>
                      </div>
                      <span className="font-bold text-amber-700 dark:text-amber-400 font-mono">
                        {bookmarks.length}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 4: Theme & Language Preferences */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                  {dict.settings}
                </span>

                <div className="space-y-2">
                  {/* Theme Mode Toggle Row */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      {themeMode === 'dark' ? (
                        <Moon className="w-4 h-4 text-indigo-400" />
                      ) : (
                        <Sun className="w-4 h-4 text-amber-500" />
                      )}
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                          {themeMode === 'dark' ? dict.darkMode : dict.lightMode}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">
                          {themeMode === 'dark' ? 'Dark theme active' : 'Light theme active'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={toggleTheme}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {themeMode === 'dark' ? dict.lightMode : dict.darkMode}
                    </button>
                  </div>

                  {/* Language Toggle Row */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                        {language === 'hi' ? 'भाषा (Language)' : 'Language'}
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {language === 'hi' ? 'हिन्दी चयनित है' : 'English selected'}
                      </span>
                    </div>

                    <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                      <button
                        onClick={() => setLanguage('hi')}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                          language === 'hi'
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        हिन्दी
                      </button>
                      <button
                        onClick={() => setLanguage('en')}
                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                          language === 'en'
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Data Management (Admin Tools) */}
              {userRole === 'admin' && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                    {dict.dataManagement}
                  </span>

                  <div className="space-y-1.5">
                    {/* Export Backup */}
                    <button
                      onClick={exportDataJson}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Download className="w-4 h-4 text-indigo-500" />
                        <span>{dict.exportBackup}</span>
                      </div>
                    </button>

                    {/* Import Restore */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Upload className="w-4 h-4 text-emerald-500" />
                        <span>{dict.importBackup}</span>
                      </div>
                    </button>

                    {/* Clear Batches */}
                    {batches.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm(dict.confirmDeleteBatch)) {
                            clearAllBatches();
                            setCurrentView('batches');
                            setIsDrawerOpen(false);
                          }
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Trash2 className="w-4 h-4 text-rose-500" />
                          <span>{language === 'hi' ? 'सभी बैच और सामग्री हटाएं' : 'Clear All Batches & Content'}</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-teal-500" />
                <span>{language === 'hi' ? 'स्थानीय स्टोरेज सक्रिय' : 'Local Storage Active'}</span>
              </span>
              <span>v1.2.0</span>
            </div>

          </aside>
        </div>
      )}
    </>
  );
};
