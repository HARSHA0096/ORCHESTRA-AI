import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  HOST: z.string().min(1).default('0.0.0.0'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  // Database
  DATABASE_URL: z
    .string()
    .url()
    .default('postgresql://orchestra:orchestra_secret@localhost:5432/orchestra_db?schema=public'),

  // Redis
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string().min(32).default('change-this-to-a-very-long-random-secret-at-least-32-chars'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32)
    .default('change-this-to-another-very-long-random-secret-32-chars'),
  JWT_EXPIRY: z.string().min(1).default('15m'),
  JWT_REFRESH_EXPIRY: z.string().min(1).default('7d'),

  // API Keys
  API_KEY_SALT: z.string().min(16).default('change-this-salt-min-16-chars'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173'),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60000),

  // Queue
  QUEUE_PREFIX: z.string().min(1).default('orchestra'),
});

export type EnvSchema = z.infer<typeof envSchema>;
