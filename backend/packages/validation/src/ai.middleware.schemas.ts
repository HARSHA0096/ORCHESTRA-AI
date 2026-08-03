import { z } from 'zod';

export const aiMiddlewareRequestSchema = z.object({
  prompt: z.string().min(1),
  provider: z.string().optional(),
  model: z.string().optional(),
  streaming: z.boolean().optional(),
  temperature: z.number().optional(),
  topP: z.number().optional(),
  topK: z.number().optional(),
  maxTokens: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type AiMiddlewareRequestInput = z.infer<typeof aiMiddlewareRequestSchema>;
