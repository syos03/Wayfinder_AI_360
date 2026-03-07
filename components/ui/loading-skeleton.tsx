/**
 * Loading Skeleton Components
 * For better loading states
 */

import React from 'react';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`shimmer rounded-md bg-muted ${className}`}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm">
      <Skeleton className="h-48 w-full mb-4 rounded-lg" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div>
      <Skeleton className="h-48 w-full mb-4" />
      <div className="px-4 -mt-16 relative z-10">
        <Skeleton className="h-24 w-24 rounded-full border-4 border-white mb-4" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64 mb-4" />
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-16 w-24" />
          <Skeleton className="h-16 w-24" />
          <Skeleton className="h-16 w-24" />
        </div>
      </div>
    </div>
  );
}





