import { getCategoryMeta } from "../utils/categoryMeta";
import { formatDeadline, getGmailUrl } from "../utils/emailUtils";

export default function EmailDetailsModal({ email, onClose }) {
  if (!email) {
    return null;
  }

  const meta = getCategoryMeta(email.category);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border bg-[color:var(--surface-strong)] p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-[color:var(--text-faint)]">
              Email details
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[color:var(--text-primary)]">
              {email.subject || "No Subject"}
            </h3>
          </div>
          <button
            type="button"
            className="btn-secondary h-9 w-9 p-0"
            onClick={onClose}
            aria-label="Close details"
          >
            ×
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Detail label="Sender" value={email.sender || "Unknown"} />
          <Detail label="Company" value={email.company || "Unknown"} />
          <Detail
            label="Category"
            value={email.category || "Other"}
            chip={meta.chip}
          />
          <Detail label="Subcategory" value={email.subcategory || "-"} />
          <Detail label="Priority" value={String(email.priority ?? 0)} />
          <Detail label="Deadline" value={formatDeadline(email.deadline)} />
        </div>

        <div className="mt-4 rounded-xl bg-[color:var(--surface-elevated)] p-4">
          <p className="text-xs uppercase tracking-wide text-[color:var(--text-faint)]">
            Summary
          </p>
          <p className="mt-1 text-sm text-[color:var(--text-primary)]">
            {email.summary || "No summary available."}
          </p>
        </div>

        <div className="mt-3 rounded-xl bg-[color:var(--surface-elevated)] p-4">
          <p className="text-xs uppercase tracking-wide text-[color:var(--text-faint)]">
            Email body
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--text-secondary)]">
            {email.body || "Body not available in this view."}
          </p>
        </div>

        <div className="mt-5 flex justify-end">
          <a
            href={getGmailUrl(email)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Open in Gmail
          </a>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, chip }) {
  return (
    <div className="rounded-xl bg-[color:var(--surface-elevated)] p-3">
      <p className="text-xs uppercase tracking-wide text-[color:var(--text-faint)]">
        {label}
      </p>
      {chip ? (
        <span
          className={`mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${chip}`}
        >
          {value}
        </span>
      ) : (
        <p className="mt-1 text-sm text-[color:var(--text-primary)]">{value}</p>
      )}
    </div>
  );
}
