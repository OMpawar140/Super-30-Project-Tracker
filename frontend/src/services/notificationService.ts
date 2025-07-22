import type { Notification, NotificationResponse, NotificationStats } from '../types/notification.types';
import { auth } from '../lib/firebase';
import { API_BASE_URL } from './api';

class NotificationService {
  private baseUrl = API_BASE_URL;

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {

    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    const token = await user.getIdToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async getNotifications(params: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  } = {}): Promise<NotificationResponse> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.unreadOnly) queryParams.append('unreadOnly', 'true');

    return this.request<NotificationResponse>(
      `/notifications?${queryParams.toString()}`
    );
  }

  async getStats(): Promise<NotificationStats> {
    return this.request<NotificationStats>('/notifications/stats');
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.request<Notification>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllAsRead(): Promise<{ updated: number }> {
    return this.request<{ updated: number }>('/notifications/read-all', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string): Promise<void> {
    return this.request<void>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }
}

export const notificationService = new NotificationService();