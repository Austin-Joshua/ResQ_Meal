/**
 * Backend connection status indicator
 * Shows real-time API connection status
 */
import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { getHealthCheckUrl } from '@/lib/apiConfig';
import { cn } from '@/lib/utils';

interface BackendStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function BackendStatus({ className, showDetails = false }: BackendStatusProps) {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(getHealthCheckUrl(), {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          mode: 'cors',
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          setStatus('online');
          setError(null);
        } else {
          setStatus('offline');
          setError(null);
        }
      } catch (err: any) {
        setStatus('offline');
        if (err.name === 'AbortError') {
          setError('Connection timeout');
        } else if (err.message?.includes('Failed to fetch') || err.code === 'ERR_NETWORK') {
          setError('Backend not running');
        } else if (err.message?.includes('CORS')) {
          setError('CORS error');
        } else {
          setError(err.message || 'Connection failed');
        }
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  if (!showDetails && status === 'online') {
    return null; // Don't show when online unless details requested
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
        status === 'online'
          ? 'bg-blue-100 text-blue-700 border border-blue-300'
          : status === 'checking'
            ? 'bg-blue-100 text-blue-700 border border-blue-300'
            : 'bg-red-100 text-red-700 border border-red-300',
        className
      )}
    >
      {status === 'checking' && <Loader2 className="w-4 h-4 animate-spin" />}
      {status === 'online' && <CheckCircle2 className="w-4 h-4" />}
      {status === 'offline' && <XCircle className="w-4 h-4" />}
      <span>
        {status === 'checking' && 'Checking API...'}
        {status === 'online' && 'Backend connected'}
        {status === 'offline' && (error ? `Backend offline (${error})` : 'Backend offline')}
      </span>
    </div>
  );
}
