import { Skeleton } from '@/components/ui/skeleton';

export function FoodPostSkeleton() {
  return (
    <div className="rounded-2xl border p-4 space-y-3" aria-hidden>
      <Skeleton className="h-40 w-full rounded-xl" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export default FoodPostSkeleton;
