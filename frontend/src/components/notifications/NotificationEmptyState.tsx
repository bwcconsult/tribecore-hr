import { Bell, CheckCircle, Inbox, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

interface EmptyStateProps {
  type?: 'all' | 'unread' | 'error' | 'loading-error';
  onRefresh?: () => void;
  onRetry?: () => void;
  isRetrying?: boolean;
  error?: Error | string | null;
}

export function NotificationEmptyState({
  type = 'all',
  onRefresh,
  onRetry,
  isRetrying = false,
  error,
}: EmptyStateProps) {
  if (type === 'error' || type === 'loading-error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-red-100 rounded-full p-4 mb-4">
          <Bell className="h-12 w-12 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Failed to Load Notifications
        </h3>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          {typeof error === 'string' 
            ? error 
            : error?.message || 'We encountered an error while fetching your notifications. Please try again.'}
        </p>
        
        {import.meta.env.DEV && error && (
          <div className="bg-gray-100 rounded-lg p-4 mb-4 max-w-lg w-full">
            <p className="text-xs font-mono text-gray-700 break-all">
              {typeof error === 'string' ? error : error.toString()}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </>
            )}
          </Button>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh}>
              Refresh Page
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (type === 'unread') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-green-100 rounded-full p-4 mb-4">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          You're All Caught Up!
        </h3>
        <p className="text-gray-600 text-center mb-6">
          No unread notifications. Great job staying on top of things!
        </p>
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>
    );
  }

  // type === 'all'
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-blue-100 rounded-full p-4 mb-4">
        <Inbox className="h-12 w-12 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Notifications Yet
      </h3>
      <p className="text-gray-600 text-center mb-6 max-w-md">
        You don't have any notifications at the moment. When there's something important, we'll let you know here.
      </p>
      {onRefresh && (
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Check for New Notifications
        </Button>
      )}
    </div>
  );
}
