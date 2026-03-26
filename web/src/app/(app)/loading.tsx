export default function AppLoading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6 space-y-6">
      {/* Title skeleton */}
      <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />

      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border/50 p-4">
            <div className="h-8 w-16 mx-auto animate-pulse rounded bg-muted mb-2" />
            <div className="h-3 w-20 mx-auto animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Card skeleton */}
      <div className="rounded-xl border border-border/50 p-5 space-y-4">
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Buttons skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <div className="h-12 animate-pulse rounded-md bg-muted" />
        <div className="h-12 animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}
