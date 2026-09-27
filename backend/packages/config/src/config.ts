import 'dotenv/config';
import { envSchema } from './env.schema.js';

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const formatted = parsed.error.issues
    .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  console.error(`\n❌ Invalid environment configuration:\n${formatted}\n`);
  process.exit(1);
}

const env = parsed.data;

export interface Config {
  app: {
    env: 'development' | 'production' | 'test';
    port: number;
    host: string;
    logLevel: string;
  };
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiry: string;
    refreshExpiry: string;
  };
  apiKey: {
    salt: string;
    openAiApiKey?: string;
    anthropicApiKey?: string;
  };
  development: {
    projectId?: string;
  };
  demo: {
    enabled: boolean;
    projectId?: string;
  };
  cors: {
    origins: string[];
  };
  rateLimit: {
    max: number;
    windowMs: number;
  };
  queue: {
    prefix: string;
  };
}

export const config: Config = {
  app: {
    env: env.NODE_ENV,
    port: env.PORT,
    host: env.HOST,
    logLevel: env.LOG_LEVEL,
  },
  database: {
    url: env.DATABASE_URL,
  },
  redis: {
    url: env.REDIS_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    expiry: env.JWT_EXPIRY,
    refreshExpiry: env.JWT_REFRESH_EXPIRY,
  },
  apiKey: {
    salt: env.API_KEY_SALT,
    openAiApiKey: env.OPENAI_API_KEY,
    anthropicApiKey: env.ANTHROPIC_API_KEY,
  },
  development: {
    projectId: env.DEVELOPMENT_PROJECT_ID,
  },
  demo: {
    enabled: env.DEMO_MODE && env.NODE_ENV !== 'test',
    projectId: env.DEMO_PROJECT_ID,
  },
  cors: {
    origins: env.CORS_ORIGINS.split(',').map((o) => o.trim()),
  },
  rateLimit: {
    max: env.RATE_LIMIT_MAX,
    windowMs: env.RATE_LIMIT_WINDOW_MS,
  },
  queue: {
    prefix: env.QUEUE_PREFIX,
  },
};
