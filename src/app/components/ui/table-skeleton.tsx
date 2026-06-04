interface TableSkeletonProps {
  variant?: 'table' | 'grid' | 'users' | 'detailFiles';
  rows?: number;
  columns?: number;
}

function ShimmerBlock({ className, style }: { className: string; style?: Record<string, string> }) {
  return <div className={`table-skeleton-shimmer ${className}`} style={style} />;
}

export function TableSkeleton({
  variant = 'table',
  rows = 10,
  columns = 6,
}: TableSkeletonProps) {
  if (variant === 'users') {
    return (
      <>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            key={`table-skeleton-user-row-${rowIndex}`}
            className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 py-4 border-b border-border items-center"
          >
            <div className="lg:col-span-4 flex items-center gap-3">
              <ShimmerBlock className="hidden lg:block w-4 h-4 rounded-sm" />
              <ShimmerBlock className="w-10 h-10 rounded-full shrink-0" />
              <div className="space-y-2 min-w-0 flex-1">
                <ShimmerBlock className="h-3.5 w-[65%] rounded-md" />
                <ShimmerBlock className="h-3 w-[85%] rounded-md" />
              </div>
            </div>
            <div className="lg:col-span-2">
              <ShimmerBlock className="h-6 w-20 rounded-full" />
            </div>
            <div className="lg:col-span-2">
              <ShimmerBlock className="h-4 w-[75%] rounded-md" />
            </div>
            <div className="lg:col-span-2">
              <ShimmerBlock className="h-4 w-[55%] rounded-md" />
            </div>
            <div className="lg:col-span-2">
              <ShimmerBlock className="h-4 w-[70%] rounded-md" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === 'detailFiles') {
    const detailGrid =
      'grid grid-cols-[1rem_minmax(0,1fr)_minmax(168px,200px)_108px] sm:grid-cols-[1rem_minmax(0,1fr)_minmax(184px,220px)_108px] gap-x-3 items-center';
    return (
      <>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            key={`table-skeleton-detail-file-${rowIndex}`}
            className={`${detailGrid} py-3.5 bg-card border-b border-border`}
          >
            <div className="flex items-center justify-center">
              <ShimmerBlock className="w-4 h-4 shrink-0 rounded" />
            </div>
            <div className="min-w-0 space-y-2">
              <ShimmerBlock className="h-4 w-[55%] max-w-md rounded-md" />
              <ShimmerBlock className="h-3 w-[40%] max-w-xs rounded-md" />
            </div>
            <div className="flex min-w-0 items-center gap-1">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center">
                <ShimmerBlock className="h-4 w-4 shrink-0 rounded-full" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <ShimmerBlock className="h-4 w-[78%] rounded-md" />
                <ShimmerBlock className="h-3 w-full rounded-md" />
              </div>
            </div>
            <div className="flex items-center justify-end">
              <ShimmerBlock className="h-9 w-9 shrink-0 rounded-lg" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === 'grid') {
    return (
      <>
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div
            key={`table-skeleton-row-${rowIndex}`}
            className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 py-4 border-b border-border"
          >
            {Array.from({ length: columns }, (_, columnIndex) => (
              <div key={`table-skeleton-cell-${rowIndex}-${columnIndex}`} className="lg:col-span-2">
                <ShimmerBlock className="h-4 w-full rounded-md" />
              </div>
            ))}
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <tr key={`table-skeleton-row-${rowIndex}`} className="border-b border-border">
          {Array.from({ length: columns }, (_, columnIndex) => (
            <td
              key={`table-skeleton-cell-${rowIndex}-${columnIndex}`}
              className="px-6 py-4 align-middle"
            >
              <ShimmerBlock className="h-4 w-full rounded-md" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
