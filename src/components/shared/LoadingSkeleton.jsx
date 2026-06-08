export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-subtle space-y-3">
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-8 w-1/2" />
      <div className="flex gap-4">
        <div className="skeleton h-6 w-16" />
        <div className="skeleton h-6 w-16" />
        <div className="skeleton h-6 w-16" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-3 shadow-subtle flex items-center gap-3">
          <div className="skeleton w-10 h-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-2/3" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4">
      <CardSkeleton />
      <div className="flex gap-3">
        <div className="skeleton h-16 w-16 rounded-xl" />
        <div className="skeleton h-16 w-16 rounded-xl" />
        <div className="skeleton h-16 w-16 rounded-xl" />
        <div className="skeleton h-16 w-16 rounded-xl" />
      </div>
      <ListSkeleton rows={4} />
    </div>
  );
}