const notificationService = require("../services/notificationService");
const logger = require("./logger");

class NotificationTriggers {
  // Trigger when user is added to project
  static async projectMemberAdded(projectData, newMemberEmail) {
    try {
      await notificationService.create({
        type: "PROJECT_MEMBER_ADDED",
        title: "Added to Project",
        message: `You have been added to "${projectData.name}"`,
        userId: newMemberEmail,
        projectId: projectData.id,
        metadata: {
          projectName: projectData.name,
          addedBy: projectData.creator.email,
        },
      });
    } catch (error) {
      logger.error(
        "Error triggering project member added notification:",
        error
      );
    }
  }

  // Trigger when task is approved/rejected
  static async taskReviewCompleted(taskData, reviewData) {
    try {
      const isApproved = reviewData.status === "APPROVED";

      await notificationService.create({
        type: isApproved ? "TASK_APPROVED" : "TASK_REJECTED",
        title: `Task ${reviewData.status}`,
        message: `Your task "${
          taskData.title
        }" has been ${reviewData.status.toLowerCase()}${
          reviewData.comment ? ": " + reviewData.comment : ""
        }`,
        userId: taskData.assigneeId,
        taskId: taskData.id,
        taskReviewId: reviewData.id,
        projectId: taskData.milestone.projectId,
        metadata: {
          taskTitle: taskData.title,
          reviewComment: reviewData.comment,
          reviewedBy: reviewData.reviewerId,
        },
      });
    } catch (error) {
      logger.error(
        "Error triggering task review completed notification:",
        error
      );
    }
  }

  // Trigger when task is submitted for review
  static async taskReviewRequested(taskData, reviewerEmails) {
    try {
      const notifications = reviewerEmails.map((reviewerEmail) => ({
        type: "TASK_REVIEW_REQUESTED",
        title: "Review Required",
        message: `"${taskData.title}" is ready for review`,
        userId: reviewerEmail,
        taskId: taskData.id,
        projectId: taskData.milestone.projectId,
        metadata: {
          taskTitle: taskData.title,
          submittedBy: taskData.assigneeId,
          projectName: taskData.milestone.project.name,
        },
      }));

      await notificationService.createBulk(notifications);
    } catch (error) {
      logger.error(
        "Error triggering task review requested notification:",
        error
      );
    }
  }

  // Trigger when task is started
  static async taskStarted(taskData, projectCreatorEmail) {
    try {
      await notificationService.create({
        type: "TASK_STARTED",
        title: "Task Started",
        message: `"${taskData.title}" has been started by ${taskData.assignee.email}`,
        userId: projectCreatorEmail,
        taskId: taskData.id,
        projectId: taskData.milestone.projectId,
        metadata: {
          taskTitle: taskData.title,
          startedBy: taskData.assigneeId,
          projectName: taskData.milestone.project.name,
        },
      });
    } catch (error) {
      logger.error("Error triggering task started notification:", error);
    }
  }

  // Trigger when task becomes overdue
  static async taskOverdue(taskData) {
    try {
      const daysPastDue = Math.ceil(
        (new Date() - new Date(taskData.dueDate)) / (1000 * 60 * 60 * 24)
      );

      await notificationService.create({
        type: "TASK_OVERDUE",
        title: "Task Overdue",
        message: `"${taskData.title}" is now ${daysPastDue} day(s) overdue`,
        userId: taskData.assigneeId,
        taskId: taskData.id,
        projectId: taskData.milestone.projectId,
        metadata: {
          taskTitle: taskData.title,
          daysPastDue,
          dueDate: taskData.dueDate,
          projectName: taskData.milestone.project.name,
        },
      });
    } catch (error) {
      logger.error("Error triggering task overdue notification:", error);
    }
  }

  // Trigger reminder before task due date
  static async taskDueReminder(taskData, daysUntilDue = 3) {
    try {
      await notificationService.create({
        type: "TASK_DUE_REMINDER",
        title: "Task Due Soon",
        message: `"${taskData.title}" is due in ${daysUntilDue} day(s)`,
        userId: taskData.assigneeId,
        taskId: taskData.id,
        projectId: taskData.milestone.projectId,
        metadata: {
          taskTitle: taskData.title,
          daysUntilDue,
          dueDate: taskData.dueDate,
          projectName: taskData.milestone.project.name,
        },
      });
    } catch (error) {
      logger.error("Error triggering task due reminder notification:", error);
    }
  }

  // Bulk trigger for started tasks (scheduled job)
  static async processStartedTasks(startedTasks) {
    try {
      const notificationsToCreate = [];

      for (const task of startedTasks) {
        // Check if a TASK_STARTED notification already exists for this task and assignee
        const existing = await notificationService.findFirstByTypeTaskUser({
          where: {
            type: "TASK_STARTED",
            taskId: task.id,
            userId: task.assigneeId,
          },
        });

        if (!existing) {
          notificationsToCreate.push({
            type: "TASK_STARTED",
            title: "Task Started",
            message: `"${task.title}" has been started.`,
            userId: task.assigneeId,
            taskId: task.id,
            projectId: task.milestone.projectId,
            metadata: {
              taskTitle: task.title,
              startedBy: task.assigneeId,
              projectName: task.milestone.project.name,
            },
          });
        }
      }

      if (notificationsToCreate.length > 0) {
        await notificationService.createBulk(notificationsToCreate);
        logger.info(
          `Processed ${notificationsToCreate.length} started task notifications`
        );
      }
    } catch (error) {
      logger.error("Error processing started tasks notifications:", error);
    }
  }

  // Bulk trigger for overdue tasks (scheduled job)
  static async processOverdueTasks(overdueTasks) {
    try {
      const notificationsToCreate = [];

      for (const task of overdueTasks) {
        // Check if a TASK_OVERDUE notification already exists for this task and assignee
        const existing = await notificationService.findFirstByTypeTaskUser({
          type: "TASK_OVERDUE",
          taskId: task.id,
          userId: task.assigneeId,
        });

        if (!existing) {
          const daysPastDue = Math.ceil(
            (new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24)
          );

          notificationsToCreate.push({
            type: "TASK_OVERDUE",
            title: "Task Overdue",
            message: `"${task.title}" is now ${daysPastDue} day(s) overdue`,
            userId: task.assigneeId,
            taskId: task.id,
            projectId: task.milestone.projectId,
            metadata: {
              taskTitle: task.title,
              daysPastDue,
              dueDate: task.dueDate,
              projectName: task.milestone.project.name,
            },
          });
        }
      }

      if (notificationsToCreate.length > 0) {
        await notificationService.createBulk(notificationsToCreate);
        logger.info(
          `Processed ${notificationsToCreate.length} overdue task notifications`
        );
      }
    } catch (error) {
      logger.error("Error processing overdue tasks notifications:", error);
    }
  }

  // Bulk trigger for due reminders (scheduled job)
  static async processDueReminders(upcomingTasks, daysUntilDue = 3) {
    try {
      const notificationsToCreate = [];

      for (const task of upcomingTasks) {
        // Check if a TASK_DUE_REMINDER notification already exists for this task and assignee
        const existing = await notificationService.findFirstByTypeTaskUser({
          type: "TASK_DUE_REMINDER",
          taskId: task.id,
          userId: task.assigneeId,
        });

        if (!existing) {
          notificationsToCreate.push({
            type: "TASK_DUE_REMINDER",
            title: "Task Due Soon",
            message: `"${task.title}" is due in ${daysUntilDue} day(s)`,
            userId: task.assigneeId,
            taskId: task.id,
            projectId: task.milestone.projectId,
            metadata: {
              taskTitle: task.title,
              daysUntilDue,
              dueDate: task.dueDate,
              projectName: task.milestone.project.name,
            },
          });
        }
      }

      if (notificationsToCreate.length > 0) {
        await notificationService.createBulk(notificationsToCreate);
        logger.info(
          `Processed ${notificationsToCreate.length} due reminder notifications`
        );
      }
    } catch (error) {
      logger.error("Error processing due reminder notifications:", error);
    }
  }
}

module.exports = NotificationTriggers;
