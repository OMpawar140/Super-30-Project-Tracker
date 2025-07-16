import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationItem } from '@/pages/notifications/NotificationItem';
import { NotificationStatsComponent } from '@/pages/notifications/NotificationStats';
import { ConnectionStatus } from '@/pages/notifications/ConnectionStatus';
import { Loader2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/CardTwo';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  // console.log(notifications);

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        
        <div className="flex items-center gap-2">
          {unreadNotifications.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={markAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Connection Status */}
      <ConnectionStatus isConnected={isConnected} error={error} />

      {/* Stats */}
      {stats && <NotificationStatsComponent stats={stats} />}

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filter Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="all">
                  All ({safeNotifications.length})
                </TabsTrigger>
                <TabsTrigger value="unread">
                  Unread ({unreadNotifications.length})
                </TabsTrigger>
                <TabsTrigger value="read">
                  Read ({safeNotifications.length - unreadNotifications.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading && safeNotifications.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                {searchTerm ? 'No notifications match your search.' : 'No notifications yet.'}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}
            
            {/* Load More Button */}
            {hasMore && !searchTerm && (
              <div className="flex justify-center pt-6">
                <Button 
                  variant="outline" 
                  onClick={loadMore}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;