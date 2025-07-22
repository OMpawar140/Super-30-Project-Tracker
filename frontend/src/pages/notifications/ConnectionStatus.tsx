import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected, error }) => {
  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className="text-sm text-muted-foreground dark:text-gray-200">
          Real-time notifications
        </span>
      </div>
      
      <Badge variant={isConnected ? "default" : "secondary"} className="text-xs font-medium dark:text-gray-300">
        {isConnected ? "Connected" : "Disconnected"}
      </Badge>
    </div>
  );
};