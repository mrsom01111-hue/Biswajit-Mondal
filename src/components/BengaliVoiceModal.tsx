import React, { useState, useEffect, useRef } from 'react';
import { Mic, X, Volume2, Sparkles, AlertCircle, Send } from 'lucide-react';
import { createSpeechRecognizer } from '../utils/audio';
import { LogoConfig } from '../types';
import { VoiceAgentLogo } from './VoiceAgentLogo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCommandRecognized: (command: string) => void;
  promptText?: string;
  defaultLang?: string;
  logoConfig?: LogoConfig;
}

export const BengaliVoiceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onCommandRecognized,
  promptText = 'What would you like me to do? (क्या करना है बताइए)',
  defaultLang = 'hi-IN',
  logoConfig,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [activeLang, setActiveLang] = useState(defaultLang);
  const [transcript, setTranscript] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const recognizerRef = useRef<any>(null);

  useEffect(() => {
    setActiveLang(defaultLang);
  }, [defaultLang]);

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [isOpen, activeLang]);

  const startListening = () => {
    setErrorMsg(null);
    setTranscript('');
    setIsListening(true);

    const recognizer = createSpeechRecognizer(
      activeLang,
      (text) => {
        setTranscript(text);
        setTimeout(() => {
          onCommandRecognized(text);
          onClose();
        }, 600);
      },
      (err) => {
        console.warn('Speech recognition warning:', err);
        setErrorMsg('Microphone not accessible. You can use the quick sample chips or type below.');
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      try {
        recognizer.start();
      } catch (e) {
        setIsListening(false);
      }
    } else {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognizerRef.current) {
      try {
        recognizerRef.current.stop();
      } catch (e) {}
      recognizerRef.current = null;
    }
    setIsListening(false);
  };

  const handleSimulateSpeech = (text: string) => {
    setTranscript(text);
    stopListening();
    setTimeout(() => {
      onCommandRecognized(text);
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-sm w-full p-5 text-slate-100 space-y-4 shadow-2xl relative overflow-hidden">
        {/* Android top prompt bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
              Voice Access &bull; {activeLang}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Voice Prompt with Custom Logo */}
        <div className="text-center py-1 space-y-2 flex flex-col items-center">
          {logoConfig && (
            <VoiceAgentLogo
              config={logoConfig}
              size="lg"
              isSpeaking={isListening}
              className="mb-1"
            />
          )}
          
          <h3 className="text-base font-bold text-slate-100">
            {promptText}
          </h3>
          <p className="text-xs text-slate-400">
            {transcript ? (
              <span className="text-emerald-300 font-semibold">"{transcript}"</span>
            ) : isListening ? (
              <span className="text-emerald-400 font-medium">
                Listening in {activeLang === 'hi-IN' ? 'Hindi (हिंदी)' : activeLang === 'bn-IN' ? 'Bengali (বাংলা)' : 'English'}...
              </span>
            ) : (
              'Tap microphone or select a command below'
            )}
          </p>
        </div>

        {/* Animated Google Assistant Glowing Dots */}
        <div className="flex items-center justify-center gap-2 py-2">
          {[
            'bg-blue-500',
            'bg-red-500',
            'bg-amber-400',
            'bg-emerald-500',
          ].map((color, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full ${color} ${
                isListening ? 'animate-bounce' : 'opacity-60'
              }`}
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>

        {/* Big Pulsing Mic Button */}
        <div className="flex justify-center">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
              isListening
                ? 'bg-emerald-500 text-slate-950 ring-8 ring-emerald-500/20 shadow-emerald-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Microphone"
          >
            <Mic className="w-7 h-7" />
          </button>
        </div>

        {/* Free Language Switcher: Hindi, Bengali, English */}
        <div className="flex justify-center gap-1.5 pt-1">
          <button
            onClick={() => setActiveLang('hi-IN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLang === 'hi-IN'
                ? 'bg-emerald-600 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            हिंदी (Hindi)
          </button>
          <button
            onClick={() => setActiveLang('bn-IN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLang === 'bn-IN'
                ? 'bg-emerald-600 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            বাংলা (Bengali)
          </button>
          <button
            onClick={() => setActiveLang('en-IN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeLang === 'en-IN' || activeLang === 'en-US'
                ? 'bg-emerald-600 text-slate-950 shadow-md font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
        </div>

        {/* Error message if mic unavailable */}
        {errorMsg && (
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Quick Voice Command Chips in Selected Language */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {activeLang === 'bn-IN' ? 'বাংলা ভয়েস কমান্ড:' : activeLang === 'hi-IN' ? 'हिंदी वॉयस कमांड्स:' : 'Voice Commands:'}
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Click to Speak</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {activeLang === 'bn-IN' ? (
              <>
                <button
                  onClick={() => handleSimulateSpeech('ইউটিউব খুলুন')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>▶️</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">YouTube</div>
                    <div className="text-[10px] text-slate-400">ইউটিউব খুলুন</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('হোয়াটসঅ্যাপ খুলুন')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>💬</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">WhatsApp</div>
                    <div className="text-[10px] text-slate-400">হোয়াটসঅ্যাপ খুলুন</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('ক্রোম খুলুন')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>🌐</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">Chrome</div>
                    <div className="text-[10px] text-slate-400">ক্রোম খুলুন</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('ক্যামেরা খুলুন')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>📷</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">Camera</div>
                    <div className="text-[10px] text-slate-400">ক্যামেরা খুলুন</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('সেটিংস খুলুন')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>⚙️</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">Settings</div>
                    <div className="text-[10px] text-slate-400">সেটিংস খুলুন</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('ফোন কল করুন')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>📞</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">Phone Call</div>
                    <div className="text-[10px] text-slate-400">ফোন কল করুন</div>
                  </div>
                </button>
              </>
            ) : activeLang === 'hi-IN' ? (
              <>
                <button
                  onClick={() => handleSimulateSpeech('यूट्यूब खोलो')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>▶️</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">YouTube</div>
                    <div className="text-[10px] text-slate-400">यूट्यूब खोलो</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('व्हाट्सएप खोलो')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>💬</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">WhatsApp</div>
                    <div className="text-[10px] text-slate-400">व्हाट्सएप खोलो</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('क्रोम खोलो')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>🌐</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">Chrome</div>
                    <div className="text-[10px] text-slate-400">क्रोम खोलो</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('कैमरा खोलो')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>📷</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">Camera</div>
                    <div className="text-[10px] text-slate-400">कैमरा खोलो</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('सेटिंग्स खोलो')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>⚙️</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">Settings</div>
                    <div className="text-[10px] text-slate-400">सेटिंग्स खोलो</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('कॉल करो')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>📞</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">Make a Call</div>
                    <div className="text-[10px] text-slate-400">कॉल करो</div>
                  </div>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleSimulateSpeech('Open YouTube')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>▶️</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">YouTube</div>
                    <div className="text-[10px] text-slate-400">Open YouTube</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('Open WhatsApp')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>💬</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">WhatsApp</div>
                    <div className="text-[10px] text-slate-400">Open WhatsApp</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('Open Chrome')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>🌐</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">Chrome</div>
                    <div className="text-[10px] text-slate-400">Open Chrome</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('Open Camera')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>📷</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">Camera</div>
                    <div className="text-[10px] text-slate-400">Open Camera</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('Open Settings')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>⚙️</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">Settings</div>
                    <div className="text-[10px] text-slate-400">Open Settings</div>
                  </div>
                </button>
                <button
                  onClick={() => handleSimulateSpeech('Call Dr. Emily')}
                  className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-left transition-colors border border-slate-700/60 flex items-center gap-1.5"
                >
                  <span>📞</span>
                  <div className="truncate">
                    <div className="font-semibold text-xs text-slate-200">Make a Call</div>
                    <div className="text-[10px] text-slate-400">Call Dr. Emily</div>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Custom text typing fallback */}
        <div className="flex gap-1.5 pt-1">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && customInput && handleSimulateSpeech(customInput)}
            placeholder="Type command in Hindi, Bengali, or English..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => customInput && handleSimulateSpeech(customInput)}
            disabled={!customInput.trim()}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs disabled:opacity-40 transition-colors flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            <span>Send</span>
          </button>
        </div>

      </div>
    </div>
  );
};
