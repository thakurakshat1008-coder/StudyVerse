import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw,
  Sparkles,
  Users,
  ShieldCheck,
  Check,
  X,
  BookOpen,
  HeartHandshake,
} from 'lucide-react';
import { getClientDeviceInfo } from '../lib/deviceFingerprint.ts';
import { redeemKey, fetchPublicInfo, validateKeyRealtime } from '../lib/api.ts';
import { getAccessToken } from '../lib/firebaseAuth.ts';
import { sendGmailLoginAlert } from '../lib/gmailService.ts';
import type { RedeemResponse } from '../types.ts';
import { StudyVerseLogo } from './StudyVerseLogo.tsx';
import { WordReveal } from './WordReveal.tsx';

interface Props {
  onOpenAdmin: () => void;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export const CommunityConnectPage: React.FC<Props> = () => {
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

  // Real-time Key Validation State
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidation, setKeyValidation] = useState<{
    checked: boolean;
    valid: boolean;
    status?: 'available' | 'claimed' | 'blocked';
    assignedName?: string;
    lockedDevice?: string;
    message: string;
  } | null>(null);

  // Live Community Capacity (Real data from backend, NO fake/demo data)
  const [capacity, setCapacity] = useState<{
    totalCapacity: number;
    claimedCount: number;
    availableCount: number;
    percentage: number;
  }>({
    totalCapacity: 1000,
    claimedCount: 0,
    availableCount: 1000,
    percentage: 0,
  });

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Silent Backend Admin Notification Email (NOT displayed in UI)
  const ADMIN_EMAIL = 'thakur.akshat101@gmail.com';

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastValidatedKeyRef = useRef<string>('');

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch Live Capacity from server
  const loadLiveStats = async () => {
    try {
      const data = await fetchPublicInfo();
      if (data.totalCapacity !== undefined) {
        setCapacity({
          totalCapacity: data.totalCapacity || 1000,
          claimedCount: data.claimedCount || 0,
          availableCount: data.availableCount ?? (1000 - (data.claimedCount || 0)),
          percentage: data.percentage ?? Number((((data.claimedCount || 0) / (data.totalCapacity || 1000)) * 100).toFixed(1)),
        });
      }
    } catch (err) {
      console.error('Failed to load live capacity:', err);
    }
  };

  useEffect(() => {
    loadLiveStats();
    // Poll every 8 seconds for real-time capacity updates
    const interval = setInterval(loadLiveStats, 8000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer for automatic WhatsApp redirect
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
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

  // Real-Time Key Validation Logic
  useEffect(() => {
    const cleanKey = key.trim().toUpperCase();

    if (!cleanKey || cleanKey.length < 5) {
      setKeyValidation(null);
      setIsValidatingKey(false);
      lastValidatedKeyRef.current = '';
      return;
    }

    if (cleanKey === lastValidatedKeyRef.current) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsValidatingKey(true);

    debounceTimerRef.current = setTimeout(async () => {
      lastValidatedKeyRef.current = cleanKey;
      try {
        const res = await validateKeyRealtime(cleanKey);
        setKeyValidation({
          checked: true,
          valid: res.valid,
          status: res.status,
          assignedName: res.assignedName,
          lockedDevice: res.lockedDevice,
          message: res.message,
        });

        if (res.valid && res.status === 'available') {
          showToast(
            'Active Key Verified',
            `Key ${cleanKey} is genuine and available for your device.`,
            'success'
          );
        } else if (res.valid && res.status === 'claimed') {
          showToast(
            'Key Already Registered',
            `This key is permanently bound to another device.`,
            'info'
          );
        } else {
          showToast(
            'Invalid Key',
            res.message || 'Key not found in official StudyVerse database.',
            'error'
          );
        }
      } catch (err: unknown) {
        console.error('Real-time validation error:', err);
      } finally {
        setIsValidatingKey(false);
      }
    }, 450);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [key]);

  const handleKeyChange = (val: string) => {
    let clean = val.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (clean.length > 20) clean = clean.slice(0, 20);
    setKey(clean);
    if (errorInfo) setErrorInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorInfo({ message: 'Please enter your full name.' });
      showToast('Name Required', 'Please enter your name to register.', 'error');
      return;
    }
    if (!key.trim()) {
      setErrorInfo({ message: 'Please enter your community activation key.' });
      showToast('Key Required', 'Please enter your activation key.', 'error');
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
        showToast('Access Denied', res.error || 'Verification failed.', 'error');
      } else {
        setSuccessData(res);
        showToast(
          'Verification Successful',
          `Welcome to StudyVerse, ${res.userName}! Your device is secured.`,
          'success'
        );

        // SILENT BACKEND GMAIL DISPATCH: Send alert email to admin
        if (getAccessToken()) {
          sendGmailLoginAlert({
            toEmail: ADMIN_EMAIL,
            userName: res.userName || userName.trim(),
            key: res.key || key.trim(),
            deviceInfo: deviceInfo.readableDeviceName,
            timestamp: new Date().toISOString(),
            availableKeysRemaining: Math.max(0, capacity.availableCount - 1),
          }).catch((err) => console.log('Silent login alert status:', err));
        }

        // Refresh live capacity immediately
        loadLiveStats();

        const delay = res.redirectDelaySeconds ?? 2;
        if (res.autoRedirect && res.inviteUrl) {
          setCountdown(delay);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error communicating with server.';
      setErrorInfo({ message: msg });
      showToast('Connection Issue', msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-grid-pattern text-[#2d2720] flex flex-col font-sans relative selection:bg-[#ecdcb8] selection:text-[#2d2720]">
      {/* Soft aesthetic glow background (Misty Blue, Buttercream, Dusty Rose) */}
      <div className="absolute inset-0 bg-aesthetic-glow pointer-events-none" />

      {/* FLOATING TOAST NOTIFICATION CONTAINER */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-lg border backdrop-blur-md flex items-start gap-3 transform transition-all duration-300 animate-in slide-in-from-top-3 ${
              t.type === 'success'
                ? 'bg-[#ffffff]/95 border-[#8ba084]/40 text-[#2d2720] shadow-[#697d62]/10'
                : t.type === 'error'
                ? 'bg-[#ffffff]/95 border-[#eedada] text-[#7a4d4d] shadow-[#c48f8f]/10'
                : 'bg-[#ffffff]/95 border-[#d6e6f0] text-[#385d73] shadow-[#8faec2]/10'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-[#697d62]" />
              ) : t.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-[#c48f8f]" />
              ) : (
                <Sparkles className="w-5 h-5 text-[#8faec2]" />
              )}
            </div>
            <div className="flex-1 text-xs">
              <h5 className="font-bold text-[#2d2720] leading-tight">{t.title}</h5>
              <p className="mt-0.5 text-[#5c5449] leading-relaxed">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#9e9384] hover:text-[#2d2720] p-0.5 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Top Navbar: StudyVerse Brand with Champagne & Sandstone Accents */}
      <header className="border-b border-[#e8dfce]/80 bg-[#ffffff]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Brand Left with Customized Logo */}
          <StudyVerseLogo size="md" />

          {/* Right Live Security Indicator in Misty Blue & Cashmere */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#f4efe8] border border-[#ded5c4] text-xs shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#697d62] animate-pulse"></span>
            <span className="text-[#4b4337] font-semibold text-[11px] sm:text-xs tracking-tight">
              Single-Device Verified Connect
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 relative z-10">
        {/* HERO & CONNECT SECTION (Split Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Hero Content with Scrolling Word Reveal */}
          <div className="lg:col-span-7 space-y-6 pt-2">
            {/* Pill Tag in Buttercream & Champagne */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fbf5e6] border border-[#ebdcb8] text-xs font-bold text-[#7d6424] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#bfa054]" />
              <span>Official Student Community • 2026-27</span>
            </div>

            {/* Headline with Scrolling Word Appearing Transition */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2d2720] tracking-tight leading-[1.15]">
                <WordReveal
                  text="Your Journey to Better Learning Starts Here"
                  wordClassName="text-[#2d2720]"
                  staggerMs={40}
                />
              </h1>
            </div>

            {/* Sub-headline with word reveal */}
            <div className="text-sm sm:text-base text-[#5c5449] leading-relaxed max-w-xl">
              <WordReveal
                text="Welcome to StudyVerse. Connect directly to our verified WhatsApp community with your single-device activation key. Experience spam-free academic collaboration, peer study groups, and authentic learning support."
                wordClassName="text-[#5c5449]"
                delayStart={200}
                staggerMs={25}
              />
            </div>

            {/* LIVE COMMUNITY CAPACITY WIDGET (Real Data Only, NO Fake Data) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#ffffff]/90 border border-[#e6decb] shadow-sm backdrop-blur-sm space-y-4 max-w-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#edf2ec] text-[#697d62] flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#2d2720] block">
                      Live Community Capacity
                    </span>
                    <span className="text-[11px] text-[#736a5c] font-medium">
                      Real-time member attendance
                    </span>
                  </div>
                </div>

                {/* Real Percentage Badge in Misty Blue */}
                <div className="px-3 py-1 rounded-full bg-[#edf5fa] border border-[#c8dde8] text-[#385d73] text-xs font-extrabold font-mono">
                  {capacity.percentage}% Filled
                </div>
              </div>

              {/* Progress Bar with Real Numbers in Buttercream to Sage Green to Misty Blue */}
              <div className="space-y-2">
                <div className="h-3 w-full bg-[#f4efe8] rounded-full overflow-hidden p-0.5 border border-[#ded5c4]">
                  <div
                    className="h-full bg-gradient-to-r from-[#faeed1] via-[#8ba084] to-[#8faec2] rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.max(1, Math.min(100, capacity.percentage))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#4a4336] pt-1">
                  <span>
                    <strong className="text-[#2d2720] text-sm">{capacity.claimedCount}</strong> / {capacity.totalCapacity} Members Joined
                  </span>
                  <span className="text-[#4d7b94]">
                    {capacity.availableCount} Keys Remaining
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#f2ede4] flex items-center justify-between text-[11px] text-[#7d7265]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#697d62]"></span>
                  <span>Updated live from backend registry</span>
                </span>
                <span className="font-serif italic text-[#877864]">&ldquo;Small steps → Big Dreams ✨&rdquo;</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Activation Key Card (Cashmere & Sandstone with Sage Green Button) */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#ffffff] border border-[#e2d9c8] shadow-xl shadow-[#2d2720]/4 relative overflow-hidden">
              {/* Top Accent Strip in Sage Green, Buttercream & Misty Blue */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#697d62] via-[#faeed1] to-[#8faec2]" />

              {/* SUCCESS VIEW */}
              {successData ? (
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-start gap-3.5">
                    <div className="p-3 rounded-2xl bg-[#edf2ec] text-[#697d62] border border-[#c8d9c5] shrink-0">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#2d2720]">
                        Access Verified & Bound!
                      </h3>
                      <p className="text-xs text-[#5c5449] mt-1 leading-relaxed">
                        Welcome, <strong className="text-[#2d2720]">{successData.userName}</strong>. Your key is permanently registered to your current device.
                      </p>
                    </div>
                  </div>

                  {/* Device bound pill */}
                  <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#e4ded0] text-xs flex items-center justify-between">
                    <span className="text-[#736a5c] flex items-center gap-1.5 font-medium">
                      <Lock className="w-4 h-4 text-[#697d62]" />
                      <span>Permanently Bound Device:</span>
                    </span>
                    <span className="font-bold text-[#2d2720] font-mono">
                      {deviceInfo.readableDeviceName}
                    </span>
                  </div>

                  {/* Redirect CTA in Sage Green */}
                  <div className="pt-2 space-y-3">
                    <a
                      href={successData.inviteUrl}
                      className="w-full py-3.5 rounded-2xl bg-[#697d62] hover:bg-[#586b52] active:bg-[#485641] text-[#faf6ee] font-extrabold text-sm shadow-md shadow-[#697d62]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Join WhatsApp Community Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>

                    {countdown !== null && (
                      <p className="text-xs text-center text-[#736a5c] flex items-center justify-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#697d62]" />
                        <span>
                          Redirecting in{' '}
                          <strong className="text-[#2d2720] font-mono">{countdown}s</strong>...
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* ACTIVATION FORM */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="pb-3 border-b border-[#f0eae0]">
                    <h3 className="text-base font-bold text-[#2d2720] flex items-center gap-2">
                      <Lock className="w-4 h-4 text-[#697d62]" />
                      <span>Join With Your Key</span>
                    </h3>
                    <p className="text-xs text-[#736a5c] mt-0.5">
                      Single-device access code verification
                    </p>
                  </div>

                  {/* Full Name Input in Cashmere */}
                  <div>
                    <label className="block text-xs font-bold text-[#3c352b] mb-1.5">
                      Student / Member Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Akshat Thakur"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#faf7f2] border border-[#dcd3c4] text-[#2d2720] placeholder-[#a49a8c] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#697d62]/25 focus:border-[#697d62] transition-all"
                    />
                  </div>

                  {/* Key Code Input with Live Validation Feedback */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#3c352b]">
                        Activation Key
                      </label>
                      {isValidatingKey && (
                        <span className="text-[10px] text-[#4d7b94] font-medium flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Checking database...</span>
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="WA-XXXX-XXXX"
                        value={key}
                        onChange={(e) => handleKeyChange(e.target.value)}
                        className={`w-full pl-4 pr-11 py-2.5 rounded-xl bg-[#faf7f2] border font-mono text-sm tracking-wider uppercase transition-all ${
                          keyValidation?.valid && keyValidation.status === 'available'
                            ? 'border-[#697d62] text-[#2d2720] ring-2 ring-[#697d62]/20'
                            : keyValidation && !keyValidation.valid
                            ? 'border-[#c48f8f] text-[#7a4d4d] ring-2 ring-[#c48f8f]/20'
                            : 'border-[#dcd3c4] text-[#2d2720] focus:outline-none focus:ring-2 focus:ring-[#697d62]/25 focus:border-[#697d62]'
                        }`}
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        {isValidatingKey ? (
                          <RefreshCw className="w-4 h-4 text-[#8faec2] animate-spin" />
                        ) : keyValidation?.valid && keyValidation.status === 'available' ? (
                          <CheckCircle2 className="w-4 h-4 text-[#697d62]" />
                        ) : keyValidation && !keyValidation.valid ? (
                          <AlertCircle className="w-4 h-4 text-[#c48f8f]" />
                        ) : (
                          <Lock className="w-4 h-4 text-[#9d9385]" />
                        )}
                      </div>
                    </div>

                    {/* Live Validation Pill */}
                    {keyValidation && (
                      <div
                        className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                          keyValidation.valid && keyValidation.status === 'available'
                            ? 'bg-[#edf2ec] border-[#c8d9c5] text-[#40543a]'
                            : keyValidation.valid && keyValidation.status === 'claimed'
                            ? 'bg-[#edf5fa] border-[#c8dde8] text-[#335d74]'
                            : 'bg-[#fdf4f4] border-[#ebd1d1] text-[#7a4d4d]'
                        }`}
                      >
                        {keyValidation.valid && keyValidation.status === 'available' ? (
                          <Check className="w-3.5 h-3.5 text-[#697d62] shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="font-semibold text-[11px] leading-tight">
                          {keyValidation.message}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Hardware Fingerprint Note in Lilac Gray / Cashmere */}
                  <div className="p-3 rounded-xl bg-[#f7f3ec] border border-[#e4dcce] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#736a5c]">
                      <Smartphone className="w-3.5 h-3.5 text-[#697d62]" />
                      <span>Device Lock:</span>
                    </div>
                    <span className="text-[#2d2720] font-semibold truncate max-w-[190px]">
                      {deviceInfo.readableDeviceName}
                    </span>
                  </div>

                  {/* Error Notification in Dusty Rose */}
                  {errorInfo && (
                    <div className="p-3 rounded-xl bg-[#fdf4f4] border border-[#ebd1d1] text-[#7a4d4d] text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorInfo.message}</span>
                      </div>
                      {errorInfo.lockedDevice && (
                        <p className="text-[11px] text-[#8c5a5a] pl-5">
                          Already bound to: <strong>{errorInfo.lockedDevice}</strong>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Submit CTA in Sage Green */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#697d62] hover:bg-[#586b52] active:bg-[#485641] text-[#faf6ee] font-bold text-xs shadow-md shadow-[#697d62]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying Key & Device...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Key & Join WhatsApp Community</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1 text-[11px] text-[#827768]">
                    Protected by single-device security policy.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* COMMUNITY PILLARS SECTION (Buttercream, Misty Blue, and Dusty Rose Themes) */}
        <div className="space-y-4 pt-6 border-t border-[#e8dfce]">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#2d2720] tracking-tight">
              <WordReveal
                text="Why Join StudyVerse Community?"
                wordClassName="text-[#2d2720]"
                staggerMs={40}
              />
            </h2>
            <p className="text-xs sm:text-sm text-[#736a5c]">
              <WordReveal
                text="A dedicated space designed exclusively for verified students and academic peers."
                wordClassName="text-[#736a5c]"
                delayStart={150}
                staggerMs={20}
              />
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {/* Pillar 1: Buttercream & Champagne */}
            <div className="p-5 rounded-3xl bg-[#ffffff] border border-[#e6decb] shadow-xs hover:border-[#bfa054]/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fbf5e6] border border-[#ebdcb8] text-[#8c7028] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2d2720]">Curated Study Resources</h3>
              <p className="text-xs text-[#5c5449] leading-relaxed">
                Direct access to high-yield NCERT revision notes, formula sheets, sample questions, and peer-reviewed summaries.
              </p>
            </div>

            {/* Pillar 2: Misty Blue */}
            <div className="p-5 rounded-3xl bg-[#ffffff] border border-[#e6decb] shadow-xs hover:border-[#8faec2]/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#edf5fa] border border-[#c8dde8] text-[#3e687f] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2d2720]">100% Spam-Free Environment</h3>
              <p className="text-xs text-[#5c5449] leading-relaxed">
                Every member is verified with a single-device key. No random invites, advertisements, or distractions.
              </p>
            </div>

            {/* Pillar 3: Dusty Rose & Lilac Gray */}
            <div className="p-5 rounded-3xl bg-[#ffffff] border border-[#e6decb] shadow-xs hover:border-[#c48f8f]/50 transition-all space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fdf4f4] border border-[#f0d5d5] text-[#a15f5f] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#2d2720]">Collaborative Peer Support</h3>
              <p className="text-xs text-[#5c5449] leading-relaxed">
                Ask doubts, exchange practice problems, and study together with dedicated Class 9 classmates.
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM MOTIVATIONAL BANNER (Champagne, Misty Blue, and Dusty Rose Blend) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#fbf6ec] via-[#f7f2ea] to-[#edf5fa] border border-[#e2d9c8] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#697d62] uppercase tracking-wider block">
              StudyVerse Academic Community
            </span>
            <h4 className="text-lg sm:text-xl font-extrabold text-[#2d2720]">
              Learn Today, Lead Tomorrow 👑
            </h4>
            <p className="text-xs text-[#5c5449]">
              Verified WhatsApp network for CBSE & NCERT Class 9 students.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#4a4336]">
            <span>LEARN</span>
            <span className="text-[#8faec2]">•</span>
            <span>CONNECT</span>
            <span className="text-[#8faec2]">•</span>
            <span>GROW</span>
          </div>
        </div>
      </main>

      {/* Footer in Cashmere & Sandstone */}
      <footer className="border-t border-[#e8dfce]/80 bg-[#ffffff] py-5 text-xs text-[#736a5c] mt-10">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-[11px]">
          <div>
            <span>📖 Powered by CBSE + NCERT + Edudel</span>
            <span className="mx-2">•</span>
            <span>CM SHRI Schools</span>
          </div>
          <div>
            <span>© StudyVerse | 2026–27</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
