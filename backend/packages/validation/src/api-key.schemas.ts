import { z } from 'zod';
import { nameSchema, descriptionSchema } from './common.schemas.js';

export const createApiKeySchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  scopes: z.array(z.string()).default([]),
  expiresAt: z.coerce.date().optional(),
  rateLimit: z.number().int().min(1).max(10000).default(100),
});
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;

export const rotateApiKeySchema = z.object({
  expiresAt: z.coerce.date().optional(),
});
export type RotateApiKeyInput = z.infer<typeof rotateApiKeySchema>;
