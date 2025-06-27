import { NotificationType, type Notification } from '../types/notification.types';
import { startOfDay, startOfWeek, startOfMonth, startOfQuarter, isAfter } from 'date-fns';

export const filterNotificationsByDateRange = (
  notifications: Notification[],
  dateRange: string
): Notification[] => {
  if (dateRange === 'all') return notifications;

  const now = new Date();
  let startDate: Date;

  switch (dateRange) {
    case 'today':
      startDate = startOfDay(now);
      break;
    case 'week':
      startDate = startOfWeek(now);
      break;
    case 'month':
      startDate = startOfMonth(now);
      break;
    case 'quarter':
      startDate = startOfQuarter(now);
      break;
    default:
      return notifications;
  }

  return notifications.filter(notification =>
    isAfter(new Date(notification.createdAt), startDate)
  );
};

export const sortNotificationsByPriority = (notifications: Notification[]): Notification[] => {
  const priorityOrder: Record<NotificationType, number> = {
    [NotificationType.TASK_OVERDUE]: 1,
    [NotificationType.TASK_DUE_REMINDER]: 2,
    [NotificationType.TASK_REJECTED]: 3,
    [NotificationType.TASK_REVIEW_REQUESTED]: 4,
    [NotificationType.TASK_APPROVED]: 5,
    [NotificationType.TASK_STARTED]: 6,
    [NotificationType.PROJECT_MEMBER_ADDED]: 7,
  };

  return [...notifications].sort((a, b) => {
    // Unread notifications first
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }

    // Then by priority
    const aPriority = priorityOrder[a.type] || 999;
    const bPriority = priorityOrder[b.type] || 999;

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Finally by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const getNotificationActionUrl = (notification: Notification): string => {
  if (notification.projectId) {
    return `/projects/${notification.projectId}`;
  }
  if (notification.taskId) {
    return `/tasks/${notification.taskId}`;
  }
  if (notification.taskReviewId) {
    return `/reviews/${notification.taskReviewId}`;
  }
  return '/notifications';
};

export const formatNotificationMessage = (notification: Notification): string => {
  // Add context-specific formatting if needed
  let message = notification.message;

  // Add project/task context if available
  if (notification.project?.name) {
    message = message.replace(/project/gi, `project "${notification.project.name}"`);
  }
  
  if (notification.task?.title) {
    message = message.replace(/task/gi, `task "${notification.task.title}"`);
  }

  return message;
};