import 'fastify';
import type { JwtPayload, RequestContext } from '@orchestra/shared';

declare module 'fastify' {
  interface FastifyRequest {
    user: JwtPayload | null;
    organization: { id: string; role: string } | null;
    apiKey: { id: string; projectId: string } | null;
    requestContext: RequestContext;
  }
}