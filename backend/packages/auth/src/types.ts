export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  organizationId?: string;
  sessionId: string;
  iat: number;
  exp: number;
}

export interface AccessTokenInput {
  sub: string;
  email: string;
  role: string;
  organizationId?: string;
  sessionId: string;
}

export interface RefreshTokenInput {
  sub: string;
  sessionId: string;
}

export interface ApiKeyData {
  raw: string;
  prefix: string;
  hash: string;
}

export interface PasswordStrengthResult {
  valid: boolean;
  errors: string[];
}
