export type KeyStatus = 'available' | 'claimed' | 'blocked';
export type KeyFilterStatus = 'all' | 'unused' | 'used' | 'available' | 'claimed' | 'blocked';

export interface CommunityKey {
  id: string;
  serial: number;
  key: string;
  status: KeyStatus;
  assignedName: string | null;
  assignedDeviceId: string | null;
  deviceInfo: string | null;
  firstUsedAt: string | null;
  lastUsedAt: string | null;
  accessCount: number;
}

export type AccessLogAction =
  | 'REDEEMED'
  | 'AUTHORIZED'
  | 'DEVICE_MISMATCH'
  | 'INVALID_KEY'
  | 'KEY_BLOCKED';

export interface AccessLog {
  id: string;
  timestamp: string;
  key: string;
  userName: string;
  action: AccessLogAction;
  deviceId: string;
  deviceInfo: string;
  ip: string;
  notes: string;
}

export interface CommunitySettings {
  communityName: string;
  inviteUrl: string;
  welcomeMessage: string;
  requireName: boolean;
  autoRedirect: boolean;
  redirectDelaySeconds: number;
  adminPin: string;
}

export interface DashboardStats {
  totalKeys: number;
  claimedKeys: number;
  availableKeys: number;
  blockedKeys: number;
  totalAccessLogs: number;
  deviceMismatchCount: number;
  todayAccessCount: number;
}

export interface RedeemResponse {
  success: boolean;
  message?: string;
  error?: string;
  inviteUrl?: string;
  communityName?: string;
  autoRedirect?: boolean;
  redirectDelaySeconds?: number;
  userName?: string;
  key?: string;
  boundAt?: string;
  lockedDevice?: string;
}
