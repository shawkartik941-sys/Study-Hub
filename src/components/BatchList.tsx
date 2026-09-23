import React, { useState, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { getDictionary } from '../utils/translations';
import { BatchCard } from './BatchCard';
import { StatsOverview } from './StatsOverview';
import { Plus, Search, Layers, Sparkles, Shield, GraduationCap } from 'lucide-react';

interface BatchListProps {
  onOpenBatch: (batchId: string) => void;
}

export const BatchList: React.FC<BatchListProps> = ({ onOpenBatch }) => {
  const { batches, language, setIsAddBatchOpen, setEditingBatch, setUserRole } = useStudy();
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const dict = getDictionary(language);

  // Unique subjects for filter tabs
  const subjects = useMemo(() => {
    const set = new Set<string>();
    batches.forEach(b => {
      if (b.subject) set.add(b.subject);
    });
    return Array.from(set);
  }, [batches]);

  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      const matchSearch =
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.targetExam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchSubject = subjectFilter === 'all' || b.subject === subjectFilter;
      return matchSearch && matchSubject;
    });
  }, [batches, searchTerm, subjectFilter]);

  const handleCreate = () => {
    setEditingBatch(null);
    setIsAddBatchOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Hero Welcome banner for Admin */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950/50 dark:to-slate-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-indigo-900/30 shadow-lg">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 border border-amber-400/30 rounded-lg text-amber-300 font-bold">
                <Shield className="w-3.5 h-3.5" />
                <span>{dict.adminBadge}</span>
              </span>
              <span aria-hidden="true" className="text-slate-500">·</span>
              <span className="text-indigo-200">{dict.adminNotice}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {language === 'hi' ? 'बैच और पाठ्यक्रम प्रबंधन केंद्र' : 'Batch & Curriculum Management Panel'}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {language === 'hi'
                ? 'यहाँ से आप नए अध्ययन बैच बना सकते हैं, चैप्टर फ़ोल्डर जोड़ सकते हैं, और वीडियो व PDF सामग्री प्रबंधित कर सकते हैं।'
                : 'Create study batches, organize chapter folders, upload video lectures and PDF resources, and manage entire curricula.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{dict.createBatch}</span>
              </button>

              <button
                onClick={() => setUserRole('student')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-medium rounded-xl backdrop-blur-xs transition-colors cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>{dict.switchToStudent}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Stats overview */}
      <StatsOverview />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'बैच का नाम या विषय खोजें...' : 'Search by batch name or subject...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Functional Subject Filter Pills (Buttons) */}
        {subjects.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSubjectFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                subjectFilter === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'hi' ? 'सभी विषय' : 'All Subjects'}
            </button>
            {subjects.map(sub => (
              <button
                key={sub}
                onClick={() => setSubjectFilter(sub)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  subjectFilter === sub
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Batches Grid */}
      {filteredBatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBatches.map(batch => (
            <BatchCard key={batch.id} batch={batch} onOpenBatch={onOpenBatch} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">{dict.noBatches}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">{dict.noBatchesDesc}</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{dict.createBatch}</span>
          </button>
        </div>
      )}
    </div>
  );
};
