import { prisma } from '@orchestra/database';

export class IdentityRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  async findUserById(id: string) {
    return prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  async createUser(data: { email: string; passwordHash: string; firstName: string; lastName: string }) {
    return prisma.user.create({ data });
  }

  async updateUser(id: string, data: { firstName?: string; lastName?: string }) {
    return prisma.user.update({ where: { id }, data });
  }

  async updateLastLogin(id: string) {
    await prisma.user.update({ where: { id }, data: { lastLoginAt: new Date() } });
  }

  async createSession(data: {
    userId: string;
    token: string;
    refreshToken: string;
    expiresAt: Date;
    refreshExpiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    deviceName?: string;
  }) {
    return prisma.session.create({ data });
  }

  async findSessionByToken(token: string) {
    return prisma.session.findFirst({ where: { token, isActive: true } });
  }

  async findSessionByRefreshToken(refreshToken: string) {
    return prisma.session.findFirst({ where: { refreshToken, isActive: true } });
  }

  async findSessionsByUserId(userId: string) {
    return prisma.session.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deactivateSession(id: string) {
    await prisma.session.update({ where: { id }, data: { isActive: false } });
  }

  async deactivateAllUserSessions(userId: string) {
    await prisma.session.updateMany({ where: { userId }, data: { isActive: false } });
  }
}
