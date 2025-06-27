const notificationService = require("../services/notificationService");
const streamService = require("../services/streamService");
const { successResponse, errorResponse } = require("../utils/response");
const logger = require("../utils/logger");

class NotificationController {
  // SSE stream endpoint
  async streamNotifications(req, res) {
    try {
      const userId = req.user.email;

      // Set SSE headers
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      // Add client to stream service
      streamService.addClient(userId, res);

      // Send initial connection confirmation
      res.write(
        `data: ${JSON.stringify({
          type: "connection",
          message: "Connected to notification stream",
        })}\n\n`
      );

      // Handle client disconnect
      req.on("close", () => {
        streamService.removeClient(userId);
        logger.info(`Client disconnected from notification stream: ${userId}`);
      });

      logger.info(`Client connected to notification stream: ${userId}`);
    } catch (error) {
      logger.error("Stream connection error:", error);
      res.status(500).end();
    }
  }

  // Get notification history
  async getNotifications(req, res) {
    try {
      const userId = req.user.email;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const notifications = await notificationService.getUserNotifications(
        userId,
        {
          page: parseInt(page),
          limit: parseInt(limit),
          unreadOnly: unreadOnly === "true",
        }
      );

      return successResponse(
        res,
        notifications,
        "Notifications retrieved successfully"
      );
    } catch (error) {
      logger.error("Get notifications error:", error);
      return errorResponse(res, "Failed to retrieve notifications", 500);
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.email;

      const notification = await notificationService.markAsRead(id, userId);

      if (!notification) {
        return errorResponse(res, "Notification not found", 404);
      }

      return successResponse(res, notification, "Notification marked as read");
    } catch (error) {
      logger.error("Mark notification as read error:", error);
      return errorResponse(res, "Failed to mark notification as read", 500);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.email;

      const result = await notificationService.markAllAsRead(userId);

      return successResponse(res, result, "All notifications marked as read");
    } catch (error) {
      logger.error("Mark all notifications as read error:", error);
      return errorResponse(
        res,
        "Failed to mark all notifications as read",
        500
      );
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.email;

      const deleted = await notificationService.deleteNotification(id, userId);

      if (!deleted) {
        return errorResponse(res, "Notification not found", 404);
      }

      return successResponse(res, null, "Notification deleted successfully");
    } catch (error) {
      logger.error("Delete notification error:", error);
      return errorResponse(res, "Failed to delete notification", 500);
    }
  }

  // Get notification statistics
  async getNotificationStats(req, res) {
    try {
      const userId = req.user.email;

      const stats = await notificationService.getNotificationStats(userId);

      return successResponse(res, stats, "Notification statistics retrieved");
    } catch (error) {
      logger.error("Get notification stats error:", error);
      return errorResponse(
        res,
        "Failed to retrieve notification statistics",
        500
      );
    }
  }
}

module.exports = new NotificationController();
