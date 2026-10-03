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
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  DEVELOPMENT_PROJECT_ID: z.string().uuid().optional(),
  DEMO_MODE: z.preprocess((value) => {
    if (typeof value === 'string') {
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;
    }
    return value;
  }, z.boolean()).default(false),
  DEMO_PROJECT_ID: z.string().uuid().optional(),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://localhost:5173,http://localhost:8080'),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().int().min(1).default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60000),
  MAX_BODY_SIZE: z.coerce.number().int().min(16_384).max(10_485_760).default(1_048_576),

  // Queue
  QUEUE_PREFIX: z.string().min(1).default('orchestra'),
}).superRefine((env, ctx) => {
  if (env.NODE_ENV !== 'production') return;

  const placeholderValues = [
    env.JWT_SECRET,
    env.JWT_REFRESH_SECRET,
    env.API_KEY_SALT,
  ];
  if (placeholderValues.some((value) => /change-this/i.test(value))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['JWT_SECRET'],
      message: 'Production requires non-placeholder JWT/API-key secrets.',
    });
  }

  if (env.DEMO_MODE) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DEMO_MODE'],
      message: 'DEMO_MODE must be false in production.',
    });
  }

  const origins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
  if (origins.some((origin) => origin === '*' || /localhost|127\.0\.0\.1/.test(origin))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['CORS_ORIGINS'],
      message: 'Production CORS_ORIGINS must not contain wildcard or localhost origins.',
    });
  }
});

export type EnvSchema = z.infer<typeof envSchema>;
