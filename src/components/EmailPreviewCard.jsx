import { getCategoryMeta, deadlineChip } from "../utils/categoryMeta";
import { getGmailUrl } from "../utils/emailUtils";

export default function EmailPreviewCard({
  email,
  className = "",
  showMeta = false,
  onOpen,
}) {
  const gmailUrl = getGmailUrl(email);
  const meta = getCategoryMeta(email.category);
  const Wrapper = onOpen ? "button" : "a";
  const wrapperProps = onOpen
    ? { type: "button", onClick: () => onOpen(email) }
    : { href: gmailUrl, target: "_blank", rel: "noopener noreferrer" };

  return (
    <Wrapper
      title="Open full email in Gmail"
      className={`group block rounded-xl bg-[color:var(--surface-elevated)] p-3 transition hover:bg-[color:var(--input-bg-hover)] hover:ring-1 hover:ring-brand-500/25 ${className}`}
      {...wrapperProps}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-1 text-sm font-medium text-[color:var(--text-primary)] group-hover:text-brand-500">
          {email.subject}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {showMeta && email.priority != null ? (
            <span className="rounded-lg bg-[color:var(--input-bg)] px-2 py-0.5 text-xs font-semibold text-[color:var(--text-primary)]">
              {email.priority}
            </span>
          ) : null}
          <GmailIcon />
        </div>
      </div>

      <p className="mt-0.5 line-clamp-1 text-xs text-[color:var(--text-muted)]">
        {email.sender}
        {email.company ? ` · ${email.company}` : ""}
      </p>

      {email.summary ? (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[color:var(--text-secondary)]">
          {email.summary}
        </p>
      ) : null}

      {showMeta ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className={`chip ${meta.chip}`}>
            {email.category || "Other"}
          </span>
          {email.deadline ? (
            <span className={`chip ${deadlineChip}`}>Due {email.deadline}</span>
          ) : null}
        </div>
      ) : null}

      <p className="mt-2 text-[11px] font-medium text-brand-500 opacity-70 transition group-hover:opacity-100">
        {onOpen ? "View details →" : "Open in Gmail →"}
      </p>
    </Wrapper>
  );
}

function GmailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 shrink-0 text-[color:var(--text-faint)] transition group-hover:text-brand-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path
        d="M7 17 17 7M7 7h10v10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
