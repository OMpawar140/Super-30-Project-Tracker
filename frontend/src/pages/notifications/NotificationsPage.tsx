import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, ChevronUp, Eye, Trash2, ExternalLink, Search, Clock, AlertCircle, Info, CheckCircle, Zap, Star, User, Calendar, Tag, Layers } from 'lucide-react';

// Types for notifications
interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'urgent';
  category: 'project' | 'task' | 'system' | 'team' | 'deadline';
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  actionText?: string;
  relatedProject?: string;
  relatedUser?: string;
  metadata?: {
    dueDate?: Date;
    projectId?: string;
    taskId?: string;
    userId?: string;
  };
}

// Sample notifications data
const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Project Deadline Approaching',
    message: 'E-commerce Platform Redesign project is due in 3 days. Several tasks are still pending completion. Please review the progress and ensure all deliverables are on track.',
    type: 'warning',
    category: 'deadline',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
    isStarred: true,
    priority: 'high',
    actionUrl: '/projects/1',
    actionText: 'View Project',
    relatedProject: 'E-commerce Platform Redesign',
    metadata: {
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      projectId: '1'
    }
  },
  {
    id: '2',
    title: 'Task Assignment',
    message: 'You have been assigned a new task: "Backend Integration" in the E-commerce Platform Redesign project. The task is scheduled to start next week.',
    type: 'info',
    category: 'task',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: false,
    isStarred: false,
    priority: 'medium',
    actionUrl: '/tasks/t4',
    actionText: 'View Task',
    relatedProject: 'E-commerce Platform Redesign',
    relatedUser: 'Mike Johnson',
    metadata: {
      taskId: 't4',
      projectId: '1'
    }
  },
  {
    id: '3',
    title: 'System Maintenance Scheduled',
    message: 'Scheduled system maintenance will occur this Saturday from 2:00 AM to 6:00 AM EST. All services will be temporarily unavailable during this period.',
    type: 'info',
    category: 'system',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isRead: true,
    isStarred: false,
    priority: 'medium',
    actionUrl: '/system/maintenance',
    actionText: 'View Details',
    metadata: {
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    }
  },
  {
    id: '4',
    title: 'Critical Bug Reported',
    message: 'A critical bug has been reported in the user authentication system. This issue is affecting user login functionality and requires immediate attention.',
    type: 'error',
    category: 'system',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
    isStarred: true,
    priority: 'critical',
    actionUrl: '/bugs/critical-auth-001',
    actionText: 'View Bug Report',
    relatedUser: 'System Monitor'
  },
  {
    id: '5',
    title: 'Milestone Completed',
    message: 'Congratulations! The "Design Phase Complete" milestone has been successfully achieved ahead of schedule. All design deliverables have been approved by stakeholders.',
    type: 'success',
    category: 'project',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    isRead: true,
    isStarred: false,
    priority: 'low',
    actionUrl: '/milestones/m1',
    actionText: 'View Milestone',
    relatedProject: 'E-commerce Platform Redesign',
    metadata: {
      projectId: '1'
    }
  },
  {
    id: '6',
    title: 'Team Meeting Reminder',
    message: 'Weekly team standup meeting is scheduled for tomorrow at 10:00 AM. Please prepare your status updates and any blockers you need to discuss.',
    type: 'info',
    category: 'team',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    isRead: false,
    isStarred: false,
    priority: 'medium',
    actionUrl: '/calendar/meeting-123',
    actionText: 'View Meeting',
    relatedUser: 'Team Lead',
    metadata: {
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  },
  {
    id: '7',
    title: 'Budget Alert',
    message: 'The Mobile App Development project has exceeded 80% of its allocated budget. Please review expenses and consider budget adjustments if necessary.',
    type: 'warning',
    category: 'project',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isRead: true,
    isStarred: false,
    priority: 'high',
    actionUrl: '/projects/2/budget',
    actionText: 'Review Budget',
    relatedProject: 'Mobile App Development',
    metadata: {
      projectId: '2'
    }
  },
  {
    id: '8',
    title: 'Code Review Required',
    message: 'Your code changes for the "Frontend Development" task are ready for review. Please assign a reviewer and ensure all tests are passing.',
    type: 'info',
    category: 'task',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    isRead: false,
    isStarred: false,
    priority: 'medium',
    actionUrl: '/code-review/pr-456',
    actionText: 'View Pull Request',
    relatedUser: 'John Doe',
    metadata: {
      taskId: 't3'
    }
  }
];

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [expandedNotifications, setExpandedNotifications] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [readFilter, setReadFilter] = useState<string>('All');
  // const [isDarkMode] = useState(false);
  const [animatedItems, setAnimatedItems] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      notifications.forEach((notification, index) => {
        setTimeout(() => {
          setAnimatedItems(prev => [...prev, notification.id]);
        }, index * 100);
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [notifications]);

  // useEffect(() => {
  //   if (isDarkMode) {
  //     document.documentElement.classList.add('dark');
  //   } else {
  //     document.documentElement.classList.remove('dark');
  //   }
  // }, [isDarkMode]);

  const toggleNotificationExpansion = (notificationId: string) => {
    setExpandedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
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

  const markAsUnread = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: false }
          : notification
      )
    );
  };

  const toggleStar = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isStarred: !notification.isStarred }
          : notification
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  };

  const handleActionClick = (notification: Notification) => {
    if (notification.actionUrl) {
      console.log(`Redirecting to: ${notification.actionUrl}`);
      alert(`Redirecting to: ${notification.actionUrl}\nAction: ${notification.actionText}`);
      markAsRead(notification.id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="w-5 h-5" />;
      case 'warning': return <AlertCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'urgent': return <Zap className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50';
      case 'warning': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50';
      case 'error': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50';
      case 'success': return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/50';
      case 'urgent': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700/50';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50 to-transparent dark:from-red-900/10';
      case 'high': return 'border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-transparent dark:from-amber-900/10';
      case 'medium': return 'border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/10';
      case 'low': return 'border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 to-transparent dark:from-emerald-900/10';
      default: return 'border-l-4 border-l-gray-500 bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-900/10';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || notification.type === typeFilter;
    const matchesCategory = categoryFilter === 'All' || notification.category === categoryFilter;
    const matchesRead = readFilter === 'All' || 
                       (readFilter === 'Read' && notification.isRead) ||
                       (readFilter === 'Unread' && !notification.isRead);
    
    return matchesSearch && matchesType && matchesCategory && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const starredCount = notifications.filter(n => n.isStarred).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      <style >{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-down {
          from { height: 0; opacity: 0; }
          to { height: auto; opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }
        .glass-morphism {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .dark .glass-morphism {
          background: rgba(17, 24, 39, 0.8);
          border: 1px solid rgba(55, 65, 81, 0.3);
        }
      `}</style>

      {/* Header */}
      <div className="sticky top-0 z-50 glass-morphism border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center pulse-glow font-semibold">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Stay updated with your latest activities</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="hidden sm:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">{unreadCount} unread</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="font-medium">{starredCount} starred</span>
                </div>
              </div>
              
              {/* Mark All Read Button */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                >
                  Mark all read
                </button>
              )}
              
              {/* Theme Toggle */}
              {/* <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 text-gray-600 dark:text-gray-300 hover:scale-105"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-morphism rounded-2xl shadow-lg p-6 mb-8 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
                className="appearance-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
              >
                <option value="All">All Status</option>
                <option value="Unread">Unread</option>
                <option value="Read">Read</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
              >
                <option value="All">All Types</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="success">Success</option>
                <option value="urgent">Urgent</option>
              </select>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 hover:bg-white/70 dark:hover:bg-gray-800/70"
              >
                <option value="All">All Categories</option>
                <option value="project">Project</option>
                <option value="task">Task</option>
                <option value="system">System</option>
                <option value="team">Team</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 opacity-50">
                <Bell className="w-full h-full text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications found</h3>
              <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`glass-morphism rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 hover:shadow-xl hover:scale-[1.01] ${
                  animatedItems.includes(notification.id) 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform translate-y-4'
                } ${!notification.isRead ? 'ring-2 ring-blue-200 dark:ring-blue-800/50' : ''}`}
              >
                {/* Notification Header */}
                <div className={`p-6 ${getPriorityColor(notification.priority)} rounded-t-2xl`}>
                  <div className="flex items-start gap-4">
                    {/* Type Icon */}
                    <div className={`flex-shrink-0 p-3 rounded-xl ${getTypeColor(notification.type)} border shadow-sm`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            )}
                            {notification.isStarred && (
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {formatTimeAgo(notification.timestamp)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4" />
                              <span className="capitalize">{notification.category}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4" />
                              <span className="capitalize font-medium">{notification.priority}</span>
                            </div>
                          </div>
                          
                          {/* Preview of message */}
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            {notification.message.length > 120 
                              ? `${notification.message.substring(0, 120)}...` 
                              : notification.message
                            }
                          </p>
                          
                          {/* Related info */}
                          {(notification.relatedProject || notification.relatedUser) && (
                            <div className="flex items-center gap-6 mt-3 text-xs">
                              {notification.relatedProject && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
                                  <Layers className="w-3 h-3" />
                                  <span className="font-medium">{notification.relatedProject}</span>
                                </div>
                              )}
                              {notification.relatedUser && (
                                <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 rounded-full">
                                  <User className="w-3 h-3" />
                                  <span className="font-medium">{notification.relatedUser}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStar(notification.id)}
                            className={`p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 ${
                              notification.isStarred ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'
                            }`}
                            title={notification.isStarred ? 'Unstar' : 'Star'}
                          >
                            <Star className={`w-4 h-4 ${notification.isStarred ? 'fill-current' : ''}`} />
                          </button>
                          
                          <button
                            onClick={() => notification.isRead ? markAsUnread(notification.id) : markAsRead(notification.id)}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110"
                            title={notification.isRead ? 'Mark as unread' : 'Mark as read'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:scale-110"
                            title="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => toggleNotificationExpansion(notification.id)}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:scale-110"
                            title="Toggle details"
                          >
                            {expandedNotifications.includes(notification.id) ? 
                              <ChevronUp className="w-4 h-4" /> : 
                              <ChevronDown className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedNotifications.includes(notification.id) && (
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-6 animate-slide-down bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/30 rounded-b-2xl">
                    <div className="space-y-6">
                      {/* Full Message */}
                      <div className="bg-white/50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/30">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4 text-blue-500" />
                          Full Message
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {notification.message}
                        </p>
                      </div>

                      {/* Metadata */}
                      {notification.metadata && (
                        <div className="bg-white/50 dark:bg-gray-800/30 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/30">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-purple-500" />
                            Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {notification.metadata.dueDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-red-500" />
                                <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {notification.metadata.dueDate.toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {notification.metadata.projectId && (
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-500" />
                                <span className="text-gray-600 dark:text-gray-400">Project ID:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {notification.metadata.projectId}
                                </span>
                              </div>
                            )}
                            {notification.metadata.taskId && (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-gray-600 dark:text-gray-400">Task ID:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {notification.metadata.taskId}
                                </span>
                              </div>
                            )}
                            {notification.metadata.userId && (
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-orange-500" />
                                <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {notification.metadata.userId}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        {notification.actionUrl && (
                          <button
                            onClick={() => handleActionClick(notification)}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {notification.actionText || 'View Details'}
                          </button>
                        )}
                        
                        <button
                          onClick={() => notification.isRead ? markAsUnread(notification.id) : markAsRead(notification.id)}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-300 hover:scale-105"
                        >
                          <Eye className="w-4 h-4" />
                          {notification.isRead ? 'Mark as Unread' : 'Mark as Read'}
                        </button>
                        
                        <button
                          onClick={() => toggleStar(notification.id)}
                          className={`flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-xl transition-all duration-300 hover:scale-105 ${
                            notification.isStarred 
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                              : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${notification.isStarred ? 'fill-current' : ''}`} />
                          {notification.isStarred ? 'Unstar' : 'Star'}
                        </button>
                      </div>

                      {/* Timestamp Details */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200/50 dark:border-gray-700/30">
                        <div className="flex items-center justify-between">
                          <span>Created: {notification.timestamp.toLocaleString()}</span>
                          <span>Priority: <span className="capitalize font-medium">{notification.priority}</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50 text-sm text-gray-500 dark:text-gray-400">
            <Bell className="w-4 h-4" />
            <span>Showing {filteredNotifications.length} of {notifications.length} notifications</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;