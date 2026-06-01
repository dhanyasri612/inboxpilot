import { useMemo } from "react";
import PageSkeleton from "../components/PageSkeleton";
import EmptyInboxState from "../components/EmptyInboxState";
import SectionHeader from "../components/SectionHeader";
import { useInboxData } from "../hooks/useInboxData";

export default function DailyBriefPage() {
  const { brief, emails, loading, scopeLabel, hasUser } = useInboxData({ includeBrief: true });

  const sections = useMemo(() => {
    const lines = brief
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const bullets = lines.filter((line) => line.startsWith("-"));
    const topOpportunityIndex = lines.findIndex((line) =>
      line.toLowerCase().includes("top opportunity"),
    );
    const topOpportunity =
      topOpportunityIndex >= 0 ? lines[topOpportunityIndex + 1] : "";

    return { lines, bullets, topOpportunity };
  }, [brief]);

  if (!hasUser) {
    return <EmptyInboxState title="Enter Gmail in Settings" description="Daily brief is generated from your Gmail inbox data." />;
  }

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if (emails.length === 0) {
    return <EmptyInboxState title="No daily brief yet" description="Sync and analyze your inbox to generate an AI daily brief." />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="panel">
        <SectionHeader
          title="Inbox summary"
          description={`AI briefing for ${scopeLabel.toLowerCase()}.`}
        />

        <div className="mt-5 space-y-3 text-sm leading-relaxed text-[color:var(--text-secondary)]">
          {sections.lines.map((line, index) => {
            if (line.startsWith("-")) {
              return (
                <div
                  key={`${line}-${index}`}
                  className="flex gap-3 rounded-xl bg-[color:var(--surface-elevated)] px-4 py-3"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-brand-400" />
                  <span>{line.replace(/^-\s*/, "")}</span>
                </div>
              );
            }

            if (line.endsWith(":")) {
              return (
                <p
                  key={`${line}-${index}`}
                  className="pt-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--text-faint)]"
                >
                  {line}
                </p>
              );
            }

            return (
              <p
                key={`${line}-${index}`}
                className="text-[color:var(--text-primary)]"
              >
                {line}
              </p>
            );
          })}
        </div>
      </div>

      <div className="space-y-5">
        <div className="panel">
          <SectionHeader title="Top opportunity" />
          <div className="mt-4 rounded-xl bg-gradient-to-br from-brand-500/10 to-cyan-500/5 p-5">
            <p className="text-sm leading-relaxed text-[color:var(--text-primary)]">
              {sections.topOpportunity || "No top opportunity detected."}
            </p>
          </div>
        </div>

        <div className="panel">
          <SectionHeader title="Quick stats" />
          <div className="mt-4 space-y-2">
            {sections.bullets.length === 0 ? (
              <p className="text-sm text-[color:var(--text-muted)]">
                No stats available for {scopeLabel.toLowerCase()}.
              </p>
            ) : (
              sections.bullets.map((bullet, index) => (
                <div
                  key={`${bullet}-${index}`}
                  className="rounded-xl bg-[color:var(--surface-elevated)] px-4 py-3 text-sm text-[color:var(--text-secondary)]"
                >
                  {bullet.replace(/^-\s*/, "")}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
