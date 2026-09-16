import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  User,
  Sparkles,
  Send,
  Radio,
  Clock,
} from 'lucide-react';
import { ActiveCallState, CallMessage } from '../types';
import { speakText, stopSpeaking } from '../utils/audio';

interface Props {
  callState: ActiveCallState;
  onEndCall: () => void;
  onUpdateCallState: (updates: Partial<ActiveCallState>) => void;
  onAddTranscriptMessage: (msg: CallMessage) => void;
}

export const ActiveCallModal: React.FC<Props> = ({
  callState,
  onEndCall,
  onUpdateCallState,
  onAddTranscriptMessage,
}) => {
  const [seconds, setSeconds] = useState(0);
  const [userInputText, setUserInputText] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [callState.messages]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Trigger conversational turn via backend Gemini API
  const handleSendDialogueTurn = async (textToSend?: string) => {
    const speech = textToSend || userInputText.trim();
    if (!speech && !textToSend) return;

    // Add user/agent message to transcript
    const outgoingMsg: CallMessage = {
      id: `msg-${Date.now()}`,
      speaker: callState.callerRole === 'agent' ? 'agent' : 'user',
      speakerLabel: callState.callerRole === 'agent' ? 'Phone AI Agent' : 'Alex (You)',
      text: speech,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    onAddTranscriptMessage(outgoingMsg);
    if (!textToSend) setUserInputText('');

    // If agent is speaking, play speech synthesis
    if (callState.callerRole === 'agent' && callState.isSpeakerOn) {
      speakText(speech);
    }

    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/agent/call-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: callState.contactName,
          objective: callState.objective || 'Appointment inquiry / call',
          history: [...callState.messages, outgoingMsg],
          callerRole: 'remote',
          userMessage: speech,
        }),
      });

      if (!res.ok) throw new Error('Call turn failed');
      const data = await res.json();

      const remoteMsg: CallMessage = {
        id: `msg-${Date.now() + 1}`,
        speaker: 'remote',
        speakerLabel: callState.contactName,
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      onAddTranscriptMessage(remoteMsg);

      // Play remote audio through speaker if enabled
      if (callState.isSpeakerOn) {
        speakText(data.text, 0.95, 1.05);
      }

      // If remote indicates objective concluded, offer hang up notice
      if (data.shouldHangUp) {
        setTimeout(() => {
          onAddTranscriptMessage({
            id: `msg-hangup-${Date.now()}`,
            speaker: 'system',
            speakerLabel: 'System',
            text: 'Call concluded. Phone AI Agent accomplished the call objective.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        }, 1200);
      }
    } catch (err) {
      console.error('Call turn error:', err);
      // Fallback response
      const fallbackMsg: CallMessage = {
        id: `msg-fallback-${Date.now()}`,
        speaker: 'remote',
        speakerLabel: callState.contactName,
        text: 'Understood, thank you! Let me confirm that for you.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      onAddTranscriptMessage(fallbackMsg);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleEndCall = () => {
    stopSpeaking();
    onEndCall();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 text-slate-100 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-xs font-mono tracking-wide text-emerald-400 uppercase font-semibold">
            {callState.objective ? 'AI Autonomous Call' : 'Active Phone Call'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-mono text-slate-200 font-semibold">{formatTime(seconds)}</span>
        </div>
      </div>

      {/* Center Caller Info & Wave */}
      <div className="w-full max-w-md flex flex-col items-center my-auto">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-3xl font-bold text-emerald-400 shadow-xl shadow-emerald-950/40">
            {callState.contactName.substring(0, 2).toUpperCase()}
          </div>
          {callState.callerRole === 'agent' && (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow" title="AI Agent is actively speaking">
              <Bot className="w-4 h-4" />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-slate-100 tracking-tight text-center">
          {callState.contactName}
        </h2>
        <p className="text-xs font-mono text-slate-400 mt-1">{callState.phoneNumber}</p>

        {callState.objective && (
          <div className="mt-3 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 max-w-sm text-center">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span className="line-clamp-2">Goal: {callState.objective}</span>
          </div>
        )}

        {/* Audio Waveform simulation */}
        <div className="flex items-center justify-center gap-1.5 my-5 h-8">
          {[40, 70, 95, 60, 85, 45, 90, 65, 35, 75, 50].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isAiGenerating
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-slate-600'
              }`}
              style={{
                height: isAiGenerating ? `${h}%` : '20%',
              }}
            />
          ))}
        </div>

        {/* Live Transcript Drawer */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 max-h-48 overflow-y-auto space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pb-1 border-b border-slate-800/80">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Live Call Transcription
            </span>
            <span className="font-mono text-[10px]">CALL_PHONE Active</span>
          </div>

          {callState.messages.length === 0 ? (
            <p className="text-slate-500 italic text-center py-4">Connecting call audio...</p>
          ) : (
            callState.messages.map((m) => (
              <div
                key={m.id}
                className={`p-2 rounded-xl leading-relaxed ${
                  m.speaker === 'agent'
                    ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-200'
                    : m.speaker === 'user'
                    ? 'bg-slate-800 border border-slate-700 text-slate-200 ml-4'
                    : m.speaker === 'system'
                    ? 'bg-amber-950/30 border border-amber-800/30 text-amber-300 text-center'
                    : 'bg-slate-800/60 text-slate-300 mr-4'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-70 mb-0.5">
                  <span className="font-semibold flex items-center gap-1">
                    {m.speaker === 'agent' && <Bot className="w-3 h-3" />}
                    {m.speakerLabel}
                  </span>
                  <span className="font-mono">{m.timestamp}</span>
                </div>
                <div>{m.text}</div>
              </div>
            ))
          )}
          {isAiGenerating && (
            <div className="flex items-center gap-2 text-slate-400 italic text-xs py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
              {callState.contactName} is responding...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Dialogue & Agent Assist Controls */}
        <div className="w-full mt-3 flex items-center gap-2">
          <input
            type="text"
            value={userInputText}
            onChange={(e) => setUserInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendDialogueTurn()}
            placeholder={
              callState.callerRole === 'agent'
                ? "Instruct AI agent what to say next..."
                : "Speak into call..."
            }
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleSendDialogueTurn()}
            disabled={isAiGenerating}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl font-medium transition-colors disabled:opacity-50"
            title="Send voice line"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="w-full flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
          <button
            onClick={() => handleSendDialogueTurn("Yes, Thursday at 3:00 PM works perfectly for me.")}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700"
          >
            "Confirm Thursday 3 PM"
          </button>
          <button
            onClick={() => handleSendDialogueTurn("Could you please repeat that?")}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700"
          >
            "Could you repeat that?"
          </button>
          <button
            onClick={() => handleSendDialogueTurn("Thank you, that is all I needed today. Goodbye!")}
            className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700"
          >
            "Thank you, goodbye"
          </button>
        </div>
      </div>

      {/* Bottom In-Call Controls */}
      <div className="w-full max-w-md pb-4">
        {/* Toggle AI Agent speaker vs Direct User */}
        <div className="flex items-center justify-center mb-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 flex items-center gap-1">
            <button
              onClick={() => onUpdateCallState({ callerRole: 'agent' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                callState.callerRole === 'agent'
                  ? 'bg-emerald-600 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              AI Agent Speaks
            </button>
            <button
              onClick={() => onUpdateCallState({ callerRole: 'remote' })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                callState.callerRole === 'remote'
                  ? 'bg-slate-700 text-slate-100 shadow-md font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Direct User
            </button>
          </div>
        </div>

        <div className="flex items-center justify-around">
          {/* Mute */}
          <button
            onClick={() => onUpdateCallState({ isMuted: !callState.isMuted })}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-colors ${
              callState.isMuted ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {callState.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            <span className="text-[10px] mt-1">{callState.isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          {/* End Call button (Red) */}
          <button
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-950/50 transition-all"
            title="Hang Up (CALL_PHONE intent finish)"
          >
            <PhoneOff className="w-8 h-8" />
          </button>

          {/* Speaker */}
          <button
            onClick={() => onUpdateCallState({ isSpeakerOn: !callState.isSpeakerOn })}
            className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-colors ${
              callState.isSpeakerOn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {callState.isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            <span className="text-[10px] mt-1">Speaker</span>
          </button>
        </div>
      </div>
    </div>
  );
};
