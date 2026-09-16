import React, { useState } from 'react';
import {
  INITIAL_CONTACTS,
  INITIAL_CALLS,
  INITIAL_SMS_THREADS,
  INITIAL_TASKS,
} from './data/initialData';
import {
  Contact,
  CallRecord,
  SmsThread,
  AgentTask,
  PermissionState,
  PermissionName,
  ActiveCallState,
  CallMessage,
} from './types';
import { AndroidStatusHeader } from './components/AndroidStatusHeader';
import { AndroidNavBar, ActiveTab } from './components/AndroidNavBar';
import { AgentHub } from './components/AgentHub';
import { DialerAndCalls } from './components/DialerAndCalls';
import { MessagingView } from './components/MessagingView';
import { ContactsView } from './components/ContactsView';
import { ActiveCallModal } from './components/ActiveCallModal';
import { CallScreeningModal } from './components/CallScreeningModal';
import { AndroidPermissionDialog } from './components/AndroidPermissionDialog';
import { ManifestModal } from './components/ManifestModal';
import { BengaliVoiceModal } from './components/BengaliVoiceModal';
import { KotlinCodeViewerModal } from './components/KotlinCodeViewerModal';
import { VoiceLogoCustomizerModal } from './components/VoiceLogoCustomizerModal';
import { VoiceAgentLogo } from './components/VoiceAgentLogo';
import { SimulatedAppView, AppPackage } from './components/SimulatedApps';
import { WallpaperModal } from './components/WallpaperModal';
import { playRingSound, speakText } from './utils/audio';
import {
  Smartphone,
  Maximize2,
  ShieldCheck,
  PhoneIncoming,
  Bot,
  Code,
  Mic,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { LogoConfig, VoiceConfig, WallpaperConfig } from './types';

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [callHistory, setCallHistory] = useState<CallRecord[]>(INITIAL_CALLS);
  const [smsThreads, setSmsThreads] = useState<SmsThread[]>(INITIAL_SMS_THREADS);
  const [tasks, setTasks] = useState<AgentTask[]>(INITIAL_TASKS);

  const [activeTab, setActiveTab] = useState<ActiveTab>('agent');
  const [isDeviceView, setIsDeviceView] = useState(true);
  const [isManifestOpen, setIsManifestOpen] = useState(false);

  // Runtime Android permissions state
  const [permissions, setPermissions] = useState<PermissionState>({
    'android.permission.CALL_PHONE': true,
    'android.permission.SEND_SMS': true,
    'android.permission.RECORD_AUDIO': true,
  });

  const [pendingPermission, setPendingPermission] = useState<PermissionName | null>(null);

  // Active call state
  const [activeCall, setActiveCall] = useState<ActiveCallState | null>(null);

  // Inbound call screening simulation state
  const [incomingCall, setIncomingCall] = useState<{
    callerName: string;
    callerNumber: string;
    initialSpeech: string;
  } | null>(null);

  // ---------------- UNIQUE VOICE & LOGO CUSTOMIZER STATE (RAVAN AI) ----------------
  const [logoConfig, setLogoConfig] = useState<LogoConfig>({
    logoId: 'ravan_emblem',
    imageUrl: '/src/assets/images/ravan_ai_logo_1789596605835.jpg',
    accentColor: 'gold',
    animation: 'sonar',
    customTitle: 'RAVAN AI',
  });

  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    pitch: 0.95,
    rate: 1.0,
    language: 'hi-IN',
    persona: 'bilingual',
  });

  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Mandatory "RAVAN" wake-word mandate state ("हर काम करवाने से पहले Ravan बोलना होगा")
  const [requireRavanWakeWord, setRequireRavanWakeWord] = useState(true);
  const [wakeWordWarning, setWakeWordWarning] = useState<string | null>(null);

  // ---------------- WALLPAPER / GALLERY BACKGROUND STATE ----------------
  const [wallpaperConfig, setWallpaperConfig] = useState<WallpaperConfig>(() => {
    try {
      const saved = localStorage.getItem('phone_ai_wallpaper');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      imageUrl: null,
      dimLevel: 40,
      blurLevel: 0,
      target: 'phone',
    };
  });
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);

  const handleUpdateWallpaper = (config: WallpaperConfig) => {
    setWallpaperConfig(config);
    try {
      localStorage.setItem('phone_ai_wallpaper', JSON.stringify(config));
    } catch (e) {}
  };

  // ---------------- KOTLIN MAINACTIVITY VOICE ASSISTANT STATE ----------------
  const [spokenStatusText, setSpokenStatusText] = useState('👑 RAVAN: हर काम से पहले "Ravan" बोलिए (उदा: "Ravan, यूट्यूब खोलो")');
  const [lastSpokenText, setLastSpokenText] = useState('');
  const [lastTTSOutput, setLastTTSOutput] = useState('RAVAN Sovereign Engine Initialized');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isKotlinViewerOpen, setIsKotlinViewerOpen] = useState(false);
  const [activeSimulatedApp, setActiveSimulatedApp] = useState<AppPackage | null>(null);

  // Speak method matching Kotlin `speak(message: String)` with customized pitch, rate, language
  const speak = (message: string, overrideLang?: string) => {
    setLastTTSOutput(message);
    speakText(message, voiceConfig.pitch, voiceConfig.rate, overrideLang || voiceConfig.language);
  };

  // Open App method matching Kotlin `openApp(packageName: String)`
  const openApp = (packageName: string) => {
    const supported: Record<string, AppPackage> = {
      'com.google.android.youtube': 'com.google.android.youtube',
      'com.whatsapp': 'com.whatsapp',
      'com.android.chrome': 'com.android.chrome',
    };

    if (supported[packageName]) {
      setActiveSimulatedApp(supported[packageName]);
    } else {
      speak('यह ऐप फोन में इंस्टॉल नहीं है');
      setSpokenStatusText('App is not installed on this device.');
    }
  };

  // Command handler matching Kotlin `handleCommand(command: String)` with RAVAN Wake-Word Mandate
  const handleCommand = (command: string) => {
    const rawText = command.trim();
    const lower = rawText.toLowerCase();
    setLastSpokenText(command);

    const isBengali = /[\u0980-\u09FF]/.test(command) || voiceConfig.language.startsWith('bn');
    const isHindi = /[\u0900-\u097F]/.test(command) || voiceConfig.language.startsWith('hi');

    // Check if the command contains the mandatory wake word: "Ravan" / "रावण" / "রাবণ" / "raavan" / "rawan"
    const hasRavan = /(?:^|\s|\b)(?:ravan|raavan|rawan|रावण|রাবণ)(?:$|\s|\b|[,:!])/i.test(rawText);

    if (requireRavanWakeWord && !hasRavan) {
      const warnMsg = `हर काम करवाने से पहले 'रावण' बोलना होगा! (Say "Ravan" before any command)`;
      setWakeWordWarning(warnMsg);
      setSpokenStatusText(`⛔ BLOCKED: पहले 'रावण' बोलिए! (उदा: "Ravan, open YouTube" या "रावण, कॉल करो")`);

      const blockedTask: AgentTask = {
        id: `task-${Date.now()}`,
        title: `⛔ BLOCKED (Missing 'Ravan'): "${command}"`,
        type: 'CALL',
        status: 'failed',
        timestamp: 'Just now',
        details: `Command rejected. User spoke "${command}" without mandatory "Ravan" wake-word.`,
      };
      setTasks((prev) => [blockedTask, ...prev]);

      if (isBengali) {
        speak("আদেশ বাতিল! কোনো কাজ করার আগে 'রাবণ' বলতে হবে। বলুন: রাবণ, " + command, 'bn-IN');
      } else if (isHindi) {
        speak("आदेश अमान्य! हर काम करवाने से पहले 'रावण' बोलना होगा। कहिए: रावण, " + command, 'hi-IN');
      } else {
        speak("Command rejected! You must say 'Ravan' before any task. Say: Ravan, " + command, 'en-US');
      }
      return;
    }

    // Wake word confirmed! Clear any active warning
    setWakeWordWarning(null);

    // Strip out the wake word to get the actionable instruction
    const actionText = lower
      .replace(/(?:^|\s|\b)(?:ravan|raavan|rawan|रावण|রাবণ)(?:$|\s|\b|[,:!])/gi, ' ')
      .trim();

    setSpokenStatusText(`👑 RAVAN: "${command}"`);

    // Record accepted agent task
    const newTask: AgentTask = {
      id: `task-${Date.now()}`,
      title: `👑 RAVAN: "${command}"`,
      type: 'CALL',
      status: 'completed',
      timestamp: 'Just now',
      details: `RAVAN accepted intent: "${command}"`,
    };
    setTasks((prev) => [newTask, ...prev]);

    // If user just called "Ravan" / "रावण" without an action:
    if (!actionText || actionText === 'hey' || actionText === 'hello' || actionText === 'सुनो' || actionText === 'नमस्ते') {
      setSpokenStatusText('👑 RAVAN सुन रहा है — आज्ञा दीजिए!');
      if (isBengali) {
        speak('হ্যাঁ! আমি রাবণ। বলুন, আপনার আদেশ কী?', 'bn-IN');
      } else if (isHindi) {
        speak('हाँ! मैं रावण हूँ। आज्ञा दीजिए, क्या काम करना है?', 'hi-IN');
      } else {
        speak('Yes! I am RAVAN. State your command, and I shall execute.', 'en-US');
      }
      return;
    }

    // Action matching under RAVAN authority:
    if (
      actionText.includes('wallpaper') ||
      actionText.includes('background') ||
      actionText.includes('gallery') ||
      actionText.includes('वॉलपेपर') ||
      actionText.includes('बैकग्राउंड') ||
      actionText.includes('गैलरी') ||
      actionText.includes('ওয়ালপেপার') ||
      actionText.includes('photo') ||
      actionText.includes('फोटो') ||
      actionText.includes('ছবি')
    ) {
      setIsWallpaperModalOpen(true);
      if (isBengali) {
        speak('রাবণের আদেশে গ্যালারি ওয়ালপেপার সেটিংস খুলছি', 'bn-IN');
      } else if (isHindi) {
        speak('रावण गैलरी वॉलपेपर सेटिंग्स खोल रहा है', 'hi-IN');
      } else {
        speak('RAVAN is opening gallery wallpaper settings', 'en-US');
      }
    } else if (actionText.includes('youtube') || actionText.includes('यूट्यूब') || actionText.includes('ইউটিউব')) {
      if (isBengali) speak('রাবণের আদেশে ইউটিউব খুলছি', 'bn-IN');
      else if (isHindi) speak('रावण के आदेश पर यूट्यूब खोल रहा हूँ', 'hi-IN');
      else speak('Opening YouTube under RAVAN command', 'en-US');
      openApp('com.google.android.youtube');
    } else if (
      actionText.includes('whatsapp') ||
      actionText.includes('व्हाट्सएप') ||
      actionText.includes('व्हाट्सऐप') ||
      actionText.includes('হোয়াটসঅ্যাপ')
    ) {
      if (isBengali) speak('রাবণের আদেশে হোয়াটসঅ্যাপ খুলছি', 'bn-IN');
      else if (isHindi) speak('रावण के आदेश पर व्हाट्सएप खोल रहा हूँ', 'hi-IN');
      else speak('Opening WhatsApp under RAVAN command', 'en-US');
      openApp('com.whatsapp');
    } else if (
      actionText.includes('chrome') ||
      actionText.includes('क्रोम') ||
      actionText.includes('browser') ||
      actionText.includes('ক্রোম')
    ) {
      if (isBengali) speak('রাবণের আদেশে ক্রোম ব্রাউজার খুলছি', 'bn-IN');
      else if (isHindi) speak('रावण के आदेश पर क्रोम खोल रहा हूँ', 'hi-IN');
      else speak('Opening Chrome browser under RAVAN command', 'en-US');
      openApp('com.android.chrome');
    } else if (
      actionText.includes('camera') ||
      actionText.includes('कैमरा') ||
      actionText.includes('क্যামেরা')
    ) {
      if (isBengali) speak('রাবণের আদেশে ক্যামেরা চালু করছি', 'bn-IN');
      else if (isHindi) speak('रावण कैमरा चालू कर रहा है', 'hi-IN');
      else speak('RAVAN is launching Camera', 'en-US');
      setActiveSimulatedApp('android.media.action.IMAGE_CAPTURE');
    } else if (
      actionText.includes('settings') ||
      actionText.includes('सेटिंग्स') ||
      actionText.includes('setting') ||
      actionText.includes('সেটিংস')
    ) {
      if (isBengali) speak('রাবণের আদেশে ফোন সেটিংস খুলছি', 'bn-IN');
      else if (isHindi) speak('रावण सेटिंग्स खोल रहा है', 'hi-IN');
      else speak('RAVAN is opening Settings', 'en-US');
      setActiveSimulatedApp('android.provider.Settings.ACTION_SETTINGS');
    } else if (
      actionText.includes('फोन') ||
      actionText.includes('call') ||
      actionText.includes('कॉल') ||
      actionText.includes('কল')
    ) {
      if (isBengali) speak('রাবণের আদেশে ফোন কল শুরু করছি', 'bn-IN');
      else if (isHindi) speak('रावण कॉल कनेक्ट कर रहा है', 'hi-IN');
      else speak('RAVAN is initiating phone call', 'en-US');
      handleStartCall('Dr. Emily Evans', '+1 (555) 438-9201', 'RAVAN Voice Call triggered');
    } else if (
      actionText.includes('मेसेज') ||
      actionText.includes('मैसेज') ||
      actionText.includes('sms') ||
      actionText.includes('message') ||
      actionText.includes('বার্তা') ||
      actionText.includes('संदेश')
    ) {
      if (isBengali) speak('রাবণের আদেশে মেসেজ তৈরি করছি', 'bn-IN');
      else if (isHindi) speak('रावण मैसेज तैयार कर रहा है', 'hi-IN');
      else speak('RAVAN is opening Messages', 'en-US');
      setActiveTab('messages');
    } else {
      setSpokenStatusText(`👑 RAVAN: Command "${command}" recognized, but no matching action found.`);
      if (isBengali) speak('রাবণ এই আদেশটি বুঝতে পেরেছে, কিন্তু ফোনে কোনো অনুরূপ অ্যাপ নেই', 'bn-IN');
      else if (isHindi) speak('रावण को आदेश समझ आया, लेकिन यह ऐप फोन में नहीं मिला', 'hi-IN');
      else speak('RAVAN recognized the command, but found no matching application intent', 'en-US');
    }
  };

  // Permission management
  const handleTogglePermission = (perm: PermissionName) => {
    setPermissions((prev) => ({
      ...prev,
      [perm]: !prev[perm],
    }));
  };

  const handleGrantPermission = (perm: PermissionName) => {
    setPermissions((prev) => ({
      ...prev,
      [perm]: true,
    }));
    setPendingPermission(null);
  };

  const handleDenyPermission = (perm: PermissionName) => {
    setPermissions((prev) => ({
      ...prev,
      [perm]: false,
    }));
    setPendingPermission(null);
  };

  // Start outgoing call
  const handleStartCall = (name: string, number: string, objective?: string) => {
    if (!permissions['android.permission.CALL_PHONE']) {
      setPendingPermission('android.permission.CALL_PHONE');
      return;
    }

    const initialMessages: CallMessage[] = [];
    if (objective) {
      initialMessages.push({
        id: `init-${Date.now()}`,
        speaker: 'agent',
        speakerLabel: 'Phone AI Agent',
        text: `Hello, I am calling on behalf of Alex Mercer regarding: ${objective}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      speakText(`Hello, I am calling on behalf of Alex Mercer regarding: ${objective}`);
    }

    setActiveCall({
      isActive: true,
      isScreening: false,
      contactName: name,
      phoneNumber: number,
      callType: 'outgoing',
      objective,
      callerRole: objective ? 'agent' : 'remote',
      messages: initialMessages,
      isMuted: false,
      isSpeakerOn: true,
      isAiAgentSpeaking: !!objective,
    });

    const newTask: AgentTask = {
      id: `task-${Date.now()}`,
      title: objective ? `Autonomous Call: ${name}` : `Direct Call: ${name}`,
      type: 'CALL',
      status: 'running',
      timestamp: 'Just now',
      details: objective
        ? `Executing CALL_PHONE intent. Goal: ${objective}`
        : `Connected call to ${number}`,
      target: name,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // End active call
  const handleEndCall = () => {
    if (!activeCall) return;

    const newRecord: CallRecord = {
      id: `call-record-${Date.now()}`,
      contactName: activeCall.contactName,
      phoneNumber: activeCall.phoneNumber,
      type: activeCall.callType,
      timestamp: 'Just now',
      durationSeconds: Math.max(25, activeCall.messages.length * 8),
      status: 'completed',
      aiHandled: activeCall.callerRole === 'agent' || !!activeCall.objective,
      summary: activeCall.objective
        ? `AI Agent completed call with ${activeCall.contactName}. Objective: "${activeCall.objective}"`
        : `Completed standard voice call with ${activeCall.contactName}`,
      transcript: activeCall.messages,
    };

    setCallHistory((prev) => [newRecord, ...prev]);
    setActiveCall(null);
  };

  // Send SMS message
  const handleSendMessage = (threadId: string, text: string, isAiGenerated = false) => {
    if (!permissions['android.permission.SEND_SMS']) {
      setPendingPermission('android.permission.SEND_SMS');
      return;
    }

    const newMsg = {
      id: `sm-${Date.now()}`,
      sender: (isAiGenerated ? 'agent' : 'user') as any,
      text,
      timestamp: 'Just now',
      status: 'delivered' as const,
      aiGenerated: isAiGenerated,
    };

    setSmsThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, messages: [...t.messages, newMsg] } : t))
    );

    const thread = smsThreads.find((t) => t.id === threadId);
    const newTask: AgentTask = {
      id: `task-${Date.now()}`,
      title: `Dispatched SMS to ${thread?.contactName || 'Recipient'}`,
      type: 'SMS',
      status: 'completed',
      timestamp: 'Just now',
      details: `Executed SEND_SMS intent: "${text}"`,
      target: thread?.contactName,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Trigger simulated incoming call for Call Screening
  const handleTriggerIncomingCall = (
    name = 'FastTrack Courier',
    number = '+1 (555) 901-2244',
    speech = 'Hi, I have package #FT-8849 for Alex Mercer, are you home?'
  ) => {
    playRingSound();
    setIncomingCall({
      callerName: name,
      callerNumber: number,
      initialSpeech: speech,
    });
  };

  const handleOpenSmsWithContact = (name: string, number: string) => {
    let thread = smsThreads.find((t) => t.phoneNumber === number);
    if (!thread) {
      thread = {
        id: `sms-${Date.now()}`,
        contactName: name,
        phoneNumber: number,
        avatarColor: 'bg-indigo-600',
        initials: name.substring(0, 2).toUpperCase(),
        category: 'personal',
        unreadCount: 0,
        messages: [],
      };
      setSmsThreads((prev) => [thread!, ...prev]);
    }
    setActiveTab('messages');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start sm:py-6 font-sans relative overflow-x-hidden">
      {/* Full Workspace Gallery Wallpaper Layer */}
      {wallpaperConfig.imageUrl &&
        (wallpaperConfig.target === 'full' || wallpaperConfig.target === 'both') && (
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-500 scale-105"
              style={{
                backgroundImage: `url(${wallpaperConfig.imageUrl})`,
                filter: `blur(${wallpaperConfig.blurLevel}px)`,
              }}
            />
            <div
              className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
              style={{ opacity: wallpaperConfig.dimLevel / 100 }}
            />
          </div>
        )}

      {/* Top Desktop Controls Bar */}
      <header className="w-full max-w-5xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 mb-4 text-xs relative z-10 backdrop-blur-md bg-slate-950/70 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <VoiceAgentLogo config={logoConfig} size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-100">{logoConfig.customTitle}</span>
              <span className="font-mono text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/60">
                {voiceConfig.language} &bull; {logoConfig.accentColor}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              AI Voice Assistant &bull; Free Voice Access (Hindi / Bengali / English) &bull; Gallery Wallpaper
            </p>
          </div>
        </div>

        {/* Action simulations */}
        <div className="flex items-center gap-2">
          {/* Gallery Wallpaper Button */}
          <button
            onClick={() => setIsWallpaperModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors shadow-sm font-medium"
            title="Set Gallery Wallpaper (गैलरी बैकग्राउंड फोटो)"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Wallpaper</span>
          </button>

          {/* Customise Voice & Logo */}
          <button
            onClick={() => setIsCustomizerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/80 transition-all shadow-sm font-semibold"
            title="Customise Voice and Logo"
          >
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            <span>Customise Logo &amp; Voice</span>
          </button>

          {/* Quick Voice Trigger */}
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-colors shadow-sm"
            title="Start Voice Assistant"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Access (Mic)</span>
          </button>

          {/* View Kotlin MainActivity.kt */}
          <button
            onClick={() => setIsKotlinViewerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800 transition-colors shadow-sm font-mono"
            title="View MainActivity.kt"
          >
            <Code className="w-3.5 h-3.5" />
            <span>MainActivity.kt</span>
          </button>

          {/* Incoming Call Simulation Button */}
          <button
            onClick={() =>
              handleTriggerIncomingCall(
                'Apex Dental Reception',
                '+1 (555) 438-9201',
                'Hello Alex, this is Apex Dental calling about your upcoming checkup.'
              )
            }
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors shadow-sm"
            title="Simulate Inbound Call"
          >
            <PhoneIncoming className="w-3.5 h-3.5 text-emerald-400" />
            <span>Screen Call</span>
          </button>

          {/* AndroidManifest.xml Inspector */}
          <button
            onClick={() => setIsManifestOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors shadow-sm"
            title="View AndroidManifest.xml"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Manifest</span>
          </button>

          {/* Toggle Device Frame vs Full-screen */}
          <button
            onClick={() => setIsDeviceView(!isDeviceView)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors shadow-sm"
            title={isDeviceView ? 'Switch to Expanded View' : 'Switch to Phone Mockup'}
          >
            {isDeviceView ? (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Expand</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container: Smartphone Mockup or Expanded */}
      <main
        className={`w-full transition-all duration-300 relative ${
          isDeviceView
            ? 'max-w-[440px] h-[850px] max-h-[92vh] rounded-[48px] border-[8px] border-slate-800 shadow-2xl shadow-emerald-950/20 bg-slate-950 flex flex-col overflow-hidden'
            : 'max-w-5xl h-[820px] max-h-[88vh] rounded-3xl border border-slate-800 bg-slate-950 flex flex-col overflow-hidden shadow-xl'
        }`}
      >
        {/* Phone Frame Gallery Wallpaper Layer */}
        {wallpaperConfig.imageUrl &&
          (wallpaperConfig.target === 'phone' || wallpaperConfig.target === 'both') && (
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-500 scale-105"
                style={{
                  backgroundImage: `url(${wallpaperConfig.imageUrl})`,
                  filter: `blur(${wallpaperConfig.blurLevel}px)`,
                }}
              />
              <div
                className="absolute inset-0 bg-slate-950 transition-opacity duration-300"
                style={{ opacity: wallpaperConfig.dimLevel / 100 }}
              />
            </div>
          )}

        {/* Status Bar */}
        <AndroidStatusHeader
          activeCallActive={!!activeCall}
          activeContactName={activeCall?.contactName}
          isMicActive={activeCall?.isSpeakerOn}
          onOpenManifest={() => setIsManifestOpen(true)}
        />

        {/* Dynamic Screen Content */}
        <div className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* If a simulated app is launched (YouTube, WhatsApp, Chrome, Camera, Settings), show it! */}
          {activeSimulatedApp && (
            <SimulatedAppView
              activePackage={activeSimulatedApp}
              onClose={() => setActiveSimulatedApp(null)}
              onVoiceTrigger={() => setIsVoiceModalOpen(true)}
              onOpenWallpaper={() => setIsWallpaperModalOpen(true)}
            />
          )}

          {activeTab === 'agent' && (
            <AgentHub
              contacts={contacts}
              tasks={tasks}
              permissions={permissions}
              logoConfig={logoConfig}
              voiceConfig={voiceConfig}
              wallpaperConfig={wallpaperConfig}
              requireRavanWakeWord={requireRavanWakeWord}
              onToggleRavanWakeWord={() => setRequireRavanWakeWord((prev) => !prev)}
              wakeWordWarning={wakeWordWarning}
              onOpenCustomizer={() => setIsCustomizerOpen(true)}
              onOpenWallpaper={() => setIsWallpaperModalOpen(true)}
              onExecuteCall={handleStartCall}
              onExecuteSms={(name, number, content) => {
                let thread = smsThreads.find((t) => t.phoneNumber === number);
                if (!thread) {
                  thread = {
                    id: `sms-${Date.now()}`,
                    contactName: name,
                    phoneNumber: number,
                    avatarColor: 'bg-emerald-600',
                    initials: name.substring(0, 2).toUpperCase(),
                    category: 'personal',
                    unreadCount: 0,
                    messages: [],
                  };
                  setSmsThreads((prev) => [thread!, ...prev]);
                }
                handleSendMessage(thread.id, content, true);
                setActiveTab('messages');
              }}
              onTriggerScreening={(name, num, speech) => handleTriggerIncomingCall(name, num, speech)}
              onRequestPermission={(perm) => setPendingPermission(perm)}
              onOpenManifest={() => setIsManifestOpen(true)}
              onTriggerVoice={() => setIsVoiceModalOpen(true)}
              onLaunchApp={(pkg) => setActiveSimulatedApp(pkg)}
              onOpenKotlinCode={() => setIsKotlinViewerOpen(true)}
              spokenStatusText={spokenStatusText}
              lastSpokenText={lastSpokenText}
              onSimulateCommand={handleCommand}
            />
          )}

          {activeTab === 'phone' && (
            <DialerAndCalls
              contacts={contacts}
              callHistory={callHistory}
              permissions={permissions}
              onStartCall={handleStartCall}
              onRequestPermission={(perm) => setPendingPermission(perm)}
            />
          )}

          {activeTab === 'messages' && (
            <MessagingView
              threads={smsThreads}
              contacts={contacts}
              permissions={permissions}
              onSendMessage={handleSendMessage}
              onNewThread={(name, num, text) => {
                const newT: SmsThread = {
                  id: `sms-${Date.now()}`,
                  contactName: name,
                  phoneNumber: num,
                  avatarColor: 'bg-emerald-600',
                  initials: name.substring(0, 2).toUpperCase(),
                  category: 'personal',
                  unreadCount: 0,
                  messages: [
                    {
                      id: `sm-${Date.now()}`,
                      sender: 'user',
                      text,
                      timestamp: 'Just now',
                      status: 'delivered',
                    },
                  ],
                };
                setSmsThreads((prev) => [newT, ...prev]);
              }}
              onRequestPermission={(perm) => setPendingPermission(perm)}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsView
              contacts={contacts}
              permissions={permissions}
              onStartCall={handleStartCall}
              onOpenSms={handleOpenSmsWithContact}
              onAddContact={(newC) => setContacts((prev) => [newC, ...prev])}
              onRequestPermission={(perm) => setPendingPermission(perm)}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        <AndroidNavBar
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          unreadSmsCount={smsThreads.reduce((acc, t) => acc + t.unreadCount, 0)}
        />
      </main>

      {/* MODALS & OVERLAYS */}

      {/* 0. Unique Voice & Logo Customizer Modal */}
      <VoiceLogoCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        logoConfig={logoConfig}
        voiceConfig={voiceConfig}
        onSaveLogoConfig={setLogoConfig}
        onSaveVoiceConfig={setVoiceConfig}
      />

      {/* 1. Voice Recognition Dialog (RecognizerIntent.ACTION_RECOGNIZE_SPEECH with Hindi / English access) */}
      <BengaliVoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onCommandRecognized={handleCommand}
        promptText="What would you like to do? (क्या करना है बताइए)"
        defaultLang={voiceConfig.language}
        logoConfig={logoConfig}
      />

      {/* 2. Kotlin Code Viewer Modal */}
      <KotlinCodeViewerModal
        isOpen={isKotlinViewerOpen}
        onClose={() => setIsKotlinViewerOpen(false)}
        lastSpokenText={lastSpokenText}
        lastStatusText={spokenStatusText}
        lastTTSOutput={lastTTSOutput}
      />

      {/* 3. Active Call Screen Modal */}
      {activeCall && (
        <ActiveCallModal
          callState={activeCall}
          onEndCall={handleEndCall}
          onUpdateCallState={(updates) =>
            setActiveCall((prev) => (prev ? { ...prev, ...updates } : null))
          }
          onAddTranscriptMessage={(msg) =>
            setActiveCall((prev) =>
              prev ? { ...prev, messages: [...prev.messages, msg] } : null
            )
          }
        />
      )}

      {/* 4. Incoming Call Screening Modal */}
      {incomingCall && (
        <CallScreeningModal
          callerName={incomingCall.callerName}
          callerNumber={incomingCall.callerNumber}
          initialCallerSpeech={incomingCall.initialSpeech}
          onAnswerCall={() => {
            const current = incomingCall;
            setIncomingCall(null);
            handleStartCall(current.callerName, current.callerNumber);
          }}
          onRejectCall={() => setIncomingCall(null)}
          onSendQuickSms={(text) => {
            const current = incomingCall;
            setIncomingCall(null);
            handleOpenSmsWithContact(current.callerName, current.callerNumber);
          }}
        />
      )}

      {/* 5. Android Runtime Permission Request Dialog */}
      {pendingPermission && (
        <AndroidPermissionDialog
          permission={pendingPermission}
          onGrant={handleGrantPermission}
          onDeny={handleDenyPermission}
        />
      )}

      {/* 6. Manifest Inspector Modal */}
      <ManifestModal
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
        permissions={permissions}
        onTogglePermission={handleTogglePermission}
      />

      {/* 7. Gallery Wallpaper & Background Modal */}
      <WallpaperModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        wallpaper={wallpaperConfig}
        onUpdateWallpaper={handleUpdateWallpaper}
      />
    </div>
  );
}
