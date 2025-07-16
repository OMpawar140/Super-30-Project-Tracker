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
  Eye
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

const getNotificationColor = (type: NotificationType) => {
  const colorMap = {
    [NotificationType.PROJECT_MEMBER_ADDED]: 'text-blue-500',
    [NotificationType.TASK_APPROVED]: 'text-green-500',
    [NotificationType.TASK_REJECTED]: 'text-red-500',
    [NotificationType.TASK_REVIEW_REQUESTED]: 'text-orange-500',
    [NotificationType.TASK_STARTED]: 'text-purple-500',
    [NotificationType.TASK_OVERDUE]: 'text-red-600',
    [NotificationType.TASK_DUE_REMINDER]: 'text-yellow-500',
  };
  
  return colorMap[type] || 'text-gray-500';
};

const getPriorityBadge = (type: NotificationType) => {
  if (type === NotificationType.TASK_OVERDUE) {
    return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
  }
  if (type === NotificationType.TASK_DUE_REMINDER) {
    return <Badge variant="secondary" className="text-xs">Reminder</Badge>;
  }
  return null;
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onClick
}) => {
  const Icon = getNotificationIcon(notification.type);
  const iconColor = getNotificationColor(notification.type);
  const priorityBadge = getPriorityBadge(notification.type);

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClick?.(notification);
  };

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md cursor-pointer",
        !notification.isRead && "border-l-4 border-l-blue-500 bg-blue-50/50"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn("flex-shrink-0 mt-1", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn(
                    "text-sm font-medium",
                    !notification.isRead && "font-semibold"
                  )}>
                    {notification.title}
                  </h4>
                  {priorityBadge}
                  {!notification.isRead && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {notification.message}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </span>
                  
                  {notification.project && (
                    <>
                      <span>•</span>
                      <span className="font-medium">{notification.project.name}</span>
                    </>
                  )}
                  
                  {notification.task && (
                    <>
                      <span>•</span>
                      <span>{notification.task.title}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!notification.isRead && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onMarkAsRead(notification.id);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Mark as read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notification.id);
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};