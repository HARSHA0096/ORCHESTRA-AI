import jwt from 'jsonwebtoken';
import { config } from '@orchestra/config';
import { UnauthorizedError, ErrorCode } from '@orchestra/errors';
import type { JwtPayload, AccessTokenInput, RefreshTokenInput } from './types.js';

export function generateAccessToken(payload: AccessTokenInput): string {
  return jwt.sign(payload, config.jwt.secret as string, {
    expiresIn: config.jwt.expiry as jwt.SignOptions['expiresIn'],
    issuer: 'orchestra-ai',
    audience: 'orchestra-api',
  });
}

export function generateRefreshToken(payload: RefreshTokenInput): string {
  return jwt.sign(payload, config.jwt.refreshSecret as string, {
    expiresIn: config.jwt.refreshExpiry as jwt.SignOptions['expiresIn'],
    issuer: 'orchestra-ai',
    audience: 'orchestra-refresh',
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'orchestra-ai',
      audience: 'orchestra-api',
    });
    return decoded as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Access token expired', ErrorCode.AUTH_TOKEN_EXPIRED);
    }
    throw new UnauthorizedError('Invalid access token', ErrorCode.AUTH_TOKEN_INVALID);
  }
}

export function verifyRefreshToken(token: string): RefreshTokenInput & { iat: number; exp: number } {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'orchestra-ai',
      audience: 'orchestra-refresh',
    });
    return decoded as RefreshTokenInput & { iat: number; exp: number };
  } catch {
    throw new UnauthorizedError('Invalid refresh token', ErrorCode.AUTH_INVALID_REFRESH_TOKEN);
  }
}

export function decodeToken(token: string): JwtPayload | null {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded === 'string') return null;
  return decoded as JwtPayload;
}
