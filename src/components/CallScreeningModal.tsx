import React, { useState } from 'react';
import {
  PhoneCall,
  PhoneOff,
  ShieldCheck,
  Bot,
  AlertTriangle,
  MessageSquare,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { speakText, stopSpeaking } from '../utils/audio';

interface Props {
  callerName: string;
  callerNumber: string;
  initialCallerSpeech?: string;
  onAnswerCall: () => void;
  onRejectCall: () => void;
  onSendQuickSms: (text: string) => void;
}

export const CallScreeningModal: React.FC<Props> = ({
  callerName,
  callerNumber,
  initialCallerSpeech = "Hi, I am calling regarding your recent order delivery at the front gate.",
  onAnswerCall,
  onRejectCall,
  onSendQuickSms,
}) => {
  const [isScreening, setIsScreening] = useState(false);
  const [screeningHistory, setScreeningHistory] = useState<Array<{ speaker: string; text: string }>>([]);
  const [screeningResult, setScreeningResult] = useState<{
    category?: string;
    urgency?: string;
    recommendation?: string;
    suggestedReply?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startScreening = async () => {
    setIsScreening(true);
    setIsLoading(true);

    const initialAgentSpeech = "Hi, I am the automated Phone AI Agent for Alex. May I ask what this call is regarding?";
    speakText(initialAgentSpeech);

    setScreeningHistory([
      { speaker: 'Phone AI Agent', text: initialAgentSpeech },
      { speaker: callerName, text: initialCallerSpeech },
    ]);

    try {
      const res = await fetch('/api/agent/screen-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName,
          callerNumber,
          callerSpeech: initialCallerSpeech,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setScreeningResult(data);
        if (data.screeningResponse) {
          setScreeningHistory((prev) => [
            ...prev,
            { speaker: 'Phone AI Agent', text: data.screeningResponse },
          ]);
          speakText(data.screeningResponse);
        }
      }
    } catch (err) {
      console.error('Call screen error:', err);
      setScreeningResult({
        category: 'Delivery / Service',
        urgency: 'Medium',
        recommendation: 'Courier is at the door, recommended to answer.',
        suggestedReply: "I'll be down in 2 minutes!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    stopSpeaking();
    onRejectCall();
  };

  const handleAnswer = () => {
    stopSpeaking();
    onAnswerCall();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-100 flex flex-col">
        {/* Top Tag */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Incoming Call Screen
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">CALL_PHONE</span>
        </div>

        {/* Caller Header */}
        <div className="flex flex-col items-center text-center my-5">
          <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-emerald-500/30 flex items-center justify-center text-2xl font-bold text-slate-200 shadow-lg mb-3">
            {callerName.substring(0, 2).toUpperCase()}
          </div>
          <h3 className="text-xl font-bold text-slate-100">{callerName}</h3>
          <p className="text-xs font-mono text-slate-400 mt-0.5">{callerNumber}</p>
        </div>

        {/* Screening Content or Initial Prompt */}
        {!isScreening ? (
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 my-2 text-center">
            <Bot className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">
              Not sure who is calling? Let the Phone AI Agent answer and screen the call in real-time.
            </p>
            <button
              onClick={startScreening}
              className="mt-3 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              Screen with AI Agent
            </button>
          </div>
        ) : (
          <div className="space-y-3 my-2">
            {/* Live Transcript */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 max-h-44 overflow-y-auto space-y-2 text-xs">
              <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-emerald-400" /> AI Agent Live Dialogue
              </div>
              {screeningHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl text-xs leading-relaxed ${
                    item.speaker === 'Phone AI Agent'
                      ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-800/40'
                      : 'bg-slate-800 text-slate-200'
                  }`}
                >
                  <span className="font-semibold block text-[10px] opacity-75">{item.speaker}</span>
                  {item.text}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 italic py-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
                  AI analyzing caller intent...
                </div>
              )}
            </div>

            {/* AI Insights & Recommendation */}
            {screeningResult && (
              <div className="bg-slate-800/80 border border-emerald-500/30 rounded-2xl p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Category:
                  </span>
                  <span className="font-mono text-emerald-300 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                    {screeningResult.category}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  <strong>Recommendation:</strong> {screeningResult.recommendation}
                </p>
                {screeningResult.suggestedReply && (
                  <button
                    onClick={() => onSendQuickSms(screeningResult.suggestedReply!)}
                    className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-[11px] text-slate-200 flex items-center justify-center gap-1.5 border border-slate-600 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3 text-indigo-400" />
                    Quick SMS: "{screeningResult.suggestedReply}"
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons: Answer, Decline */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800">
          <button
            onClick={handleDecline}
            className="py-3 px-4 rounded-2xl bg-rose-600/90 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow"
          >
            <PhoneOff className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={handleAnswer}
            className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <PhoneCall className="w-4 h-4" />
            {isScreening ? 'Take Over Call' : 'Answer Call'}
          </button>
        </div>
      </div>
    </div>
  );
};
