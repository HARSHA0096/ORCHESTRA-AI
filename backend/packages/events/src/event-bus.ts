import { EventEmitter } from 'node:events';

export interface EventMap {
  'user.created': { userId: string; email: string };
  'user.updated': { userId: string };
  'org.created': { orgId: string; userId: string };
  'org.updated': { orgId: string };
  'project.created': { projectId: string; orgId: string };
  'project.updated': { projectId: string };
  'api-key.created': { apiKeyId: string; projectId: string };
  'api-key.rotated': { apiKeyId: string };
  'api-key.revoked': { apiKeyId: string };
  'audit.logged': { action: string; resource: string; resourceId?: string };
  'notification.created': { notificationId: string; userId: string };
}

export class EventBus {
  private emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(50);
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): boolean {
    return this.emitter.emit(event, data);
  }

  on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): this {
    this.emitter.on(event, handler as (...args: unknown[]) => void);
    return this;
  }

  once<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): this {
    this.emitter.once(event, handler as (...args: unknown[]) => void);
    return this;
  }

  off<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): this {
    this.emitter.off(event, handler as (...args: unknown[]) => void);
    return this;
  }

  removeAllListeners<K extends keyof EventMap>(event?: K): this {
    if (event) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
    return this;
  }
}

export const eventBus = new EventBus();
