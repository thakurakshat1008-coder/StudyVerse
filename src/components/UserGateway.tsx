import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Smartphone,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Sparkles,
  Users,
  Copy,
  Check,
} from 'lucide-react';
import { getClientDeviceInfo } from '../lib/deviceFingerprint.ts';
import { redeemKey, fetchPublicInfo } from '../lib/api.ts';
import type { RedeemResponse } from '../types.ts';

interface Props {
  onOpenAdmin: () => void;
}

export const UserGateway: React.FC<Props> = ({ onOpenAdmin }) => {
  const [userName, setUserName] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    lockedDevice?: string;
    boundAt?: string;
    assignedName?: string;
  } | null>(null);
  const [successData, setSuccessData] = useState<RedeemResponse | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [deviceInfo] = useState(getClientDeviceInfo());

  const [publicData, setPublicData] = useState<{
    communityName: string;
    welcomeMessage: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    fetchPublicInfo()
      .then((data) => {
        setPublicData(data);
      })
      .catch((err) => console.error('Failed to load public info:', err));
  }, []);

  const handleKeyChange = (val: string) => {
    let clean = val.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (clean.length > 20) clean = clean.slice(0, 20);
    setKey(clean);
    if (errorInfo) setErrorInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setErrorInfo({ message: 'Please enter your community activation key.' });
      return;
    }
    if (!userName.trim()) {
      setErrorInfo({ message: 'Please enter your full name.' });
      return;
    }

    setLoading(true);
    setErrorInfo(null);
    setSuccessData(null);

    try {
      const res = await redeemKey({
        key: key.trim(),
        userName: userName.trim(),
        deviceId: deviceInfo.deviceId,
        deviceInfo: deviceInfo.readableDeviceName,
      });

      if (!res.success) {
        setErrorInfo({
          message: res.error || 'Access verification failed',
          lockedDevice: res.lockedDevice,
          boundAt: res.boundAt,
          assignedName: res.userName,
        });
      } else {
        setSuccessData(res);
        const delay = res.redirectDelaySeconds ?? 2;
        if (res.autoRedirect && res.inviteUrl) {
          setCountdown(delay);
        }
      }
    } catch (err: unknown) {
      setErrorInfo({
        message: err instanceof Error ? err.message : 'Network error communicating with access server.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle countdown and redirect
  useEffect(() => {
    if (countdown === null || countdown < 0) return;

    if (countdown === 0) {
      if (successData?.inviteUrl) {
        window.location.href = successData.inviteUrl;
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, successData]);

  const handleCopyKey = () => {
    if (key) {
      navigator.clipboard.writeText(key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block leading-tight">
                {publicData?.communityName || 'WhatsApp Community'}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Official Member Gateway
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Console</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Top decorative gradient glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 bg-emerald-500/15 blur-3xl pointer-events-none rounded-full" />

            {!successData ? (
              <>
                {/* Header info */}
                <div className="text-center mb-6 relative">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Single-Device Verified Access</span>
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-white mb-2">
                    Enter Community Key
                  </h1>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    {publicData?.welcomeMessage ||
                      'Join our exclusive WhatsApp community. Your key is uniquely registered to this device upon activation.'}
                  </p>
                </div>

                {/* Device Info Badge */}
                <div className="mb-6 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="text-[11px] text-slate-400 block">Registered Device Identity</span>
                      <span className="font-mono text-xs text-slate-200 font-semibold truncate block">
                        {deviceInfo.readableDeviceName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                    Locked 1:1
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Akshat Thakur"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    />
                  </div>

                  {/* Key field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-300">
                        Activation Key
                      </label>
                      {key && (
                        <button
                          type="button"
                          onClick={handleCopyKey}
                          className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                        >
                          {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="WA-XXXX-XXXX"
                        value={key}
                        onChange={(e) => handleKeyChange(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 placeholder-slate-500 text-base font-mono font-bold tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all uppercase"
                      />
                    </div>
                  </div>

                  {/* Error Notification */}
                  {errorInfo && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1.5 animate-in fade-in duration-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-rose-200">{errorInfo.message}</p>
                          {errorInfo.lockedDevice && (
                            <p className="text-[11px] text-rose-300/80 mt-1">
                              Locked Device: <span className="font-mono text-rose-100">{errorInfo.lockedDevice}</span>
                            </p>
                          )}
                          {errorInfo.boundAt && (
                            <p className="text-[11px] text-rose-300/80">
                              Registered on: {new Date(errorInfo.boundAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Key & Device...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Redirect to WhatsApp</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success & Instant Redirect View */
              <div className="text-center py-2 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold text-white">Access Granted!</h2>
                  <p className="text-xs text-emerald-400 font-medium mt-1">
                    Device Successfully Authenticated & Bound
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Member:</span>
                    <span className="font-semibold text-slate-100">{successData.userName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Access Key:</span>
                    <span className="font-mono font-bold text-emerald-400">{successData.key}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Community:</span>
                    <span className="font-medium text-slate-200">{successData.communityName}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Locked Device:</span>
                    <span className="font-mono text-slate-300 truncate max-w-[180px]">
                      {deviceInfo.readableDeviceName}
                    </span>
                  </div>
                </div>

                {countdown !== null && countdown > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      Redirecting to WhatsApp Community in <strong className="font-mono">{countdown}s</strong>...
                    </span>
                  </div>
                )}

                <div className="space-y-2">
                  <a
                    href={successData.inviteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Open WhatsApp Community</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => {
                      setSuccessData(null);
                      setCountdown(null);
                    }}
                    className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Enter Another Key
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security Guarantee Footer Note */}
          <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Single-device cryptographic binding prevents credential theft</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-3 text-center text-xs text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <span>Protected WhatsApp Access Gateway</span>
          <button
            onClick={onOpenAdmin}
            className="text-slate-400 hover:text-emerald-400 font-medium transition-colors"
          >
            Admin Management Dashboard →
          </button>
        </div>
      </footer>
    </div>
  );
};
