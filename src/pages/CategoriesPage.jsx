import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EmailDetailsModal from "../components/EmailDetailsModal";
import EmptyInboxState from "../components/EmptyInboxState";
import PageSkeleton from "../components/PageSkeleton";
import SectionHeader from "../components/SectionHeader";
import { useInboxData } from "../hooks/useInboxData";
import { CATEGORY_ORDER, getCategoryMeta } from "../utils/categoryMeta";

const PAGE_SIZE = 20;

function normalize(category) {
  return (category || "Other").trim().toLowerCase();
}

export default function CategoriesPage() {
  const { emails, loading, hasUser, scopeLabel } = useInboxData();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeEmail, setActiveEmail] = useState(null);

  const selectedCategory = searchParams.get("category") || "";

  const grouped = useMemo(() => {
    const map = new Map();
    CATEGORY_ORDER.forEach((category) => map.set(category, []));

    emails.forEach((email) => {
      const category =
        CATEGORY_ORDER.find(
          (entry) => normalize(entry) === normalize(email.category),
        ) || "Other";
      map.get(category).push(email);
    });

    return map;
  }, [emails]);

  const selectedItems = useMemo(() => {
    if (!selectedCategory) {
      return [];
    }

    const canonical =
      CATEGORY_ORDER.find(
        (entry) => normalize(entry) === normalize(selectedCategory),
      ) || selectedCategory;

    const source = grouped.get(canonical) || [];
    const query = search.trim().toLowerCase();

    return source.filter((email) => {
      if (!query) {
        return true;
      }

      const text = [email.subject, email.company, email.sender, email.summary]
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [selectedCategory, grouped, search]);

  const visibleItems = useMemo(
    () => selectedItems.slice(0, visibleCount),
    [selectedItems, visibleCount],
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, search]);

  if (!hasUser) {
    return (
      <EmptyInboxState
        title="Enter Gmail in Settings"
        description="Categories are built from your fetched Gmail inbox."
      />
    );
  }

  if (loading) {
    return <PageSkeleton variant="grid" />;
  }

  if (emails.length === 0) {
    return (
      <EmptyInboxState
        title="No categories yet"
        description="Sync and analyze your inbox to populate categories."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="panel">
        <SectionHeader
          title="Categories"
          description={`Browse all emails by category for ${scopeLabel.toLowerCase()}.`}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CATEGORY_ORDER.map((category) => {
            const count = (grouped.get(category) || []).length;
            const meta = getCategoryMeta(category);
            const active = normalize(selectedCategory) === normalize(category);

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSearchParams({ category })}
                className={`rounded-xl border p-3 text-left transition ${
                  active
                    ? "border-brand-500/40 bg-[color:var(--accent-muted)]"
                    : "bg-[color:var(--surface-elevated)] hover:border-[color:var(--border-strong)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`chip ${meta.chip}`}>{category}</span>
                  <span className="text-sm font-semibold text-[color:var(--text-primary)]">
                    {count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedCategory ? (
        <div className="panel space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeader
              title={`${selectedCategory} (${selectedItems.length})`}
              description="Showing all emails in this category."
            />
            <div className="flex gap-2">
              <input
                className="input-shell"
                placeholder="Search in this category"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setSearch("");
                  setSearchParams({});
                  navigate("/categories");
                }}
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
            {visibleItems.length === 0 ? (
              <p className="empty-state">No emails found in this category.</p>
            ) : (
              visibleItems.map((email) => (
                <button
                  key={email.id || `${email.subject}-${email.sender}`}
                  type="button"
                  onClick={() => setActiveEmail(email)}
                  className="w-full rounded-xl border bg-[color:var(--surface-elevated)] p-3 text-left transition hover:bg-[color:var(--input-bg-hover)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-semibold text-[color:var(--text-primary)]">
                      {email.subject}
                    </p>
                    <span className="rounded-lg bg-[color:var(--input-bg)] px-2 py-0.5 text-xs font-semibold">
                      {email.priority ?? 0}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                    {email.company || "Unknown"} • {email.sender || "Unknown"}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-[color:var(--text-secondary)]">
                    {email.summary || "No summary available."}
                  </p>
                </button>
              ))
            )}
          </div>

          {visibleCount < selectedItems.length ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
            >
              Load more
            </button>
          ) : null}
        </div>
      ) : (
        <div className="panel">
          <p className="text-sm text-[color:var(--text-muted)]">
            Click a category card to view every email in that group.
          </p>
        </div>
      )}

      <EmailDetailsModal
        email={activeEmail}
        onClose={() => setActiveEmail(null)}
      />
    </div>
  );
}
