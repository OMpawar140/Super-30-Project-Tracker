import React, { useState, useEffect, useMemo } from 'react';
import { Bell, RefreshCw } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from '@/pages/notifications/NotificationItem';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface NotificationBellProps {
  onNotificationClick?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
  onNotificationClick 
}) => {
  const { 
    notifications, 
    stats, 
    markAsRead, 
    deleteNotification, 
    refreshNotifications,
    isConnected 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);

  // Get recent unread notifications (max 5 for dropdown)
  const recentNotifications = useMemo(() => {
    return (notifications ?? []).filter(n => !n.isRead).slice(0, 5);
  }, [notifications]);

  const unreadCount = stats?.unread || 0;

  // Trigger animation when unread count changes


  useEffect(() => {
    if (unreadCount !== prevUnreadCount) {
      setPrevUnreadCount(unreadCount);
    }
  }, [unreadCount, prevUnreadCount]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotifications();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewAllClick = () => {
    setIsOpen(false);
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  const handleNotificationAction = async (notificationId: string, action: 'read' | 'delete') => {
    try {
      if (action === 'read') {
        await markAsRead(notificationId);
      } else if (action === 'delete') {
        await deleteNotification(notificationId);
      }
    } catch (error) {
      console.error(`Failed to ${action} notification:`, error);
    }
  };

  return (
    <>
      <style>{`
        @keyframes slide-down-fade {
          from { 
            opacity: 0; 
            transform: translateY(-10px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 16px rgba(239, 68, 68, 0.6); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        @keyframes count-appear {
          from { 
            opacity: 0; 
            transform: scale(0.5); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        @keyframes bell-ring {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }
        .animate-slide-down-fade {
          animation: slide-down-fade 0.3s ease-out forwards;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .animate-bell-ring {
          animation: bell-ring 0.8s ease-in-out;
        }
        .count-appear {
          animation: count-appear 0.3s ease-out forwards;
        }
        .glass-morphism {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .dark .glass-morphism {
          background: rgba(17, 24, 39, 0.95);
          border: 1px solid rgba(55, 65, 81, 0.3);
        }
        .notification-item {
          transition: all 0.2s ease-in-out;
        }
        .notification-item:hover {
          transform: translateX(4px);
          background: rgba(59, 130, 246, 0.03);
        }
        .dark .notification-item:hover {
          background: rgba(59, 130, 246, 0.08);
        }
        .notification-bell {
          position: relative;
        }
        .notification-bell .bell-icon {
          transition: all 0.3s ease;
        }
        .notification-bell:hover .bell-icon {
          transform: rotate(15deg);
        }
        .notification-badge {
          animation: count-appear 0.3s ease-out forwards;
          transition: all 0.2s ease;
        }
        .notification-badge:hover {
          transform: scale(1.1);
        }
        .connection-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid white;
        }
        .connection-indicator.connected {
          background-color: #10b981;
        }
        .connection-indicator.disconnected {
          background-color: #f59e0b;
          animation: pulse 2s infinite;
        }
      `}</style>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`relative notification-bell ${unreadCount > 0 ? 'animate-bounce-subtle' : ''}`}
          >
            <Bell 
              className={`h-5 w-5 bell-icon ${unreadCount > 0 ? 'text-red-500 animate-pulse-glow' : 'text-gray-600 dark:text-gray-400'}`} 
            />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center notification-badge count-appear font-bold border-2 border-white dark:border-gray-800"
                key={unreadCount} // Key ensures re-animation on count change
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
            {/* Connection indicator */}
            <div 
              className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}
              title={isConnected ? 'Connected' : 'Reconnecting...'}
            />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Notifications</h3>
              {!isConnected && (
                <Badge variant="outline" className="text-xs">
                  Offline
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="count-appear">
                  {unreadCount} unread
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
                title="Refresh notifications"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-96">
            {recentNotifications.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No new notifications</p>
                <p className="text-xs mt-1">
                  {isConnected ? 'You\'re all caught up!' : 'Connecting...'}
                </p>
              </div>
            ) : (
              <div className="p-2">
                {recentNotifications.map((notification, index) => (
                  <div key={`${notification.id}-${notification.updatedAt || notification.createdAt}`}>
                    <div className="p-2 hover:bg-muted/50 rounded-md cursor-pointer notification-item">
                      <NotificationItem
                        notification={notification}
                        onMarkAsRead={(id) => handleNotificationAction(id, 'read')}
                        onDelete={(id) => handleNotificationAction(id, 'delete')}
                      />
                    </div>
                    {index < recentNotifications.length - 1 && (
                      <Separator className="my-1" />
                    )}
                  </div>
                ))}
                
                {notifications && notifications.length > 5 && (
                  <div className="p-2 border-t mt-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={handleViewAllClick}
                    >
                      View all {notifications.length} notifications
                    </Button>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </>
  );
};