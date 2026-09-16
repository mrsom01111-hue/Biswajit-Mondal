import React from 'react';
import { Bot, Phone, MessageSquare, Users, ShieldAlert } from 'lucide-react';

export type ActiveTab = 'agent' | 'phone' | 'messages' | 'contacts';

interface Props {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  unreadSmsCount?: number;
}

export const AndroidNavBar: React.FC<Props> = ({
  activeTab,
  onChangeTab,
  unreadSmsCount = 0,
}) => {
  return (
    <div className="w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 py-1.5 px-3 z-30 select-none">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Agent Hub (MainActivity) */}
        <button
          onClick={() => onChangeTab('agent')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'agent'
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">AI Agent</span>
        </button>

        {/* Phone / Dialer (CALL_PHONE) */}
        <button
          onClick={() => onChangeTab('phone')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'phone'
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Phone className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">Phone</span>
        </button>

        {/* Messages (SEND_SMS) */}
        <button
          onClick={() => onChangeTab('messages')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'messages'
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 mb-0.5" />
            {unreadSmsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            )}
          </div>
          <span className="text-[10px] font-semibold tracking-tight">Messages</span>
        </button>

        {/* Contacts */}
        <button
          onClick={() => onChangeTab('contacts')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'contacts'
              ? 'text-emerald-400 bg-emerald-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold tracking-tight">Contacts</span>
        </button>
      </div>

      {/* Android bottom gesture handle */}
      <div className="w-28 h-1 bg-slate-700/60 rounded-full mx-auto mt-2"></div>
    </div>
  );
};
