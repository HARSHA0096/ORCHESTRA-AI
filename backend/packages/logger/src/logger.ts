import pino from 'pino';
import type { Logger, LoggerOptions } from 'pino';

interface CreateLoggerOptions {
  level?: string;
  name?: string;
}

export function createLogger(options?: CreateLoggerOptions): Logger {
  const isDev = process.env['NODE_ENV'] !== 'production';
  const level = options?.level ?? process.env['LOG_LEVEL'] ?? (isDev ? 'debug' : 'info');

  const pinoOptions: LoggerOptions = {
    level,
    name: options?.name ?? 'orchestra',
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'body.password',
        'body.passwordConfirm',
        'body.currentPassword',
        'body.newPassword',
        'body.token',
        'body.refreshToken',
      ],
      censor: '[REDACTED]',
    },
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (isDev) {
    pinoOptions.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss.l',
        ignore: 'pid,hostname',
      },
    };
  }

  return pino(pinoOptions);
}

export const logger = createLogger();
