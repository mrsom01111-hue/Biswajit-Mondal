export type PermissionName = 
  | 'android.permission.CALL_PHONE'
  | 'android.permission.SEND_SMS'
  | 'android.permission.RECORD_AUDIO';

export interface PermissionState {
  'android.permission.CALL_PHONE': boolean;
  'android.permission.SEND_SMS': boolean;
  'android.permission.RECORD_AUDIO': boolean;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatarColor: string;
  initials: string;
  company?: string;
  relationship: 'Personal' | 'Work' | 'Medical' | 'Service' | 'Unknown';
  isFavorite?: boolean;
}

export interface CallMessage {
  id: string;
  speaker: 'agent' | 'user' | 'remote' | 'system';
  speakerLabel: string;
  text: string;
  timestamp: string;
  emotion?: string;
}

export interface CallRecord {
  id: string;
  contactName: string;
  phoneNumber: string;
  type: 'incoming' | 'outgoing' | 'missed' | 'screened';
  timestamp: string;
  durationSeconds: number;
  status: 'completed' | 'missed' | 'rejected' | 'screened';
  summary?: string;
  category?: 'Personal' | 'Work' | 'Medical' | 'Delivery' | 'Spam' | 'Inquiry';
  transcript?: CallMessage[];
  aiHandled?: boolean;
}

export interface SmsMessage {
  id: string;
  sender: 'user' | 'remote' | 'agent';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'received' | 'failed';
  aiGenerated?: boolean;
}

export interface SmsThread {
  id: string;
  contactName: string;
  phoneNumber: string;
  avatarColor: string;
  initials: string;
  category: 'personal' | 'business' | 'verification' | 'spam';
  messages: SmsMessage[];
  unreadCount: number;
}

export interface AgentTask {
  id: string;
  title: string;
  type: 'CALL' | 'SMS' | 'SCREEN' | 'QUERY';
  status: 'completed' | 'running' | 'pending_approval' | 'failed';
  timestamp: string;
  details: string;
  target?: string;
}

export interface ActiveCallState {
  isActive: boolean;
  isScreening: boolean;
  contactName: string;
  phoneNumber: string;
  callType: 'outgoing' | 'incoming';
  objective?: string;
  callerRole: 'remote' | 'agent';
  messages: CallMessage[];
  isMuted: boolean;
  isSpeakerOn: boolean;
  isAiAgentSpeaking: boolean;
  screeningSummary?: {
    category: string;
    urgency: string;
    recommendation: string;
    suggestedReply: string;
  };
}

export interface LogoConfig {
  logoId: 'ravan_emblem' | 'cyber_core' | 'orbital_orb' | 'vector_wave' | 'phone_pulse';
  imageUrl?: string;
  accentColor: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose' | 'gold';
  animation: 'waveform' | 'breathing' | 'sonar' | 'static';
  customTitle: string;
}

export interface VoiceConfig {
  pitch: number; // 0.6 to 1.6
  rate: number; // 0.7 to 1.5
  language: 'hi-IN' | 'bn-IN' | 'bn-BD' | 'en-US' | 'en-IN';
  persona: 'bilingual' | 'secretary' | 'concierge' | 'cyber';
}

export interface WallpaperConfig {
  imageUrl: string | null;
  dimLevel: number; // 0 to 90 (darkness % overlay)
  blurLevel: number; // 0 to 20 (px)
  target: 'phone' | 'full' | 'both'; // where the wallpaper applies
  name?: string;
}

export type ThemeId =
  | 'emerald_cyber'
  | 'obsidian_gold'
  | 'midnight_purple'
  | 'cyber_cyan'
  | 'crimson_ruby'
  | 'solar_amber'
  | 'oled_stealth'
  | 'frosted_glacier';

export interface AppTheme {
  id: ThemeId;
  name: string;
  nameHindi: string;
  category: 'Classic' | 'Royal' | 'Cyber' | 'Stealth' | 'Light';
  description: string;
  accentColor: 'emerald' | 'cyan' | 'violet' | 'amber' | 'rose' | 'gold';
  phoneBorderColor: string;
  phoneBgColor: string;
  primaryButtonClass: string;
  accentTextClass: string;
  accentBadgeClass: string;
  glowColor: string;
  previewColors: string[];
  suggestedLogoId: LogoConfig['logoId'];
  suggestedTitle: string;
}
