import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MlFreshnessBadgeProps {
  source?: string | null;
  className?: string;
}

/** Shows when backend provides an ML freshness `source` field on food posts. */
export function MlFreshnessBadge({ source, className }: MlFreshnessBadgeProps) {
  if (!source) return null;

  const label = source.replace(/_/g, ' ');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
        className
      )}
      title={`Freshness assessed via ${label}`}
    >
      <Sparkles className="h-3 w-3" aria-hidden />
      ML · {label}
    </span>
  );
}
