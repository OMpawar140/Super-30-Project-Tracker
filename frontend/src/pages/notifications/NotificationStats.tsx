import React from 'react';
import type { NotificationStats } from '../../types/notification.types';
import { Bell, CheckCircle, Circle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/CardTwo';
import { cn } from '@/lib/utils';

interface NotificationStatsProps {
  stats: NotificationStats;
}

export const NotificationStatsComponent: React.FC<NotificationStatsProps> = ({ stats }) => {
  const readPercentage = stats.total > 0 ? Math.round((stats.read / stats.total) * 100) : 0;
  const unreadPercentage = stats.total > 0 ? Math.round((stats.unread / stats.total) * 100) : 0;

  const statsItems = [
    {
      title: "Total Notifications",
      value: stats.total,
      icon: Bell,
      color: "text-gray-600 dark:text-gray-400",
      bgColor: "bg-gray-100 dark:bg-gray-800",
      ringColor: "ring-gray-500/20",
      valueColor: "text-gray-900 dark:text-gray-100",
      gradient: "from-gray-500 to-gray-600",
      description: "All notifications",
      trend: null
    },
    {
      title: "Unread",
      value: stats.unread,
      icon: Circle,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      ringColor: "ring-blue-500/20",
      valueColor: "text-blue-600 dark:text-blue-400",
      gradient: "from-blue-500 to-blue-600",
      description: `${unreadPercentage}% unread`,
      trend: stats.unread > 0 ? "attention" : null
    },
    {
      title: "Read",
      value: stats.read,
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
      ringColor: "ring-emerald-500/20",
      valueColor: "text-emerald-600 dark:text-emerald-400",
      gradient: "from-emerald-500 to-emerald-600",
      description: `${readPercentage}% completed`,
      trend: readPercentage > 80 ? "good" : null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statsItems.map((item, index) => {
        const Icon = item.icon;
        const isHighlighted = item.trend === "attention" && item.value > 0;
        
        return (
          <Card 
            key={index}
            className={cn(
              "relative overflow-hidden",
              "backdrop-blur-sm bg-white/80 dark:bg-gray-900/80",
              "border border-gray-200/60 dark:border-gray-700/60",
              isHighlighted && [
                "ring-2 ring-blue-500/20 dark:ring-blue-400/30",
                "border-l-4 border-l-blue-500 dark:border-l-blue-400"
              ]
            )}
          >
            {/* Attention pulse for unread notifications */}
            {isHighlighted && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 animate-pulse" />
            )}

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.title}
              </CardTitle>
              
              {/* Icon container */}
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg ring-2",
                item.bgColor, item.ringColor
              )}>
                <Icon className={cn("h-4 w-4", item.color)} />
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-1">
                {/* Main value */}
                <div className={cn(
                  "text-2xl font-bold",
                  item.valueColor
                )}>
                  {item.value.toLocaleString()}
                  
                  {/* Trend indicator */}
                  {item.trend === "attention" && item.value > 0 && (
                    <span className="ml-2 inline-flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    </span>
                  )}
                  {item.trend === "good" && (
                    <span className="ml-2 inline-flex items-center">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </span>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {item.description}
                </p>
                
                {/* Progress bar for visual representation */}
                {stats.total > 0 && index > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={cn(
                          "h-1.5 rounded-full",
                          `bg-gradient-to-r ${item.gradient}`
                        )}
                        style={{ 
                          width: `${index === 1 ? unreadPercentage : readPercentage}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
