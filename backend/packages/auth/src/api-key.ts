import crypto from 'node:crypto';
import { config } from '@orchestra/config';
import type { ApiKeyData } from './types.js';

export function generateApiKey(): ApiKeyData {
  const rawBytes = crypto.randomBytes(48);
  const raw = rawBytes.toString('hex');
  const prefix = `orc_${raw.substring(0, 8)}`;
  const hash = hashApiKey(raw);

  return { raw, prefix, hash };
}

export function hashApiKey(raw: string): string {
  return crypto
    .createHmac('sha256', config.apiKey.salt)
    .update(raw)
    .digest('hex');
}

export function maskApiKey(raw: string): string {
  if (raw.length <= 12) return '***';
  const start = raw.substring(0, 8);
  const end = raw.substring(raw.length - 4);
  return `${start}${'*'.repeat(8)}${end}`;
}
