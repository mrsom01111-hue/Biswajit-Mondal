import React from 'react';
import { LogoConfig } from '../types';
import { Mic, Phone, Radio, Activity } from 'lucide-react';

interface Props {
  config: LogoConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isSpeaking?: boolean;
}

export const VoiceAgentLogo: React.FC<Props> = ({
  config,
  size = 'md',
  className = '',
  isSpeaking = false,
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-24 h-24 text-xl',
  };

  const glowColorMap = {
    gold: 'shadow-amber-400/40 border-amber-400/60 text-amber-300 bg-amber-950/50 ring-amber-400/40',
    emerald: 'shadow-emerald-500/30 border-emerald-500/50 text-emerald-400 bg-emerald-950/40 ring-emerald-500/30',
    cyan: 'shadow-cyan-500/30 border-cyan-500/50 text-cyan-400 bg-cyan-950/40 ring-cyan-500/30',
    violet: 'shadow-purple-500/30 border-purple-500/50 text-purple-400 bg-purple-950/40 ring-purple-500/30',
    amber: 'shadow-amber-500/30 border-amber-500/50 text-amber-400 bg-amber-950/40 ring-amber-500/30',
    rose: 'shadow-rose-500/30 border-rose-500/50 text-rose-400 bg-rose-950/40 ring-rose-500/30',
  };

  const getAnimationClass = () => {
    if (config.animation === 'waveform' || isSpeaking) {
      return 'animate-pulse';
    }
    if (config.animation === 'breathing') {
      return 'transition-all duration-1000 scale-105';
    }
    if (config.animation === 'sonar') {
      return 'ring-4 ring-offset-2 ring-offset-slate-950';
    }
    return '';
  };

  const imageSrc =
    config.logoId === 'ravan_emblem'
      ? '/src/assets/images/ravan_ai_logo_1789596605835.jpg'
      : config.logoId === 'cyber_core'
      ? '/src/assets/images/voice_agent_logo_1789595723581.jpg'
      : config.logoId === 'orbital_orb'
      ? '/src/assets/images/soundwave_orb_logo_1789595736968.jpg'
      : null;

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {/* Outer Soundwaves / Sonar Ring animation if active */}
      {(isSpeaking || config.animation === 'waveform' || config.animation === 'sonar') && (
        <span
          className={`absolute -inset-1 rounded-2xl sm:rounded-3xl opacity-60 blur-sm animate-ping pointer-events-none ${
            config.accentColor === 'gold'
              ? 'bg-amber-400'
              : config.accentColor === 'emerald'
              ? 'bg-emerald-500'
              : config.accentColor === 'cyan'
              ? 'bg-cyan-500'
              : config.accentColor === 'violet'
              ? 'bg-purple-500'
              : config.accentColor === 'amber'
              ? 'bg-amber-500'
              : 'bg-rose-500'
          }`}
          style={{ animationDuration: isSpeaking ? '1.2s' : '2.5s' }}
        />
      )}

      <div
        className={`${sizeMap[size]} rounded-2xl border shadow-lg overflow-hidden flex items-center justify-center transition-all ${glowColorMap[config.accentColor]} ${getAnimationClass()}`}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={config.customTitle}
            className="w-full h-full object-cover select-none"
            referrerPolicy="no-referrer"
          />
        ) : config.logoId === 'vector_wave' ? (
          <div className="flex items-center justify-center gap-0.5">
            <span className="w-1 h-3 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-4 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="w-1 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <Phone className="w-1/2 h-1/2 fill-current" />
          </div>
        )}
      </div>

      {/* Voice active badge dot */}
      {isSpeaking && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
      )}
    </div>
  );
};
