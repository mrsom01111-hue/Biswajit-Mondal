import React, { useState } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  ShieldCheck,
  Delete,
  Bot,
  User,
  Sparkles,
  History,
  FileText,
  Clock,
  X,
} from 'lucide-react';
import { Contact, CallRecord, PermissionState } from '../types';
import { playDtmfTone } from '../utils/audio';

interface Props {
  contacts: Contact[];
  callHistory: CallRecord[];
  permissions: PermissionState;
  onStartCall: (name: string, number: string, objective?: string) => void;
  onRequestPermission: (perm: any) => void;
}

export const DialerAndCalls: React.FC<Props> = ({
  contacts,
  callHistory,
  permissions,
  onStartCall,
  onRequestPermission,
}) => {
  const [activeTab, setActiveTab] = useState<'dialer' | 'history' | 'ai_call'>('dialer');
  const [dialedNumber, setDialedNumber] = useState('');
  const [selectedCallDetail, setSelectedCallDetail] = useState<CallRecord | null>(null);

  // AI Autonomous Call config
  const [aiTargetContact, setAiTargetContact] = useState<string>(contacts[0]?.name || '');
  const [aiObjective, setAiObjective] = useState('');

  const handleKeypadPress = (key: string) => {
    playDtmfTone(key);
    setDialedNumber((prev) => prev + key);
  };

  const handleBackspace = () => {
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const handleDial = () => {
    if (!dialedNumber) return;
    if (!permissions['android.permission.CALL_PHONE']) {
      onRequestPermission('android.permission.CALL_PHONE');
      return;
    }

    const matched = contacts.find((c) => c.phone.replace(/\D/g, '') === dialedNumber.replace(/\D/g, ''));
    onStartCall(matched ? matched.name : dialedNumber, dialedNumber);
  };

  const handleLaunchAiCall = () => {
    if (!aiObjective.trim()) return;
    if (!permissions['android.permission.CALL_PHONE']) {
      onRequestPermission('android.permission.CALL_PHONE');
      return;
    }

    const contact = contacts.find((c) => c.name === aiTargetContact) || contacts[0];
    onStartCall(contact.name, contact.phone, aiObjective);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto text-slate-100">
      {/* Top Segmented Controls */}
      <div className="flex items-center justify-center mb-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1 flex items-center gap-1 w-full max-w-sm">
          <button
            onClick={() => setActiveTab('dialer')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'dialer'
                ? 'bg-emerald-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Keypad
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Recents ({callHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('ai_call')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ai_call'
                ? 'bg-emerald-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Call
          </button>
        </div>
      </div>

      {/* 1. DIALPAD TAB */}
      {activeTab === 'dialer' && (
        <div className="flex-1 flex flex-col items-center justify-between max-w-sm mx-auto w-full">
          {/* Number Display */}
          <div className="w-full flex items-center justify-center relative py-4 min-h-[70px]">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-wider text-slate-100 text-center select-all">
              {dialedNumber || <span className="text-slate-600 font-normal text-xl">Dial number</span>}
            </div>
            {dialedNumber && (
              <button
                onClick={handleBackspace}
                className="absolute right-2 p-2 text-slate-400 hover:text-slate-200 transition-colors"
                title="Delete"
              >
                <Delete className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Keypad Grid (Standard Telecom DTMF) */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full my-auto">
            {[
              { num: '1', sub: '' },
              { num: '2', sub: 'ABC' },
              { num: '3', sub: 'DEF' },
              { num: '4', sub: 'GHI' },
              { num: '5', sub: 'JKL' },
              { num: '6', sub: 'MNO' },
              { num: '7', sub: 'PQRS' },
              { num: '8', sub: 'TUV' },
              { num: '9', sub: 'WXYZ' },
              { num: '*', sub: '' },
              { num: '0', sub: '+' },
              { num: '#', sub: '' },
            ].map((k) => (
              <button
                key={k.num}
                onClick={() => handleKeypadPress(k.num)}
                className="h-16 rounded-3xl bg-slate-900/80 hover:bg-slate-800 active:bg-emerald-950/40 border border-slate-800 flex flex-col items-center justify-center transition-all duration-100 shadow-md active:scale-95 group"
              >
                <span className="text-xl font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {k.num}
                </span>
                {k.sub && (
                  <span className="text-[9px] font-mono tracking-widest text-slate-500 group-hover:text-slate-400">
                    {k.sub}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Green Call Action Button */}
          <div className="w-full flex items-center justify-center pt-5 pb-2">
            <button
              onClick={handleDial}
              disabled={!dialedNumber}
              className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-950/60 disabled:opacity-40 transition-all"
              title="Place Call (android.permission.CALL_PHONE)"
            >
              <PhoneCall className="w-7 h-7 fill-current" />
            </button>
          </div>
        </div>
      )}

      {/* 2. RECENT CALLS TAB */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Call Logs & Screening Summaries
          </div>
          {callHistory.map((call) => (
            <div
              key={call.id}
              onClick={() => setSelectedCallDetail(call)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-colors cursor-pointer flex items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`p-2.5 rounded-2xl shrink-0 ${
                    call.type === 'screened'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : call.type === 'incoming'
                      ? 'bg-blue-500/10 text-blue-400'
                      : call.type === 'outgoing'
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {call.type === 'screened' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : call.type === 'incoming' ? (
                    <PhoneIncoming className="w-4 h-4" />
                  ) : call.type === 'outgoing' ? (
                    <PhoneOutgoing className="w-4 h-4" />
                  ) : (
                    <PhoneMissed className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-200 truncate">
                      {call.contactName}
                    </span>
                    {call.aiHandled && (
                      <span className="text-[10px] bg-emerald-950/70 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/60 font-mono">
                        AI Handled
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{call.phoneNumber}</span>
                    <span>&bull;</span>
                    <span>{call.timestamp}</span>
                  </div>
                  {call.summary && (
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-1 italic">
                      "{call.summary}"
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartCall(call.contactName, call.phoneNumber);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-slate-950 text-slate-300 transition-colors"
                  title="Call Back"
                >
                  <PhoneCall className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. AI CALL ASSISTANT TAB */}
      {activeTab === 'ai_call' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl max-w-md mx-auto w-full space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Autonomous AI Phone Caller</h3>
              <p className="text-[11px] text-slate-400">
                The agent places the call via CALL_PHONE and speaks on your behalf
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select Contact to Call:
            </label>
            <select
              value={aiTargetContact}
              onChange={(e) => setAiTargetContact(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.phone}) - {c.company || c.relationship}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              What should the AI Agent accomplish on the call?
            </label>
            <textarea
              value={aiObjective}
              onChange={(e) => setAiObjective(e.target.value)}
              placeholder="E.g. Inquire about picking up my repaired car this evening, or Reschedule dental appointment to Friday 2 PM..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[90px] resize-none leading-relaxed"
            />
          </div>

          {/* Quick Objective Suggestions */}
          <div className="flex flex-wrap gap-1.5">
            {[
              'Reschedule appointment to Friday 2 PM',
              'Check opening hours and parking',
              'Confirm price estimate for service',
            ].map((s, idx) => (
              <button
                key={idx}
                onClick={() => setAiObjective(s)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>

          <button
            onClick={handleLaunchAiCall}
            disabled={!aiObjective.trim()}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Autonomous Call</span>
          </button>
        </div>
      )}

      {/* Call Detail Modal */}
      {selectedCallDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-5 text-slate-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold text-slate-100">{selectedCallDetail.contactName}</h4>
                <p className="text-xs text-slate-400 font-mono">{selectedCallDetail.phoneNumber}</p>
              </div>
              <button
                onClick={() => setSelectedCallDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Type:</span>
                  <span className="font-semibold text-slate-200 uppercase">{selectedCallDetail.type}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Duration:</span>
                  <span className="font-mono text-slate-200">{selectedCallDetail.durationSeconds}s</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Timestamp:</span>
                  <span className="text-slate-200">{selectedCallDetail.timestamp}</span>
                </div>
              </div>

              {selectedCallDetail.summary && (
                <div>
                  <span className="text-xs font-semibold text-emerald-400 block mb-1">
                    AI Call Summary:
                  </span>
                  <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                    {selectedCallDetail.summary}
                  </p>
                </div>
              )}

              {selectedCallDetail.transcript && (
                <div>
                  <span className="text-xs font-semibold text-slate-300 block mb-1">
                    Full Audio Transcript:
                  </span>
                  <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
                    {selectedCallDetail.transcript.map((msg) => (
                      <div key={msg.id} className="leading-relaxed">
                        <span className="font-semibold text-emerald-400 mr-1.5">
                          {msg.speakerLabel}:
                        </span>
                        <span className="text-slate-300">{msg.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCallDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
