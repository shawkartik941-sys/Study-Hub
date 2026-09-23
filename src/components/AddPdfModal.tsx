import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStudy } from '../context/StudyContext';
import { getDictionary } from '../utils/translations';
import { PdfCategory } from '../types';
import { formatBytes } from '../utils/helpers';
import { savePdfToStorage } from '../utils/mediaStorage';
import { ImagePicker } from './ImagePicker';
import { X, FileText, Upload, Link, Check, Sparkles, Folder } from 'lucide-react';

const CATEGORIES: { id: PdfCategory; labelKey: string }[] = [
  { id: 'lecture_notes', labelKey: 'categoryLectureNotes' },
  { id: 'assignment', labelKey: 'categoryAssignment' },
  { id: 'formula_sheet', labelKey: 'categoryFormulaSheet' },
  { id: 'previous_questions', labelKey: 'categoryPyq' },
  { id: 'handwritten', labelKey: 'categoryHandwritten' },
];

export const AddPdfModal: React.FC = () => {
  const { 
    isAddPdfOpen, 
    setIsAddPdfOpen, 
    targetChapterForPdf, 
    createPdf, 
    batches,
    language 
  } = useStudy();

  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [title, setTitle] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [category, setCategory] = useState<PdfCategory>('lecture_notes');
  const [pageCount, setPageCount] = useState<number>(10);
  const [fileSizeBytes, setFileSizeBytes] = useState<number | undefined>(undefined);
  const [fileSizeFormatted, setFileSizeFormatted] = useState<string>('1.5 MB');
  const [localFileName, setLocalFileName] = useState<string>('');
  const [description, setDescription] = useState('');
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dict = getDictionary(language);

  const targetChapter = useMemo(() => {
    if (!targetChapterForPdf) return null;
    const b = batches.find(batch => batch.id === targetChapterForPdf.batchId);
    return b?.chapters.find(c => c.id === targetChapterForPdf.chapterId) || null;
  }, [batches, targetChapterForPdf]);

  useEffect(() => {
    if (isAddPdfOpen) {
      setTitle('');
      setPdfUrl('');
      setCoverImageUrl('');
      setCategory('lecture_notes');
      setPageCount(8);
      setFileSizeBytes(undefined);
      setFileSizeFormatted('1.5 MB');
      setLocalFileName('');
      setDescription('');
      setSelectedPdfFile(null);
      setIsSaving(false);
      setInputMode('upload');
    }
  }, [isAddPdfOpen]);

  if (!isAddPdfOpen || !targetChapterForPdf) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedPdfFile(file);
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    if (!title) {
      setTitle(cleanName);
    }
    setLocalFileName(file.name);
    setFileSizeBytes(file.size);
    setFileSizeFormatted(formatBytes(file.size));
    setPdfUrl(`file://${file.name}`);
  };

  const handleUseSampleUrl = (url: string, sampleTitle: string, sampleCat: PdfCategory, pages: number) => {
    setInputMode('url');
    setSelectedPdfFile(null);
    setPdfUrl(url);
    setTitle(sampleTitle);
    setCategory(sampleCat);
    setPageCount(pages);
    setFileSizeFormatted('2.4 MB');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert(language === 'hi' ? 'कृपया शीर्षक दर्ज करें' : 'Please provide a title');
      return;
    }

    if (inputMode === 'upload' && !selectedPdfFile && !pdfUrl.trim()) {
      alert(language === 'hi' ? 'कृपया डिवाइस से PDF फ़ाइल चुनें' : 'Please select a PDF file from your device');
      return;
    }

    if (inputMode === 'url' && !pdfUrl.trim()) {
      alert(language === 'hi' ? 'कृपया मान्य PDF URL दर्ज करें' : 'Please enter a valid PDF URL');
      return;
    }

    setIsSaving(true);
    try {
      let finalPdfUrl = pdfUrl.trim();

      if (inputMode === 'upload' && selectedPdfFile) {
        const pdfId = `pdf-${Date.now()}`;
        finalPdfUrl = await savePdfToStorage(pdfId, selectedPdfFile);
      }

      createPdf(targetChapterForPdf.batchId, targetChapterForPdf.chapterId, {
        title: title.trim(),
        pdfUrl: finalPdfUrl,
        coverImageUrl: coverImageUrl.trim() || undefined,
        category,
        pageCount: Number(pageCount) || 10,
        fileSizeBytes,
        fileSizeFormatted,
        localFileName: selectedPdfFile?.name || localFileName,
        description: description.trim(),
      });

      setIsAddPdfOpen(false);
    } catch (err) {
      console.error('Error saving PDF:', err);
      alert(language === 'hi' ? 'PDF सेव करने में समस्या हुई' : 'Error saving PDF');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div 
        className="fixed inset-0"
        onClick={() => setIsAddPdfOpen(false)}
      />

      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {dict.addPdf}
            </h3>
          </div>
          <button
            onClick={() => setIsAddPdfOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Target Chapter Folder info */}
          <div className="flex items-center justify-between p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 rounded-xl text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shrink-0">
                <Folder className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 block">
                  {language === 'hi' ? 'चैप्टर फ़ोल्डर के अंदर जोड़ा जाएगा:' : 'Folder location:'}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  📁 {targetChapter?.title || (language === 'hi' ? 'चैप्टर फ़ोल्डर' : 'Chapter Folder')}
                </span>
              </div>
            </div>
            {targetChapter && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold">
                {language === 'hi' ? `अध्याय ${targetChapter.chapterNumber || 1}` : `Chapter ${targetChapter.chapterNumber || 1}`}
              </span>
            )}
          </div>

          {/* Input Method Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                inputMode === 'upload'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{dict.uploadLocalPdf}</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                inputMode === 'url'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>{dict.pdfUrlInput}</span>
            </button>
          </div>

          {/* Quick preset samples */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'hi' ? 'त्वरित टेस्ट हेतु उदाहरण PDF:' : 'Quick Sample PDFs:'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleUseSampleUrl(
                  'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
                  'Physics Handwritten Formula Notes',
                  'formula_sheet',
                  14
                )}
                className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-md text-[11px] text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                Sample Physics Notes
              </button>
              <button
                type="button"
                onClick={() => handleUseSampleUrl(
                  'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
                  'Trigonometry Formulas & Practice Set',
                  'assignment',
                  8
                )}
                className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-md text-[11px] text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
              >
                Sample Maths DPP
              </button>
            </div>
          </div>

          {/* Upload Dropzone */}
          {inputMode === 'upload' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'फ़ाइल चुनें' : 'Choose PDF File'} <span className="text-rose-500">*</span>
              </label>
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                  localFileName 
                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/30' 
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf,.pdf"
                  className="hidden"
                />

                {localFileName ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="truncate max-w-xs">{localFileName}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">({fileSizeFormatted})</span>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {language === 'hi' ? 'PDF चुनने के लिए यहाँ क्लिक करें' : 'Click to select PDF document'}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                      {language === 'hi' ? 'ब्राउज़र में सीधे देखने हेतु सुरक्षित' : 'Encodes securely for in-app offline view'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'ऑनलाइन PDF का URL' : 'PDF Document URL'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                required={inputMode === 'url'}
                placeholder="https://example.com/notes.pdf"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-indigo-500 font-sans"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'PDF का नाम / शीर्षक' : 'PDF Title'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={language === 'hi' ? 'उदा. Class Notes: Electrostatics Full Summary' : 'e.g. Complete Lecture Notes & PYQs'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-indigo-500 font-sans"
            />
          </div>

          {/* PDF Cover Image Picker */}
          <ImagePicker
            label={dict.pdfCover || 'PDF Cover Image'}
            description={dict.pdfCoverDesc}
            imageUrl={coverImageUrl}
            onChange={setCoverImageUrl}
            presetCategory="pdf"
            aspectRatio="portrait"
            language={language}
          />

          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {dict.category}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-2.5 py-2 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                    category === cat.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(dict as any)[cat.labelKey] || cat.id}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'पृष्ठ संख्या (Pages)' : 'Page Count'}
              </label>
              <input
                type="number"
                min={1}
                value={pageCount}
                onChange={(e) => setPageCount(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'फ़ाइल का साइज़' : 'File Size'}
              </label>
              <input
                type="text"
                value={fileSizeFormatted}
                onChange={(e) => setFileSizeFormatted(e.target.value)}
                placeholder="1.5 MB"
                className="w-full px-3.5 py-2 text-xs font-mono tabular-nums bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {dict.description}
            </label>
            <textarea
              rows={2}
              placeholder={language === 'hi' ? 'इस PDF में शामिल सामग्री या असाइनमेंट निर्देश...' : 'Brief summary of contents in this PDF...'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:outline-hidden focus:border-indigo-500 font-sans resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddPdfOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {dict.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-cyan-700 hover:bg-cyan-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {dict.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
