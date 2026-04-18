import { cn } from '@/lib/utils';

export type FoodStatus = 'POSTED' | 'MATCHED' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED' | 'EXPIRED';

interface StatusBadgeProps {
  status: FoodStatus;
  className?: string;
}

const statusConfig: Record<FoodStatus, { label: string; className: string }> = {
  POSTED: {
    label: 'Posted',
    className: 'bg-eco-blue/10 text-eco-blue border-eco-blue/20',
  },
  MATCHED: {
    label: 'Matched',
    className: 'bg-harvest-orange/10 text-harvest-orange border-harvest-orange/20',
  },
  ACCEPTED: {
    label: 'Accepted',
    className: 'bg-resq-green/10 text-resq-green border-resq-green/20',
  },
  PICKED_UP: {
    label: 'Picked Up',
    className: 'bg-eco-blue/10 text-eco-blue border-eco-blue/20',
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-resq-green/10 text-resq-green border-resq-green/20',
  },
  EXPIRED: {
    label: 'Expired',
    className: 'bg-alert-red/10 text-alert-red border-alert-red/20',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
