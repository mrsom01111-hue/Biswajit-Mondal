import React from 'react';
import { PhoneCall, MessageSquare, ShieldAlert } from 'lucide-react';
import { PermissionName } from '../types';

interface Props {
  permission: PermissionName;
  onGrant: (perm: PermissionName) => void;
  onDeny: (perm: PermissionName) => void;
}

export const AndroidPermissionDialog: React.FC<Props> = ({
  permission,
  onGrant,
  onDeny,
}) => {
  const isCall = permission === 'android.permission.CALL_PHONE';
  const isSms = permission === 'android.permission.SEND_SMS';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-slate-100 flex flex-col items-center text-center">
        {/* Android Icon */}
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-400">
          {isCall ? (
            <PhoneCall className="w-7 h-7" />
          ) : isSms ? (
            <MessageSquare className="w-7 h-7" />
          ) : (
            <ShieldAlert className="w-7 h-7" />
          )}
        </div>

        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
          Android 15 Permission Request
        </span>

        <h3 className="text-lg font-bold text-slate-100 mb-2">
          {isCall
            ? 'Allow Phone AI Agent to make and manage phone calls?'
            : isSms
            ? 'Allow Phone AI Agent to send and view SMS messages?'
            : 'Allow Phone AI Agent audio recording?'}
        </h3>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          The app manifest requires{' '}
          <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">
            {permission}
          </code>{' '}
          for autonomous agent actions, automated call screening, and SMS auto-replies.
        </p>

        {/* Standard Android Button Stack */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={() => onGrant(permission)}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-semibold text-sm transition-all shadow-md active:scale-98"
          >
            While using the app
          </button>
          <button
            onClick={() => onGrant(permission)}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-colors border border-slate-700"
          >
            Only this time
          </button>
          <button
            onClick={() => onDeny(permission)}
            className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            Don't allow
          </button>
        </div>
      </div>
    </div>
  );
};
