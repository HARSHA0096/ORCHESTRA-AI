import type { FastifyRequest } from 'fastify';
import { config } from '@orchestra/config';
import { prisma } from '@orchestra/database';

export interface GatewayIdentity {
  userId: string;
  organizationId: string;
  projectId: string;
}

export interface AuthenticationProvider {
  authenticate(request: FastifyRequest): Promise<GatewayIdentity>;
}

export class DemoAuthenticationProvider implements AuthenticationProvider {
  async authenticate(_request: FastifyRequest): Promise<GatewayIdentity> {
    const configured = config.demo.projectId;
    const project = configured
      ? await prisma.project.findFirst({ where: { id: configured, status: 'ACTIVE', deletedAt: null }, select: { id: true, organizationId: true } })
      : await prisma.project.findFirst({ where: { slug: 'orchestra-demo', status: 'ACTIVE', deletedAt: null }, select: { id: true, organizationId: true }, orderBy: { createdAt: 'desc' } });
    if (!project) throw new Error('Demo project is not configured. Run `pnpm db:seed` with DEMO_MODE=true.');
    return { userId: 'demo-user', organizationId: project.organizationId, projectId: project.id };
  }
}

/**
 * Development-only identity provider. It never creates or invents a project;
 * it resolves an explicitly configured project and verifies that it is active.
 */
export class DevelopmentAuthenticationProvider implements AuthenticationProvider {
  async authenticate(request: FastifyRequest): Promise<GatewayIdentity> {
    const projectId = request.headers['x-project-id'] as string | undefined ?? config.development.projectId;
    if (!projectId) {
      throw new Error('Development project context is required. Set X-Project-ID or DEVELOPMENT_PROJECT_ID.');
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, status: 'ACTIVE', deletedAt: null },
      select: { id: true, organizationId: true },
    });
    if (!project) {
      throw new Error('Configured development project does not exist or is inactive.');
    }

    return {
      userId: request.user?.sub ?? 'development-user',
      organizationId: project.organizationId,
      projectId: project.id,
    };
  }
}