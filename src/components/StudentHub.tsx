import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { getDictionary } from '../utils/translations';
import { themeStyles } from '../utils/helpers';
import { 
  GraduationCap, 
  BookOpen, 
  Play, 
  FileText, 
  Bookmark, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  BookmarkCheck, 
  Search, 
  FolderTree,
  ChevronRight,
  Shield,
  Layers,
  Flame,
  X
} from 'lucide-react';

interface StudentHubProps {
  onOpenBatch: (batchId: string) => void;
}

export const StudentHub: React.FC<StudentHubProps> = ({ onOpenBatch }) => {
  const { 
    batches, 
    language, 
    bookmarks, 
    toggleBookmark, 
    recentActivities, 
    setActiveVideoPlayer, 
    setActivePdfViewer, 
    setUserRole,
    stats,
    setActiveBatchId,
    setActiveChapterId
  } = useStudy();

  const dict = getDictionary(language);
  const [activeTab, setActiveTab] = useState<'batches' | 'bookmarks' | 'recents'>('batches');
  const [bookmarkTypeFilter, setBookmarkTypeFilter] = useState<'all' | 'video' | 'pdf'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleResumeActivity = (activity: typeof recentActivities[0]) => {
    const batch = batches.find(b => b.id === activity.batchId);
    if (!batch) return;
    const chapter = batch.chapters.find(c => c.id === activity.chapterId);
    if (!chapter) return;

    setActiveBatchId(batch.id);
    setActiveChapterId(chapter.id);

    if (activity.type === 'video') {
      const vid = chapter.videos.find(v => v.id === activity.resourceId);
      if (vid) setActiveVideoPlayer(vid);
    } else {
      const pdf = chapter.pdfs.find(p => p.id === activity.resourceId);
      if (pdf) setActivePdfViewer(pdf);
    }
  };

  const handleOpenBookmark = (bm: typeof bookmarks[0]) => {
    const batch = batches.find(b => b.id === bm.batchId);
    if (!batch) return;
    const chapter = batch.chapters.find(c => c.id === bm.chapterId);
    if (!chapter) return;

    setActiveBatchId(batch.id);
    setActiveChapterId(chapter.id);

    if (bm.type === 'video') {
      const vid = chapter.videos.find(v => v.id === bm.resourceId);
      if (vid) setActiveVideoPlayer(vid);
    } else {
      const pdf = chapter.pdfs.find(p => p.id === bm.resourceId);
      if (pdf) setActivePdfViewer(pdf);
    }
  };

  // Filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter(b => {
      const matchType = bookmarkTypeFilter === 'all' || b.type === bookmarkTypeFilter;
      const matchSearch = 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.batchTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [bookmarks, bookmarkTypeFilter, searchQuery]);

  // Filtered batches for student
  const filteredBatches = useMemo(() => {
    if (!searchQuery.trim()) return batches;
    return batches.filter(b => 
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.targetExam.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [batches, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-indigo-900/40 shadow-lg">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-lg text-indigo-200">
                <GraduationCap className="w-4 h-4 text-indigo-300" />
                <span>{dict.studentBadge}</span>
              </span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'hi' ? 'दैनिक अध्ययन मोड सक्रिय' : 'Daily Study Mode Active'}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {language === 'hi' ? 'विद्यार्थी अध्ययन कक्ष (Student Portal)' : 'Student Learning Hub'}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {dict.studentNotice}
            </p>
          </div>

          {/* Quick role toggle & streak */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setUserRole('admin')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-medium backdrop-blur-xs transition-colors cursor-pointer"
              title={language === 'hi' ? 'एडमिन मोड में जाएं (बैच और चैप्टर संपादित करें)' : 'Switch to Admin Mode'}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hi' ? 'एडमिन मोड चालू करें' : 'Switch to Admin'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1.5">
            <span>{dict.enrolledBatches}</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {stats.totalBatches}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1.5">
            <span>{language === 'hi' ? 'पूर्ण लेक्चर्स व नोट्स' : 'Completed Items'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {stats.completedItems} / {stats.totalItems}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1.5">
            <span>{dict.completionRate}</span>
            <Sparkles className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.progressPercentage}%
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium mb-1.5">
            <span>{dict.myBookmarks}</span>
            <BookmarkCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {bookmarks.length}
          </div>
        </div>
      </div>

      {/* Tabs bar: Batches vs Revision Vault vs Recent Activity */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'batches'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>{language === 'hi' ? 'अध्ययन सामग्री व बैच' : 'Study Batches'}</span>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {batches.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'bookmarks'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-500" />
            <span>{dict.revisionVault}</span>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {bookmarks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('recents')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'recents'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{dict.recentLectures}</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'खोजें...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Tab 1: Batches Grid for Students */}
      {activeTab === 'batches' && (
        <div>
          {filteredBatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBatches.map(batch => {
                const theme = themeStyles[batch.colorTheme] || themeStyles.indigo;
                let totalVids = 0;
                let totalPdfs = 0;
                let completedCount = 0;

                batch.chapters.forEach(c => {
                  totalVids += c.videos.length;
                  totalPdfs += c.pdfs.length;
                  c.videos.forEach(v => { if (v.isCompleted) completedCount++; });
                  c.pdfs.forEach(p => { if (p.isCompleted) completedCount++; });
                });

                const totalItems = totalVids + totalPdfs;
                const percent = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

                return (
                  <div
                    key={batch.id}
                    onClick={() => onOpenBatch(batch.id)}
                    className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
                  >
                    {batch.imageUrl ? (
                      <div className="relative h-32 w-full overflow-hidden bg-slate-950">
                        <img
                          src={batch.imageUrl}
                          alt={batch.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.gradient}`} />
                        <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold">
                          {batch.subject} · {batch.targetExam}
                        </div>
                      </div>
                    ) : (
                      <div className={`h-2.5 w-full bg-gradient-to-r ${theme.gradient}`} />
                    )}
                    
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {!batch.imageUrl && (
                          <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                            <span className={`font-semibold ${theme.text}`}>{batch.subject}</span>
                            <span aria-hidden="true">·</span>
                            <span>{batch.targetExam}</span>
                          </div>
                        )}

                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-2">
                          {batch.title}
                        </h3>

                        {batch.instructor && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            <span>{language === 'hi' ? 'शिक्षक: ' : 'Instructor: '}</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{batch.instructor}</span>
                          </p>
                        )}

                        {batch.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                            {batch.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                          <span className="font-mono tabular-nums">
                            {batch.chapters.length} {language === 'hi' ? 'चैप्टर्स' : 'Chapters'} · {totalVids} {language === 'hi' ? 'वीडियो' : 'Videos'} · {totalPdfs} {language === 'hi' ? 'PDFs' : 'PDFs'}
                          </span>
                          <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
                            {percent}%
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                          <div
                            className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-300`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-1">
                          <span>{language === 'hi' ? 'अध्याय खोलें व पढ़ें' : 'Open Chapters'}</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto my-8">
              <Layers className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">{dict.noBatches}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {language === 'hi' ? 'एडमिन मोड में जाकर नया बैच व सामग्री जोड़ें।' : 'Switch to Admin Mode to add study batches and curriculum.'}
              </p>
              <button
                onClick={() => setUserRole('admin')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'एडमिन मोड चालू करें' : 'Switch to Admin Mode'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Revision Vault (Bookmarks) */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBookmarkTypeFilter('all')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  bookmarkTypeFilter === 'all'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {language === 'hi' ? 'सभी बुकमार्क्स' : 'All Bookmarks'} ({bookmarks.length})
              </button>
              <button
                onClick={() => setBookmarkTypeFilter('video')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  bookmarkTypeFilter === 'video'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Play className="w-3 h-3 text-rose-500 fill-current" />
                <span>{language === 'hi' ? 'वीडियो' : 'Videos'}</span>
              </button>
              <button
                onClick={() => setBookmarkTypeFilter('pdf')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  bookmarkTypeFilter === 'pdf'
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <FileText className="w-3 h-3 text-cyan-500" />
                <span>{language === 'hi' ? 'PDF नोट्स' : 'PDF Notes'}</span>
              </button>
            </div>
          </div>

          {filteredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredBookmarks.map(bm => (
                <div
                  key={`${bm.type}-${bm.resourceId}`}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex items-center justify-between gap-3 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors"
                >
                  <div 
                    onClick={() => handleOpenBookmark(bm)}
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      bm.type === 'video'
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
                        : 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400'
                    }`}>
                      {bm.type === 'video' ? <Play className="w-4 h-4 fill-current" /> : <FileText className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mb-0.5">
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{bm.batchTitle}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{bm.chapterTitle}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {bm.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenBookmark(bm)}
                      className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      {bm.type === 'video' ? dict.playLecture : dict.viewPdf}
                    </button>
                    <button
                      onClick={() => toggleBookmark({
                        type: bm.type,
                        batchId: bm.batchId,
                        batchTitle: bm.batchTitle,
                        chapterId: bm.chapterId,
                        chapterTitle: bm.chapterTitle,
                        resourceId: bm.resourceId,
                        title: bm.title,
                      })}
                      className="p-1.5 text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title={dict.removeBookmark}
                    >
                      <BookmarkCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-10 text-center max-w-md mx-auto my-8">
              <Bookmark className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">{dict.noBookmarks}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {dict.noBookmarksDesc}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Recent Activities */}
      {activeTab === 'recents' && (
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
              {recentActivities.map((act, i) => (
                <div
                  key={`${act.resourceId}-${i}`}
                  onClick={() => handleResumeActivity(act)}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      act.type === 'video' 
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400' 
                        : 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400'
                    }`}>
                      {act.type === 'video' ? <Play className="w-4 h-4 fill-current" /> : <FileText className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {act.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                        <span>{act.batchTitle}</span>
                        <span aria-hidden="true">·</span>
                        <span>{act.chapterTitle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-10 text-center max-w-md mx-auto my-8">
              <Clock className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                {language === 'hi' ? 'कोई हालिया गतिविधि नहीं' : 'No recent activity'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi' ? 'जैसे ही आप लेक्चर्स देखना या PDF पढ़ना शुरू करेंगे, यहाँ सूची दिखेगी।' : 'As you watch lectures or open PDFs, they will appear here for fast resuming.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
