import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCheck,
  Plus,
  ArrowLeft,
  Sliders,
  Filter,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { SmsThread, SmsMessage, PermissionState, Contact } from '../types';

interface Props {
  threads: SmsThread[];
  contacts: Contact[];
  permissions: PermissionState;
  onSendMessage: (threadId: string, text: string, isAiGenerated?: boolean) => void;
  onNewThread: (contactName: string, phoneNumber: string, text: string) => void;
  onRequestPermission: (perm: any) => void;
}

export const MessagingView: React.FC<Props> = ({
  threads,
  contacts,
  permissions,
  onSendMessage,
  onNewThread,
  onRequestPermission,
}) => {
  const [activeThreadId, setActiveThreadId] = useState<string | null>(threads[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'personal' | 'business' | 'verification'>('all');

  // AI Draft Modal state
  const [isAiDraftOpen, setIsAiDraftOpen] = useState(false);
  const [aiIntentPrompt, setAiIntentPrompt] = useState('');
  const [aiDraftTone, setAiDraftTone] = useState<'friendly' | 'professional' | 'concise' | 'urgent'>('friendly');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [draftResult, setDraftResult] = useState<{ draft: string; options: string[] } | null>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages]);

  const handleSend = () => {
    if (!inputText.trim() || !activeThread) return;
    if (!permissions['android.permission.SEND_SMS']) {
      onRequestPermission('android.permission.SEND_SMS');
      return;
    }

    onSendMessage(activeThread.id, inputText.trim(), false);
    setInputText('');
  };

  const handleGenerateAiDraft = async () => {
    if (!aiIntentPrompt.trim()) return;
    setIsGeneratingDraft(true);
    try {
      const res = await fetch('/api/agent/draft-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: activeThread?.contactName || 'Recipient',
          userIntent: aiIntentPrompt,
          tone: aiDraftTone,
          threadContext: activeThread?.messages.slice(-4) || [],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDraftResult(data);
      }
    } catch (err) {
      console.error('Draft error:', err);
      setDraftResult({
        draft: `Hi ${activeThread?.contactName || 'there'}, ${aiIntentPrompt}`,
        options: ['Got it, thanks!', 'Will get back to you shortly.'],
      });
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const applyDraftToInput = (text: string) => {
    setInputText(text);
    setIsAiDraftOpen(false);
    setDraftResult(null);
    setAiIntentPrompt('');
  };

  const filteredThreads = threads.filter((t) => {
    if (categoryFilter === 'all') return true;
    return t.category === categoryFilter;
  });

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden text-slate-100">
      {/* LEFT: THREADS LIST */}
      <div
        className={`w-full md:w-80 border-r border-slate-800 flex flex-col bg-slate-900/50 ${
          activeThreadId && 'hidden md:flex'
        }`}
      >
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              SMS Inbox
            </h2>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
              SEND_SMS
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(['all', 'personal', 'business', 'verification'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap font-medium text-[11px] transition-colors ${
                  categoryFilter === cat
                    ? 'bg-emerald-600 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Thread items */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
          {filteredThreads.map((t) => {
            const lastMsg = t.messages[t.messages.length - 1];
            return (
              <button
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                  activeThreadId === t.id ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full ${t.avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                >
                  {t.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {t.contactName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {lastMsg?.timestamp || ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {lastMsg ? lastMsg.text : 'No messages'}
                  </p>
                </div>
                {t.unreadCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 self-center shrink-0"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: ACTIVE THREAD CHAT */}
      {activeThread ? (
        <div className="flex-1 flex flex-col h-full bg-slate-950">
          {/* Thread Header */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/60 backdrop-blur flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveThreadId(null)}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div
                className={`w-9 h-9 rounded-full ${activeThread.avatarColor} flex items-center justify-center text-xs font-bold text-white`}
              >
                {activeThread.initials}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-100">
                  {activeThread.contactName}
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  {activeThread.phoneNumber}
                </span>
              </div>
            </div>

            {/* Smart Draft with AI Agent Button */}
            <button
              onClick={() => setIsAiDraftOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Draft</span>
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeThread.messages.map((m) => {
              const isUser = m.sender === 'user';
              const isAgent = m.sender === 'agent';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser || isAgent ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                      isAgent
                        ? 'bg-emerald-950/70 border border-emerald-800/70 text-emerald-200 rounded-br-none'
                        : isUser
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {isAgent && (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mb-1">
                        <Bot className="w-3 h-3" /> Phone AI Agent Auto-Dispatched
                      </div>
                    )}
                    <div>{m.text}</div>
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-500 font-mono">
                    <span>{m.timestamp}</span>
                    {(isUser || isAgent) && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Smart Replies Bar */}
          <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] text-slate-500 shrink-0 font-medium">Smart Replies:</span>
            {[
              "Sounds good, I'll be there!",
              'Can we reschedule to tomorrow?',
              'Thanks for letting me know.',
            ].map((reply, i) => (
              <button
                key={i}
                onClick={() => setInputText(reply)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700/80 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Message Input Footer */}
          <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={`Text ${activeThread.contactName}... (via SEND_SMS)`}
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-bold transition-all disabled:opacity-40 shadow active:scale-95"
              title="Send SMS"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-500">
          <MessageSquare className="w-12 h-12 mb-3 stroke-1" />
          <p className="text-xs">Select a conversation thread to start messaging</p>
        </div>
      )}

      {/* AI DRAFT MODAL */}
      {isAiDraftOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-5 text-slate-100 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-slate-100">
                  AI SMS Draft Assistant
                </h4>
              </div>
              <button
                onClick={() => setIsAiDraftOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Close
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                What do you want to say to {activeThread?.contactName}?
              </label>
              <textarea
                value={aiIntentPrompt}
                onChange={(e) => setAiIntentPrompt(e.target.value)}
                placeholder="E.g. Let them know I am in transit and will be 15 mins late..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 min-h-[70px] resize-none"
              />
            </div>

            {/* Tone selector */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Tone:
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(['friendly', 'professional', 'concise', 'urgent'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setAiDraftTone(t)}
                    className={`py-1.5 px-2 rounded-lg capitalize text-center text-[11px] transition-colors ${
                      aiDraftTone === t
                        ? 'bg-emerald-600 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateAiDraft}
              disabled={isGeneratingDraft || !aiIntentPrompt.trim()}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
            >
              {isGeneratingDraft ? (
                <span className="animate-spin w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Generate AI Draft</span>
            </button>

            {/* Draft suggestions */}
            {draftResult && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-emerald-400 block">
                  Recommended Draft:
                </span>
                <div
                  onClick={() => applyDraftToInput(draftResult.draft)}
                  className="p-3 bg-slate-950 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 cursor-pointer hover:bg-emerald-950/20 transition-colors"
                >
                  "{draftResult.draft}"
                </div>

                {draftResult.options.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400">Variations:</span>
                    {draftResult.options.map((opt, i) => (
                      <div
                        key={i}
                        onClick={() => applyDraftToInput(opt)}
                        className="p-2 bg-slate-800/80 rounded-lg text-[11px] text-slate-300 cursor-pointer hover:bg-slate-700 transition-colors"
                      >
                        "{opt}"
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
