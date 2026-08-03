import { z } from 'zod';

export const gatewayRequestSchema = z.object({
  prompt: z.string().min(1),
  provider: z.string().optional(),
  model: z.string().optional(),
  projectId: z.string().optional(),
  requestType: z.enum(['completion', 'chat', 'embedding', 'image', 'audio', 'moderation']).optional(),
  streaming: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  temperature: z.number().optional(),
  topP: z.number().optional(),
  topK: z.number().optional(),
  maxTokens: z.number().optional(),
});

export type GatewayRequestInputSchema = z.infer<typeof gatewayRequestSchema>;
