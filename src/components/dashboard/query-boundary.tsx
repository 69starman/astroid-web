'use client';

import type { UseQueryResult } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QueryBoundaryProps<T> {
  query: UseQueryResult<T>;
  /** Skeleton shown while the first fetch is in flight. */
  loading: React.ReactNode;
  /** Rendered with the resolved, non-nullish data. */
  children: (data: T) => React.ReactNode;
  /** Optional custom empty predicate + node (e.g. empty arrays). */
  isEmpty?: (data: T) => boolean;
  empty?: React.ReactNode;
}

/**
 * Standardizes the loading / error / empty / ready states for a query so every
 * page handles them consistently: skeletons while loading, a recoverable error
 * card with retry, an optional illustrated empty state, then the content.
 */
export function QueryBoundary<T>({
  query,
  loading,
  children,
  isEmpty,
  empty,
}: QueryBoundaryProps<T>) {
  if (query.isPending) return <>{loading}</>;

  if (query.isError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-danger/40 bg-danger-soft/30 p-10 text-center">
        <AlertTriangle className="h-8 w-8 text-danger" aria-hidden />
        <div className="flex flex-col gap-1">
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Something went wrong
          </h3>
          <p className="max-w-sm text-xs text-foreground-secondary">
            {query.error instanceof Error
              ? query.error.message
              : 'The data could not be loaded.'}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => query.refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  const data = query.data;
  if (isEmpty && empty && isEmpty(data)) return <>{empty}</>;

  return <>{children(data)}</>;
}
