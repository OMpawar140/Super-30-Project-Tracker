/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/CardTwo';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { NotificationType } from '../../types/notification.types';
import { Volume2, Bell, Mail, Smartphone } from 'lucide-react';

interface NotificationPreferences {
  soundEnabled: boolean;
  soundVolume: number;
  browserNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  enabledTypes: Record<NotificationType, boolean>;
}

const defaultPreferences: NotificationPreferences = {
  soundEnabled: true,
  soundVolume: 50,
  browserNotifications: true,
  emailNotifications: true,
  pushNotifications: false,
  enabledTypes: {
    [NotificationType.PROJECT_MEMBER_ADDED]: true,
    [NotificationType.TASK_APPROVED]: true,
    [NotificationType.TASK_REJECTED]: true,
    [NotificationType.TASK_REVIEW_REQUESTED]: true,
    [NotificationType.TASK_STARTED]: true,
    [NotificationType.TASK_OVERDUE]: true,
    [NotificationType.TASK_DUE_REMINDER]: true,
  },
};

const notificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.PROJECT_MEMBER_ADDED]: 'Project Member Added',
  [NotificationType.TASK_APPROVED]: 'Task Approved',
  [NotificationType.TASK_REJECTED]: 'Task Rejected',
  [NotificationType.TASK_REVIEW_REQUESTED]: 'Review Requested',
  [NotificationType.TASK_STARTED]: 'Task Started',
  [NotificationType.TASK_OVERDUE]: 'Task Overdue',
  [NotificationType.TASK_DUE_REMINDER]: 'Due Reminder',
};

export const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save preferences to API
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      // Show success message
      console.log('Preferences saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeToggle = (type: NotificationType, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      enabledTypes: {
        ...prev.enabledTypes,
        [type]: enabled,
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            General Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Browser Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Browser Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Show desktop notifications in your browser
              </div>
            </div>
            <Switch
              checked={preferences.browserNotifications}
              onCheckedChange={(checked: any) =>
                setPreferences(prev => ({ ...prev, browserNotifications: checked }))
              }
            />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
              <div className="text-sm text-muted-foreground">
                Receive notifications via email
              </div>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked: any) =>
                setPreferences(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Push Notifications
              </Label>
              <div className="text-sm text-muted-foreground">
                Send push notifications to your mobile device
              </div>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked: any) =>
                setPreferences(prev => ({ ...prev, pushNotifications: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Sound Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label className="text-base">Sound Notifications</Label>
            <Switch
              checked={preferences.soundEnabled}
              onCheckedChange={(checked: any) =>
                setPreferences(prev => ({ ...prev, soundEnabled: checked }))
              }
            />
          </div>

          {preferences.soundEnabled && (
            <div className="space-y-2">
              <Label>Volume: {preferences.soundVolume}%</Label>
              <Slider
                value={[preferences.soundVolume]}
                onValueChange={(value: any[]) =>
                  setPreferences(prev => ({ ...prev, soundVolume: value[0] }))
                }
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <div className="text-sm text-muted-foreground">
            Choose which types of notifications you want to receive
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(notificationTypeLabels).map(([type, label], index) => (
              <div key={type}>
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-normal">{label}</Label>
                  <Switch
                    checked={preferences.enabledTypes[type as NotificationType]}
                    onCheckedChange={(checked: boolean) =>
                      handleTypeToggle(type as NotificationType, checked)
                    }
                  />
                </div>
                {index < Object.entries(notificationTypeLabels).length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};