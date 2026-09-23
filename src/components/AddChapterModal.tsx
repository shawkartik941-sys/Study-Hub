import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { getDictionary } from '../utils/translations';
import { ImagePicker } from './ImagePicker';
import { X, FolderPlus } from 'lucide-react';

export const AddChapterModal: React.FC = () => {
  const { 
    isAddChapterOpen, 
    setIsAddChapterOpen, 
    targetBatchForChapter,
    activeBatch,
    editingChapter, 
    createChapter, 
    updateChapter,
    language 
  } = useStudy();

  const [title, setTitle] = useState('');
  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const dict = getDictionary(language);
  const currentBatch = activeBatch;

  useEffect(() => {
    if (editingChapter) {
      setTitle(editingChapter.title);
      setChapterNumber(editingChapter.chapterNumber);
      setDescription(editingChapter.description || '');
      setImageUrl(editingChapter.imageUrl || '');
    } else {
      setTitle('');
      const nextNum = (currentBatch?.chapters.length || 0) + 1;
      setChapterNumber(nextNum);
      setDescription('');
      setImageUrl('');
    }
  }, [editingChapter, isAddChapterOpen, currentBatch]);

  if (!isAddChapterOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const batchId = targetBatchForChapter || activeBatch?.id;
    if (!batchId) return;

    if (editingChapter) {
      updateChapter(batchId, editingChapter.id, {
        title: title.trim(),
        chapterNumber,
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });
    } else {
      createChapter(batchId, {
        title: title.trim(),
        chapterNumber,
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });
    }

    setIsAddChapterOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        className="fixed inset-0"
        onClick={() => setIsAddChapterOpen(false)}
      />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingChapter ? dict.editChapter : dict.addChapter}
            </h3>
          </div>
          <button
            onClick={() => setIsAddChapterOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Chapter / Folder Image */}
          <ImagePicker
            label={dict.chapterImage || 'Chapter Folder Image'}
            description={dict.chapterImageDesc}
            imageUrl={imageUrl}
            onChange={setImageUrl}
            presetCategory="chapter"
            aspectRatio="banner"
            language={language}
          />

          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'क्रमांक' : 'No.'}
              </label>
              <input
                type="number"
                min={1}
                required
                value={chapterNumber}
                onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-indigo-500 text-center"
              />
            </div>

            <div className="col-span-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {dict.chapterTitle} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={language === 'hi' ? 'उदा. चुंबकत्व एवं द्रव्य (Magnetism & Matter)' : 'e.g. Chemical Bonding & Molecular Structure'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {dict.description}
            </label>
            <textarea
              rows={3}
              placeholder={language === 'hi' ? 'चैप्टर में कवर किए जाने वाले टॉपिक्स व लर्निंग गोल्स...' : 'Key syllabus topics covered in this chapter...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-sans resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddChapterOpen(false)}
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
