import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShieldCheck,
  Smartphone,
  Users,
  KeyRound,
  Download,
  Copy,
  Check,
  Search,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Settings,
  Lock,
  ArrowLeft,
  Sliders,
  FileText,
  RotateCcw,
  Sparkles,
  X,
  Filter,
} from 'lucide-react';
import type {
  CommunityKey,
  AccessLog,
  CommunitySettings,
  DashboardStats,
  KeyStatus,
  KeyFilterStatus,
} from '../types.ts';
import {
  fetchAdminOverview,
  fetchKeys,
  fetchLogs,
  resetDeviceLock,
  toggleBlockKey,
  generateKeys,
  clearLogs,
  updateSettings,
} from '../lib/api.ts';
import { KeyDetailsModal } from './KeyDetailsModal.tsx';
import { ExportModal } from './ExportModal.tsx';

interface Props {
  onSwitchToGateway: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onSwitchToGateway }) => {
  const [activeTab, setActiveTab] = useState<'keys' | 'logs' | 'settings' | 'export'>('keys');

  // Stats & Overview
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [settings, setSettings] = useState<CommunitySettings | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Keys State
  const [keysList, setKeysList] = useState<CommunityKey[]>([]);
  const [keysTotal, setKeysTotal] = useState(0);
  const [keysPage, setKeysPage] = useState(1);
  const [keysLimit] = useState(50);
  const [keysTotalPages, setKeysTotalPages] = useState(1);
  const [keySearch, setKeySearch] = useState('');
  const [keyStatusFilter, setKeyStatusFilter] = useState<KeyFilterStatus>('all');
  const [loadingKeys, setLoadingKeys] = useState(false);

  // Logs State
  const [logsList, setLogsList] = useState<AccessLog[]>([]);
  const [logFilterAction, setLogFilterAction] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(true);

  // Modals & Feedback
  const [selectedKeyForDetails, setSelectedKeyForDetails] = useState<CommunityKey | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [allKeysForExport, setAllKeysForExport] = useState<CommunityKey[]>([]);
  const [copiedKeyText, setCopiedKeyText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<CommunitySettings>({
    communityName: '',
    inviteUrl: '',
    welcomeMessage: '',
    requireName: true,
    autoRedirect: true,
    redirectDelaySeconds: 2,
    adminPin: '1234',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Notification Toast Helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Load Overview Data
  const loadOverview = useCallback(async () => {
    try {
      const data = await fetchAdminOverview();
      setStats(data.stats);
      setSettings(data.settings);
      setSettingsForm(data.settings);
    } catch (err) {
      console.error('Failed to load overview:', err);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  // Load Keys
  const loadKeys = useCallback(async () => {
    setLoadingKeys(true);
    try {
      const res = await fetchKeys({
        search: keySearch,
        status: keyStatusFilter,
        page: keysPage,
        limit: keysLimit,
      });
      setKeysList(res.items);
      setKeysTotal(res.total);
      setKeysTotalPages(res.totalPages);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error('Failed to load keys:', err);
    } finally {
      setLoadingKeys(false);
    }
  }, [keySearch, keyStatusFilter, keysPage, keysLimit]);

  // Load Logs
  const loadLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetchLogs({
        action: logFilterAction,
        search: logSearch,
      });
      setLogsList(res.logs);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, [logFilterAction, logSearch]);

  // Initial load
  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Real-time polling for access logs & overview every 2.5s
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!autoRefreshLogs) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(() => {
      fetchLogs({ action: logFilterAction, search: logSearch })
        .then((res) => {
          setLogsList(res.logs);
        })
        .catch(() => {});

      fetchAdminOverview()
        .then((res) => {
          setStats(res.stats);
        })
        .catch(() => {});

      fetchKeys({
        search: keySearch,
        status: keyStatusFilter,
        page: keysPage,
        limit: keysLimit,
      })
        .then((res) => {
          setKeysList(res.items);
          setKeysTotal(res.total);
          setKeysTotalPages(res.totalPages);
          if (res.stats) setStats(res.stats);
        })
        .catch(() => {});
    }, 2500);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [autoRefreshLogs, logFilterAction, logSearch]);

  // Reset Device Lock handler
  const handleResetDevice = async (keyStr: string) => {
    try {
      const res = await resetDeviceLock(keyStr);
      showToast(res.message);
      loadKeys();
      loadOverview();
      if (selectedKeyForDetails && selectedKeyForDetails.key === keyStr) {
        setSelectedKeyForDetails(res.key);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to reset device lock');
    }
  };

  // Toggle Block/Revoke handler
  const handleToggleBlock = async (keyStr: string) => {
    try {
      const res = await toggleBlockKey(keyStr);
      showToast(res.message);
      loadKeys();
      loadOverview();
      if (selectedKeyForDetails && selectedKeyForDetails.key === keyStr) {
        setSelectedKeyForDetails(res.key);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to change key status');
    }
  };

  // Copy Key to Clipboard
  const handleCopyKey = (k: string) => {
    navigator.clipboard.writeText(k);
    setCopiedKeyText(k);
    setTimeout(() => setCopiedKeyText(null), 2000);
  };

  // Generate More Keys
  const handleGenerateKeys = async (count: number) => {
    try {
      const res = await generateKeys(count);
      showToast(res.message);
      loadKeys();
      loadOverview();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to generate keys');
    }
  };

  // Clear Logs
  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear all real-time access logs?')) return;
    try {
      await clearLogs();
      setLogsList([]);
      showToast('Access logs cleared successfully.');
      loadOverview();
    } catch {
      showToast('Failed to clear logs.');
    }
  };

  // Open Export Modal
  const handleOpenExport = async () => {
    try {
      const res = await fetchKeys({ limit: 1000, page: 1 });
      setAllKeysForExport(res.items);
      setIsExportModalOpen(true);
    } catch {
      showToast('Failed to load all keys for export.');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await updateSettings(settingsForm);
      setSettings(res.settings);
      showToast(res.message);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (Nav Tabs) - Zone 3 (Actions) */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white block">
                CommuniKey
              </span>
              <span className="text-[11px] text-slate-400 block -mt-0.5">
                WhatsApp Community Key Manager
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('keys')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'keys'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Keys (1,000)</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Real-Time Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Community Link</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'export'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Keys</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenExport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export 1000 Keys</span>
            </button>

            <button
              onClick={onSwitchToGateway}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-400/20 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Test Key Gateway</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('keys')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'keys' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Keys (1,000)
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'logs' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-Time Logs
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Community Link
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
              activeTab === 'export' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Export Keys
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Metric Cards Banner (High density, Tabular numerals, 60-30-10 palette) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Total Backend Keys</span>
              <KeyRound className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
              {stats?.totalKeys ?? 1000}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Pre-generated in database</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Claimed Members</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
              {stats?.claimedKeys ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Locked to single devices</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Available Keys</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-200">
              {stats?.availableKeys ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Ready for distribution</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Intrusions Blocked</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-rose-400">
              {stats?.deviceMismatchCount ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Device mismatch rejected</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Today's Accesses</span>
              <Smartphone className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-purple-300">
              {stats?.todayAccessCount ?? 0}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Verified community entries</div>
          </div>
        </div>

        {/* TAB 1: KEYS MANAGEMENT (1,000 KEYS) */}
        {activeTab === 'keys' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
            {/* Table Control Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[240px] max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by key (e.g. WA-...), member name, or device..."
                    value={keySearch}
                    onChange={(e) => {
                      setKeySearch(e.target.value);
                      setKeysPage(1);
                    }}
                    className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
                  />
                  {keySearch && (
                    <button
                      onClick={() => {
                        setKeySearch('');
                        setKeysPage(1);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Segmented Control (All / Unused / Used / Blocked) */}
                <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => {
                      setKeyStatusFilter('all');
                      setKeysPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                      keyStatusFilter === 'all'
                        ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700/80'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>All Keys</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {stats?.totalKeys ?? 1000}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setKeyStatusFilter('unused');
                      setKeysPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                      keyStatusFilter === 'unused'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Keys not yet registered (available for members)"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Unused</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                      {stats?.availableKeys ?? 0}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setKeyStatusFilter('used');
                      setKeysPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                      keyStatusFilter === 'used'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Keys already registered by members and bound to devices"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>Used</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40">
                      {stats?.claimedKeys ?? 0}
                    </span>
                  </button>

                  {(stats?.blockedKeys ?? 0) > 0 && (
                    <button
                      onClick={() => {
                        setKeyStatusFilter('blocked');
                        setKeysPage(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                        keyStatusFilter === 'blocked'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      <span>Blocked</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40">
                        {stats?.blockedKeys ?? 0}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {(keySearch || keyStatusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setKeySearch('');
                      setKeyStatusFilter('all');
                      setKeysPage(1);
                    }}
                    className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors flex items-center gap-1"
                    title="Reset search and filters"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                )}
                <button
                  onClick={() => handleGenerateKeys(100)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+100 Keys</span>
                </button>
                <button
                  onClick={loadKeys}
                  disabled={loadingKeys}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                  title="Refresh keys table"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingKeys ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Active Filter & Context Banner */}
            {(keySearch || keyStatusFilter !== 'all') && (
              <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 font-medium">
                    {keyStatusFilter === 'used' ? (
                      <span>
                        Showing <strong className="text-blue-400 font-mono">{keysTotal} Used Keys</strong> with registered members and device locks
                      </span>
                    ) : keyStatusFilter === 'unused' ? (
                      <span>
                        Showing <strong className="text-emerald-400 font-mono">{keysTotal} Unused Keys</strong> ready to send to new members
                      </span>
                    ) : keyStatusFilter === 'blocked' ? (
                      <span>
                        Showing <strong className="text-rose-400 font-mono">{keysTotal} Blocked Keys</strong>
                      </span>
                    ) : (
                      <span>
                        Showing <strong className="text-slate-200 font-mono">{keysTotal} keys</strong>
                      </span>
                    )}
                    {keySearch && (
                      <span className="text-slate-400 ml-1.5">
                        matching &ldquo;<span className="text-slate-200 font-mono">{keySearch}</span>&rdquo;
                      </span>
                    )}
                  </span>
                </div>

                {keyStatusFilter === 'unused' && keysList.length > 0 && (
                  <button
                    onClick={() => {
                      const text = keysList.slice(0, 10).map((k) => k.key).join('\n');
                      navigator.clipboard.writeText(text);
                      showToast('Copied 10 unused keys to clipboard!');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy 10 Unused</span>
                  </button>
                )}
              </div>
            )}

            {/* Keys Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-16">#</th>
                    <th className="py-3 px-4">Key Identifier</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Claimed Member</th>
                    <th className="py-3 px-4">Bound Device (Single-Lock)</th>
                    <th className="py-3 px-4 text-center">Uses</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {keysList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        {loadingKeys ? 'Loading keys repository...' : 'No access keys matching criteria.'}
                      </td>
                    </tr>
                  ) : (
                    keysList.map((k) => (
                      <tr
                        key={k.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                          {k.serial}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-100 text-xs">
                              {k.key}
                            </span>
                            <button
                              onClick={() => handleCopyKey(k.key)}
                              className="text-slate-500 hover:text-emerald-400 transition-colors p-1"
                              title="Copy Key"
                            >
                              {copiedKeyText === k.key ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block font-semibold uppercase text-[10px] px-2 py-0.5 rounded ${
                              k.status === 'claimed'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : k.status === 'blocked'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {k.status === 'claimed' ? 'Claimed & Bound' : k.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-200">
                          {k.assignedName || <span className="text-slate-600 italic">Unassigned</span>}
                        </td>
                        <td className="py-3 px-4">
                          {k.deviceInfo ? (
                            <div className="flex items-center gap-1.5 max-w-[200px] truncate">
                              <Smartphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              <span className="font-mono text-slate-300 text-[11px] truncate" title={k.deviceInfo}>
                                {k.deviceInfo}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-600 italic">No device bound</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-300">
                          {k.accessCount}
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {k.assignedDeviceId && (
                              <button
                                onClick={() => handleResetDevice(k.key)}
                                className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors flex items-center gap-1"
                                title="Reset device lock so user can register a new phone"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Reset Device</span>
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedKeyForDetails(k)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-colors"
                            >
                              Manage
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination & Summary Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                Showing <strong className="text-slate-200 tabular-nums">{keysList.length}</strong> of{' '}
                <strong className="text-slate-200 tabular-nums">{keysTotal}</strong> keys total
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setKeysPage((p) => Math.max(1, p - 1))}
                  disabled={keysPage <= 1}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 font-medium transition-colors"
                >
                  Previous
                </button>
                <span className="text-slate-400 px-2 font-mono tabular-nums">
                  Page {keysPage} of {keysTotalPages || 1}
                </span>
                <button
                  onClick={() => setKeysPage((p) => Math.min(keysTotalPages, p + 1))}
                  disabled={keysPage >= keysTotalPages}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-200 font-medium transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REAL-TIME ACCESS LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
            {/* Logs Controls */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs by name, key, or IP..."
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Filter Action */}
                <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  {['ALL', 'REDEEMED', 'AUTHORIZED', 'DEVICE_MISMATCH', 'INVALID_KEY'].map((act) => (
                    <button
                      key={act}
                      onClick={() => setLogFilterAction(act)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                        logFilterAction === act
                          ? 'bg-slate-800 text-emerald-400 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {act.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time pulse and controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoRefreshLogs(!autoRefreshLogs)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                    autoRefreshLogs
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${autoRefreshLogs ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span>{autoRefreshLogs ? 'Live Stream Active' : 'Stream Paused'}</span>
                </button>

                <button
                  onClick={handleClearLogs}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  Clear Logs
                </button>
              </div>
            </div>

            {/* Logs List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-40">Timestamp</th>
                    <th className="py-3 px-4">Event Type</th>
                    <th className="py-3 px-4">Member Name</th>
                    <th className="py-3 px-4">Key</th>
                    <th className="py-3 px-4">Device & IP</th>
                    <th className="py-3 px-4">Security Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {logsList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        {loadingLogs ? 'Loading access audit stream...' : 'No access logs captured yet.'}
                      </td>
                    </tr>
                  ) : (
                    logsList.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400 tabular-nums whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString()} ·{' '}
                          <span className="text-[11px] text-slate-500">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block font-semibold uppercase text-[10px] px-2 py-0.5 rounded ${
                              log.action === 'REDEEMED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : log.action === 'AUTHORIZED'
                                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                : log.action === 'DEVICE_MISMATCH'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold'
                                : log.action === 'INVALID_KEY'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {log.userName}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-300">
                          {log.key}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-mono text-[11px] text-slate-300 truncate max-w-[200px]">
                            {log.deviceInfo}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">IP: {log.ip}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-xs">
                          {log.notes}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: WHATSAPP SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center gap-3 pb-6 border-b border-slate-800 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">WhatsApp Community & Gateway Configuration</h2>
                <p className="text-xs text-slate-400">
                  Manage your WhatsApp invite link, automated redirect behavior, and gateway copy.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  WhatsApp Community / Group Name
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.communityName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, communityName: e.target.value })}
                  placeholder="e.g. Official StudySync VIP Community"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  WhatsApp Community Invite Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    value={settingsForm.inviteUrl}
                    onChange={(e) => setSettingsForm({ ...settingsForm, inviteUrl: e.target.value })}
                    placeholder="https://chat.whatsapp.com/..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <a
                    href={settingsForm.inviteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <span>Test Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Users with valid activation keys will be redirected to this link after device verification.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Welcome / Instructions Message
                </label>
                <textarea
                  rows={2}
                  value={settingsForm.welcomeMessage}
                  onChange={(e) => setSettingsForm({ ...settingsForm, welcomeMessage: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Require Member Full Name</span>
                    <span className="text-[11px] text-slate-400">Shows member name in access audit logs</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.requireName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, requireName: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Automated Redirection</span>
                    <span className="text-[11px] text-slate-400">Instantly forward user to WhatsApp</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsForm.autoRedirect}
                    onChange={(e) => setSettingsForm({ ...settingsForm, autoRedirect: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="col-span-full border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-200">
                      Redirect Delay: <strong className="font-mono text-emerald-400">{settingsForm.redirectDelaySeconds} seconds</strong>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {settingsForm.redirectDelaySeconds === 0 ? 'Instant redirect' : 'Smooth confirmation then redirect'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={5}
                    value={settingsForm.redirectDelaySeconds}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, redirectDelaySeconds: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
                >
                  {savingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: EXPORT KEYS */}
        {activeTab === 'export' && (
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Full Backend Keys Repository</h2>
                  <p className="text-xs text-slate-400">
                    Export or copy your 1,000 WhatsApp community access keys for member distribution.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/api/admin/export-keys?format=txt"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download .TXT</span>
                </a>
                <a
                  href="/api/admin/export-keys?format=csv"
                  className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download .CSV</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Total Available Keys</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  {stats?.availableKeys ?? 0}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Unassigned & ready to issue</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Claimed & Bound Keys</span>
                <span className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
                  {stats?.claimedKeys ?? 0}
                </span>
                <p className="text-[11px] text-slate-500 mt-1">Locked to specific member devices</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">Single-Device Guarantee</span>
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mt-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Enforced at Server</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-1">1 device lock prevents link sharing</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-200">Interactive Export Modal</h4>
                <p className="text-[11px] text-slate-400">
                  Filter keys by status and copy batches of 10, 50, or all available keys with 1 click.
                </p>
              </div>
              <button
                onClick={handleOpenExport}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
              >
                Open Key Exporter
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <KeyDetailsModal
        keyItem={selectedKeyForDetails}
        onClose={() => setSelectedKeyForDetails(null)}
        onResetDevice={handleResetDevice}
        onToggleBlock={handleToggleBlock}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allKeys={allKeysForExport}
      />
    </div>
  );
};
