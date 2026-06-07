import { Skeleton } from '@/components/ui/skeleton';

export function MatchCardSkeleton() {
  return (
    <div className="rounded-xl border p-4 space-y-3" aria-hidden>
      <div className="flex justify-between items-start">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export default MatchCardSkeleton;
