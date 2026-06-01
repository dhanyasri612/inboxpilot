export default function StatCard({
  title,
  value,
  detail,
  icon,
  tone = "from-sky-500/15 to-transparent",
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-[color:var(--surface)] p-4 transition hover:border-[color:var(--border-strong)] sm:p-5">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-60 transition group-hover:opacity-80`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[color:var(--text-muted)]">
            {title}
          </p>
          <p className="mt-1.5 text-xl font-semibold tracking-tight text-[color:var(--text-primary)] sm:text-2xl">
            {value}
          </p>
          {detail ? (
            <p className="mt-1 text-xs text-[color:var(--text-faint)]">
              {detail}
            </p>
          ) : null}
        </div>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[color:var(--input-bg)] text-[color:var(--text-secondary)]">
          {icon}
        </div>
      </div>
    </div>
  );
}
