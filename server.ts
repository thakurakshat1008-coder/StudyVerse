import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import type { CommunityKey, AccessLog, CommunitySettings, DashboardStats } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'community_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoreData {
  settings: CommunitySettings;
  keys: CommunityKey[];
  logs: AccessLog[];
}

function generateRandomKey(serial: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 4; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length));
    part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `WA-${part1}-${part2}`;
}

function initializeStore(): StoreData {
  if (fs.existsSync(STORE_FILE)) {
    try {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      const data = JSON.parse(content) as StoreData;
      if (data && Array.isArray(data.keys) && data.keys.length > 0) {
        // Ensure invite URL matches user request
        data.settings.inviteUrl = 'https://chat.whatsapp.com/KjrIS2v1vur592bFBs1ZkA';
        // Remove any old demo keys if present
        data.keys = data.keys.filter((k) => !k.key.includes('DEMO'));
        // Fill up to 1000 keys with clean keys if needed
        const existingKeySet = new Set(data.keys.map((k) => k.key));
        while (data.keys.length < 1000) {
          const serial = data.keys.length + 1;
          const k = generateRandomKey(serial);
          if (!existingKeySet.has(k)) {
            existingKeySet.add(k);
            data.keys.push({
              id: `key-${serial}`,
              serial,
              key: k,
              status: 'available',
              assignedName: null,
              assignedDeviceId: null,
              deviceInfo: null,
              firstUsedAt: null,
              lastUsedAt: null,
              accessCount: 0,
            });
          }
        }
        // Remove demo logs
        data.logs = data.logs.filter((l) => !l.key.includes('DEMO'));
        saveStore(data);
        return data;
      }
    } catch (e) {
      console.error('Failed to parse existing store, creating fresh one:', e);
    }
  }

  console.log('Generating 1,000 secure keys for WhatsApp Community...');
  const keys: CommunityKey[] = [];
  const existingKeySet = new Set<string>();

  // Generate 1000 authentic production keys (no demo keys)
  while (keys.length < 1000) {
    const serial = keys.length + 1;
    const k = generateRandomKey(serial);
    if (!existingKeySet.has(k)) {
      existingKeySet.add(k);
      keys.push({
        id: `key-${serial}`,
        serial,
        key: k,
        status: 'available',
        assignedName: null,
        assignedDeviceId: null,
        deviceInfo: null,
        firstUsedAt: null,
        lastUsedAt: null,
        accessCount: 0,
      });
    }
  }

  const defaultStore: StoreData = {
    settings: {
      communityName: 'StudyVerse - Official WhatsApp Community',
      inviteUrl: 'https://chat.whatsapp.com/KjrIS2v1vur592bFBs1ZkA',
      welcomeMessage: 'Welcome to our verified WhatsApp Community! Your access key is securely bound to this device.',
      requireName: true,
      autoRedirect: true,
      redirectDelaySeconds: 2,
      adminPin: '1234',
    },
    keys,
    logs: [],
  };

  saveStore(defaultStore);
  return defaultStore;
}

let store: StoreData = initializeStore();
store.settings.communityName = 'StudyVerse - Official WhatsApp Community';

function saveStore(dataToSave: StoreData = store) {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store file:', err);
  }
}

function getStats(): DashboardStats {
  const totalKeys = store.keys.length;
  let claimedKeys = 0;
  let blockedKeys = 0;
  let availableKeys = 0;

  for (const k of store.keys) {
    if (k.status === 'claimed') claimedKeys++;
    else if (k.status === 'blocked') blockedKeys++;
    else availableKeys++;
  }

  const deviceMismatchCount = store.logs.filter((l) => l.action === 'DEVICE_MISMATCH').length;
  
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayAccessCount = store.logs.filter((l) => l.timestamp.startsWith(todayStr)).length;

  return {
    totalKeys,
    claimedKeys,
    availableKeys,
    blockedKeys,
    totalAccessLogs: store.logs.length,
    deviceMismatchCount,
    todayAccessCount,
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // 1. Public Info & Live Capacity Endpoint
  app.get('/api/public/info', (req: Request, res: Response) => {
    const totalCapacity = store.keys.length;
    const claimedCount = store.keys.filter((k) => k.status === 'claimed').length;
    const availableCount = store.keys.filter((k) => k.status === 'available').length;
    const percentage = Number(((claimedCount / (totalCapacity || 1)) * 100).toFixed(1));

    res.json({
      communityName: store.settings.communityName,
      welcomeMessage: store.settings.welcomeMessage,
      requireName: store.settings.requireName,
      autoRedirect: store.settings.autoRedirect,
      redirectDelaySeconds: store.settings.redirectDelaySeconds,
      totalCapacity,
      claimedCount,
      availableCount,
      percentage,
    });
  });

  // 2. User Key Verification, Single-Device Enforcement & WhatsApp Gateway
  const handleRedeem = (req: Request, res: Response) => {
    const { key: rawKey, userName, deviceId, deviceInfo } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    if (!rawKey || typeof rawKey !== 'string') {
      res.status(400).json({ success: false, error: 'Please enter a valid activation key.' });
      return;
    }

    const cleanKey = rawKey.trim().toUpperCase();
    const cleanName = (userName && typeof userName === 'string' ? userName.trim() : '') || 'Anonymous Member';
    const cleanDeviceId = (deviceId && typeof deviceId === 'string' ? deviceId.trim() : '') || `temp-${Date.now()}`;
    const cleanDeviceInfo = (deviceInfo && typeof deviceInfo === 'string' ? deviceInfo.trim() : '') || 'Unknown Device';

    if (store.settings.requireName && !cleanName) {
      res.status(400).json({ success: false, error: 'Your name is required to activate your membership.' });
      return;
    }

    // Find key in database
    const keyRecord = store.keys.find((k) => k.key === cleanKey);

    if (!keyRecord) {
      // Log invalid key attempt
      const logEntry: AccessLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        key: cleanKey,
        userName: cleanName,
        action: 'INVALID_KEY',
        deviceId: cleanDeviceId,
        deviceInfo: cleanDeviceInfo,
        ip: clientIp,
        notes: 'Access denied: Key does not exist in backend database.',
      };
      store.logs.unshift(logEntry);
      if (store.logs.length > 500) store.logs.pop();
      saveStore();

      res.status(404).json({
        success: false,
        error: 'Invalid activation key. Please verify the code sent to you.',
      });
      return;
    }

    // Check if key is blocked / revoked
    if (keyRecord.status === 'blocked') {
      const logEntry: AccessLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        key: cleanKey,
        userName: cleanName,
        action: 'KEY_BLOCKED',
        deviceId: cleanDeviceId,
        deviceInfo: cleanDeviceInfo,
        ip: clientIp,
        notes: `Access blocked: Key was revoked by administrator (Originally assigned: ${keyRecord.assignedName || 'None'}).`,
      };
      store.logs.unshift(logEntry);
      if (store.logs.length > 500) store.logs.pop();
      saveStore();

      res.status(403).json({
        success: false,
        error: 'This access key has been suspended or revoked by the administrator.',
      });
      return;
    }

    // CASE 1: Brand new / Available key -> Bind to this device
    if (keyRecord.status === 'available') {
      const now = new Date().toISOString();
      keyRecord.status = 'claimed';
      keyRecord.assignedName = cleanName;
      keyRecord.assignedDeviceId = cleanDeviceId;
      keyRecord.deviceInfo = cleanDeviceInfo;
      keyRecord.firstUsedAt = now;
      keyRecord.lastUsedAt = now;
      keyRecord.accessCount = 1;

      const logEntry: AccessLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: now,
        key: cleanKey,
        userName: cleanName,
        action: 'REDEEMED',
        deviceId: cleanDeviceId,
        deviceInfo: cleanDeviceInfo,
        ip: clientIp,
        notes: `Key activated successfully! Permanently locked to ${cleanDeviceInfo}.`,
      };
      store.logs.unshift(logEntry);
      if (store.logs.length > 500) store.logs.pop();
      saveStore();

      res.json({
        success: true,
        message: 'Key successfully activated and securely bound to this device!',
        inviteUrl: store.settings.inviteUrl,
        communityName: store.settings.communityName,
        autoRedirect: store.settings.autoRedirect,
        redirectDelaySeconds: store.settings.redirectDelaySeconds,
        userName: cleanName,
        key: keyRecord.key,
        boundAt: now,
        lockedDevice: cleanDeviceInfo,
      });
      return;
    }

    // CASE 2: Key was already claimed -> Check single device lock!
    if (keyRecord.status === 'claimed') {
      if (keyRecord.assignedDeviceId === cleanDeviceId) {
        // MATCH: Authorized re-access from same device!
        const now = new Date().toISOString();
        keyRecord.lastUsedAt = now;
        keyRecord.accessCount += 1;

        const logEntry: AccessLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: now,
          key: cleanKey,
          userName: keyRecord.assignedName || cleanName,
          action: 'AUTHORIZED',
          deviceId: cleanDeviceId,
          deviceInfo: cleanDeviceInfo,
          ip: clientIp,
          notes: `Authorized repeat access from verified bound device (Visit #${keyRecord.accessCount}).`,
        };
        store.logs.unshift(logEntry);
        if (store.logs.length > 500) store.logs.pop();
        saveStore();

        res.json({
          success: true,
          message: `Welcome back, ${keyRecord.assignedName || cleanName}! Device authenticated.`,
          inviteUrl: store.settings.inviteUrl,
          communityName: store.settings.communityName,
          autoRedirect: store.settings.autoRedirect,
          redirectDelaySeconds: store.settings.redirectDelaySeconds,
          userName: keyRecord.assignedName || cleanName,
          key: keyRecord.key,
          boundAt: keyRecord.firstUsedAt,
          lockedDevice: keyRecord.deviceInfo,
        });
        return;
      } else {
        // MISMATCH: Unauthorized second device attempting to use key!
        const logEntry: AccessLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toISOString(),
          key: cleanKey,
          userName: `${cleanName} (Claimed owner: ${keyRecord.assignedName || 'Unknown'})`,
          action: 'DEVICE_MISMATCH',
          deviceId: cleanDeviceId,
          deviceInfo: cleanDeviceInfo,
          ip: clientIp,
          notes: `SECURITY INTRUSION PREVENTED: Key is already bound to [${keyRecord.deviceInfo}]. Unauthorized device [${cleanDeviceInfo}] was rejected.`,
        };
        store.logs.unshift(logEntry);
        if (store.logs.length > 500) store.logs.pop();
        saveStore();

        res.status(403).json({
          success: false,
          error: `Single-Device Security Policy: This activation key is strictly locked to another registered device (${keyRecord.deviceInfo || 'Original Device'}). Multi-device key sharing is not permitted.`,
          lockedDevice: keyRecord.deviceInfo,
          boundAt: keyRecord.firstUsedAt,
          assignedName: keyRecord.assignedName,
        });
        return;
      }
    }

    res.status(400).json({ success: false, error: 'Key processing failed.' });
  };

  app.post('/api/verify-and-redeem', handleRedeem);
  app.post('/api/redeem', handleRedeem);

  // Real-Time Key Validation endpoint
  app.get('/api/validate-key', (req: Request, res: Response) => {
    const rawKey = ((req.query.key as string) || '').trim().toUpperCase();
    if (!rawKey) {
      res.json({ valid: false, message: 'Please enter a key.' });
      return;
    }

    const keyRecord = store.keys.find((k) => k.key === rawKey);
    if (!keyRecord) {
      res.json({
        valid: false,
        exists: false,
        message: 'Invalid key code. Key not found in official StudySync registry.',
      });
      return;
    }

    if (keyRecord.status === 'blocked') {
      res.json({
        valid: false,
        exists: true,
        status: 'blocked',
        message: 'This key has been suspended or revoked by the administrator.',
      });
      return;
    }

    if (keyRecord.status === 'claimed') {
      res.json({
        valid: true,
        exists: true,
        status: 'claimed',
        assignedName: keyRecord.assignedName,
        lockedDevice: keyRecord.deviceInfo,
        message: `Registered to ${keyRecord.assignedName || 'Member'} (Device locked)`,
      });
      return;
    }

    res.json({
      valid: true,
      exists: true,
      status: 'available',
      message: 'Active unused key! Ready to bind to your device.',
    });
  });

  // 3. Admin Overview & Stats
  app.get('/api/admin/overview', (req: Request, res: Response) => {
    res.json({
      stats: getStats(),
      settings: store.settings,
      recentLogs: store.logs.slice(0, 15),
    });
  });

  // 4. Admin Keys Query (Search, Filter, Pagination)
  app.get('/api/admin/keys', (req: Request, res: Response) => {
    const search = ((req.query.search as string) || '').trim().toLowerCase();
    const status = (req.query.status as string) || 'all';
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.max(10, Math.min(500, parseInt((req.query.limit as string) || '50', 10)));

    let filtered = store.keys;

    if (status !== 'all') {
      if (status === 'used' || status === 'claimed') {
        filtered = filtered.filter((k) => k.status === 'claimed');
      } else if (status === 'unused' || status === 'available') {
        filtered = filtered.filter((k) => k.status === 'available');
      } else {
        filtered = filtered.filter((k) => k.status === status);
      }
    }

    if (search) {
      filtered = filtered.filter(
        (k) =>
          k.key.toLowerCase().includes(search) ||
          (k.assignedName && k.assignedName.toLowerCase().includes(search)) ||
          (k.deviceInfo && k.deviceInfo.toLowerCase().includes(search)) ||
          k.serial.toString().includes(search)
      );
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    res.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: getStats(),
    });
  });

  // 5. Admin Reset Device Lock on Key
  app.post('/api/admin/keys/reset-device', (req: Request, res: Response) => {
    const { key } = req.body;
    if (!key) {
      res.status(400).json({ success: false, error: 'Key identifier is required.' });
      return;
    }

    const keyRecord = store.keys.find((k) => k.key === key.trim().toUpperCase());
    if (!keyRecord) {
      res.status(404).json({ success: false, error: 'Key not found.' });
      return;
    }

    const prevDevice = keyRecord.deviceInfo || keyRecord.assignedDeviceId;
    keyRecord.assignedDeviceId = null;
    keyRecord.deviceInfo = null;

    const logEntry: AccessLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      key: keyRecord.key,
      userName: keyRecord.assignedName || 'Admin Action',
      action: 'AUTHORIZED',
      deviceId: 'ADMIN_CONSOLE',
      deviceInfo: 'Admin Console',
      ip: req.ip || '127.0.0.1',
      notes: `Admin reset device lock for key ${keyRecord.key}. Member (${keyRecord.assignedName}) can now register a new device. Previous device was: ${prevDevice}.`,
    };
    store.logs.unshift(logEntry);
    if (store.logs.length > 500) store.logs.pop();
    saveStore();

    res.json({
      success: true,
      message: `Device lock released for key ${keyRecord.key}. The user can now link a new device.`,
      key: keyRecord,
    });
  });

  // 6. Admin Toggle Block / Revoke Key
  app.post('/api/admin/keys/toggle-block', (req: Request, res: Response) => {
    const { key } = req.body;
    if (!key) {
      res.status(400).json({ success: false, error: 'Key is required.' });
      return;
    }

    const keyRecord = store.keys.find((k) => k.key === key.trim().toUpperCase());
    if (!keyRecord) {
      res.status(404).json({ success: false, error: 'Key not found.' });
      return;
    }

    const newStatus = keyRecord.status === 'blocked' ? (keyRecord.assignedName ? 'claimed' : 'available') : 'blocked';
    keyRecord.status = newStatus;

    const logEntry: AccessLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      key: keyRecord.key,
      userName: keyRecord.assignedName || 'System',
      action: newStatus === 'blocked' ? 'KEY_BLOCKED' : 'AUTHORIZED',
      deviceId: 'ADMIN_CONSOLE',
      deviceInfo: 'Admin Console',
      ip: req.ip || '127.0.0.1',
      notes: `Admin changed status of ${keyRecord.key} to ${newStatus.toUpperCase()}.`,
    };
    store.logs.unshift(logEntry);
    if (store.logs.length > 500) store.logs.pop();
    saveStore();

    res.json({ success: true, key: keyRecord, message: `Key status updated to ${newStatus}.` });
  });

  // 7. Admin Generate Additional Keys
  app.post('/api/admin/keys/generate', (req: Request, res: Response) => {
    const count = Math.min(500, Math.max(1, parseInt(req.body.count || '100', 10)));
    const existingKeySet = new Set(store.keys.map((k) => k.key));
    const added: CommunityKey[] = [];

    while (added.length < count) {
      const serial = store.keys.length + 1;
      const k = generateRandomKey(serial);
      if (!existingKeySet.has(k)) {
        existingKeySet.add(k);
        const newRecord: CommunityKey = {
          id: `key-${serial}`,
          serial,
          key: k,
          status: 'available',
          assignedName: null,
          assignedDeviceId: null,
          deviceInfo: null,
          firstUsedAt: null,
          lastUsedAt: null,
          accessCount: 0,
        };
        store.keys.push(newRecord);
        added.push(newRecord);
      }
    }

    saveStore();
    res.json({
      success: true,
      message: `Generated ${added.length} new keys. Total keys: ${store.keys.length}.`,
      count: added.length,
      totalKeys: store.keys.length,
    });
  });

  // 8. Admin Real-Time Access Logs
  app.get('/api/admin/logs', (req: Request, res: Response) => {
    const action = req.query.action as string;
    const search = ((req.query.search as string) || '').trim().toLowerCase();
    let logs = store.logs;

    if (action && action !== 'ALL') {
      logs = logs.filter((l) => l.action === action);
    }

    if (search) {
      logs = logs.filter(
        (l) =>
          l.key.toLowerCase().includes(search) ||
          l.userName.toLowerCase().includes(search) ||
          l.deviceInfo.toLowerCase().includes(search) ||
          l.notes.toLowerCase().includes(search) ||
          l.ip.includes(search)
      );
    }

    res.json({ logs: logs.slice(0, 200), total: logs.length });
  });

  // 9. Admin Clear Logs
  app.post('/api/admin/logs/clear', (req: Request, res: Response) => {
    store.logs = [];
    saveStore();
    res.json({ success: true, message: 'Access logs cleared.' });
  });

  // 10. Admin Export All Keys
  app.get('/api/admin/export-keys', (req: Request, res: Response) => {
    const format = (req.query.format as string) || 'json';
    const status = (req.query.status as string) || 'all';

    let keys = store.keys;
    if (status !== 'all') {
      if (status === 'used' || status === 'claimed') {
        keys = keys.filter((k) => k.status === 'claimed');
      } else if (status === 'unused' || status === 'available') {
        keys = keys.filter((k) => k.status === 'available');
      } else {
        keys = keys.filter((k) => k.status === status);
      }
    }

    if (format === 'txt') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', 'attachment; filename="whatsapp-community-keys.txt"');
      const lines = keys.map((k) => k.key).join('\n');
      res.send(lines);
      return;
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="whatsapp-community-keys.csv"');
      const header = 'Serial,Key,Status,AssignedName,BoundDevice,FirstUsedAt,LastUsedAt,AccessCount\n';
      const rows = keys
        .map(
          (k) =>
            `${k.serial},"${k.key}","${k.status}","${k.assignedName || ''}","${(k.deviceInfo || '').replace(/"/g, '""')}","${k.firstUsedAt || ''}","${k.lastUsedAt || ''}",${k.accessCount}`
        )
        .join('\n');
      res.send(header + rows);
      return;
    }

    res.json({ keys, total: keys.length });
  });

  // 11. Admin Update Community Settings
  app.post('/api/admin/settings', (req: Request, res: Response) => {
    const { communityName, inviteUrl, welcomeMessage, requireName, autoRedirect, redirectDelaySeconds, adminPin } = req.body;

    if (communityName !== undefined) store.settings.communityName = String(communityName).trim();
    if (inviteUrl !== undefined) store.settings.inviteUrl = String(inviteUrl).trim();
    if (welcomeMessage !== undefined) store.settings.welcomeMessage = String(welcomeMessage).trim();
    if (requireName !== undefined) store.settings.requireName = Boolean(requireName);
    if (autoRedirect !== undefined) store.settings.autoRedirect = Boolean(autoRedirect);
    if (redirectDelaySeconds !== undefined) store.settings.redirectDelaySeconds = Math.max(0, Math.min(10, Number(redirectDelaySeconds)));
    if (adminPin !== undefined && String(adminPin).trim()) store.settings.adminPin = String(adminPin).trim();

    saveStore();
    res.json({ success: true, settings: store.settings, message: 'Settings saved successfully.' });
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${PORT}`);
    console.log(`Total Keys Loaded: ${store.keys.length}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
