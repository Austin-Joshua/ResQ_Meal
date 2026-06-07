import { ApiError } from '@/api/client';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ApiErrorFallbackProps {
  error: Error;
  onRetry?: () => void;
}

export function ApiErrorFallback({ error, onRetry }: ApiErrorFallbackProps) {
  const isApiError = error instanceof ApiError;
  const title = isApiError ? `Request failed (${error.status})` : 'Something went wrong';
  const message = error.message || 'An unexpected error occurred.';

  return (
    <div
      className="min-h-[200px] flex items-center justify-center p-6"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-6 text-center space-y-4">
        <AlertTriangle className="h-10 w-10 text-red-600 mx-auto" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold text-red-900 dark:text-red-100">{title}</h2>
          <p className="text-sm text-red-700 dark:text-red-200 mt-1">{message}</p>
        </div>
        {onRetry && (
          <Button type="button" variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
