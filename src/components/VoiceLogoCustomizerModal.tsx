import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  X,
  Play,
  RotateCcw,
  Check,
  Palette,
  Mic,
  Sliders,
  Radio,
  Layers,
} from 'lucide-react';
import { LogoConfig, VoiceConfig } from '../types';
import { VoiceAgentLogo } from './VoiceAgentLogo';
import { speakText } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  logoConfig: LogoConfig;
  voiceConfig: VoiceConfig;
  onSaveLogoConfig: (config: LogoConfig) => void;
  onSaveVoiceConfig: (config: VoiceConfig) => void;
}

export const VoiceLogoCustomizerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  logoConfig,
  voiceConfig,
  onSaveLogoConfig,
  onSaveVoiceConfig,
}) => {
  const [tempLogo, setTempLogo] = useState<LogoConfig>({ ...logoConfig });
  const [tempVoice, setTempVoice] = useState<VoiceConfig>({ ...voiceConfig });
  const [activeTab, setActiveTab] = useState<'logo' | 'voice'>('logo');
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  if (!isOpen) return null;

  const handleTestVoice = (langOverride?: string) => {
    setIsTestingVoice(true);
    const testLang = langOverride || tempVoice.language;
    const sampleText =
      testLang.startsWith('hi')
        ? 'नमस्ते! मैं आपका फोन एआई वॉयस एजेंट हूँ। आपकी वॉयस और लोगो सेटिंग्स तैयार हैं।'
        : testLang.startsWith('bn')
        ? 'নমস্কার! আমি আপনার ফোন এআই ভয়েস এজেন্ট।'
        : 'Hello! I am your Phone AI Voice Agent. Voice and logo customizations are operating normally.';

    speakText(sampleText, tempVoice.pitch, tempVoice.rate, testLang);

    setTimeout(() => {
      setIsTestingVoice(false);
    }, 3200);
  };

  const applyPersona = (persona: VoiceConfig['persona']) => {
    if (persona === 'bilingual') {
      setTempVoice((v) => ({ ...v, persona, pitch: 1.0, rate: 1.0 }));
    } else if (persona === 'secretary') {
      setTempVoice((v) => ({ ...v, persona, pitch: 0.95, rate: 1.1 }));
    } else if (persona === 'concierge') {
      setTempVoice((v) => ({ ...v, persona, pitch: 1.2, rate: 0.95 }));
    } else if (persona === 'cyber') {
      setTempVoice((v) => ({ ...v, persona, pitch: 0.75, rate: 0.9 }));
    }
  };

  const handleSave = () => {
    onSaveLogoConfig(tempLogo);
    onSaveVoiceConfig(tempVoice);
    onClose();
  };

  const handleReset = () => {
    setTempLogo({
      logoId: 'cyber_core',
      accentColor: 'emerald',
      animation: 'waveform',
      customTitle: 'Phone AI Agent',
    });
    setTempVoice({
      pitch: 1.0,
      rate: 1.0,
      language: 'hi-IN',
      persona: 'bilingual',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Voice &amp; Logo Customizer</h3>
              <p className="text-[11px] text-slate-400">
                Personalize your Phone AI Agent's brand emblem, soundwave aesthetics, and voice synthesizer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Hero Card */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <VoiceAgentLogo
              config={tempLogo}
              size="lg"
              isSpeaking={isTestingVoice}
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-100">{tempLogo.customTitle}</h4>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-slate-700">
                  {tempVoice.language}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pitch: {tempVoice.pitch}x &bull; Rate: {tempVoice.rate}x &bull; Glow: {tempLogo.accentColor}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleTestVoice()}
            disabled={isTestingVoice}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all shadow active:scale-95 disabled:opacity-60"
          >
            {isTestingVoice ? (
              <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            <span>{isTestingVoice ? 'Speaking...' : 'Test Voice'}</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1">
          <button
            onClick={() => setActiveTab('logo')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'logo'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Logo &amp; Visual Emblem
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'voice'
                ? 'bg-slate-800 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            Voice Synthesizer &amp; Locale
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
          {/* TAB 1: LOGO CUSTOMIZATION */}
          {activeTab === 'logo' && (
            <div className="space-y-4">
              {/* Brand Title Input */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Agent Brand Title:
                </label>
                <input
                  type="text"
                  value={tempLogo.customTitle}
                  onChange={(e) => setTempLogo({ ...tempLogo, customTitle: e.target.value })}
                  placeholder="e.g. Phone AI Agent or ভয়েস এআই এজেন্ট"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>

              {/* Logo Emblem Designs */}
              <div>
                <label className="text-slate-300 font-semibold block mb-2">
                  Select Unique Voice Emblem:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'ravan_emblem',
                      title: 'RAVAN Sovereign Crest',
                      desc: 'Ultra-luxurious obsidian & molten gold crown with crimson resonance',
                      img: '/src/assets/images/ravan_ai_logo_1789596605835.jpg',
                    },
                    {
                      id: 'cyber_core',
                      title: 'Cyber Acoustic Core',
                      desc: 'Futuristic 3D neural voice ring with metallic sheen',
                      img: '/src/assets/images/voice_agent_logo_1789595723581.jpg',
                    },
                    {
                      id: 'orbital_orb',
                      title: 'Orbital Soundwave Orb',
                      desc: 'Radiant holographic sound frequency rings',
                      img: '/src/assets/images/soundwave_orb_logo_1789595736968.jpg',
                    },
                    {
                      id: 'vector_wave',
                      title: 'Procedural Audio Bars',
                      desc: 'Clean vector graphic dynamic sound equalizer',
                    },
                    {
                      id: 'phone_pulse',
                      title: 'Minimalist Phone Badge',
                      desc: 'Classic telecom silhouette with neon pulse',
                    },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setTempLogo({ ...tempLogo, logoId: style.id as any })}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                        tempLogo.logoId === style.id
                          ? 'bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center">
                        {style.img ? (
                          <img
                            src={style.img}
                            alt={style.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Radio className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-200 text-xs truncate">
                          {style.title}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                          {style.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Glow Colors */}
              <div>
                <label className="text-slate-300 font-semibold block mb-2">
                  Accent Aura Glow:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'gold', name: 'Imperial Gold', hex: 'bg-amber-400' },
                    { id: 'emerald', name: 'Emerald Neon', hex: 'bg-emerald-500' },
                    { id: 'cyan', name: 'Cyber Cyan', hex: 'bg-cyan-500' },
                    { id: 'violet', name: 'Electric Violet', hex: 'bg-purple-500' },
                    { id: 'amber', name: 'Solar Amber', hex: 'bg-amber-500' },
                    { id: 'rose', name: 'Crimson Rose', hex: 'bg-rose-500' },
                  ].map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setTempLogo({ ...tempLogo, accentColor: color.id as any })}
                      className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                        tempLogo.accentColor === color.id
                          ? 'bg-slate-800 border-emerald-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full ${color.hex} shadow-sm`} />
                      <span className="text-[10px] text-slate-300 truncate font-medium">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Mode */}
              <div>
                <label className="text-slate-300 font-semibold block mb-2">
                  Logo Dynamic Behavior:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'waveform', name: 'Waveform Pulse', desc: 'Active acoustic vibes' },
                    { id: 'breathing', name: 'Luminous Breath', desc: 'Slow subtle glow' },
                    { id: 'sonar', name: 'Radar Sonar Ring', desc: 'Expanding waves' },
                    { id: 'static', name: 'Static Emblem', desc: 'Fixed clean badge' },
                  ].map((anim) => (
                    <button
                      key={anim.id}
                      onClick={() => setTempLogo({ ...tempLogo, animation: anim.id as any })}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        tempLogo.animation === anim.id
                          ? 'bg-slate-800 border-emerald-400 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-xs">{anim.name}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{anim.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VOICE CUSTOMIZATION */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              {/* Persona Presets */}
              <div>
                <label className="text-slate-300 font-semibold block mb-2">
                  Voice Persona Preset:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: 'bilingual',
                      title: 'Bilingual Assistant',
                      desc: 'Standard balanced cadence (Pitch 1.0, Rate 1.0)',
                    },
                    {
                      id: 'secretary',
                      title: 'Professional Secretary',
                      desc: 'Crisp & slightly swift (Pitch 0.95, Rate 1.1)',
                    },
                    {
                      id: 'concierge',
                      title: 'Friendly Concierge',
                      desc: 'Warm & conversational (Pitch 1.2, Rate 0.95)',
                    },
                    {
                      id: 'cyber',
                      title: 'Cybernetic Core',
                      desc: 'Deep & authoritative (Pitch 0.75, Rate 0.9)',
                    },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyPersona(p.id as any)}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        tempVoice.persona === p.id
                          ? 'bg-slate-800 border-emerald-400 text-slate-100 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-200">{p.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language / Dialect */}
              <div>
                <label className="text-slate-300 font-semibold block mb-2">
                  Synthesizer Language / Dialect:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { code: 'hi-IN', label: 'Hindi (भारत)' },
                    { code: 'en-IN', label: 'English (India)' },
                    { code: 'en-US', label: 'English (US)' },
                    { code: 'bn-IN', label: 'বাংলা (ভারত)' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setTempVoice({ ...tempVoice, language: l.code as any })}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        tempVoice.language === l.code
                          ? 'bg-emerald-600 text-slate-950 font-bold border-emerald-500'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="text-xs">{l.label}</div>
                      <div className="text-[10px] opacity-70 font-mono">{l.code}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pitch Slider */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Voice Pitch</span>
                  <span className="font-mono text-emerald-400">{tempVoice.pitch.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.6"
                  step="0.05"
                  value={tempVoice.pitch}
                  onChange={(e) =>
                    setTempVoice({ ...tempVoice, pitch: parseFloat(e.target.value) })
                  }
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Deeper</span>
                  <span>Natural</span>
                  <span>Higher</span>
                </div>
              </div>

              {/* Speech Rate Slider */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-300">Speech Rate / Speed</span>
                  <span className="font-mono text-emerald-400">{tempVoice.rate.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.4"
                  step="0.05"
                  value={tempVoice.rate}
                  onChange={(e) =>
                    setTempVoice({ ...tempVoice, rate: parseFloat(e.target.value) })
                  }
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Deliberate</span>
                  <span>Normal (1.0x)</span>
                  <span>Rapid</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors border border-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Apply Customization</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
