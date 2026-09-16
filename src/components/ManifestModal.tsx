import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, FileCode, Sparkles } from 'lucide-react';
import { PermissionState, PermissionName } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  permissions: PermissionState;
  onTogglePermission: (perm: PermissionName) => void;
}

const MANIFEST_XML = `<manifest
    xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.CALL_PHONE"/>
    <uses-permission android:name="android.permission.SEND_SMS"/>

    <application
        android:theme="@style/Theme.PhoneAgent"
        android:label="Phone AI Agent">

        <activity
            android:name=".MainActivity"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>

        </activity>

    </application>

</manifest>`;

export const ManifestModal: React.FC<Props> = ({
  isOpen,
  onClose,
  permissions,
  onTogglePermission,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">AndroidManifest.xml & Architecture</h3>
              <p className="text-xs text-slate-400">Targeting Android 15 &bull; Theme.PhoneAgent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto py-4 space-y-5 text-sm">
          {/* Permission status cards */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Runtime Permission Controls
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* CALL_PHONE */}
              <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-200 block">
                    CALL_PHONE
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Voice calls, AI agent calling & call screening
                  </span>
                </div>
                <button
                  onClick={() => onTogglePermission('android.permission.CALL_PHONE')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    permissions['android.permission.CALL_PHONE']
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {permissions['android.permission.CALL_PHONE'] ? 'Granted' : 'Revoked'}
                </button>
              </div>

              {/* SEND_SMS */}
              <div className="bg-slate-800/60 border border-slate-700/70 p-3.5 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-semibold text-slate-200 block">
                    SEND_SMS
                  </span>
                  <span className="text-[11px] text-slate-400">
                    SMS dispatch, auto-drafting & smart responder
                  </span>
                </div>
                <button
                  onClick={() => onTogglePermission('android.permission.SEND_SMS')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    permissions['android.permission.SEND_SMS']
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {permissions['android.permission.SEND_SMS'] ? 'Granted' : 'Revoked'}
                </button>
              </div>
            </div>
          </div>

          {/* Raw Manifest Source Display */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Declared AndroidManifest.xml
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3" /> Live Manifest Link
              </span>
            </div>
            <pre className="bg-slate-950 p-4 rounded-2xl text-xs font-mono text-slate-300 border border-slate-800 overflow-x-auto leading-relaxed">
              <code>{MANIFEST_XML}</code>
            </pre>
          </div>

          {/* Feature mapping notes */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-slate-200">How Phone AI Agent uses these permissions:</div>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>
                <strong className="text-slate-200">android.permission.CALL_PHONE:</strong> Powers autonomous agent phone calls (e.g. calling to confirm a dental appointment or booking), and dynamic incoming call screening.
              </li>
              <li>
                <strong className="text-slate-200">android.permission.SEND_SMS:</strong> Powers AI smart replies, natural language SMS dispatching, and auto-responding to incoming courier/delivery alerts.
              </li>
              <li>
                <strong className="text-slate-200">Theme.PhoneAgent & MainActivity:</strong> The central agent dashboard where natural language commands are executed.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
