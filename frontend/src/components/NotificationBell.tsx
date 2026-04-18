import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  darkMode?: boolean;
  className?: string;
}

export function NotificationBell({ darkMode, className }: NotificationBellProps) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative', className)} ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg p-2 sm:p-2.5 text-white/90 transition-colors hover:bg-white/10 hover:text-white relative"
        title="Notifications"
        aria-label={unreadCount ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div
          className={cn(
            'absolute right-0 top-full z-50 mt-1 w-80 max-h-[70vh] overflow-hidden rounded-lg border shadow-xl',
            'bg-[#1e3a5f] border-blue-800/50'
          )}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-blue-800/30">
            <span className="text-sm font-semibold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="text-xs text-[#D4AF37] hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto max-h-[60vh]">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-sm text-white/70 text-center">No notifications yet.</p>
            ) : (
              <ul className="divide-y divide-blue-800/30">
                {notifications.slice(0, 20).map((n) => (
                  <li
                    key={n.id}
                    className={cn(
                      'px-4 py-3 text-left hover:bg-white/5 transition',
                      !n.read_at && 'bg-[#D4AF37]/10'
                    )}
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => {
                        markRead(n.id);
                        if (n.link) {
                          setOpen(false);
                          if (n.link.startsWith('#')) window.location.hash = n.link.slice(1);
                          else window.location.href = n.link;
                        }
                      }}
                    >
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      {n.message && (
                        <p className="text-xs text-white/70 mt-0.5 line-clamp-2">{n.message}</p>
                      )}
                      <p className="text-xs text-white/50 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
