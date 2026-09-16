import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  Play,
  Pause,
  Send,
  Camera,
  RotateCcw,
  Settings,
  Wifi,
  Volume2,
  Battery,
  Globe,
  Share2,
  ThumbsUp,
  MessageCircle,
  ExternalLink,
  Shield,
  Smartphone,
  Mic,
  Image as ImageIcon,
} from 'lucide-react';

export type AppPackage =
  | 'com.google.android.youtube'
  | 'com.whatsapp'
  | 'com.android.chrome'
  | 'android.media.action.IMAGE_CAPTURE'
  | 'android.provider.Settings.ACTION_SETTINGS';

interface Props {
  activePackage: AppPackage;
  onClose: () => void;
  onVoiceTrigger?: () => void;
  onOpenWallpaper?: () => void;
}

export const SimulatedAppView: React.FC<Props> = ({
  activePackage,
  onClose,
  onVoiceTrigger,
  onOpenWallpaper,
}) => {
  // 1. YouTube App State
  const [ytPlaying, setYtPlaying] = useState(true);
  const [ytSearch, setYtSearch] = useState('');

  // 2. WhatsApp App State
  const [waText, setWaText] = useState('');
  const [waMessages, setWaMessages] = useState<Array<{ sender: 'user' | 'other'; text: string; time: string }>>([
    { sender: 'other', text: 'Good morning! How is the project update coming along?', time: '10:30 AM' },
    { sender: 'user', text: 'Everything is moving smoothly. Phone AI Agent is ready!', time: '10:32 AM' },
  ]);

  // 3. Chrome App State
  const [urlBar, setUrlBar] = useState('https://www.google.com/search?q=AI+Voice+Assistant');

  // 4. Camera App State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);

  useEffect(() => {
    if (activePackage === 'android.media.action.IMAGE_CAPTURE') {
      // Attempt camera access
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((stream) => {
            setHasCameraPermission(true);
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch(() => {
            setHasCameraPermission(false);
          });
      } else {
        setHasCameraPermission(false);
      }
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activePackage]);

  const handleTakePhoto = () => {
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    if (videoRef.current && hasCameraPermission) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          setCapturedPhoto(canvas.toDataURL('image/png'));
        }
      } catch (e) {
        setCapturedPhoto('captured');
      }
    } else {
      setCapturedPhoto('sample');
    }
  };

  const handleSendWa = () => {
    if (!waText.trim()) return;
    setWaMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: waText.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setWaText('');
  };

  return (
    <div className="absolute inset-0 z-40 bg-slate-950 flex flex-col animate-in fade-in duration-150">
      {/* ---------------- YOUTUBE APP ---------------- */}
      {activePackage === 'com.google.android.youtube' && (
        <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
          {/* Header */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-white">
              <div className="w-6 h-4 bg-red-600 rounded flex items-center justify-center">
                <Play className="w-2.5 h-2.5 text-white fill-white" />
              </div>
              <span>YouTube</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <button
                onClick={onVoiceTrigger}
                className="p-1.5 rounded-full bg-slate-800 text-emerald-400 hover:bg-slate-700"
                title="Voice Search"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Video Player Box */}
          <div className="w-full bg-black aspect-video relative flex items-center justify-center border-b border-slate-800">
            {/* Animated simulated video graphics */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-950/60 via-slate-900 to-indigo-950/60 flex flex-col items-center justify-center p-4 text-center">
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/70 px-2.5 py-1 rounded-full mb-2 border border-emerald-800/60">
                AI Voice Assistant Tutorial
              </span>
              <p className="text-xs text-slate-300 font-medium max-w-xs">
                How to control your phone hands-free with Hindi &amp; English voice access
              </p>
            </div>

            <button
              onClick={() => setYtPlaying(!ytPlaying)}
              className="z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white flex items-center justify-center transition-all shadow-lg active:scale-95"
            >
              {ytPlaying ? (
                <Pause className="w-6 h-6 fill-white" />
              ) : (
                <Play className="w-6 h-6 fill-white ml-0.5" />
              )}
            </button>

            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[10px] text-slate-400">
              <span>02:14 / 10:45</span>
              <span className="bg-red-600 text-white px-1.5 rounded font-mono">1080p</span>
            </div>
          </div>

          {/* Video Meta & Recommended */}
          <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-100 leading-snug">
                Android Voice Agent with Hindi &amp; English Voice Access
              </h3>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                <span>124K views</span>
                <span>&bull;</span>
                <span>2 days ago</span>
                <span>&bull;</span>
                <span className="text-emerald-400 font-medium">#PhoneAgent</span>
              </div>
            </div>

            {/* Interaction pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              <button className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full text-slate-200">
                <ThumbsUp className="w-3.5 h-3.5" /> 14K
              </button>
              <button className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full text-slate-200">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <button className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full text-slate-200">
                <MessageCircle className="w-3.5 h-3.5" /> 842
              </button>
            </div>

            {/* Next Recommended Videos */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Up next
              </span>
              {[
                { title: 'Kotlin Activity Result Launcher & Permissions', views: '45K views', time: '8:12' },
                { title: 'Android TextToSpeech Locale("hi", "IN") Guide', views: '89K views', time: '14:30' },
                { title: 'Automated Phone Calling & Call Screen AI', views: '210K views', time: '19:45' },
              ].map((rec, i) => (
                <div key={i} className="flex gap-3 cursor-pointer group">
                  <div className="w-24 h-16 bg-slate-800 rounded-xl relative shrink-0 overflow-hidden flex items-center justify-center text-slate-500">
                    <Play className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-[9px] px-1 rounded text-slate-300 font-mono">
                      {rec.time}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-slate-200 group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                      {rec.title}
                    </h4>
                    <span className="text-[10px] text-slate-500 mt-1 block">{rec.views}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- WHATSAPP APP ---------------- */}
      {activePackage === 'com.whatsapp' && (
        <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
          {/* Header */}
          <div className="p-3 bg-emerald-900 border-b border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button onClick={onClose} className="p-1 rounded-lg text-emerald-200 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-xs text-white">
                SC
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">Sarah Chen</h3>
                <span className="text-[10px] text-emerald-200">Online &bull; WhatsApp</span>
              </div>
            </div>
            <button onClick={onClose} className="text-xs text-emerald-200 hover:text-white font-medium">
              Close
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="text-center">
              <span className="text-[10px] bg-slate-800/80 text-slate-400 px-2.5 py-1 rounded-full border border-slate-700">
                Messages are end-to-end encrypted
              </span>
            </div>

            {waMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 px-1 font-mono">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-2.5 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={waText}
              onChange={(e) => setWaText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendWa()}
              placeholder="Type a message..."
              className="flex-1 bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSendWa}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-bold transition-all shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------- CHROME BROWSER APP ---------------- */}
      {activePackage === 'com.android.chrome' && (
        <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
          {/* URL address bar */}
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 bg-slate-950 border border-slate-700/80 rounded-2xl px-3 py-1.5 text-xs text-slate-300 flex items-center gap-2 overflow-hidden">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <input
                type="text"
                value={urlBar}
                onChange={(e) => setUrlBar(e.target.value)}
                className="bg-transparent w-full text-slate-200 focus:outline-none text-xs font-mono"
              />
            </div>
          </div>

          {/* Web View simulation */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            <div className="flex items-center justify-center py-4">
              <span className="text-3xl font-extrabold tracking-tight">
                <span className="text-blue-500">G</span>
                <span className="text-red-500">o</span>
                <span className="text-yellow-500">o</span>
                <span className="text-blue-500">g</span>
                <span className="text-green-500">l</span>
                <span className="text-red-500">e</span>
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'Google AI Studio: Phone AI Agent with Kotlin & Android',
                  url: 'https://ai.studio/build/phone-agent',
                  desc: 'Speech recognition RecognizerIntent integration with TextToSpeech engine and automated app intents.',
                },
                {
                  title: 'Android SpeechRecognizer API Documentation',
                  url: 'https://developer.android.com/reference/android/speech/SpeechRecognizer',
                  desc: 'Handles free-form voice recognition with language specification using RecognizerIntent.EXTRA_LANGUAGE.',
                },
                {
                  title: 'TextToSpeech | Android Developers',
                  url: 'https://developer.android.com/reference/android/speech/tts/TextToSpeech',
                  desc: 'Synthesizes speech from text for immediate playback or to create a sound file with Locale("hi", "IN").',
                },
              ].map((res, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1 hover:border-slate-700 transition-colors cursor-pointer"
                >
                  <span className="text-[10px] text-slate-500 font-mono truncate block">
                    {res.url}
                  </span>
                  <h4 className="font-semibold text-emerald-400 text-xs hover:underline">
                    {res.title}
                  </h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{res.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- CAMERA APP ---------------- */}
      {activePackage === 'android.media.action.IMAGE_CAPTURE' && (
        <div className="flex-1 flex flex-col bg-black text-white relative">
          {/* Top Camera Controls */}
          <div className="p-3 flex items-center justify-between z-10 bg-black/40 backdrop-blur-sm">
            <button onClick={onClose} className="p-1.5 rounded-full bg-white/20 text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-mono uppercase tracking-widest text-slate-300">
              IMAGE_CAPTURE
            </span>
            <div className="w-8"></div>
          </div>

          {/* Viewfinder */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {hasCameraPermission ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
                <Camera className="w-12 h-12 text-slate-500" />
                <span className="text-xs font-semibold text-slate-200">
                  Camera Viewfinder
                </span>
                <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                  Camera active. Tap the shutter button to take a photo.
                </p>
              </div>
            )}

            {/* Shutter flash effect */}
            {isShutterFlashing && (
              <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200" />
            )}

            {/* Grid overlay */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20 border border-white/40">
              <div className="border border-white/40"></div>
              <div className="border border-white/40"></div>
              <div className="border border-white/40"></div>
              <div className="border border-white/40"></div>
              <div className="border border-white/40"></div>
              <div className="border border-white/40"></div>
            </div>
          </div>

          {/* Bottom Shutter Controls */}
          <div className="p-6 bg-black/80 flex items-center justify-around z-10">
            {capturedPhoto ? (
              <div className="w-12 h-12 rounded-xl bg-slate-800 border-2 border-emerald-400 flex items-center justify-center overflow-hidden text-[10px] text-emerald-300">
                Photo Saved
              </div>
            ) : (
              <div className="w-12 h-12"></div>
            )}

            <button
              onClick={handleTakePhoto}
              className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-transform bg-white/10"
              title="Take Photo"
            >
              <div className="w-12 h-12 rounded-full bg-white"></div>
            </button>

            <button
              onClick={() => setCapturedPhoto(null)}
              className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------- SETTINGS APP ---------------- */}
      {activePackage === 'android.provider.Settings.ACTION_SETTINGS' && (
        <div className="flex-1 flex flex-col bg-slate-950 text-slate-100">
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-bold text-slate-100">Android Settings</h3>
            </div>
            <button onClick={onClose} className="text-xs text-emerald-400 font-medium">
              Done
            </button>
          </div>

          {/* Settings List */}
          <div className="p-4 overflow-y-auto space-y-3 text-xs">
            {[
              {
                icon: <ImageIcon className="w-4 h-4 text-emerald-400" />,
                title: 'Wallpaper & Gallery Background',
                desc: 'Set custom photo from device gallery or curated HD backgrounds',
                action: () => onOpenWallpaper?.(),
              },
              {
                icon: <Wifi className="w-4 h-4 text-emerald-400" />,
                title: 'Network & Internet',
                desc: 'Wi-Fi, 5G, SIM cards, Hotspot',
              },
              {
                icon: <Globe className="w-4 h-4 text-blue-400" />,
                title: 'Language & Voice Input',
                desc: 'Free Language: Hindi (hi-IN), Bengali (bn-IN), English (US)',
              },
              {
                icon: <Volume2 className="w-4 h-4 text-purple-400" />,
                title: 'Text-to-Speech Output',
                desc: 'Speech engine: Hindi (India) Locale("hi", "IN") & Bengali Locale("bn", "IN")',
              },
              {
                icon: <Shield className="w-4 h-4 text-amber-400" />,
                title: 'Apps & Permissions',
                desc: 'CALL_PHONE, SEND_SMS, RECORD_AUDIO',
              },
              {
                icon: <Battery className="w-4 h-4 text-emerald-400" />,
                title: 'Battery & Performance',
                desc: '92% &bull; Normal agent background consumption',
              },
            ].map((s, idx) => (
              <div
                key={idx}
                onClick={s.action}
                className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-800/80">{s.icon}</div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-200 text-xs">{s.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{s.desc}</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
