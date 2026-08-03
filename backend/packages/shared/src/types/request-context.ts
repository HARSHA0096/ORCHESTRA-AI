export interface RequestContext {
  requestId: string;
  correlationId: string;
  userId?: string;
  organizationId?: string;
  projectId?: string;
  apiKey?: string;
  provider?: string;
  model?: string;
  streaming?: boolean;
  retryCount?: number;
  requestType?: string;
  metadata?: Record<string, unknown>;
  ip: string;
  userAgent: string;
  status?: string;
  currentStage?: string;
}
