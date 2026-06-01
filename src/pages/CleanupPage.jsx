import { useMemo, useState } from "react";
import EmailDetailsModal from "../components/EmailDetailsModal";
import EmptyInboxState from "../components/EmptyInboxState";
import PageSkeleton from "../components/PageSkeleton";
import SectionHeader from "../components/SectionHeader";
import { useInboxData } from "../hooks/useInboxData";
import { useUser } from "../context/UserContext";
import { inboxApi } from "../services/api";
import { getCategoryMeta } from "../utils/categoryMeta";

const CLEANUP_CATEGORIES = new Set(["Promotion", "Newsletter", "Spam"]);

export default function CleanupPage() {
  const {
    emails,
    loading,
    hasUser,
    scopeLabel,
    removeEmailsByIds,
    refreshData,
  } = useInboxData();
  const { address } = useUser();
  const [selectedIds, setSelectedIds] = useState([]);
  const [notice, setNotice] = useState("");
  const [busyAction, setBusyAction] = useState("");
  const [activeEmail, setActiveEmail] = useState(null);

  const cleanupCandidates = useMemo(() => {
    return emails.filter((email) =>
      CLEANUP_CATEGORIES.has((email.category || "Other").trim()),
    );
  }, [emails]);

  const selectedCount = selectedIds.length;
  const allSelected =
    cleanupCandidates.length > 0 && selectedCount === cleanupCandidates.length;

  function toggleSelection(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  function toggleAll() {
    setSelectedIds(
      allSelected ? [] : cleanupCandidates.map((email) => email.id),
    );
  }

  async function executeAction(action) {
    if (selectedIds.length === 0) {
      setNotice("Select at least one email first.");
      return;
    }

    setBusyAction(action);
    setNotice("");

    try {
      const result = await inboxApi.bulkEmailAction(
        action,
        selectedIds,
        address,
      );
      if (!result.success && result.processed === 0) {
        setNotice("Action failed for all selected emails.");
        return;
      }

      if (["delete", "archive"].includes(action)) {
        removeEmailsByIds(selectedIds);
      }

      setSelectedIds([]);
      setNotice(
        `${result.processed} email${result.processed === 1 ? "" : "s"} processed with ${action.replace("_", " ")}.`,
      );
      refreshData();
    } catch (error) {
      setNotice(error.message || "Action failed.");
    } finally {
      setBusyAction("");
    }
  }

  async function deleteSingle(id) {
    setBusyAction(id);
    try {
      await inboxApi.deleteEmail(id, address);
      removeEmailsByIds([id]);
      setNotice("Email moved to trash.");
      refreshData();
    } catch (error) {
      setNotice(error.message || "Delete failed.");
    } finally {
      setBusyAction("");
    }
  }

  if (!hasUser) {
    return (
      <EmptyInboxState
        title="Enter Gmail in Settings"
        description="Cleanup runs on categorized inbox emails."
      />
    );
  }

  if (loading) {
    return <PageSkeleton />;
  }

  if (emails.length === 0) {
    return (
      <EmptyInboxState
        title="Nothing to clean up"
        description="Sync your Gmail inbox first to find cleanup candidates."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="panel-compact">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SectionHeader
            title="Cleanup center"
            description={`${cleanupCandidates.length} candidates · ${selectedCount} selected · ${scopeLabel}`}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary"
              disabled={!selectedCount || !!busyAction}
              onClick={() => executeAction("delete")}
            >
              Delete Selected
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={!selectedCount || !!busyAction}
              onClick={() => executeAction("archive")}
            >
              Archive Selected
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={!selectedCount || !!busyAction}
              onClick={() => executeAction("mark_read")}
            >
              Mark Read
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={!selectedCount || !!busyAction}
              onClick={() => executeAction("mark_important")}
            >
              Mark Important
            </button>
            <button type="button" className="btn-ghost" onClick={toggleAll}>
              {allSelected ? "Clear all" : "Select all"}
            </button>
          </div>
        </div>

        {notice ? (
          <p className="mt-3 rounded-xl bg-[color:var(--accent-muted)] px-4 py-2.5 text-sm text-[color:var(--accent)]">
            {notice}
          </p>
        ) : null}
      </div>

      <div className="table-shell">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-[color:var(--surface-elevated)] text-xs font-medium uppercase tracking-wide text-[color:var(--text-muted)]">
              <tr>
                <th className="w-12 px-5 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-[color:var(--border-strong)] text-brand-500 focus:ring-brand-500/30"
                    aria-label="Select all cleanup candidates"
                  />
                </th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cleanupCandidates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No cleanup candidates for {scopeLabel.toLowerCase()}.
                  </td>
                </tr>
              ) : (
                cleanupCandidates.map((email) => {
                  const checked = selectedIds.includes(email.id);
                  const meta = getCategoryMeta(email.category);

                  return (
                    <tr
                      key={email.id}
                      className={`transition hover:bg-[color:var(--surface-elevated)] ${checked ? "bg-[color:var(--accent-muted)]" : ""}`}
                    >
                      <td className="px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelection(email.id)}
                          className="h-4 w-4 rounded border-[color:var(--border-strong)] text-brand-500 focus:ring-brand-500/30"
                          aria-label={`Select ${email.subject}`}
                        />
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          className="line-clamp-2 text-left font-medium text-[color:var(--text-primary)] hover:text-brand-500"
                          onClick={() => setActiveEmail(email)}
                        >
                          {email.subject}
                        </button>
                        <p className="mt-1 line-clamp-1 text-xs text-[color:var(--text-muted)]">
                          {email.sender}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-[color:var(--text-secondary)]">
                        {email.company || "Unknown"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`chip ${meta.chip}`}>
                          {email.category || "Other"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-lg bg-[color:var(--input-bg)] px-2 py-1 text-xs font-semibold">
                          {email.priority ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={() => deleteSingle(email.id)}
                          disabled={
                            busyAction === email.id ||
                            Boolean(busyAction && busyAction !== email.id)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EmailDetailsModal
        email={activeEmail}
        onClose={() => setActiveEmail(null)}
      />
    </div>
  );
}
