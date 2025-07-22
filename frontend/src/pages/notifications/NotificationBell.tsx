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
  const [bellAnimation, setBellAnimation] = useState(false);
  const [badgeKey, setBadgeKey] = useState(0);

  // Get recent unread notifications (max 5 for dropdown)
  const recentNotifications = useMemo(() => {
    return (notifications ?? []).filter(n => !n.isRead).slice(0, 5);
  }, [notifications]);

  const unreadCount = stats?.unread || 0;

  // Trigger animations when unread count changes
  useEffect(() => {
    if (unreadCount > prevUnreadCount && unreadCount > 0) {
      setBellAnimation(true);
      setBadgeKey(prev => prev + 1); // Force badge re-render for animation
      setTimeout(() => setBellAnimation(false), 1000);
    }
    setPrevUnreadCount(unreadCount);
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`
            relative group p-2 rounded-lg transition-all duration-300 ease-in-out
            hover:bg-gray-100 dark:hover:bg-gray-800
            hover:scale-105 active:scale-95
            ${unreadCount > 0 ? 'animate-pulse' : ''}
            ${bellAnimation ? 'animate-bounce' : ''}
          `}
          aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
        >
          {/* Bell Icon */}
          <Bell 
            className={`
              h-5 w-5 transition-all duration-300 ease-in-out
              group-hover:rotate-12 group-hover:scale-110
              ${unreadCount > 0 
                ? 'text-red-500 drop-shadow-sm filter' 
                : 'text-gray-600 dark:text-gray-400'
              }
              ${bellAnimation ? 'animate-pulse text-red-600' : ''}
            `}
          />
          
          {/* Unread Count Badge */}
          {unreadCount > 0 && (
            <Badge 
              key={badgeKey} // Force re-render for animation
              variant="destructive" 
              className={`
                absolute -top-2 -right-2 h-5 min-w-[20px] px-1 rounded-full
                text-xs flex items-center justify-center font-bold 
                border-2 border-white dark:border-gray-900 shadow-lg
                transform transition-all duration-300 ease-out
                animate-in fade-in-0 zoom-in-50 duration-500
                hover:scale-110 hover:rotate-12
                bg-red-500 hover:bg-red-600 text-white
                ${unreadCount > 99 ? 'text-[10px]' : ''}
              `}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
          
          {/* Connection Status Indicator */}
          <div 
            className={`
              absolute -bottom-1 -right-1 w-3 h-3 rounded-full 
              border-2 border-white dark:border-gray-900
              transition-all duration-300 ease-in-out
              ${isConnected 
                ? 'bg-emerald-500 shadow-emerald-400/50 shadow-sm' 
                : 'bg-amber-500 shadow-amber-400/50 shadow-sm animate-pulse'
              }
            `}
            title={isConnected ? 'Connected' : 'Reconnecting...'}
          />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className={`
          w-80 max-w-[90vw] p-0 shadow-2xl border-0 overflow-hidden
          backdrop-blur-xl bg-white/95 dark:bg-gray-900/95
          ring-1 ring-black/5 dark:ring-white/10
          animate-in fade-in-0 zoom-in-95 duration-200 ease-out
          slide-in-from-top-2
        `} 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-transparent dark:from-blue-900/20 dark:via-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-lg ring-2 ring-blue-500/20">
              <Bell className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'}
                </p>
                {!isConnected && (
                  <Badge 
                    variant="outline" 
                    className="text-[10px] px-1.5 py-0.5 h-auto bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 animate-pulse"
                  >
                    Offline
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge 
                variant="secondary" 
                className={`
                  text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 
                  text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700
                  animate-in fade-in-0 slide-in-from-right-2 duration-300
                `}
              >
                {unreadCount} new
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`
                h-8 w-8 p-0 rounded-lg transition-all duration-200
                hover:bg-gray-100 dark:hover:bg-gray-700 
                hover:scale-105 active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              title="Refresh notifications"
            >
              <RefreshCw 
                className={`
                  h-4 w-4 transition-transform duration-300
                  ${isRefreshing ? 'animate-spin' : 'hover:rotate-180'}
                `} 
              />
            </Button>
          </div>
        </div>
        
        {/* Notifications List */}
        <ScrollArea className="h-96 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/20 dark:to-gray-800/20 pointer-events-none" />
          
          {recentNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4 animate-in fade-in-0 duration-500">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                  <Bell className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="space-y-2 text-center">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    No new notifications
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isConnected ? '🎉 You\'re all caught up!' : '🔄 Connecting...'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {recentNotifications.map((notification, index) => (
                <div 
                  key={`${notification.id}-${notification.updatedAt || notification.createdAt}`}
                  className={`
                    animate-in fade-in-0 slide-in-from-right-2 duration-300 ease-out
                  `}
                  style={{ 
                    animationDelay: `${index * 75}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className={`
                    group relative p-3 rounded-xl cursor-pointer 
                    transition-all duration-200 ease-in-out
                    hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/40
                    dark:hover:from-blue-900/20 dark:hover:to-indigo-900/10
                    hover:translate-x-1 hover:shadow-md hover:shadow-blue-500/10
                    border border-transparent hover:border-blue-200/50 
                    dark:hover:border-blue-700/30
                    ${!notification.isRead 
                      ? 'bg-gradient-to-r from-blue-50/60 to-indigo-50/30 dark:from-blue-900/15 dark:to-indigo-900/10 ring-1 ring-blue-200/30 dark:ring-blue-700/20' 
                      : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                    }
                  `}>
                    {/* Priority indicator line */}
                    <div className={`
                      absolute left-0 top-0 w-1 h-full rounded-l-xl
                      ${notification.priority === 'high' ? 'bg-red-500' : ''}
                      ${notification.priority === 'medium' ? 'bg-yellow-500' : ''}
                      ${notification.priority === 'low' ? 'bg-green-500' : ''}
                      ${!notification.isRead ? 'opacity-100' : 'opacity-30'}
                    `} />
                    
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={(id) => handleNotificationAction(id, 'read')}
                      onDelete={(id) => handleNotificationAction(id, 'delete')}
                    />
                    
                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse ring-2 ring-blue-200 dark:ring-blue-800" />
                    )}
                  </div>
                  
                  {index < recentNotifications.length - 1 && (
                    <Separator className="my-2 opacity-30" />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* View All Button */}
          {notifications && notifications.length > 5 && (
            <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 via-blue-50/20 to-transparent dark:from-gray-800/50 dark:via-blue-900/10">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`
                  w-full h-10 text-sm font-medium rounded-lg
                  bg-gradient-to-r from-blue-50 to-indigo-50 
                  dark:from-blue-900/20 dark:to-indigo-900/20
                  hover:from-blue-100 hover:to-indigo-100 
                  dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30
                  text-blue-700 dark:text-blue-300
                  border border-blue-200/50 dark:border-blue-700/50
                  hover:border-blue-300 dark:hover:border-blue-600
                  transition-all duration-200 ease-in-out
                  hover:scale-[1.01] active:scale-[0.99]
                  hover:shadow-sm hover:shadow-blue-500/20
                  group
                `}
                onClick={handleViewAllClick}
              >
                <span className="flex items-center gap-2">
                  View all {notifications.length} notifications 
                  <span className="transform transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Button>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
