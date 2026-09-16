import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  Smartphone,
  Monitor,
  Eye,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { WallpaperConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  wallpaper: WallpaperConfig;
  onUpdateWallpaper: (config: WallpaperConfig) => void;
}

// Curated high quality wallpaper presets
export const WALLPAPER_PRESETS: Array<{ id: string; name: string; category: string; url: string }> = [
  {
    id: 'cyber_neon',
    name: 'Cyberpunk Neon Metropolis',
    category: 'Cyberpunk',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'amoled_minimal',
    name: 'Dark Minimalist Peaks',
    category: 'Minimal',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'cosmic_aurora',
    name: 'Northern Lights Aurora',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'deep_space',
    name: 'Cosmic Nebula Stars',
    category: 'Galaxy',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'emerald_circuit',
    name: 'Emerald Matrix Grid',
    category: 'Tech',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1080&q=80',
  },
  {
    id: 'sunset_horizon',
    name: 'Violet Twilight Horizon',
    category: 'Aesthetic',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80',
  },
];

export const WallpaperModal: React.FC<Props> = ({
  isOpen,
  onClose,
  wallpaper,
  onUpdateWallpaper,
}) => {
  const [tempConfig, setTempConfig] = useState<WallpaperConfig>(wallpaper);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setTempConfig((prev) => ({
          ...prev,
          imageUrl: result,
          name: file.name,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSelectPreset = (url: string, name: string) => {
    setTempConfig((prev) => ({
      ...prev,
      imageUrl: url,
      name,
    }));
  };

  const handleRemoveWallpaper = () => {
    setTempConfig((prev) => ({
      ...prev,
      imageUrl: null,
      name: undefined,
    }));
  };

  const handleApply = () => {
    onUpdateWallpaper(tempConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full p-5 text-slate-100 space-y-4 shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Gallery Wallpaper / बैकग्राउंड फोटो
              </h2>
              <p className="text-xs text-slate-400">
                Choose a photo from your device gallery or curated HD backgrounds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          {/* 1. Device Gallery Upload (Drag and drop or Browse) */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              1. Upload from Device Gallery (डिवाइस गैलरी से फोटो चुनें)
            </span>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-950/30 scale-[0.99]'
                  : 'border-slate-700 hover:border-emerald-500/60 bg-slate-950/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <p className="font-semibold text-slate-200 text-xs sm:text-sm">
                Click to browse gallery or drag &amp; drop a photo here
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports JPG, PNG, WebP, GIF from your local phone or PC storage
              </p>
            </div>
          </div>

          {/* 2. Curated Wallpapers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
                2. Or Select a Curated HD Wallpaper
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Click to select</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {WALLPAPER_PRESETS.map((item) => {
                const isSelected = tempConfig.imageUrl === item.url;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectPreset(item.url, item.name)}
                    className={`relative rounded-xl overflow-hidden aspect-[9/16] group border-2 transition-all ${
                      isSelected
                        ? 'border-emerald-400 ring-2 ring-emerald-500/40 scale-105 shadow-lg'
                        : 'border-slate-800 hover:border-slate-600 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1">
                      <span className="text-[9px] font-semibold text-slate-200 truncate leading-tight">
                        {item.category}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Wallpaper Live Preview & Controls */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs text-slate-200">
                  Display &amp; Readability Settings
                </span>
              </div>
              {tempConfig.imageUrl && (
                <button
                  onClick={handleRemoveWallpaper}
                  className="flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            {tempConfig.imageUrl ? (
              <div className="space-y-3 pt-1">
                {/* Active photo indicator */}
                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                    <img
                      src={tempConfig.imageUrl}
                      alt="Selected wallpaper"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-100 truncate text-xs">
                      {tempConfig.name || 'Custom Gallery Photo'}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono">
                      Active Background Layer
                    </div>
                  </div>
                </div>

                {/* Target selector */}
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-medium block">
                    Apply Wallpaper To:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setTempConfig((p) => ({ ...p, target: 'phone' }))}
                      className={`p-2 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs ${
                        tempConfig.target === 'phone'
                          ? 'bg-emerald-600 text-slate-950 font-bold shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Phone Screen</span>
                    </button>
                    <button
                      onClick={() => setTempConfig((p) => ({ ...p, target: 'full' }))}
                      className={`p-2 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs ${
                        tempConfig.target === 'full'
                          ? 'bg-emerald-600 text-slate-950 font-bold shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Workspace</span>
                    </button>
                    <button
                      onClick={() => setTempConfig((p) => ({ ...p, target: 'both' }))}
                      className={`p-2 rounded-xl flex items-center justify-center gap-1.5 transition-all text-xs ${
                        tempConfig.target === 'both'
                          ? 'bg-emerald-600 text-slate-950 font-bold shadow-md'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Both</span>
                    </button>
                  </div>
                </div>

                {/* Darkness Dimming Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Darkness Overlay (Text Readability):</span>
                    <span className="font-mono text-emerald-400">{tempConfig.dimLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={tempConfig.dimLevel}
                    onChange={(e) =>
                      setTempConfig((p) => ({ ...p, dimLevel: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Light (10%)</span>
                    <span>Standard (40%)</span>
                    <span>Deep Stealth (90%)</span>
                  </div>
                </div>

                {/* Blur Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Background Blur / Frosted Glass:</span>
                    <span className="font-mono text-emerald-400">{tempConfig.blurLevel}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="1"
                    value={tempConfig.blurLevel}
                    onChange={(e) =>
                      setTempConfig((p) => ({ ...p, blurLevel: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Sharp (0px)</span>
                    <span>Frosted Glass (6px)</span>
                    <span>Soft Blur (16px)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-slate-400 text-xs">
                No custom photo active. Device is currently using default dark slate theme.
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleRemoveWallpaper}
            className="px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Save &amp; Apply Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
