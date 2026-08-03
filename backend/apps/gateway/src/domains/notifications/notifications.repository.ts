import { prisma } from '@orchestra/database';

export class NotificationsRepository {
  async findByUserId(userId: string, skip: number, take: number) {
    const [data, total] = await Promise.all([
      prisma.notification.findMany({ where: { userId }, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { data, total };
  }

  async markAsRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { read: true, readAt: new Date() } });
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true, readAt: new Date() } });
  }

  async countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  }
}
