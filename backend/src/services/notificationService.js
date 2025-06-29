const { PrismaClient } = require("@prisma/client");
const streamService = require("./streamService");
const logger = require("../utils/logger");

const prisma = new PrismaClient();

class NotificationService {
  // Create a new notification
  async create(notificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          userId: notificationData.userId,
          projectId: notificationData.projectId || null,
          taskId: notificationData.taskId || null,
          taskReviewId: notificationData.taskReviewId || null,
          metadata: notificationData.metadata || null,
        },
        include: {
          project: {
            select: { id: true, name: true },
          },
          task: {
            select: { id: true, title: true },
          },
          taskReview: {
            select: { id: true, status: true },
          },
        },
      });

      // Send real-time notification via SSE
      streamService.sendToUser(notification.userId, {
        ...notification,
        timestamp: new Date().toISOString(),
      });

      logger.info(
        `Notification created and sent: ${notification.type} for user ${notification.userId}`
      );
      return notification;
    } catch (error) {
      logger.error("Create notification error:", error);
      throw error;
    }
  }

  // Get user notifications with pagination
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      const skip = (page - 1) * limit;

      const where = {
        userId,
        ...(unreadOnly && { isRead: false }),
      };

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          include: {
            project: {
              select: { id: true, name: true },
            },
            task: {
              select: { id: true, title: true },
            },
            taskReview: {
              select: { id: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where }),
      ]);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Get user notifications error:", error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      return notification.count > 0;
    } catch (error) {
      logger.error("Mark notification as read error:", error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          updatedAt: new Date(),
        },
      });

      return { updated: result.count };
    } catch (error) {
      logger.error("Mark all notifications as read error:", error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId) {
    try {
      const result = await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          userId,
        },
      });

      return result.count > 0;
    } catch (error) {
      logger.error("Delete notification error:", error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId) {
    try {
      const [total, unread, byType] = await Promise.all([
        prisma.notification.count({
          where: { userId },
        }),
        prisma.notification.count({
          where: { userId, isRead: false },
        }),
        prisma.notification.groupBy({
          by: ["type"],
          where: { userId },
          _count: { type: true },
        }),
      ]);

      return {
        total,
        unread,
        read: total - unread,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {}),
      };
    } catch (error) {
      logger.error("Get notification stats error:", error);
      throw error;
    }
  }

  // Find the first notification by type, taskId, and userId
  async findFirstByTypeTaskUser({ type, taskId, userId }) {
    try {
      return await prisma.notification.findFirst({
        where: {
          type,
          taskId,
          userId,
        },
      });
    } catch (error) {
      logger.error("Find first notification error:", error);
      throw error;
    }
  }

  // Bulk create notifications (for multiple users)
  async createBulk(notifications) {
    try {
      const createdNotifications = await prisma.notification.createMany({
        data: notifications,
      });

      // Send real-time notifications to all users
      notifications.forEach((notification) => {
        streamService.sendToUser(notification.userId, {
          ...notification,
          timestamp: new Date().toISOString(),
        });
      });

      logger.info(`Bulk notifications created: ${createdNotifications.count}`);
      return createdNotifications;
    } catch (error) {
      logger.error("Bulk create notifications error:", error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
