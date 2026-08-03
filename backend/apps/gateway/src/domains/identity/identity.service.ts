import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword,
  verifyRefreshToken as verifyRefresh,
} from '@orchestra/auth';
import type { TokenPair } from '@orchestra/auth';
import { ConflictError, UnauthorizedError, NotFoundError, ErrorCode } from '@orchestra/errors';
import { config } from '@orchestra/config';
import { eventBus } from '@orchestra/events';
import { parseDuration } from '@orchestra/shared';
import type { RegisterInput, LoginInput, UpdateProfileInput } from '@orchestra/validation';
import { IdentityRepository } from './identity.repository.js';

export class IdentityService {
  constructor(private readonly repo: IdentityRepository) {}

  async register(input: RegisterInput, ip?: string, userAgent?: string) {
    const existing = await this.repo.findUserByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email already registered', ErrorCode.AUTH_EMAIL_EXISTS);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.repo.createUser({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    const tokens = await this._createSession(user.id, user.email, 'DEVELOPER', ip, userAgent);
    eventBus.emit('user.created', { userId: user.id, email: user.email });

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      tokens,
    };
  }

  async login(input: LoginInput, ip?: string, userAgent?: string) {
    const user = await this.repo.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password', ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid email or password', ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    await this.repo.updateLastLogin(user.id);
    const tokens = await this._createSession(user.id, user.email, 'DEVELOPER', ip, userAgent);

    return {
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      tokens,
    };
  }

  async logout(sessionId: string) {
    await this.repo.deactivateSession(sessionId);
  }

  async refreshToken(refreshToken: string) {
    verifyRefresh(refreshToken);
    const session = await this.repo.findSessionByRefreshToken(refreshToken);
    if (!session || !session.isActive) {
      throw new UnauthorizedError('Invalid refresh token', ErrorCode.AUTH_INVALID_REFRESH_TOKEN);
    }

    const user = await this.repo.findUserById(session.userId);
    if (!user) {
      throw new NotFoundError('User not found', ErrorCode.AUTH_USER_NOT_FOUND);
    }

    // Deactivate old session and create new one
    await this.repo.deactivateSession(session.id);
    return this._createSession(user.id, user.email, 'DEVELOPER', undefined, undefined);
  }

  async getProfile(userId: string) {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found', ErrorCode.AUTH_USER_NOT_FOUND);
    }
    return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, emailVerified: user.emailVerified, status: user.status, createdAt: user.createdAt };
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const user = await this.repo.updateUser(userId, data);
    eventBus.emit('user.updated', { userId });
    return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
  }

  async getSessions(userId: string) {
    const sessions = await this.repo.findSessionsByUserId(userId);
    return sessions.map((session: { id: string; ipAddress: string | null; userAgent: string | null; deviceName: string | null; createdAt: Date; expiresAt: Date; isActive: boolean }) => ({
      id: session.id,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceName: session.deviceName,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isActive: session.isActive,
    }));
  }

  async revokeSession(userId: string, sessionId: string) {
    const sessions = await this.repo.findSessionsByUserId(userId);
    const session = sessions.find((candidate: { id: string }) => candidate.id === sessionId);
    if (!session) {
      throw new NotFoundError('Session not found', ErrorCode.AUTH_SESSION_EXPIRED);
    }
    await this.repo.deactivateSession(sessionId);
  }

  async revokeAllSessions(userId: string) {
    await this.repo.deactivateAllUserSessions(userId);
  }

  private async _createSession(
    userId: string,
    email: string,
    role: string,
    ip?: string,
    userAgent?: string,
  ): Promise<TokenPair> {
    const sessionId = crypto.randomUUID();
    const accessToken = generateAccessToken({ sub: userId, email, role, sessionId });
    const refreshTokenStr = generateRefreshToken({ sub: userId, sessionId });

    const expiresAt = new Date(Date.now() + parseDuration(config.jwt.expiry));
    const refreshExpiresAt = new Date(Date.now() + parseDuration(config.jwt.refreshExpiry));

    await this.repo.createSession({
      userId,
      token: accessToken,
      refreshToken: refreshTokenStr,
      expiresAt,
      refreshExpiresAt,
      ipAddress: ip,
      userAgent,
    });

    return {
      accessToken,
      refreshToken: refreshTokenStr,
      expiresIn: config.jwt.expiry,
      refreshExpiresIn: config.jwt.refreshExpiry,
    };
  }
}
