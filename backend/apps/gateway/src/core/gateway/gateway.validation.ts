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

const chatMessageSchema = z.object({
  role: z.enum(['system', 'user', 'assistant', 'tool', 'function']),
  content: z.string(),
  name: z.string().optional(),
  tool_call_id: z.string().optional(),
  tool_calls: z.array(z.object({
    id: z.string(),
    type: z.literal('function'),
    function: z.object({ name: z.string(), arguments: z.string() }),
  })).optional(),
});

const toolSchema = z.object({
  type: z.literal('function'),
  function: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    parameters: z.record(z.string(), z.unknown()),
  }),
});

export const openAiChatCompletionSchema = z.object({
  model: z.string().min(1),
  messages: z.array(chatMessageSchema).min(1),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
  max_tokens: z.number().int().min(1).optional(),
  max_completion_tokens: z.number().int().min(1).optional(),
  stop: z.union([z.string(), z.array(z.string()).min(1)]).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  tools: z.array(toolSchema).optional(),
  tool_choice: z.unknown().optional(),
  response_format: z.object({ type: z.enum(['text', 'json_object']) }).optional(),
  stream: z.boolean().optional().default(false),
});

export type OpenAiChatCompletionInput = z.infer<typeof openAiChatCompletionSchema>;
