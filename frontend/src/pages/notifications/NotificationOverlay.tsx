import { useState, useEffect, useRef } from 'react';
import { Bell, X, Eye, Clock, AlertCircle, Info, CheckCircle, Zap, ExternalLink, Settings, MoreHorizontal } from 'lucide-react';
import { HiBell } from 'react-icons/hi';

// Sample notifications data (condensed for overlay)
const sampleNotifications = [
  {
    id: '1',
    title: 'Project Deadline Approaching',
    message: 'E-commerce Platform Redesign project is due in 3 days. Several tasks are still pending completion.',
    type: 'warning',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
    priority: 'high',
    avatar: '🚨'
  },
  {
    id: '2',
    title: 'Task Assignment', 
    message: 'You have been assigned a new task: "Backend Integration" in the E-commerce Platform.',
    type: 'info',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: false,
    priority: 'medium',
    avatar: '📋'
  },
  {
    id: '3',
    title: 'Critical Bug Reported',
    message: 'A critical bug has been reported in the user authentication system affecting login functionality.',
    type: 'error',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
    priority: 'critical',
    avatar: '🐛'
  },
  {
    id: '4',
    title: 'Milestone Completed',
    message: 'The "Design Phase Complete" milestone has been successfully achieved ahead of schedule.',
    type: 'success',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isRead: true,
    priority: 'low',
    avatar: '🎉'
  },
  {
    id: '5',
    title: 'Team Meeting Reminder',
    message: 'Weekly team standup meeting is scheduled for tomorrow at 10:00 AM.',
    type: 'info',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isRead: false,
    priority: 'medium',
    avatar: '👥'
  }
];


const NotificationOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [animateIn, setAnimateIn] = useState(false);
  const overlayRef = useRef(null);
  const buttonRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (isOpen) {
      setAnimateIn(true);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        overlayRef.current &&
        !(overlayRef.current as HTMLElement).contains(event.target as Node) &&
        buttonRef.current &&
        !(buttonRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setIsOpen(false);
        setAnimateIn(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'urgent': return <Zap className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'warning': return 'text-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'error': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'success': return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      case 'urgent': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-red-500';
      case 'high': return 'border-l-amber-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-emerald-500';
      default: return 'border-l-gray-500';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div className="relative">
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
        .animate-slide-down-fade {
          animation: slide-down-fade 0.3s ease-out forwards;
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
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
      `}</style>

      {/* Notification Bell Button - Using your existing styles */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 cursor-pointer"
      >
        <HiBell className={`h-6 w-6 ${isOpen ? 'animate-bounce-subtle' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-medium animate-pulse-glow select-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Overlay */}
      {isOpen && (
      <div
      ref={overlayRef}
            className={`fixed right-4 top-16 w-96 max-w-sm glass-morphism rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-[9999] ${
                animateIn ? 'animate-slide-down-fade' : 'opacity-0'
            }`}
            >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {unreadCount} unread messages
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto z-50">
            {notifications.slice(0, 5).map((notification, index) => (
              <div
                key={notification.id}
                className={`notification-item p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                  index !== notifications.length - 1 ? 'border-b border-gray-100 dark:border-gray-700/50' : ''
                } ${!notification.isRead ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar/Icon */}
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-xl ${getTypeColor(notification.type)} shadow-sm`}>
                      {getTypeIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-semibold truncate ${
                            !notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notification.timestamp)}
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500 transition-colors"
                                title="Mark as read"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              title="More options"
                            >
                              <MoreHorizontal className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/30">
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium">
                View all
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationOverlay;