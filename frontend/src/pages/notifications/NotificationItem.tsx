import React from 'react';
import { type Notification, NotificationType } from '../../types/notification.types';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Play, 
  AlertTriangle, 
  Clock,
  Users,
  MoreVertical,
  Trash2,
  Eye,
  Calendar,
  Tag,
  ExternalLink
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/CardTwo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick?: (notification: Notification) => void;
}

const getNotificationIcon = (type: NotificationType) => {
  const iconMap = {
    [NotificationType.PROJECT_MEMBER_ADDED]: Users,
    [NotificationType.TASK_APPROVED]: CheckCircle,
    [NotificationType.TASK_REJECTED]: XCircle,
    [NotificationType.TASK_REVIEW_REQUESTED]: FileText,
    [NotificationType.TASK_STARTED]: Play,
    [NotificationType.TASK_OVERDUE]: AlertTriangle,
    [NotificationType.TASK_DUE_REMINDER]: Clock,
  };
  
  return iconMap[type] || Bell;
};

const getNotificationTheme = (type: NotificationType) => {
  const themeMap = {
    [NotificationType.PROJECT_MEMBER_ADDED]: {
      icon: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-700',
      accent: 'from-blue-500 to-blue-600',
      ring: 'ring-blue-500/20'
    },
    [NotificationType.TASK_APPROVED]: {
      icon: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      border: 'border-emerald-200 dark:border-emerald-700',
      accent: 'from-emerald-500 to-emerald-600',
      ring: 'ring-emerald-500/20'
    },
    [NotificationType.TASK_REJECTED]: {
      icon: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-700',
      accent: 'from-red-500 to-red-600',
      ring: 'ring-red-500/20'
    },
    [NotificationType.TASK_REVIEW_REQUESTED]: {
      icon: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      border: 'border-amber-200 dark:border-amber-700',
      accent: 'from-amber-500 to-amber-600',
      ring: 'ring-amber-500/20'
    },
    [NotificationType.TASK_STARTED]: {
      icon: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      border: 'border-purple-200 dark:border-purple-700',
      accent: 'from-purple-500 to-purple-600',
      ring: 'ring-purple-500/20'
    },
    [NotificationType.TASK_OVERDUE]: {
      icon: 'text-red-700 dark:text-red-300',
      bg: 'bg-red-100 dark:bg-red-900/40',
      border: 'border-red-300 dark:border-red-600',
      accent: 'from-red-600 to-red-700',
      ring: 'ring-red-500/30'
    },
    [NotificationType.TASK_DUE_REMINDER]: {
      icon: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-700',
      accent: 'from-yellow-500 to-yellow-600',
      ring: 'ring-yellow-500/20'
    },
  };
  
  return themeMap[type] || {
    icon: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    border: 'border-gray-200 dark:border-gray-700',
    accent: 'from-gray-500 to-gray-600',
    ring: 'ring-gray-500/20'
  };
};

const getPriorityConfig = (type: NotificationType) => {
  if (type === NotificationType.TASK_OVERDUE) {
    return {
      badge: <Badge variant="destructive" className="text-xs font-medium animate-pulse">🚨 Urgent</Badge>,
      priority: 'urgent'
    };
  }
  if (type === NotificationType.TASK_DUE_REMINDER) {
    return {
      badge: <Badge variant="secondary" className="text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">⏰ Reminder</Badge>,
      priority: 'normal'
    };
  }
  if (type === NotificationType.TASK_APPROVED) {
    return {
      badge: <Badge variant="secondary" className="text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200">✅ Success</Badge>,
      priority: 'normal'
    };
  }
  return { badge: null, priority: 'normal' };
};

const getTypeLabel = (type: NotificationType) => {
  const labelMap = {
    [NotificationType.PROJECT_MEMBER_ADDED]: 'Team Update',
    [NotificationType.TASK_APPROVED]: 'Task Approved',
    [NotificationType.TASK_REJECTED]: 'Task Rejected',
    [NotificationType.TASK_REVIEW_REQUESTED]: 'Review Requested',
    [NotificationType.TASK_STARTED]: 'Task Started',
    [NotificationType.TASK_OVERDUE]: 'Overdue Alert',
    [NotificationType.TASK_DUE_REMINDER]: 'Due Reminder',
  };
  
  return labelMap[type] || 'Notification';
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick
}) => {
  const Icon = getNotificationIcon(notification.type);
  const theme = getNotificationTheme(notification.type);
  const { badge: priorityBadge, priority } = getPriorityConfig(notification.type);
  const typeLabel = getTypeLabel(notification.type);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  return (
    <Card 
      className={cn(
        // Remove the group class and separate hover states
        "relative overflow-hidden transition-all duration-300 ease-out cursor-pointer",
        "backdrop-blur-sm bg-white/80 dark:bg-gray-900/80",
        "border border-gray-200/60 dark:border-gray-700/60",
        "hover:shadow-lg hover:shadow-gray-500/10 dark:hover:shadow-black/20",
        "hover:scale-[1.01] hover:-translate-y-0.5",
        "active:scale-[0.99] active:translate-y-0",
        !notification.isRead && [
          "ring-2 ring-blue-500/20 dark:ring-blue-400/30",
          "bg-gradient-to-r from-blue-50/80 via-white/80 to-white/80",
          "dark:from-blue-950/40 dark:via-gray-900/80 dark:to-gray-900/80",
          "border-l-4 border-l-blue-500 dark:border-l-blue-400"
        ],
        priority === 'urgent' && [
          "ring-2 ring-red-500/30",
          "bg-gradient-to-r from-red-50/80 via-white/80 to-white/80",
          "dark:from-red-950/40 dark:via-gray-900/80 dark:to-gray-900/80"
        ]
      )}
      onClick={handleClick}
    >
      {/* Animated background gradient */}
      <div className={cn(
        "absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none",
        "bg-gradient-to-r", theme.accent, "opacity-[0.02]"
      )} />
      
      {/* Priority stripe animation for urgent notifications */}
      {priority === 'urgent' && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 animate-pulse pointer-events-none" />
      )}

      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon Container - Create separate hover group */}
          <div className="flex-shrink-0 relative group">
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl shadow-sm ring-2",
              theme.bg, theme.ring,
              "group-hover:scale-110 group-hover:rotate-3 transition-all duration-200"
            )}>
              <Icon className={cn("w-5 h-5", theme.icon)} />
            </div>
            
            {/* Unread indicator */}
            {!notification.isRead && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse ring-2 ring-white dark:ring-gray-900" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                {/* Header */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs font-medium px-2 py-0.5 h-auto  dark:text-gray-300",
                      theme.border, theme.bg
                    )}
                  >
                    {typeLabel}
                  </Badge>
                  {priorityBadge}
                  {!notification.isRead && (
                    <div className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      New
                    </div>
                  )}
                </div>
                
                {/* Title */}
                <h4 className={cn(
                  "text-sm leading-relaxed",
                  !notification.isRead 
                    ? "font-semibold text-gray-900 dark:text-white" 
                    : "font-medium text-gray-700 dark:text-gray-300"
                )}>
                  {notification.title}
                </h4>
                
                {/* Message */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {notification.message}
                </p>
                
                {/* Metadata */}
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 pt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {notification.project && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      <span className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                        {notification.project.name}
                      </span>
                    </div>
                  )}
                  
                  {notification.task && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span className="truncate max-w-32" title={notification.task.title}>
                        {notification.task.title}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions - Create separate hover group and isolate hover state */}
              <div className="flex-shrink-0 group">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn(
                        "h-8 w-8 p-0 rounded-lg transition-all duration-200",
                        "opacity-0 group-hover:opacity-100",
                        "hover:bg-gray-100 dark:hover:bg-gray-700",
                        "hover:scale-110 active:scale-95",
                        "focus:opacity-100 relative z-10"
                      )}
                      onClick={(e) => e.stopPropagation()}
                      onMouseEnter={(e) => e.stopPropagation()}
                      onMouseLeave={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-48 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95 border-gray-200/60 dark:border-gray-700/60 z-50"
                    onMouseEnter={(e) => e.stopPropagation()}
                    onMouseLeave={(e) => e.stopPropagation()}
                  >
                    {!notification.isRead && (
                      <>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notification.id);
                          }}
                          className="gap-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors focus:bg-blue-50 dark:focus:bg-blue-900/20"
                        >
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span>Mark as read</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    
                    {onClick && (
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onClick(notification);
                        }}
                        className="gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:bg-gray-50 dark:focus:bg-gray-800"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                        <span>View details</span>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(notification.id);
                      }}
                      className="gap-2 cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:bg-red-50 dark:focus:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete notification</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons for mobile */}
        <div className="md:hidden flex items-center gap-2 mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
          {!notification.isRead && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="flex-1 gap-2 h-8 text-xs"
            >
              <Eye className="h-3 w-3" />
              Mark read
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="gap-2 h-8 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
