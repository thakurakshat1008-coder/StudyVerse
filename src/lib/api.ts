import type {
  CommunityKey,
  AccessLog,
  CommunitySettings,
  DashboardStats,
  RedeemResponse,
  KeyStatus,
  KeyFilterStatus,
} from '../types.ts';

export async function fetchPublicInfo(): Promise<{
  communityName: string;
  welcomeMessage: string;
  requireName: boolean;
  autoRedirect: boolean;
  redirectDelaySeconds: number;
  totalCapacity?: number;
  claimedCount?: number;
  availableCount?: number;
  percentage?: number;
}> {
  const res = await fetch('/api/public/info');
  if (!res.ok) throw new Error('Failed to load public info');
  return res.json();
}

export async function redeemKey(data: {
  key: string;
  userName: string;
  deviceId: string;
  deviceInfo: string;
}): Promise<RedeemResponse> {
  const res = await fetch('/api/verify-and-redeem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) {
    return {
      success: false,
      error: json.error || 'Failed to verify key',
      lockedDevice: json.lockedDevice,
      boundAt: json.boundAt,
      userName: json.assignedName,
    };
  }
  return json;
}

export async function validateKeyRealtime(key: string): Promise<{
  valid: boolean;
  exists?: boolean;
  status?: 'available' | 'claimed' | 'blocked';
  assignedName?: string;
  lockedDevice?: string;
  message: string;
}> {
  const res = await fetch(`/api/validate-key?key=${encodeURIComponent(key.trim())}`);
  if (!res.ok) throw new Error('Validation request failed');
  return res.json();
}

export async function fetchAdminOverview(): Promise<{
  stats: DashboardStats;
  settings: CommunitySettings;
  recentLogs: AccessLog[];
}> {
  const res = await fetch('/api/admin/overview');
  if (!res.ok) throw new Error('Failed to load admin overview');
  return res.json();
}

export async function fetchKeys(params: {
  search?: string;
  status?: KeyFilterStatus;
  page?: number;
  limit?: number;
}): Promise<{
  items: CommunityKey[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: DashboardStats;
}> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));

  const res = await fetch(`/api/admin/keys?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch keys');
  return res.json();
}

export async function resetDeviceLock(key: string): Promise<{ success: boolean; message: string; key: CommunityKey }> {
  const res = await fetch('/api/admin/keys/reset-device', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to reset device lock');
  return json;
}

export async function toggleBlockKey(key: string): Promise<{ success: boolean; message: string; key: CommunityKey }> {
  const res = await fetch('/api/admin/keys/toggle-block', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update key status');
  return json;
}

export async function generateKeys(count: number): Promise<{ success: boolean; message: string; totalKeys: number }> {
  const res = await fetch('/api/admin/keys/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to generate keys');
  return json;
}

export async function fetchLogs(params?: {
  action?: string;
  search?: string;
}): Promise<{ logs: AccessLog[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.action) query.set('action', params.action);
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`/api/admin/logs?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

export async function clearLogs(): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/admin/logs/clear', {
    method: 'POST',
  });
  return res.json();
}

export async function updateSettings(settings: Partial<CommunitySettings>): Promise<{
  success: boolean;
  settings: CommunitySettings;
  message: string;
}> {
  const res = await fetch('/api/admin/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update settings');
  return json;
}
