const logger = require("../utils/logger");

class StreamService {
  constructor() {
    this.clients = new Map(); // userId -> response object
    this.connectionCount = 0;
  }

  // Add client to active connections
  addClient(userId, response) {
    // Remove existing connection if present
    this.removeClient(userId);

    this.clients.set(userId, response);
    this.connectionCount++;

    logger.info(
      `SSE client added: ${userId}. Total connections: ${this.connectionCount}`
    );
  }

  // Remove client from active connections
  removeClient(userId) {
    const hadClient = this.clients.has(userId);
    if (hadClient) {
      const response = this.clients.get(userId);
      try {
        response.end();
      } catch (error) {
        logger.warn("Error closing SSE connection:", error.message);
      }

      this.clients.delete(userId);
      this.connectionCount--;

      logger.info(
        `SSE client removed: ${userId}. Total connections: ${this.connectionCount}`
      );
    }
    return hadClient;
  }

  // Send notification to specific user
  sendToUser(userId, notification) {
    const client = this.clients.get(userId);
    if (client) {
      try {
        const data = JSON.stringify({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
          projectId: notification.projectId,
          taskId: notification.taskId,
          taskReviewId: notification.taskReviewId,
          metadata: notification.metadata,
          timestamp: notification.timestamp || new Date().toISOString(),
        });

        client.write(`data: ${data}\n\n`);
        logger.debug(
          `Notification sent to user ${userId}: ${notification.type}`
        );
      } catch (error) {
        logger.error(`Error sending notification to user ${userId}:`, error);
        this.removeClient(userId);
      }
    } else {
      logger.debug(`No active SSE connection for user: ${userId}`);
    }
  }

  // Broadcast notification to multiple users
  broadcast(userIds, notification) {
    userIds.forEach((userId) => {
      this.sendToUser(userId, notification);
    });
    logger.info(
      `Notification broadcasted to ${userIds.length} users: ${notification.type}`
    );
  }

  // Send system-wide notifications
  broadcastToAll(notification) {
    const userIds = Array.from(this.clients.keys());
    this.broadcast(userIds, notification);
  }

  // Get active connection statistics
  getStats() {
    return {
      totalConnections: this.connectionCount,
      activeUsers: Array.from(this.clients.keys()),
      timestamp: new Date().toISOString(),
    };
  }

  // Health check for connections
  async healthCheck() {
    const deadConnections = [];

    for (const [userId, response] of this.clients.entries()) {
      try {
        // Send a ping to check connection health
        response.write(
          `data: ${JSON.stringify({ type: "ping", timestamp: Date.now() })}\n\n`
        );
      } catch (error) {
        deadConnections.push(userId);
      }
    }

    // Remove dead connections
    deadConnections.forEach((userId) => this.removeClient(userId));

    if (deadConnections.length > 0) {
      logger.info(`Cleaned up ${deadConnections.length} dead SSE connections`);
    }

    return {
      totalConnections: this.connectionCount,
      cleanedUp: deadConnections.length,
    };
  }
}

module.exports = new StreamService();
