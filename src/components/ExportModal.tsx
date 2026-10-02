import React, { useState } from 'react';
import type { CommunityKey } from '../types.ts';
import { Download, Copy, Check, X, FileText, KeyRound } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  allKeys: CommunityKey[];
}

export const ExportModal: React.FC<Props> = ({ isOpen, onClose, allKeys }) => {
  const [filterType, setFilterType] = useState<'all' | 'available' | 'claimed'>('available');
  const [formatMode, setFormatMode] = useState<'keys_only' | 'registry'>('keys_only');
  const [copiedBatch, setCopiedBatch] = useState<number | null>(null);

  if (!isOpen) return null;

  const filtered = allKeys.filter((k) => {
    if (filterType === 'all') return true;
    return k.status === filterType;
  });

  const handleCopy = (count?: number) => {
    const subset = count ? filtered.slice(0, count) : filtered;
    const text =
      formatMode === 'keys_only'
        ? subset.map((k) => k.key).join('\n')
        : subset
            .map(
              (k) =>
                `#${k.serial} | Key: ${k.key} | Status: ${k.status} | Member: ${
                  k.assignedName || 'Unassigned'
                } | Device: ${k.deviceInfo || 'None'} | Bound: ${
                  k.firstUsedAt ? new Date(k.firstUsedAt).toLocaleString() : 'Never'
                }`
            )
            .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedBatch(count || filtered.length);
    setTimeout(() => setCopiedBatch(null), 2500);
  };

  const handleDownloadTxt = () => {
    window.open(`/api/admin/export-keys?format=txt&status=${filterType}`, '_blank');
  };

  const handleDownloadCsv = () => {
    window.open(`/api/admin/export-keys?format=csv&status=${filterType}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Export & Share Access Keys</h3>
              <p className="text-xs text-slate-400">Total keys in backend: {allKeys.length} keys</p>
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
        <div className="p-6 space-y-5">
          {/* Filter segment */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Filter keys to export:</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterType('available')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  filterType === 'available'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Available Keys ({allKeys.filter((k) => k.status === 'available').length})
              </button>
              <button
                onClick={() => setFilterType('all')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  filterType === 'all'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Keys ({allKeys.length})
              </button>
              <button
                onClick={() => setFilterType('claimed')}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  filterType === 'claimed'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Claimed ({allKeys.filter((k) => k.status === 'claimed').length})
              </button>
            </div>
          </div>

          {/* Format mode */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">Copy Format:</label>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setFormatMode('keys_only')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    formatMode === 'keys_only'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Keys Only
                </button>
                <button
                  onClick={() => setFormatMode('registry')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    formatMode === 'registry'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  With Registered Names & Device Info
                </button>
              </div>
            </div>
          </div>

          {/* Quick copy buttons */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">Quick Copy Batches to Clipboard:</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => handleCopy(10)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedBatch === 10 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                Copy 10 Keys
              </button>
              <button
                onClick={() => handleCopy(50)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedBatch === 50 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                Copy 50 Keys
              </button>
              <button
                onClick={() => handleCopy()}
                className="py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedBatch === filtered.length ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-emerald-400" />}
                Copy All ({filtered.length})
              </button>
            </div>
          </div>

          {/* Preview box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-400">Keys Preview (First 8 keys shown):</span>
              <span className="text-xs font-mono text-emerald-400">{filtered.length} total keys ready</span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-36 overflow-y-auto font-mono text-xs text-slate-300 space-y-1">
              {filtered.slice(0, 12).map((k) => (
                <div key={k.id} className="flex items-center justify-between">
                  <span className="text-emerald-400 font-semibold">{k.key}</span>
                  <span className="text-slate-500 text-[11px]">
                    #{k.serial} {k.assignedName ? `· ${k.assignedName}` : '· Unused'}
                  </span>
                </div>
              ))}
              {filtered.length > 12 && (
                <p className="text-slate-500 text-[11px] pt-1 italic text-center">
                  ... and {filtered.length - 12} more keys
                </p>
              )}
            </div>
          </div>

          {/* Download files */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={handleDownloadTxt}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-100 flex items-center justify-center gap-2 transition-colors"
            >
              <FileText className="w-4 h-4 text-blue-400" />
              Download .TXT File
            </button>
            <button
              onClick={handleDownloadCsv}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-100 flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Download .CSV File
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
