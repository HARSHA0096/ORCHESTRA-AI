import { z } from 'zod';
import { nameSchema, slugSchema, descriptionSchema, emailSchema } from './common.schemas.js';

export const createOrganizationSchema = z.object({
  name: nameSchema,
  slug: slugSchema.optional(),
  description: descriptionSchema,
});
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z.object({
  name: nameSchema.optional(),
  description: descriptionSchema,
});
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: z.enum(['SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER', 'VIEWER']).default('DEVELOPER'),
});
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(['SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER', 'VIEWER']),
});
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
