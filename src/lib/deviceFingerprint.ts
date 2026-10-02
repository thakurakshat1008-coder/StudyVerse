export interface ClientDeviceInfo {
  deviceId: string;
  readableDeviceName: string;
  platform: string;
  screenRes: string;
  timeZone: string;
  fullDescriptor: string;
}

const STORAGE_KEY = 'communi_device_id_v1';
const SIMULATED_DEVICE_KEY = 'communi_simulated_device_id';

export function getOrCreateDeviceId(): string {
  // Check if simulated device mode is enabled in sessionStorage
  const simulated = sessionStorage.getItem(SIMULATED_DEVICE_KEY);
  if (simulated) {
    return simulated;
  }

  let deviceId = localStorage.getItem(STORAGE_KEY);
  if (!deviceId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      deviceId = `dev-${crypto.randomUUID()}`;
    } else {
      deviceId = `dev-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;
    }
    try {
      localStorage.setItem(STORAGE_KEY, deviceId);
    } catch {
      // ignore quota / private mode storage error
    }
  }
  return deviceId;
}

export function detectBrowserAndOS(): { browser: string; os: string; isMobile: boolean } {
  const ua = navigator.userAgent;
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  // OS detection
  if (/Windows NT 10.0/i.test(ua)) os = 'Windows 10/11';
  else if (/Windows NT 6.3/i.test(ua)) os = 'Windows 8.1';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/iPhone/i.test(ua)) os = 'iPhone iOS';
  else if (/iPad/i.test(ua)) os = 'iPadOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Browser detection
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/Opera|OPR\//i.test(ua)) browser = 'Opera';

  return { browser, os, isMobile };
}

export function getClientDeviceInfo(): ClientDeviceInfo {
  const deviceId = getOrCreateDeviceId();
  const { browser, os, isMobile } = detectBrowserAndOS();
  const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'unknown';
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  
  const isSimulated = sessionStorage.getItem(SIMULATED_DEVICE_KEY) !== null;
  const simSuffix = isSimulated ? ' (Simulated Device #2)' : '';

  const readableDeviceName = `${isMobile ? 'Mobile ' : ''}${browser} on ${os}${simSuffix}`;
  const fullDescriptor = `${readableDeviceName} · ${screenRes} · ${timeZone}`;

  return {
    deviceId,
    readableDeviceName,
    platform: os,
    screenRes,
    timeZone,
    fullDescriptor,
  };
}

export function setSimulatedDevice(enabled: boolean): void {
  if (enabled) {
    sessionStorage.setItem(SIMULATED_DEVICE_KEY, `simulated-dev-${Date.now()}`);
  } else {
    sessionStorage.removeItem(SIMULATED_DEVICE_KEY);
  }
}

export function isDeviceSimulated(): boolean {
  return sessionStorage.getItem(SIMULATED_DEVICE_KEY) !== null;
}
