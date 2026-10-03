import { describe, expect, it } from 'vitest';
import { envSchema } from './env.schema.js';

describe('production environment safeguards', () => {
  const base = {
    NODE_ENV: 'production',
    JWT_SECRET: 'a'.repeat(40),
    JWT_REFRESH_SECRET: 'b'.repeat(40),
    API_KEY_SALT: 'c'.repeat(20),
    CORS_ORIGINS: 'https://app.example.com',
    DEMO_MODE: 'false',
  };

  it('rejects placeholder secrets', () => {
    const result = envSchema.safeParse({ ...base, JWT_SECRET: 'change-this-to-a-very-long-random-secret-at-least-32-chars' });
    expect(result.success).toBe(false);
  });

  it('rejects demo mode in production', () => {
    const result = envSchema.safeParse({ ...base, DEMO_MODE: 'true' });
    expect(result.success).toBe(false);
  });

  it('rejects wildcard or localhost CORS in production', () => {
    expect(envSchema.safeParse({ ...base, CORS_ORIGINS: '*' }).success).toBe(false);
    expect(envSchema.safeParse({ ...base, CORS_ORIGINS: 'http://localhost:8080' }).success).toBe(false);
  });

  it('accepts explicit production configuration', () => {
    expect(envSchema.safeParse(base).success).toBe(true);
  });
});
