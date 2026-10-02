import React from 'react';
import type { CommunityKey } from '../types.ts';
import { ShieldCheck, Smartphone, Clock, User, Hash, AlertTriangle, X, RefreshCw } from 'lucide-react';

interface Props {
  keyItem: CommunityKey | null;
  onClose: () => void;
  onResetDevice: (key: string) => void;
  onToggleBlock: (key: string) => void;
}

export const KeyDetailsModal: React.FC<Props> = ({
  keyItem,
  onClose,
  onResetDevice,
  onToggleBlock,
}) => {
  if (!keyItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 font-mono">{keyItem.key}</h3>
              <p className="text-xs text-slate-400">Key #{keyItem.serial} Details & Security Binding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Status</span>
              <span
                className={`inline-block font-semibold uppercase px-2 py-0.5 rounded text-xs ${
                  keyItem.status === 'claimed'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : keyItem.status === 'blocked'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                }`}
              >
                {keyItem.status}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block mb-1">Access Count</span>
              <span className="text-slate-200 font-mono font-bold text-sm">
                {keyItem.accessCount} {keyItem.accessCount === 1 ? 'time' : 'times'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <User className="w-4 h-4 text-emerald-400" />
              <span>Assigned Member Name:</span>
              <span className="font-semibold text-slate-200 text-sm">
                {keyItem.assignedName || 'Unassigned (Key is free)'}
              </span>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-400">
              <Smartphone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span>Bound Device Lock:</span>
                <p className="font-mono text-xs text-slate-300 mt-0.5 break-all">
                  {keyItem.deviceInfo || keyItem.assignedDeviceId || 'No device currently bound'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>First Bound At:</span>
              <span className="text-slate-300">
                {keyItem.firstUsedAt ? new Date(keyItem.firstUsedAt).toLocaleString() : 'Never'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Last Accessed At:</span>
              <span className="text-slate-300">
                {keyItem.lastUsedAt ? new Date(keyItem.lastUsedAt).toLocaleString() : 'Never'}
              </span>
            </div>
          </div>

          {keyItem.assignedDeviceId && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <p className="font-semibold">Single-Device Lock Active</p>
                <p className="text-amber-300/80 mt-0.5">
                  Only the device recorded above is permitted to use this key. If the user changed devices or cleared their browser, click "Reset Device Lock" below.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onToggleBlock(keyItem.key)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors ${
              keyItem.status === 'blocked'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
            }`}
          >
            {keyItem.status === 'blocked' ? 'Unblock Key' : 'Revoke / Block Key'}
          </button>

          <div className="flex items-center gap-2">
            {keyItem.assignedDeviceId && (
              <button
                onClick={() => onResetDevice(keyItem.key)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Device Lock
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
