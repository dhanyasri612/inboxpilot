import { useMemo, useState } from "react";
import EmailDetailsModal from "../components/EmailDetailsModal";
import EmptyInboxState from "../components/EmptyInboxState";
import PageSkeleton from "../components/PageSkeleton";
import SectionHeader from "../components/SectionHeader";
import { useInboxData } from "../hooks/useInboxData";
import { getCategoryMeta } from "../utils/categoryMeta";
import { formatDeadline } from "../utils/emailUtils";

function deadlineRank(deadline) {
  if (!deadline) {
    return Number.MAX_SAFE_INTEGER;
  }

  const text = deadline.toLowerCase();
  if (text.includes("today")) {
    return 0;
  }
  if (text.includes("tomorrow")) {
    return 1;
  }
  if (text.includes("this week")) {
    return 3;
  }
  if (text.includes("next week")) {
    return 7;
  }

  const date = new Date(deadline);
  if (!Number.isNaN(date.getTime())) {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    return Math.max(Math.floor(diffMs / (24 * 60 * 60 * 1000)), 0);
  }

  return 3650;
}

export default function DeadlinesPage() {
  const { emails, loading, hasUser, scopeLabel } = useInboxData();
  const [activeEmail, setActiveEmail] = useState(null);

  const deadlineEmails = useMemo(() => {
    return [...emails]
      .filter((email) => Boolean(email.deadline))
      .sort(
        (left, right) =>
          deadlineRank(left.deadline) - deadlineRank(right.deadline),
      );
  }, [emails]);

  if (!hasUser) {
    return (
      <EmptyInboxState
        title="Enter Gmail in Settings"
        description="Deadlines are extracted from your fetched inbox emails."
      />
    );
  }

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (deadlineEmails.length === 0) {
    return (
      <EmptyInboxState
        title="No deadlines found"
        description={`No deadline emails detected for ${scopeLabel.toLowerCase()}.`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="panel">
        <SectionHeader
          title="View All Deadlines"
          description={`${deadlineEmails.length} deadline email${deadlineEmails.length === 1 ? "" : "s"} in ${scopeLabel.toLowerCase()}. Sorted by nearest deadline.`}
        />
      </div>

      <div className="space-y-3">
        {deadlineEmails.map((email) => {
          const meta = getCategoryMeta(email.category);

          return (
            <button
              key={email.id || `${email.subject}-${email.sender}`}
              type="button"
              onClick={() => setActiveEmail(email)}
              className="panel w-full text-left transition hover:bg-[color:var(--surface-elevated)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-semibold text-[color:var(--text-primary)]">
                  {email.subject}
                </p>
                <span className="rounded-lg bg-[color:var(--input-bg)] px-2 py-1 text-xs font-semibold">
                  Priority {email.priority ?? 0}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap gap-2 text-xs text-[color:var(--text-muted)]">
                <span>{email.company || "Unknown"}</span>
                <span>•</span>
                <span>{email.sender || "Unknown"}</span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`chip ${meta.chip}`}>
                  {email.category || "Other"}
                </span>
                <span className="chip bg-rose-500/10 text-rose-700 ring-rose-500/25 dark:text-rose-300 dark:ring-rose-400/20">
                  {formatDeadline(email.deadline)}
                </span>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-[color:var(--text-secondary)]">
                {email.summary || "No summary available."}
              </p>
            </button>
          );
        })}
      </div>

      <EmailDetailsModal
        email={activeEmail}
        onClose={() => setActiveEmail(null)}
      />
    </div>
  );
}
