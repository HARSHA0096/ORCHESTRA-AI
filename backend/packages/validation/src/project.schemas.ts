import { z } from 'zod';
import { nameSchema, slugSchema, descriptionSchema } from './common.schemas.js';

export const createProjectSchema = z.object({
  name: nameSchema,
  slug: slugSchema.optional(),
  description: descriptionSchema,
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: nameSchema.optional(),
  description: descriptionSchema,
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
