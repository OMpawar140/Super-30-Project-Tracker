import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from '@/pages/notifications/NotificationItem';
import { NotificationStatsComponent } from '@/pages/notifications/NotificationStats';
import { ConnectionStatus } from '@/pages/notifications/ConnectionStatus';
import { Loader2, CheckCheck, Search, Filter, Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/CardTwo';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const NotificationsPage: React.FC = () => {
  const {
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
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Ensure notifications is always an array
  const safeNotifications = notifications || [];

  // Filter notifications based on search term and active tab
  const filteredNotifications = safeNotifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'unread' && !notification.isRead) ||
      (activeTab === 'read' && notification.isRead);
    
    return matchesSearch && matchesTab;
  });

  const unreadNotifications = safeNotifications.filter(n => !n.isRead);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title and Description */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-lg ring-2 ring-blue-500/20">
                  <Bell className="w-6 h-6 text-white drop-shadow-sm" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Notifications
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Stay updated with your latest activities
                  </p>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              {unreadNotifications.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                  className="gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                  <Badge variant="secondary" className="ml-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {unreadNotifications.length}
                  </Badge>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <ConnectionStatus isConnected={isConnected} error={error} />
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="mb-6">
            <NotificationStatsComponent stats={stats} />
          </div>
        )}

        {/* Search and Filter Card */}
        <Card className="mb-6 backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-800 dark:text-gray-200">
              <Filter className="w-5 h-5" />
              Filter & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notifications by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:text-gray-300"
                />
              </div>
              
              {/* Filter Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm dark:text-gray-300">
                <TabsList className="grid w-full grid-cols-3 sm:w-auto bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <TabsTrigger 
                    value="all"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <span className="flex items-center gap-2">
                      All
                      <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                        {safeNotifications.length}
                      </Badge>
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="unread"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <span className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      Unread
                      {unreadNotifications.length > 0 && (
                        <Badge variant="destructive" className="bg-red-500 text-white">
                          {unreadNotifications.length}
                        </Badge>
                      )}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="read"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all duration-200"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3" />
                      Read
                      <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                        {safeNotifications.length - unreadNotifications.length}
                      </Badge>
                    </span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Quick Stats */}
            {filteredNotifications.length !== safeNotifications.length && (
              <div className="mt-4 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Showing {filteredNotifications.length} of {safeNotifications.length} notifications
                  {searchTerm && (
                    <span className="ml-1">
                      matching "<span className="font-medium">{searchTerm}</span>"
                    </span>
                  )}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading && safeNotifications.length === 0 ? (
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="py-16">
                <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in-0 duration-500">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 animate-ping opacity-20"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Loading notifications...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please wait while we fetch your updates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className="backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border-gray-200/50 dark:border-gray-700/50">
              <CardContent className="py-16">
                <div className="text-center space-y-4 animate-in fade-in-0 duration-500">
                  <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                    <Bell className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {searchTerm ? 'No matching notifications' : 'No notifications yet'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                      {searchTerm 
                        ? `No notifications match "${searchTerm}". Try adjusting your search terms or filters.`
                        : 'When you receive notifications, they will appear here. Stay tuned for updates!'
                      }
                    </p>
                    {searchTerm && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSearchTerm('')}
                        className="mt-4 bg-white/50 dark:bg-gray-800/50"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Notification Items */}
              <div className="space-y-3">
                {filteredNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out"
                    style={{ 
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    <div className="group relative">
                      {/* Notification Item Container */}
                      <div className="relative overflow-hidden rounded-xl backdrop-blur-sm bg-white/70 dark:bg-gray-900/70 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                        {/* Priority Indicator */}
                        {!notification.isRead && (
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600 rounded-l-xl" />
                        )}
                        
                        <NotificationItem
                          notification={notification}
                          onMarkAsRead={markAsRead}
                          onDelete={deleteNotification}
                        />
                      </div>
                      
                      {/* Hover Shadow Effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load More Section */}
              {hasMore && !searchTerm && (
                <div className="flex justify-center pt-8 animate-in fade-in-0 duration-500">
                  <div className="text-center space-y-4">
                    <Button 
                      variant="outline" 
                      onClick={loadMore}
                      disabled={isLoading}
                      className="gap-2 px-8 py-3 h-auto bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-200 hover:scale-105 disabled:scale-100"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                      {isLoading ? 'Loading...' : 'Load More Notifications'}
                    </Button>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {safeNotifications.length} notifications loaded
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Stats */}
        {safeNotifications.length > 0 && (
          <div className="mt-12 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {filteredNotifications.length} shown
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  {unreadNotifications.length} unread
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {safeNotifications.length - unreadNotifications.length} read
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
