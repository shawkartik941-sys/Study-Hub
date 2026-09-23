import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { ColorTheme } from '../types';
import { getDictionary } from '../utils/translations';
import { ImagePicker } from './ImagePicker';
import { X, Layers, Check } from 'lucide-react';

const COLOR_OPTIONS: { id: ColorTheme; label: string; class: string }[] = [
  { id: 'indigo', label: 'Indigo', class: 'bg-indigo-600' },
  { id: 'emerald', label: 'Emerald', class: 'bg-emerald-600' },
  { id: 'amber', label: 'Amber', class: 'bg-amber-600' },
  { id: 'rose', label: 'Rose', class: 'bg-rose-600' },
  { id: 'cyan', label: 'Cyan', class: 'bg-cyan-600' },
  { id: 'violet', label: 'Violet', class: 'bg-violet-600' },
  { id: 'blue', label: 'Blue', class: 'bg-blue-600' },
];

export const AddBatchModal: React.FC = () => {
  const { 
    isAddBatchOpen, 
    setIsAddBatchOpen, 
    editingBatch, 
    createBatch, 
    updateBatch,
    language 
  } = useStudy();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [instructor, setInstructor] = useState('');
  const [description, setDescription] = useState('');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('indigo');
  const [imageUrl, setImageUrl] = useState('');

  const dict = getDictionary(language);

  useEffect(() => {
    if (editingBatch) {
      setTitle(editingBatch.title);
      setSubject(editingBatch.subject);
      setTargetExam(editingBatch.targetExam);
      setInstructor(editingBatch.instructor);
      setDescription(editingBatch.description);
      setColorTheme(editingBatch.colorTheme);
      setImageUrl(editingBatch.imageUrl || '');
    } else {
      setTitle('');
      setSubject('');
      setTargetExam('');
      setInstructor('');
      setDescription('');
      setColorTheme('indigo');
      setImageUrl('');
    }
  }, [editingBatch, isAddBatchOpen]);

  if (!isAddBatchOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    if (editingBatch) {
      updateBatch(editingBatch.id, {
        title: title.trim(),
        subject: subject.trim(),
        targetExam: targetExam.trim() || 'General Studies',
        instructor: instructor.trim(),
        description: description.trim(),
        colorTheme,
        imageUrl: imageUrl.trim() || undefined,
      });
    } else {
      createBatch({
        title: title.trim(),
        subject: subject.trim(),
        targetExam: targetExam.trim() || 'General Studies',
        instructor: instructor.trim(),
        description: description.trim(),
        colorTheme,
        imageUrl: imageUrl.trim() || undefined,
      });
    }

    setIsAddBatchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        className="fixed inset-0"
        onClick={() => setIsAddBatchOpen(false)}
      />

      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingBatch ? dict.editBatch : dict.createBatch}
            </h3>
          </div>
          <button
            onClick={() => setIsAddBatchOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Batch Cover Image Picker */}
          <ImagePicker
            label={dict.batchImage || 'Batch Cover Image'}
            description={dict.batchImageDesc}
            imageUrl={imageUrl}
            onChange={setImageUrl}
            presetCategory="batch"
            aspectRatio="banner"
            language={language}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {dict.batchTitle} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={language === 'hi' ? 'उदा. भौतिक विज्ञान (Class 12) - Topper Batch' : 'e.g. Physics 12th Board Crash Course'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {dict.batchSubject} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={language === 'hi' ? 'उदा. Physics, Maths, Coding' : 'e.g. Physics, Chemistry, DSA'}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {dict.targetExam}
              </label>
              <input
                type="text"
                placeholder={language === 'hi' ? 'उदा. CBSE 12th, JEE, NEET' : 'e.g. JEE 2026, NEET, Board'}
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {dict.instructor}
            </label>
            <input
              type="text"
              placeholder={language === 'hi' ? 'उदा. Sharma Sir, Er. Kartik' : 'e.g. Sharma Sir / Self'}
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {dict.description}
            </label>
            <textarea
              rows={2}
              placeholder={language === 'hi' ? 'इस बैच का संक्षिप्त विवरण और अध्ययन योजना...' : 'Brief summary of the batch curriculum...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans resize-none"
            />
          </div>

          {/* Color theme selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {dict.themeColor}
            </label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorTheme(c.id)}
                  className={`w-7 h-7 rounded-full ${c.class} flex items-center justify-center transition-transform cursor-pointer ${
                    colorTheme === c.id ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'
                  }`}
                  title={c.label}
                >
                  {colorTheme === c.id && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddBatchOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {dict.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {dict.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
