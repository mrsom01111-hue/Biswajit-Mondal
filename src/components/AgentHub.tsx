import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Send,
  Mic,
  ArrowRight,
  CheckCircle2,
  Clock,
  Radio,
  Sliders,
  AlertCircle,
  Play,
  Code,
  Youtube,
  Globe,
  Camera,
  Settings,
  Volume2,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { Contact, AgentTask, PermissionState, LogoConfig, VoiceConfig, WallpaperConfig } from '../types';
import { AppPackage } from './SimulatedApps';
import { VoiceAgentLogo } from './VoiceAgentLogo';

interface Props {
  contacts: Contact[];
  tasks: AgentTask[];
  permissions: PermissionState;
  logoConfig: LogoConfig;
  voiceConfig: VoiceConfig;
  wallpaperConfig?: WallpaperConfig;
  currentTheme?: AppTheme;
  onOpenThemes?: () => void;
  requireRavanWakeWord?: boolean;
  onToggleRavanWakeWord?: () => void;
  wakeWordWarning?: string | null;
  onOpenCustomizer: () => void;
  onOpenWallpaper?: () => void;
  onExecuteCall: (targetName: string, targetNumber: string, objective?: string) => void;
  onExecuteSms: (targetName: string, targetNumber: string, content: string) => void;
  onTriggerScreening: (name: string, number: string, speech: string) => void;
  onRequestPermission: (perm: any) => void;
  onOpenManifest: () => void;
  // New Bengali / Kotlin MainActivity Voice Agent props
  onTriggerVoice: () => void;
  onLaunchApp: (packageName: AppPackage) => void;
  onOpenKotlinCode: () => void;
  spokenStatusText: string;
  lastSpokenText: string;
  onSimulateCommand: (command: string) => void;
}

interface ParsedAction {
  action: 'CALL' | 'SMS' | 'SCREEN_CALL' | 'SUMMARIZE_SMS' | 'QUERY';
  targetName?: string;
  targetNumber?: string;
  content?: string;
  objective?: string;
  reasoning?: string;
  needsConfirmation?: boolean;
}

export const AgentHub: React.FC<Props> = ({
  contacts,
  tasks,
  permissions,
  logoConfig,
  voiceConfig,
  wallpaperConfig,
  currentTheme,
  onOpenThemes,
  requireRavanWakeWord = false,
  onToggleRavanWakeWord,
  wakeWordWarning,
  onOpenCustomizer,
  onOpenWallpaper,
  onExecuteCall,
  onExecuteSms,
  onTriggerScreening,
  onRequestPermission,
  onOpenManifest,
  onTriggerVoice,
  onLaunchApp,
  onOpenKotlinCode,
  spokenStatusText,
  lastSpokenText,
  onSimulateCommand,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedIntent, setParsedIntent] = useState<ParsedAction | null>(null);
  const [summaryMessage, setSummaryMessage] = useState<string | null>(null);

  const presets = [
    {
      title: 'Call Dentist',
      desc: 'Reschedule appointment to Thursday 3 PM',
      prompt: 'Call Dr. Emily Evans to reschedule my appointment to Thursday at 3 PM',
      type: 'CALL',
    },
    {
      title: 'SMS Sarah',
      desc: 'Send quick text: Running 10 mins late',
      prompt: 'Send SMS to Sarah Chen: Hey Sarah, I am running 10 mins late for the standup, please start without me!',
      type: 'SMS',
    },
    {
      title: 'Screen Inbound Call',
      desc: 'Simulate courier delivery call screening',
      prompt: 'Simulate call screening for FastTrack Courier arriving at front door',
      type: 'SCREEN',
    },
    {
      title: 'Summarize SMS',
      desc: 'Check latest notifications & codes',
      prompt: 'Summarize all recent unread SMS notifications',
      type: 'QUERY',
    },
  ];

  const handleRunCommand = async (customPrompt?: string) => {
    const text = customPrompt || prompt;
    if (!text.trim()) return;

    // If user has specifically turned on wake-word requirement
    const hasWakeWord = /(?:^|\s|\b)(?:ravan|raavan|rawan|रावण|রাবণ)(?:$|\s|\b|[,:!])/i.test(text);
    if (requireRavanWakeWord && !hasWakeWord) {
      onSimulateCommand(text); // Triggers wake-word audio rejection and warning
      setPrompt('');
      return;
    }

    // Check if it's a voice app launch command (English, Hindi, Bengali)
    const lower = text.toLowerCase().trim();
    if (
      lower.includes('wallpaper') || lower.includes('background') || lower.includes('gallery') ||
      lower.includes('वॉलपेपर') || lower.includes('बैकग्राउंड') || lower.includes('গ্যালারি') || lower.includes('ওয়ালপেপার')
    ) {
      if (onOpenWallpaper) {
        onOpenWallpaper();
        setPrompt('');
        return;
      }
    }
    if (
      lower.includes('youtube') || lower.includes('यूट्यूब') || lower.includes('ইউটিউব') ||
      lower.includes('whatsapp') || lower.includes('व्हाट्सएप') || lower.includes('व्हाट्सऐप') || lower.includes('হোয়াটসঅ্যাপ') ||
      lower.includes('chrome') || lower.includes('क्रोम') || lower.includes('ক্রোম') ||
      lower.includes('camera') || lower.includes('कैमरा') || lower.includes('ক্যামেরা') ||
      lower.includes('settings') || lower.includes('सेटिंग्स') || lower.includes('সেটিংস')
    ) {
      onSimulateCommand(text);
      setPrompt('');
      return;
    }

    setIsProcessing(true);
    setSummaryMessage(null);
    try {
      const res = await fetch('/api/agent/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          contacts,
        }),
      });

      if (!res.ok) throw new Error('Failed to parse command');
      const data: ParsedAction = await res.json();
      setParsedIntent(data);

      if (data.action === 'SUMMARIZE_SMS') {
        setSummaryMessage(
          'Agent Analysis: 1 unread message from FastTrack Courier (#FT-8849 delivery at front door), 1 Google verification code (G-748912), and confirmed dental appointment reminder.'
        );
      }
    } catch (err) {
      console.error('Agent error:', err);
      // Fallback
      setParsedIntent({
        action: 'CALL',
        targetName: 'Dr. Emily Evans',
        targetNumber: '+1 (555) 438-9201',
        objective: text,
        reasoning: 'Heuristic fallback: Outgoing call requested.',
        needsConfirmation: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const executeParsedAction = () => {
    if (!parsedIntent) return;

    if (parsedIntent.action === 'CALL') {
      if (!permissions['android.permission.CALL_PHONE']) {
        onRequestPermission('android.permission.CALL_PHONE');
        return;
      }
      onExecuteCall(
        parsedIntent.targetName || 'Contact',
        parsedIntent.targetNumber || '+1 (555) 438-9201',
        parsedIntent.objective || 'Autonomous phone call'
      );
      setParsedIntent(null);
      setPrompt('');
    } else if (parsedIntent.action === 'SMS') {
      if (!permissions['android.permission.SEND_SMS']) {
        onRequestPermission('android.permission.SEND_SMS');
        return;
      }
      onExecuteSms(
        parsedIntent.targetName || 'Contact',
        parsedIntent.targetNumber || '+1 (555) 782-3140',
        parsedIntent.content || 'Hello from Phone AI Agent!'
      );
      setParsedIntent(null);
      setPrompt('');
    } else if (parsedIntent.action === 'SCREEN_CALL') {
      onTriggerScreening(
        'FastTrack Courier',
        '+1 (555) 901-2244',
        'Hi, I have package #FT-8849 for Alex Mercer, are you home?'
      );
      setParsedIntent(null);
      setPrompt('');
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-100">
      {/* Top Banner: MainActivity info with Kotlin Code viewer button */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <VoiceAgentLogo config={logoConfig} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                  {logoConfig.customTitle}
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {voiceConfig.language}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Bengali Voice Assistant &bull; RecognizerIntent &bull; TextToSpeech
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenCustomizer}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs transition-colors border border-emerald-800/80 shadow-sm"
              title="Customise Voice & Logo"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Customise</span>
            </button>
            <button
              onClick={onOpenKotlinCode}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 text-xs transition-colors border border-purple-800/60 font-mono"
              title="View MainActivity.kt"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Kotlin</span>
            </button>
            <button
              onClick={onOpenManifest}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Manifest</span>
            </button>
          </div>
        </div>

        {/* Permissions status chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
          <span className="text-slate-400">Manifest:</span>
          <span
            className={`px-2 py-0.5 rounded-lg font-mono flex items-center gap-1 ${
              permissions['android.permission.CALL_PHONE']
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                : 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
            }`}
          >
            CALL_PHONE
          </span>
          <span
            className={`px-2 py-0.5 rounded-lg font-mono flex items-center gap-1 ${
              permissions['android.permission.SEND_SMS']
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                : 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
            }`}
          >
            SEND_SMS
          </span>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-lg font-mono">
            {voiceConfig.language} Voice Access
          </span>
        </div>
      </div>

      {/* ---------------- MAINACTIVITY.KT VOICE ASSISTANT CARD ---------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3.5">
        {/* Top bar with Voice status & quick modal triggers */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1">
              <span>{currentTheme?.name || 'Voice Assistant'}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenThemes && (
              <button
                onClick={onOpenThemes}
                className="text-[10px] font-medium text-indigo-400 bg-indigo-950/80 hover:bg-indigo-900/80 px-2 py-0.5 rounded-lg border border-indigo-800/60 flex items-center gap-1 transition-colors"
                title="Switch Phone & UI Themes"
              >
                <Palette className="w-3 h-3" />
                <span>Themes</span>
              </button>
            )}
            {onOpenWallpaper && (
              <button
                onClick={onOpenWallpaper}
                className="text-[10px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
                title="Choose wallpaper from device gallery"
              >
                <ImageIcon className="w-3 h-3" />
                <span>Wallpaper</span>
              </button>
            )}
            <button
              onClick={onOpenCustomizer}
              className="text-[10px] font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
              title="Change Voice & Logo appearance"
            >
              <Settings className="w-3 h-3" />
              <span>Voice/Logo</span>
            </button>
          </div>
        </div>

        {/* Wake-word warning alert if blocked */}
        {wakeWordWarning && (
          <div className="p-3 bg-rose-950/80 border border-rose-600/70 rounded-2xl text-rose-200 text-xs flex items-center gap-2.5 animate-bounce shadow-lg shadow-rose-950/50">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-bold text-rose-100 block">{wakeWordWarning}</span>
            </div>
          </div>
        )}

        {/* statusText TextView display */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-slate-900 text-emerald-400 shrink-0 mt-0.5">
            <Volume2 className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-mono text-slate-500 block uppercase">
              TextView (R.id.statusText):
            </span>
            <p className="text-xs sm:text-sm font-semibold text-slate-100 mt-0.5 leading-snug">
              {spokenStatusText || 'Ready for voice commands (Hindi, Bengali, or English)'}
            </p>
            {lastSpokenText && (
              <span className="text-[10px] text-slate-400 block mt-1">
                Last voice input: "{lastSpokenText}"
              </span>
            )}
          </div>
        </div>

        {/* Voice Trigger Button: R.id.voiceButton */}
        <button
          onClick={onTriggerVoice}
          className={`w-full py-3.5 px-4 rounded-2xl ${
            currentTheme?.primaryButtonClass || 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
          } font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2.5 group`}
          id="voiceButton"
        >
          <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Tap to Speak (Hindi / Bengali / English)</span>
        </button>

        {/* handleCommand App Intents Grid */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Quick App Launch Intents:
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">1-Click Launch</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {/* Gallery Wallpaper */}
            <button
              onClick={() => onSimulateCommand('वॉलपेपर खोलो')}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-all flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                  Wallpaper
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">वॉलपेपर खोलो</div>
              </div>
            </button>

            {/* YouTube */}
            <button
              onClick={() => onSimulateCommand('यूट्यूब खोलो')}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-all flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                <Youtube className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-200 group-hover:text-red-400 transition-colors">
                  YouTube
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">यूट्यूब खोलो</div>
              </div>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => onSimulateCommand('व्हाट्सएप खोलो')}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-all flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                  WhatsApp
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">व्हाट्सएप खोलो</div>
              </div>
            </button>

            {/* Chrome */}
            <button
              onClick={() => onSimulateCommand('क्रोम खोलो')}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-all flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                  Chrome
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">क्रोम खोलो</div>
              </div>
            </button>

            {/* Camera */}
            <button
              onClick={() => onSimulateCommand('कैमरा खोलो')}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-all flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                  Camera
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">कैमरा खोलो</div>
              </div>
            </button>

            {/* Settings */}
            <button
              onClick={() => onSimulateCommand('सेटिंग्स खोलो')}
              className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-left transition-all flex items-center gap-2.5 group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                <Settings className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-200 group-hover:text-purple-400 transition-colors">
                  Settings
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">सेटिंग्स खोलो</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- NATURAL LANGUAGE AGENT / CALL & SMS DISPATCHER ---------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-lg space-y-3">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Natural Language Prompt (English, Hindi, or Bengali)
        </label>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRunCommand();
              }
            }}
            placeholder="Type any command: e.g. Open YouTube, or कॉल करो, or Call Dr. Emily, or send SMS..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl p-3.5 pr-24 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[70px] resize-none leading-relaxed"
          />
          <div className="absolute right-2.5 bottom-3 flex items-center gap-1.5">
            <button
              onClick={() => handleRunCommand()}
              disabled={isProcessing || !prompt.trim()}
              className={`py-1.5 px-3 ${
                currentTheme?.primaryButtonClass || 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
              } rounded-xl font-semibold text-xs transition-all disabled:opacity-40 flex items-center gap-1 shadow`}
            >
              {isProcessing ? (
                <span className="animate-spin w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Run</span>
            </button>
          </div>
        </div>

        {/* Preset Prompt Buttons */}
        <div>
          <span className="text-[11px] text-slate-400 block mb-2 font-medium">Quick Manifest Presets:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(p.prompt);
                  handleRunCommand(p.prompt);
                }}
                className="p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 text-left border border-slate-700/60 transition-colors flex items-start gap-2.5 group"
              >
                <div className="p-1.5 rounded-xl bg-slate-700/60 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors shrink-0 mt-0.5">
                  {p.type === 'CALL' ? (
                    <PhoneCall className="w-3.5 h-3.5" />
                  ) : p.type === 'SMS' ? (
                    <MessageSquare className="w-3.5 h-3.5" />
                  ) : (
                    <Radio className="w-3.5 h-3.5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                    {p.title}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{p.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Parsed Intent Confirmation Card */}
      {parsedIntent && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Action Plan Prepared
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {parsedIntent.action === 'CALL' ? 'Intent.ACTION_CALL' : 'Intent.ACTION_SENDTO'}
            </span>
          </div>

          <div className="py-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target Contact:</span>
              <span className="font-semibold text-slate-200">
                {parsedIntent.targetName} ({parsedIntent.targetNumber})
              </span>
            </div>
            {parsedIntent.objective && (
              <div>
                <span className="text-slate-400 block mb-0.5">Call Objective:</span>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-300 font-medium text-xs">
                  "{parsedIntent.objective}"
                </div>
              </div>
            )}
            {parsedIntent.content && (
              <div>
                <span className="text-slate-400 block mb-0.5">SMS Body to Dispatch:</span>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 font-medium text-xs">
                  "{parsedIntent.content}"
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-400 italic pt-1">{parsedIntent.reasoning}</p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              onClick={() => setParsedIntent(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={executeParsedAction}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Execute on Android</span>
            </button>
          </div>
        </div>
      )}

      {/* Summary message display */}
      {summaryMessage && (
        <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-4 text-xs text-indigo-200">
          <div className="font-semibold mb-1 flex items-center gap-1.5">
            <Bot className="w-4 h-4 text-indigo-400" /> SMS Inbox Summary
          </div>
          {summaryMessage}
        </div>
      )}

      {/* Recent Agent Activity Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            Agent Activity Timeline
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">{tasks.length} Tasks Recorded</span>
        </div>

        <div className="space-y-2.5">
          {tasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40 text-xs flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                    task.type === 'CALL'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : task.type === 'SMS'
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {task.type === 'CALL' ? (
                    <PhoneCall className="w-3.5 h-3.5" />
                  ) : task.type === 'SMS' ? (
                    <MessageSquare className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                </div>
                <div>
                  <div className="font-semibold text-slate-200">{task.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {task.details}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 shrink-0 whitespace-nowrap">
                {task.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
