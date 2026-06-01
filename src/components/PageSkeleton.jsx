export default function PageSkeleton({ variant = "default" }) {
  if (variant === "dashboard") {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-28 rounded-2xl border bg-[color:var(--surface-elevated)]"
            />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-[420px] rounded-2xl border bg-[color:var(--surface-elevated)]" />
          <div className="h-[420px] rounded-2xl border bg-[color:var(--surface-elevated)]" />
        </div>
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="h-52 rounded-2xl border bg-[color:var(--surface-elevated)]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-14 rounded-2xl border bg-[color:var(--surface-elevated)]" />
      <div className="h-[480px] rounded-2xl border bg-[color:var(--surface-elevated)]" />
    </div>
  );
}
