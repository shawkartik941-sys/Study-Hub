import React from 'react';
import { useStudy } from '../context/StudyContext';
import { getDictionary } from '../utils/translations';
import { Layers, Folder, Video, FileText, CheckCircle2 } from 'lucide-react';

export const StatsOverview: React.FC = () => {
  const { stats, language } = useStudy();
  const dict = getDictionary(language);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 my-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium">{dict.totalBatches}</span>
          <Layers className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
          {stats.totalBatches}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium">{dict.totalChapters}</span>
          <Folder className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
          {stats.totalChapters}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium">{dict.totalLectures}</span>
          <Video className="w-4 h-4 text-rose-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
          {stats.totalVideos}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium">{dict.totalNotes}</span>
          <FileText className="w-4 h-4 text-cyan-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
          {stats.totalPdfs}
        </div>
      </div>

      <div className="col-span-2 md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-2xs flex flex-col justify-between transition-colors">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
          <span className="text-xs font-medium">{dict.completionRate}</span>
          <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.progressPercentage}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {stats.completedItems}/{stats.totalItems}
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-300"
              style={{ width: `${stats.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
