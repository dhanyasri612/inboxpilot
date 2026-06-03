import { useMemo, useState } from "react";
import PageSkeleton from "../components/PageSkeleton";
import EmptyInboxState from "../components/EmptyInboxState";
import SectionHeader from "../components/SectionHeader";
import EmailDetailsModal from "../components/EmailDetailsModal";
import { useInboxData } from "../hooks/useInboxData";
import { getCategoryMeta } from "../utils/categoryMeta";
import { formatDeadline, normalizeCategory } from "../utils/emailUtils";

export default function CareerTrackerPage() {
  const { emails, loading, scopeLabel, hasUser, refreshData } = useInboxData();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedEmail, setSelectedEmail] = useState(null);

  const categories = useMemo(
    () => ["All", "Job", "Internship", "Interview", "Networking", "Learning", "College"],
    [],
  );

  const filteredEmails = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...emails]
      .filter((email) => {
        // Only include career-related emails in the Career Tracker
        if (!email.career_related) {
          return false;
        }

        const matchesCategory =
          categoryFilter === "All" ||
          normalizeCategory(email.category) ===
            normalizeCategory(categoryFilter);
        const searchableText = [
          email.company,
          email.subject,
          email.sender,
          email.summary,
          email.category,
        ]
          .join(" ")
          .toLowerCase();
        const matchesSearch =
          query.length === 0 || searchableText.includes(query);
        return matchesCategory && matchesSearch;
      })
      .sort((left, right) => {
        const priorityDiff =
          sortDirection === "desc"
            ? (right.priority ?? 0) - (left.priority ?? 0)
            : (left.priority ?? 0) - (right.priority ?? 0);

        if (priorityDiff !== 0) {
          return priorityDiff;
        }

        // Sub-sort by date (newest first)
        const leftDate = Number(left.internalDate || 0);
        const rightDate = Number(right.internalDate || 0);
        return rightDate - leftDate;
      });
  }, [categoryFilter, emails, search, sortDirection]);

  if (!hasUser) {
    return <EmptyInboxState title="Enter Gmail in Settings" description="Career tracker uses emails fetched for your Gmail address only." />;
  }

  if (loading) {
    return <PageSkeleton />;
  }

  if (emails.length === 0) {
    return <EmptyInboxState title="No emails to track" description="Connect Gmail and fetch your inbox from Settings to populate the career tracker." />;
  }

  return (
    <div className="space-y-5">
      <div className="panel-compact">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <input
            className="input-shell lg:flex-[1.4]"
            placeholder="Search company, subject, sender..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="select-shell lg:flex-1"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn-secondary lg:flex-shrink-0"
            onClick={() =>
              setSortDirection((current) =>
                current === "desc" ? "asc" : "desc",
              )
            }
          >
            Priority {sortDirection === "desc" ? "↓" : "↑"}
          </button>
        </div>
      </div>

      <div className="table-shell">
        <div className="border-b px-5 py-3">
          <SectionHeader
            title="All career opportunities"
            description={`${filteredEmails.length} result${filteredEmails.length === 1 ? "" : "s"} · ${scopeLabel}`}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-[color:var(--surface-elevated)] text-xs font-medium uppercase tracking-wide text-[color:var(--text-muted)]">
              <tr>
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Subject</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Deadline</th>
                <th className="px-5 py-3">Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEmails.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-state">
                    No career emails matched your filters for {scopeLabel.toLowerCase()}.
                  </td>
                </tr>
              ) : (
                filteredEmails.map((email) => {
                  const meta = getCategoryMeta(email.category);

                  return (
                    <tr
                      key={email.id}
                      className="transition hover:bg-[color:var(--surface-elevated)] cursor-pointer"
                      onClick={() => setSelectedEmail(email)}
                    >
                      <td className="px-5 py-3.5 font-medium text-[color:var(--text-primary)]">
                        {email.company || "Unknown"}
                      </td>
                      <td className="max-w-xs px-5 py-3.5 text-[color:var(--text-secondary)]">
                        <span className="line-clamp-2 font-medium hover:text-brand-500">
                          {email.subject}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`chip ${meta.chip}`}>
                          {email.category || "Other"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-lg bg-[color:var(--input-bg)] px-2 py-1 text-xs font-semibold">
                          {email.priority}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[color:var(--text-muted)]">
                        {formatDeadline(email.deadline)}
                      </td>
                      <td className="max-w-md px-5 py-3.5 text-[color:var(--text-muted)]">
                        <span className="line-clamp-2">{email.summary}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmail && (
        <EmailDetailsModal
          email={selectedEmail}
          onClose={() => {
            setSelectedEmail(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
}
