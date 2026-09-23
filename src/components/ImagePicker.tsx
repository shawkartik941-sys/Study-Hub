import React, { useState, useRef } from 'react';
import { compressImageFile, STUDY_IMAGE_PRESETS } from '../utils/helpers';
import { 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  Trash2, 
  Image as ImageIcon,
  Check,
  AlertCircle
} from 'lucide-react';

interface ImagePickerProps {
  label: string;
  description?: string;
  imageUrl: string;
  onChange: (url: string) => void;
  presetCategory?: 'batch' | 'chapter' | 'video' | 'pdf';
  aspectRatio?: 'banner' | 'video' | 'square' | 'portrait';
  language?: 'hi' | 'en';
}

export const ImagePicker: React.FC<ImagePickerProps> = ({
  label,
  description,
  imageUrl,
  onChange,
  presetCategory = 'batch',
  aspectRatio = 'banner',
  language = 'hi'
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = STUDY_IMAGE_PRESETS[presetCategory] || STUDY_IMAGE_PRESETS.batch;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert(language === 'hi' ? 'कृपया मान्य फोटो फ़ाइल (.jpg, .png, .webp) चुनें' : 'Please select a valid image file');
      return;
    }

    try {
      setIsProcessing(true);
      setImageError(false);
      // Compress to prevent localStorage overflow
      const compressedDataUri = await compressImageFile(file, 900, 0.78);
      onChange(compressedDataUri);
    } catch (err) {
      console.error('Failed to process image:', err);
      alert(language === 'hi' ? 'फोटो प्रोसेस करने में त्रुटि हुई' : 'Failed to process image');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setImageError(false);
    onChange(urlInput.trim());
    setUrlInput('');
  };

  const handleSelectPreset = (url: string) => {
    setImageError(false);
    onChange(url);
  };

  const handleRemove = () => {
    setImageError(false);
    onChange('');
    setUrlInput('');
  };

  const aspectClass = 
    aspectRatio === 'video' ? 'aspect-video' :
    aspectRatio === 'portrait' ? 'aspect-3/4' :
    aspectRatio === 'square' ? 'aspect-square' :
    'aspect-21/9 sm:aspect-16/7';

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
          <span>{label}</span>
          <span className="text-[10px] font-normal text-slate-400">({language === 'hi' ? 'वैकल्पिक' : 'optional'})</span>
        </label>
        {imageUrl && (
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer font-medium"
          >
            <Trash2 className="w-3 h-3" />
            <span>{language === 'hi' ? 'फोटो हटाएं' : 'Remove'}</span>
          </button>
        )}
      </div>

      {description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-1">
          {description}
        </p>
      )}

      {/* If Image is Selected: Show Live Preview */}
      {imageUrl ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
          <div className={`w-full ${aspectClass} overflow-hidden bg-slate-900/10 dark:bg-slate-900/40 relative`}>
            {!imageError ? (
              <img
                src={imageUrl}
                alt="Preview"
                onError={() => setImageError(true)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs">
                <AlertCircle className="w-6 h-6 mb-1 text-amber-500" />
                <span>{language === 'hi' ? 'फोटो लोड नहीं हो सकी' : 'Image preview failed'}</span>
              </div>
            )}

            {/* Change button overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white/95 text-slate-800 text-xs font-semibold rounded-lg shadow-sm hover:bg-white cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3 h-3" />
                <span>{language === 'hi' ? 'बदलें' : 'Change'}</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-rose-600/90 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-rose-600 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" />
                <span>{language === 'hi' ? 'हटाएं' : 'Delete'}</span>
              </button>
            </div>
          </div>

          <div className="p-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'कवर फोटो चयनित' : 'Image Selected'}</span>
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              {language === 'hi' ? 'अन्य फोटो चुनें' : 'Choose another'}
            </button>
          </div>
        </div>
      ) : (
        /* If No Image Selected: Interactive Upload / URL / Preset Tabs */
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 space-y-3">
          
          {/* Segmented selector */}
          <div className="grid grid-cols-3 gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`py-1.5 px-2 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>{language === 'hi' ? 'अपलोड' : 'Upload'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`py-1.5 px-2 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              <span>{language === 'hi' ? 'वेब URL' : 'Link'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`py-1.5 px-2 rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{language === 'hi' ? 'सैंपल' : 'Presets'}</span>
            </button>
          </div>

          {/* TAB 1: File Upload */}
          {activeTab === 'upload' && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-white dark:bg-slate-900/60 group"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isProcessing
                  ? (language === 'hi' ? 'फोटो प्रोसेस हो रही है...' : 'Processing image...')
                  : (language === 'hi' ? 'डिवाइस से फोटो चुनें' : 'Choose photo from device')}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                PNG, JPG, WebP (ऑटो-कंप्रेस)
              </p>
            </div>
          )}

          {/* TAB 2: Image URL */}
          {activeTab === 'url' && (
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={language === 'hi' ? 'इमेज URL डालें (उदा. https://...)' : 'Paste image URL (https://...)'}
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyUrl();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!urlInput.trim()}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {language === 'hi' ? 'लागू करें' : 'Apply'}
              </button>
            </div>
          )}

          {/* TAB 3: Curated Presets */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p.url)}
                  className="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 aspect-16/10 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-left"
                >
                  <img
                    src={p.url}
                    alt={p.label}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-1.5">
                    <span className="text-[10px] text-white font-medium truncate block leading-tight">
                      {p.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};
