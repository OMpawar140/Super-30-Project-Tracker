import React from 'react';
import { NotificationType } from '../../types/notification.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/CardTwo';
import { CalendarDays, Filter } from 'lucide-react';

interface NotificationFiltersProps {
  selectedType: NotificationType | 'all';
  onTypeChange: (type: NotificationType | 'all') => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  onClearFilters: () => void;
}

const notificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.PROJECT_MEMBER_ADDED]: 'Project Member Added',
  [NotificationType.TASK_APPROVED]: 'Task Approved',
  [NotificationType.TASK_REJECTED]: 'Task Rejected',
  [NotificationType.TASK_REVIEW_REQUESTED]: 'Review Requested',
  [NotificationType.TASK_STARTED]: 'Task Started',
  [NotificationType.TASK_OVERDUE]: 'Task Overdue',
  [NotificationType.TASK_DUE_REMINDER]: 'Due Reminder',
};

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  selectedType,
  onTypeChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
}) => {
  const hasActiveFilters = selectedType !== 'all' || dateRange !== 'all';

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Notification Type Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">
              Notification Type
            </label>
            <Select
              value={selectedType}
              onValueChange={(value: string) => onTypeChange(value as NotificationType | 'all')}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(notificationTypeLabels).map(([type, label]) => (
                  <SelectItem key={type} value={type}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">
              <CalendarDays className="h-4 w-4 inline mr-1" />
              Date Range
            </label>
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {selectedType !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {notificationTypeLabels[selectedType as NotificationType]}
                <button
                  onClick={() => onTypeChange('all')}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
            {dateRange !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                {dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}
                <button
                  onClick={() => onDateRangeChange('all')}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};