import { useInboxScope } from "../context/InboxScopeContext";

export default function InboxScopeSelector({ compact = false }) {
  const { scope, options, setScope, scopeLabel } = useInboxScope();

  return (
    <label className="inline-flex min-w-0 items-center gap-2">
      <span className="sr-only">Inbox time range</span>
      {!compact ? (
        <span className="hidden text-xs font-medium text-[color:var(--text-muted)] lg:inline">
          Range
        </span>
      ) : null}
      <select
        value={scope}
        onChange={(event) => setScope(event.target.value)}
        className="select-shell h-9 min-w-0 max-w-[9.5rem] py-1.5 text-xs sm:max-w-none sm:text-sm"
        aria-label={`Inbox range: ${scopeLabel}`}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {compact ? option.shortLabel : option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
