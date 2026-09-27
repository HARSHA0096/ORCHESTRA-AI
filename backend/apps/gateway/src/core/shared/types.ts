// ──────────────────────────────────────────────────────────────
// Orchestra AI — Core Shared Types
// All types used across the AI Middleware Core
// ──────────────────────────────────────────────────────────────

// ── Request Lifecycle ──────────────────────────────────────
export const ExecutionStatus = {
  RECEIVED: 'received',
  VALIDATED: 'validated',
  QUEUED: 'queued',
  RUNNING: 'running',
  STREAMING: 'streaming',
  COMPLETED: 'completed',
  FAILED: 'failed',
  TIMEOUT: 'timeout',
  CANCELLED: 'cancelled',
} as const;
export type ExecutionStatus = (typeof ExecutionStatus)[keyof typeof ExecutionStatus];

export const RequestType = {
  COMPLETION: 'completion',
  CHAT: 'chat',
  EMBEDDING: 'embedding',
  IMAGE: 'image',
  AUDIO: 'audio',
  MODERATION: 'moderation',
} as const;
export type RequestType = (typeof RequestType)[keyof typeof RequestType];

// ── Chat Message ───────────────────────────────────────────
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// ── Gateway Request Input ──────────────────────────────────
export interface GatewayRequestInput {
  // Core
  prompt?: string;
  messages?: ChatMessage[];
  requestType?: RequestType;

  // Provider routing
  provider?: string;
  model?: string;

  // Sampling parameters
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stop?: string[];
  frequencyPenalty?: number;
  presencePenalty?: number;

  // Behavior
  streaming?: boolean;
  responseFormat?: 'text' | 'json';
  tools?: ToolDefinition[];
  toolChoice?: unknown;

  // Context
  userId?: string;
  organizationId?: string;
  projectId?: string;
  endpoint?: string;
  apiKey?: string;

  // Metadata
  metadata?: Record<string, unknown>;
  onStreamChunk?: (chunk: StreamChunk) => void;
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

// ── Prompt Metadata ────────────────────────────────────────
export interface PromptMetadata {
  promptTokenEstimate: number;
  messageCount: number;
  hasSystemMessage: boolean;
  hasTools: boolean;
  language?: string;
}

// ── Stage Tracking ─────────────────────────────────────────
export interface StageResult {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'skipped' | 'failed';
  durationMs: number;
  metadata?: Record<string, unknown>;
  error?: string;
}

// ── Execution Context ──────────────────────────────────────
export interface ExecutionContext {
  // Identity
  requestId: string;
  correlationId: string;
  executionId: string;

  // Auth
  userId?: string;
  organizationId?: string;
  projectId?: string;
  endpoint?: string;
  apiKey?: string;

  // Request
  prompt?: string;
  messages?: ChatMessage[];
  requestType: RequestType;

  // Provider
  provider?: string;
  model?: string;
  resolvedProvider?: string;
  resolvedModel?: string;

  // Sampling
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stop?: string[];
  frequencyPenalty?: number;
  presencePenalty?: number;

  // Behavior
  streaming: boolean;
  responseFormat?: 'text' | 'json';
  tools?: ToolDefinition[];
  toolChoice?: unknown;

  // Lifecycle
  status: ExecutionStatus;
  retryCount: number;
  maxRetries: number;
  currentStage: string;
  stages: StageResult[];

  // Timing
  timestamp: string;
  startedAt: number;
  executionDurationMs: number;

  // Network
  headers: Record<string, string>;
  ipAddress: string;
  userAgent: string;

  // Result
  providerResponse?: ProviderResponse;
  error?: ExecutionError;

  // Metadata
  promptMetadata?: PromptMetadata;
  metadata: Record<string, unknown>;
  customMetadata: Record<string, unknown>;
  onStreamChunk?: (chunk: StreamChunk) => void;
}

// ── Execution Error ────────────────────────────────────────
export interface ExecutionError {
  code: string;
  message: string;
  provider?: string;
  retryable: boolean;
  statusCode?: number;
  timestamp: string;
  stage?: string;
}

// ── Provider Types ─────────────────────────────────────────
export interface ProviderCapabilities {
  streaming: boolean;
  vision: boolean;
  functions: boolean;
  tools: boolean;
  json: boolean;
  embeddings: boolean;
  images: boolean;
  audio: boolean;
}

export interface ProviderModelInfo {
  id: string;
  name: string;
  contextWindow: number;
  maxOutputTokens: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
  capabilities: string[];
}

export interface ProviderInfo {
  name: string;
  displayName: string;
  type: string;
  status: 'active' | 'inactive' | 'degraded';
  capabilities: ProviderCapabilities;
  models: ProviderModelInfo[];
  metadata?: Record<string, unknown>;
}

// ── Provider Response ──────────────────────────────────────
export interface ProviderResponse {
  content: string;
  provider: string;
  model: string;
  finishReason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'error';
  usage: TokenUsage;
  latencyMs: number;
  providerRequestId?: string;
  toolCalls?: ToolCall[];
  metadata?: Record<string, unknown>;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

// ── Streaming Types ────────────────────────────────────────
export interface StreamChunk {
  id: string;
  content: string;
  provider: string;
  model: string;
  finishReason?: 'stop' | 'length' | 'content_filter' | 'tool_calls';
  index: number;
  timestamp: string;
}

export interface StreamOptions {
  onChunk: (chunk: StreamChunk) => void;
  onComplete: (response: ProviderResponse) => void;
  onError: (error: ExecutionError) => void;
  signal?: AbortSignal;
}

// ── Gateway Response ───────────────────────────────────────
export interface GatewayResponse {
  success: boolean;
  message: string;
  data: {
    response: string;
    provider: string;
    model: string;
    finishReason: string;
    usage: TokenUsage;
    providerRequestId?: string;
    toolCalls?: ToolCall[];
    latencyMs: number;
    executionTimeMs: number;
    requestId: string;
    correlationId: string;
    metadata?: Record<string, unknown>;
  };
  execution: {
    executionId: string;
    status: ExecutionStatus;
    latencyMs: number;
    executionTimeMs: number;
    retryCount: number;
    stages: StageResult[];
  };
  provider: {
    name: string;
    model: string;
    resolvedProvider?: string;
    resolvedModel?: string;
  };
  metadata: Record<string, unknown>;
  timestamp: string;
  requestId: string;
  correlationId: string;
  errors: Array<{ code: string; message: string; stage?: string }>;
}

// ── Retry Types ────────────────────────────────────────────
export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableStatuses: number[];
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableStatuses: [429, 500, 502, 503, 504],
};
