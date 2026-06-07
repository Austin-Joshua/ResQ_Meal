import { formatDistanceToNow, parseISO } from 'date-fns';

export function formatExpiry(iso: string): string {
  try {
    return parseISO(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function timeUntilExpiry(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return '';
  }
}

export function formatRelativeTime(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true });
  } catch {
    return iso;
  }
}
