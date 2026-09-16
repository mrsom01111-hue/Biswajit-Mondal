import React, { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryCharging, ShieldCheck, Mic } from 'lucide-react';

interface Props {
  activeCallActive?: boolean;
  activeContactName?: string;
  isMicActive?: boolean;
  onOpenManifest?: () => void;
}

export const AndroidStatusHeader: React.FC<Props> = ({
  activeCallActive,
  activeContactName,
  isMicActive,
  onOpenManifest,
}) => {
  const [timeStr, setTimeStr] = useState('14:40');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md text-slate-300 text-xs px-5 py-2.5 flex items-center justify-between border-b border-slate-800/80 select-none z-30">
      {/* Left: Clock and status */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-100 tracking-tight text-[13px]">{timeStr}</span>
        {isMicActive && (
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded text-[10px] font-medium border border-emerald-800/60 animate-pulse">
            <Mic className="w-2.5 h-2.5" /> MIC
          </span>
        )}
      </div>

      {/* Middle: Dynamic Island / Pill for Active AI Call */}
      {activeCallActive ? (
        <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 rounded-full animate-pulse text-[11px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Call in progress: {activeContactName || 'Active'}
        </div>
      ) : (
        <button
          onClick={onOpenManifest}
          className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 px-2.5 py-0.5 rounded-full text-[11px] transition-colors border border-slate-700"
          title="Inspect AndroidManifest.xml and Permissions"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span className="font-mono text-[10px]">Theme.PhoneAgent</span>
        </button>
      )}

      {/* Right: Signal, 5G, Wifi, Battery */}
      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-[11px] font-medium text-slate-300">5G</span>
        <Signal className="w-3.5 h-3.5 text-slate-300" />
        <Wifi className="w-3.5 h-3.5 text-slate-300" />
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono text-slate-300">92%</span>
          <BatteryCharging className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
