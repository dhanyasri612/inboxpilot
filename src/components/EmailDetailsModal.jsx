import { useState } from "react";
import { getCategoryMeta } from "../utils/categoryMeta";
import { formatDeadline, getGmailUrl, stripHtml } from "../utils/emailUtils";
import { useUser } from "../context/UserContext";
import { inboxApi } from "../services/api";

export default function EmailDetailsModal({ email, onClose }) {
  const { address } = useUser();
  const [draft, setDraft] = useState("");
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [activeIntent, setActiveIntent] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  if (!email) {
    return null;
  }

  const meta = getCategoryMeta(email.category);

  const intents = [
    { id: "confirm_time", label: "Confirm Time", icon: "📅" },
    { id: "reschedule", label: "Reschedule", icon: "🔄" },
    { id: "decline", label: "Decline Gracefully", icon: "❌" },
    { id: "inquiry", label: "Ask Details", icon: "💬" },
  ];

  async function handleGenerateReply(replyType) {
    setLoadingDraft(true);
    setActiveIntent(replyType);
    setCopied(false);
    setError("");
    try {
      const response = await inboxApi.generateReply(email.id, replyType, address);
      if (response.success && response.draft) {
        setDraft(response.draft);
      } else {
        setError("Failed to generate draft. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to contact Groq API. Please try again.");
    } finally {
      setLoadingDraft(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  }

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
          <p className="mt-1 max-h-[160px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-[color:var(--text-secondary)]">
            {stripHtml(email.body) || "Body not available in this view."}
          </p>
        </div>

        {/* AI Smart Reply Section */}
        <div className="mt-4 border-t pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--text-faint)]">
            AI Smart Reply Assistant
          </p>
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">
            Choose an intent to instantly draft a contextual reply via LLM.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {intents.map((intent) => (
              <button
                key={intent.id}
                type="button"
                className={`btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 transition ${
                  activeIntent === intent.id
                    ? "border-brand-500 bg-brand-50/10 text-brand-400"
                    : ""
                }`}
                disabled={loadingDraft}
                onClick={() => handleGenerateReply(intent.id)}
              >
                <span>{intent.icon}</span>
                <span>{intent.label}</span>
              </button>
            ))}
          </div>

          {loadingDraft && (
            <div className="mt-3 flex items-center justify-center rounded-xl bg-[color:var(--surface-elevated)] p-8">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
              <span className="ml-2.5 text-xs text-[color:var(--text-secondary)]">
                AI is drafting your response...
              </span>
            </div>
          )}

          {error && (
            <p className="mt-3 text-xs text-red-500">
              ⚠️ {error}
            </p>
          )}

          {!loadingDraft && draft && (
            <div className="mt-3 rounded-xl bg-[color:var(--surface-elevated)] p-4 border border-[color:var(--border-color)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-brand-400">
                  Generated Draft Response:
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs font-semibold text-brand-500 hover:underline flex items-center gap-1"
                >
                  {copied ? "✓ Copied!" : "📋 Copy Draft"}
                </button>
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={5}
                className="w-full bg-transparent border-0 p-0 text-sm text-[color:var(--text-primary)] focus:ring-0 focus:outline-none resize-y leading-relaxed font-sans"
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <a
            href={getGmailUrl(email)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Open in Gmail
          </a>
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
          >
            Close Details
          </button>
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
