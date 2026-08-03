import { paginate, buildPaginatedMeta } from '@orchestra/shared';
import type { PaginationInput } from '@orchestra/validation';
import { NotificationsRepository } from './notifications.repository.js';

export class NotificationsService {
  constructor(private readonly repo: NotificationsRepository) {}

  async getUserNotifications(userId: string, pagination: PaginationInput) {
    const { skip, take } = paginate(pagination.page, pagination.perPage);
    const { data, total } = await this.repo.findByUserId(userId, skip, take);
    return { data, meta: buildPaginatedMeta(total, pagination.page, pagination.perPage) };
  }

  async markAsRead(notificationId: string) {
    return this.repo.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string) {
    await this.repo.markAllAsRead(userId);
  }

  async getUnreadCount(userId: string) {
    return this.repo.countUnread(userId);
  }
}
