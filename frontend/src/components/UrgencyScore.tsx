import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, Flame } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UrgencyScoreProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getUrgencyConfig(score: number) {
  if (score <= 40) {
    return {
      color: 'text-eco-blue',
      bgColor: 'bg-eco-blue/10',
      borderColor: 'border-eco-blue/20',
      label: 'Low Urgency',
      icon: Clock,
    };
  } else if (score <= 70) {
    return {
      color: 'text-harvest-orange',
      bgColor: 'bg-harvest-orange/10',
      borderColor: 'border-harvest-orange/20',
      label: 'Medium Urgency',
      icon: AlertTriangle,
    };
  } else {
    return {
      color: 'text-alert-red',
      bgColor: 'bg-alert-red/10',
      borderColor: 'border-alert-red/20',
      label: 'High Urgency',
      icon: Flame,
    };
  }
}

const sizeConfig = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

export function UrgencyScore({ score, showLabel = true, size = 'md', className }: UrgencyScoreProps) {
  const config = getUrgencyConfig(score);
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border font-medium cursor-help',
            config.bgColor,
            config.borderColor,
            config.color,
            sizeConfig[size],
            className
          )}
        >
          <Icon className={cn(size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')} />
          <span>{score}</span>
          {showLabel && <span className="hidden sm:inline">- {config.label}</span>}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{config.label}</p>
        <p className="text-xs text-muted-foreground">
          Score based on expiry time and food quantity
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
