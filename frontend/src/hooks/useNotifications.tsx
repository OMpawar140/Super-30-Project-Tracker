/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useRef } from 'react';
import type { Notification, NotificationStats, StreamMessage } from '../types/notification.types';
import { notificationService } from '@/services/notificationService';
import { auth } from '../lib/firebase';
import { toast } from 'sonner';
import { API_BASE_URL } from '../services/api'; 


interface UseNotificationsReturn {
  notifications: Notification[];
  stats: NotificationStats | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshNotifications: () => Promise<void>; 
}

// Improved EventSource with headers support
class EventSourceWithHeaders {
  private controller: AbortController | null = null;
  private url: string;
  private headers: Record<string, string>;
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;
  
  public readyState: number = EventSource.CONNECTING;

  constructor(url: string, headers: Record<string, string> = {}) {
    this.url = url;
    this.headers = headers;
    this.connect();
  }

  private async connect() {
    try {
      this.controller = new AbortController();
      
      // console.log('Connecting to SSE with headers:', this.headers);
      
      const response = await fetch(this.url, {
        method: 'GET',
        headers: {
          ...this.headers,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        signal: this.controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      this.readyState = EventSource.OPEN;
      if (this.onopen) {
        this.onopen(new Event('open'));
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('📡 SSE stream ended');
            break;
          }
          
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete lines
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: ')) {
              const data = trimmedLine.slice(6); // Remove 'data: ' prefix
              if (data && this.onmessage) {
                this.onmessage(new MessageEvent('message', { data }));
              }
            }
          }
        }
      } catch (readerError) {
        if (typeof readerError === 'object' && readerError !== null && 'name' in readerError && (readerError as any).name !== 'AbortError') {
          console.error('SSE reader error:', readerError);
          throw readerError;
        }
      }
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'name' in error && (error as any).name === 'AbortError') {
        console.log('SSE connection aborted');
        return;
      }
      
      console.error('SSE connection error:', error);
      this.readyState = EventSource.CLOSED;
      
      if (this.onerror) {
        this.onerror(new Event('error'));
      }
    }
  }

  public close() {
    // console.log('🔌 Closing SSE connection');
    this.readyState = EventSource.CLOSED;
    
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

export const useNotifications = (): UseNotificationsReturn => {
  const apiBaseUrl = `${API_BASE_URL}/api`; 

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState(auth.currentUser);

  // Key fix: Force re-renders by using a separate state for updates
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const forceUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const fetchedToken = await firebaseUser.getIdToken();
          setToken(fetchedToken);
          // console.log('Firebase token obtained');
        } catch (error) {
          console.error('Failed to get Firebase token:', error);
          setError('Authentication failed');
        }
      } else {
        setToken(null);
        console.log('🚪 User signed out');
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize with empty array to prevent undefined errors
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const eventSourceRef = useRef<EventSourceWithHeaders | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Load notification stats with better error handling
  const refreshStats = useCallback(async () => {
    if (!token) return;

    try {
      const statsResponse = await notificationService.getStats();
      
      // Handle the nested response structure
      if (statsResponse?.message) {
        const newStats = statsResponse.message as unknown as NotificationStats;
        setStats(newStats);
        // console.log('Stats refreshed:', newStats);
      } else {
        // Fallback if the response structure is different
        setStats(statsResponse);
        // console.log('Stats refreshed (fallback):', statsResponse);
      }
      
      forceUpdate(); // Force re-render
    } catch (err) {
      console.error('Load stats error:', err);
    }
  }, [token, forceUpdate]);

  // Load initial notifications
  const loadNotifications = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (!token) {
      // console.log('Cannot load notifications: missing token');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await notificationService.getNotifications({
        page: pageNum,
        limit: 20
      });

      // Fix: Access nested structure - notifications are in response.message.notifications
      const notificationsData = response?.message?.notifications || [];
      const paginationData = response?.message?.pagination;

      if (reset) {
        setNotifications(notificationsData);
      } else {
        setNotifications(prev => {
          const currentNotifications = prev || [];
          return [...currentNotifications, ...notificationsData];
        });
      }

      // Fix: Check pagination data from the correct location
      if (paginationData && typeof paginationData.page === 'number' && typeof paginationData.pages === 'number') {
        setHasMore(paginationData.page < paginationData.pages);
        setPage(pageNum);
      } else {
        console.warn('Missing or invalid pagination data in response:', paginationData);
        setHasMore(false);
      }

      // console.log(`Loaded ${notificationsData.length} notifications (page ${pageNum})`);
      forceUpdate(); // Force re-render
    } catch (err) {
      const errorMessage = 'Failed to load notifications';
      setError(errorMessage);
      console.error('Load notifications error:', err);
      toast.error(errorMessage);
      // Ensure notifications is still an array on error
      if (reset) {
        setNotifications([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, forceUpdate]);

  // Add refresh method for manual refresh
  const refreshNotifications = useCallback(async () => {
    await Promise.all([
      loadNotifications(1, true),
      refreshStats()
    ]);
  }, [loadNotifications, refreshStats]);

  // Initialize SSE connection
  const initializeStream = useCallback(() => {
    if (!token || !user) {
      // console.log('Cannot initialize stream: missing token or user');
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      const streamUrl = `${apiBaseUrl}/notifications/stream`;
      // console.log('Connecting to SSE endpoint:', streamUrl);

      const eventSource = new EventSourceWithHeaders(streamUrl, {
        'Authorization': `Bearer ${token}`,
        'accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      });

      eventSource.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        // console.log('Notification stream connected successfully');
      };

      eventSource.onmessage = (event: MessageEvent) => {
        // console.log('Raw SSE message:', event.data);
        
        try {
          const data: StreamMessage = JSON.parse(event.data);
          
          if (data.type === 'connection') {
            // console.log('Stream connection confirmed:', data.message);
            return;
          }

          if (data.type === 'ping') {
            // console.log('Received ping from server');
            return;
          }

          // Handle new notification
          const notification = data as Notification;
          // console.log('New notification received:', notification);
          
          // Update notifications immediately
          setNotifications(prev => {
            const currentNotifications = prev || [];
            const exists = currentNotifications.some(n => n.id === notification.id);
            if (exists) return currentNotifications;
            const newNotifications = [notification, ...currentNotifications];
            // console.log('Updated notifications:', newNotifications.length);
            return newNotifications;
          });
          
          // Update stats immediately and force re-render
          setStats(prev => {
            // Import NotificationType enum or type if not already imported
            // import type { NotificationType } from '../types/notification.types';

            // List all possible notification types here
            const notificationTypes: string[] = [
              'PROJECT_MEMBER_ADDED',
              'TASK_APPROVED',
              'TASK_REJECTED',
              'TASK_REVIEW_REQUESTED',
              'TASK_ASSIGNED',
              'TASK_COMPLETED',
              'GENERAL'
            ];

            const makeStatsWithMessage = (stats: Omit<NotificationStats, 'message'>): NotificationStats => ({
              ...stats,
              message: prev?.message ?? (() => undefined)
            });

            const getDefaultByType = () => {
              const obj: Record<string, number> = {};
              notificationTypes.forEach(type => {
                obj[type] = 0;
              });
              return obj as Record<typeof notificationTypes[number], number>;
            };

            const newStats = prev
              ? makeStatsWithMessage({
                  ...prev,
                  total: prev.total + 1,
                  unread: prev.unread + 1,
                  byType: {
                    ...prev.byType,
                    [notification.type]: (prev.byType[notification.type] || 0) + 1
                  },
                  read: prev.read
                })
              : makeStatsWithMessage({
                  total: 1,
                  unread: 1,
                  read: 0,
                  byType: {
                    ...getDefaultByType(),
                    [notification.type]: 1,
                    PROJECT_MEMBER_ADDED: 0,
                    TASK_APPROVED: 0,
                    TASK_REJECTED: 0,
                    TASK_REVIEW_REQUESTED: 0,
                    TASK_STARTED: 0,
                    TASK_OVERDUE: 0,
                    TASK_DUE_REMINDER: 0
                  }
                });

            // console.log('Updated stats:', newStats);
            return newStats;
          });

          // Force immediate re-render
          forceUpdate();

          // Show toast notification
          toast(notification.title, {
            description: notification.message,
            action: {
              label: 'View',
              onClick: () => {
                if (notification.projectId) {
                  window.location.href = `/projects/${notification.projectId}`;
                } else if (notification.taskId) {
                  window.location.href = `/tasks/${notification.taskId}`;
                }
              }
            }
          });

          // Also refresh from server to ensure consistency
          setTimeout(() => {
            refreshStats();
          }, 1000);

        } catch (err) {
          console.error('Error parsing notification:', err, 'Raw data:', event.data);
        }
      };

      eventSource.onerror = (event: Event) => {
        setIsConnected(false);
        console.error('Notification stream error:', event);
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(Math.pow(2, reconnectAttempts.current) * 1000, 30000);
          // console.log(`Attempting to reconnect in ${delay}ms (${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            initializeStream();
          }, delay);
        } else {
          setError('Failed to connect to notification stream after multiple attempts');
          console.error('Max reconnection attempts reached');
        }
      };

      eventSourceRef.current = eventSource;
      
    } catch (err) {
      console.error('Failed to initialize notification stream:', err);
      setError('Failed to initialize notification stream');
    }
  }, [token, user, apiBaseUrl, forceUpdate, refreshStats]);

  // Load more notifications
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await loadNotifications(page + 1, false);
  }, [hasMore, isLoading, page, loadNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    if (!token) return;

    try {
      await notificationService.markAsRead(id);
      
      setNotifications(prev => {
        const currentNotifications = prev || [];
        const updated = currentNotifications.map(n => n.id === id ? { ...n, isRead: true } : n);
        // console.log('Notification marked as read locally:', id);
        return updated;
      });
      
      setStats(prev => {
        const newStats = prev ? {
          ...prev,
          unread: Math.max(0, prev.unread - 1),
          read: prev.read + 1
        } : null;
        // console.log('Stats updated after mark as read:', newStats);
        return newStats;
      });
      
      forceUpdate(); // Force re-render
      // console.log(`Notification ${id} marked as read`);
    } catch (err) {
      console.error('Mark as read error:', err);
      toast.error('Failed to mark notification as read');
    }
  }, [token, forceUpdate]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      await notificationService.markAllAsRead();
      
      setNotifications(prev => {
        const currentNotifications = prev || [];
        return currentNotifications.map(n => ({ ...n, isRead: true }));
      });
      
      setStats(prev => prev ? {
        ...prev,
        unread: 0,
        read: prev.total
      } : null);

      forceUpdate(); // Force re-render
      toast.success('All notifications marked as read');
      // console.log('All notifications marked as read');
    } catch (err) {
      console.error('Mark all as read error:', err);
      toast.error('Failed to mark all notifications as read');
    }
  }, [token, forceUpdate]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    if (!token) return;

    try {
      await notificationService.deleteNotification(id);
      
      const currentNotifications = notifications || [];
      const notification = currentNotifications.find(n => n.id === id);
      
      setNotifications(prev => {
        const current = prev || [];
        return current.filter(n => n.id !== id);
      });
      
      setStats(prev => {
        if (!prev || !notification) return prev;
        
        return {
          ...prev,
          total: prev.total - 1,
          unread: notification.isRead ? prev.unread : prev.unread - 1,
          read: notification.isRead ? prev.read - 1 : prev.read,
          byType: {
            ...prev.byType,
            [notification.type]: Math.max(0, (prev.byType[notification.type] || 0) - 1)
          }
        };
      });

      forceUpdate(); // Force re-render
      toast.success('Notification deleted');
      // console.log(` Notification ${id} deleted`);
    } catch (err) {
      console.error('Delete notification error:', err);
      toast.error('Failed to delete notification');
    }
  }, [token, notifications, forceUpdate]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      // console.log('🧹 Cleaning up SSE connection');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Initialize on mount and cleanup on unmount
  useEffect(() => {
    if (user && token) {
      // console.log('Initializing notifications system');
      loadNotifications(1, true);
      refreshStats();
      
      const streamTimeout = setTimeout(() => {
        initializeStream();
      }, 1000);

      return () => {
        clearTimeout(streamTimeout);
        cleanup();
      };
    } else {
      // console.log('Waiting for user authentication...');
      cleanup();
    }
  }, [user, token, loadNotifications, refreshStats, initializeStream, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Debug effect to log state changes
  useEffect(() => {
    // State change effect: notifications, stats, isConnected, updateTrigger
    // You can add analytics, debugging, or custom side effects here if needed.
    // For example, you could emit a custom event or call a callback.
  }, [notifications, stats, isConnected, updateTrigger]);

  return {
    notifications,
    stats,
    isConnected,
    isLoading,
    error,
    hasMore,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshStats,
    refreshNotifications
  };
};