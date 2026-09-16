import React, { useState } from 'react';
import {
  X,
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Smartphone,
  Eye,
  Zap,
} from 'lucide-react';
import { AppTheme, ThemeId, LogoConfig } from '../types';
import { APP_THEMES, DEFAULT_THEME_ID } from '../data/themes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: ThemeId;
  onSelectTheme: (theme: AppTheme, autoApplyLogo: boolean) => void;
  onResetToDefault: () => void;
}

export const ThemeSelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
  onResetToDefault,
}) => {
  const [selectedId, setSelectedId] = useState<ThemeId>(currentThemeId);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [syncLogo, setSyncLogo] = useState(true);

  if (!isOpen) return null;

  const categories = ['All', 'Classic', 'Royal', 'Cyber', 'Stealth', 'Light'];
  const filteredThemes = filterCategory === 'All'
    ? APP_THEMES
    : APP_THEMES.filter((t) => t.category === filterCategory);

  const activeThemeObj = APP_THEMES.find((t) => t.id === selectedId) || APP_THEMES[0];

  const handleApply = () => {
    onSelectTheme(activeThemeObj, syncLogo);
    onClose();
  };

  const handleQuickReset = () => {
    onResetToDefault();
    setSelectedId(DEFAULT_THEME_ID);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">Phone &amp; UI Themes</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                  {APP_THEMES.length} Themes
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                थीम बदलें: Switch colors, glowing accents, and phone aesthetics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleQuickReset}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 flex items-center gap-1 transition-colors"
              title="Restore to initial default theme (पहले जैसा)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">पहले जैसा (Reset)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Themes Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredThemes.map((theme) => {
              const isSelected = selectedId === theme.id;
              const isCurrent = currentThemeId === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => setSelectedId(theme.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 hover:bg-slate-800/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-100">{theme.name}</h4>
                          {isCurrent && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{theme.nameHindi}</span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                        {theme.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {theme.description}
                    </p>
                  </div>

                  {/* Palette Swatches & Glow Preview */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {theme.previewColors.map((color, idx) => (
                        <span
                          key={idx}
                          className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: theme.glowColor,
                          boxShadow: `0 0 8px ${theme.glowColor}`,
                        }}
                      />
                      <span className="text-[11px] font-mono font-medium text-slate-300 capitalize">
                        {theme.accentColor}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sync Logo Option */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Synchronize Logo &amp; Voice Title
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Automatically align the voice assistant logo glow and title with the theme
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={syncLogo}
                onChange={(e) => setSyncLogo(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleQuickReset}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Classic Emerald (पहले जैसा)</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-950/50 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Apply Theme ({activeThemeObj.name})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
