import { z } from 'zod';

export const uuidSchema = z.string().uuid();
export const emailSchema = z.string().email().toLowerCase().trim();
export const passwordSchema = z.string().min(8).max(128);
export const slugSchema = z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens');
export const nameSchema = z.string().min(1).max(100).trim();
export const descriptionSchema = z.string().max(500).optional();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationInput = z.infer<typeof paginationSchema>;

export const sortSchema = z.object({
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export type SortInput = z.infer<typeof sortSchema>;

export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type DateRangeInput = z.infer<typeof dateRangeSchema>;

export const searchSchema = z.object({
  search: z.string().max(200).optional(),
});
export type SearchInput = z.infer<typeof searchSchema>;
