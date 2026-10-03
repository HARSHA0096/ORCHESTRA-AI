import type { FastifyRequest } from 'fastify';
import type { JwtPayload, RequestContext } from '@orchestra/shared';

export type OrchestraRequest = FastifyRequest & {
  user: JwtPayload | null;
  organization: { id: string; role: string } | null;
  apiKey: { id: string; projectId: string } | null;
  requestContext: RequestContext;
};
