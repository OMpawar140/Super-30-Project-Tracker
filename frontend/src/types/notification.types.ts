/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  projectId?: string;
  taskId?: string;
  taskReviewId?: string;
  metadata?: Record<string, any>;
  project?: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    title: string;
  };
  taskReview?: {
    id: string;
    status: string;
  };
}

export type NotificationType =
  | 'PROJECT_MEMBER_ADDED'
  | 'TASK_APPROVED'
  | 'TASK_REJECTED'
  | 'TASK_REVIEW_REQUESTED'
  | 'TASK_STARTED'
  | 'TASK_OVERDUE'
  | 'TASK_DUE_REMINDER';

export const NotificationType = {
  PROJECT_MEMBER_ADDED: 'PROJECT_MEMBER_ADDED',
  TASK_APPROVED: 'TASK_APPROVED',
  TASK_REJECTED: 'TASK_REJECTED',
  TASK_REVIEW_REQUESTED: 'TASK_REVIEW_REQUESTED',
  TASK_STARTED: 'TASK_STARTED',
  TASK_OVERDUE: 'TASK_OVERDUE',
  TASK_DUE_REMINDER: 'TASK_DUE_REMINDER'
} as const;

// Raw stats data structure
export interface NotificationStatsData {
  total: number;
  unread: number;
  read: number;
  byType: Record<NotificationType, number>;
}

// API response structure for stats
export interface NotificationStatsResponse {
  success: boolean;
  message: NotificationStatsData;
  timestamp: string;
  data: string;
}

// For backwards compatibility, keep the original interface
export interface NotificationStats extends NotificationStatsData {
  message(arg0: string, message: any): unknown;
}

export interface NotificationResponse {
  message: any;
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface StreamMessage {
  type: string;
  id?: string;
  title?: string;
  message?: string;
  timestamp?: string;
  [key: string]: any;
}