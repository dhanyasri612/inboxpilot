import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { PieChartTooltip } from "../components/ChartTooltip";
import EmailDetailsModal from "../components/EmailDetailsModal";
import EmailPreviewCard from "../components/EmailPreviewCard";
import EmptyInboxState from "../components/EmptyInboxState";
import PageSkeleton from "../components/PageSkeleton";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import { useInboxData } from "../hooks/useInboxData";
import { getCategoryMeta } from "../utils/categoryMeta";
import { getDistinctCategoryCount } from "../utils/emailUtils";

const chartColors = [
  "#38bdf8",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#f97316",
  "#14b8a6",
  "#ec4899",
  "#60a5fa",
  "#e879f9",
  "#34d399",
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { dashboard, emails, loading, scopeLabel, hasUser, refreshData } =
    useInboxData({
      includeDashboard: true,
    });
  const [activeEmail, setActiveEmail] = useState(null);

  const categoryCounts = useMemo(() => {
    return emails.reduce((accumulator, email) => {
      const category = email.category || "Other";
      accumulator[category] = (accumulator[category] || 0) + 1;
      return accumulator;
    }, {});
  }, [emails]);

  const chartData = useMemo(() => {
    return Object.entries(categoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((left, right) => right.value - left.value);
  }, [categoryCounts]);

  const topEmails = useMemo(() => {
    return [...emails]
      .sort((left, right) => right.priority - left.priority)
      .slice(0, 5);
  }, [emails]);

  const stats = [
    {
      title: "Total Emails",
      value: dashboard?.totalEmails ?? 0,
      detail: `In ${scopeLabel.toLowerCase()}`,
      tone: "from-sky-500/15 to-transparent",
      icon: <DashboardGlyph />,
      onClick: () => navigate("/career-tracker"),
    },
    {
      title: "Jobs",
      value: dashboard?.jobs ?? 0,
      detail: "Openings detected",
      tone: "from-emerald-500/15 to-transparent",
      icon: <BriefcaseGlyph />,
      onClick: () => navigate("/categories?category=Job"),
    },
    {
      title: "Internships",
      value: dashboard?.internships ?? 0,
      detail: "Career opportunities",
      tone: "from-cyan-500/15 to-transparent",
      icon: <InternshipGlyph />,
      onClick: () => navigate("/categories?category=Internship"),
    },
    {
      title: "Interviews",
      value: dashboard?.interviews ?? 0,
      detail: "Assessment pipeline",
      tone: "from-fuchsia-500/15 to-transparent",
      icon: <BriefcaseGlyph />,
      onClick: () => navigate("/categories?category=Interview"),
    },
    {
      title: "Deadlines",
      value: dashboard?.deadlines ?? 0,
      detail: "Time-sensitive items",
      tone: "from-rose-500/15 to-transparent",
      icon: <CalendarGlyph />,
      onClick: () => navigate("/deadlines"),
    },
    {
      title: "Promotions",
      value: dashboard?.promotions ?? 0,
      detail: "Ready for cleanup",
      tone: "from-orange-500/15 to-transparent",
      icon: <SparkGlyph />,
      onClick: () => navigate("/cleanup"),
    },
    {
      title: "Security Alerts",
      value: dashboard?.securityAlerts ?? 0,
      detail: "Account risk signals",
      tone: "from-red-500/15 to-transparent",
      icon: <CalendarGlyph />,
      onClick: () => navigate("/categories?category=Security"),
    },
    {
      title: "Spam",
      value: dashboard?.spam ?? 0,
      detail: "Noise detected",
      tone: "from-red-400/15 to-transparent",
      icon: <SparkGlyph />,
      onClick: () => navigate("/categories?category=Spam"),
    },
    {
      title: "Categories",
      value: getDistinctCategoryCount(emails),
      detail: "Unique groups",
      tone: "from-violet-500/15 to-transparent",
      icon: <GridGlyph />,
      onClick: () => navigate("/categories"),
    },
  ];

  if (!hasUser) {
    return <EmptyInboxState />;
  }

  if (loading) {
    return <PageSkeleton variant="dashboard" />;
  }

  if ((dashboard?.totalEmails ?? 0) === 0) {
    return <EmptyInboxState />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {stats.map((stat) => (
          <button
            type="button"
            key={stat.title}
            onClick={stat.onClick}
            className="text-left"
          >
            <StatCard {...stat} />
          </button>
        ))}
      </section>

      <div className="flex justify-end">
        <button type="button" className="btn-secondary" onClick={refreshData}>
          Refresh
        </button>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2">
        <div className="panel min-w-0">
          <SectionHeader
            title="Category breakdown"
            description={`How your inbox was grouped for ${scopeLabel.toLowerCase()}.`}
            action={
              <span className="badge">{chartData.length} categories</span>
            }
          />

          <div className="mt-4 grid grid-cols-1 gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-2">
            <div className="flex chart-box items-center justify-center rounded-xl bg-[color:var(--surface-elevated)] p-3 sm:p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="42%"
                    outerRadius="72%"
                    paddingAngle={2}
                    stroke="transparent"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    content={<PieChartTooltip />}
                    wrapperStyle={{ outline: "none", zIndex: 50 }}
                    contentStyle={{
                      background: "transparent",
                      border: "none",
                      boxShadow: "none",
                      padding: 0,
                    }}
                    itemStyle={{ color: "var(--text-primary)" }}
                    labelStyle={{ color: "var(--text-primary)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {chartData.slice(0, 6).map((item, index) => {
                const meta = getCategoryMeta(item.name);
                const percentage = Math.round(
                  (item.value / Math.max(dashboard?.totalEmails ?? 0, 1)) * 100,
                );

                return (
                  <div
                    key={item.name}
                    className="rounded-xl bg-[color:var(--surface-elevated)] p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[color:var(--text-primary)]">
                          {item.name}
                        </p>
                        <p className="text-xs text-[color:var(--text-muted)]">
                          {item.value} emails
                        </p>
                      </div>
                      <span className={`chip ${meta.chip}`}>{percentage}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[color:var(--input-bg)]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${percentage}%`,
                          background: chartColors[index % chartColors.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="panel min-w-0">
          <SectionHeader
            title="Top priority emails"
            description={`Highest urgency items in ${scopeLabel.toLowerCase()}.`}
          />

          <div className="mt-5 space-y-2">
            {topEmails.map((email) => (
              <EmailPreviewCard
                key={email.id || `${email.subject}-${email.sender}`}
                email={email}
                showMeta
                className="p-4"
                onOpen={setActiveEmail}
              />
            ))}
          </div>
        </div>
      </section>

      <EmailDetailsModal
        email={activeEmail}
        onClose={() => setActiveEmail(null)}
      />
    </div>
  );
}

function DashboardGlyph() {
  return (
    <Glyph path="M4 13.5V19a1 1 0 0 0 1 1h5v-6.5H4Zm10 0V20h5a1 1 0 0 0 1-1v-5.5h-6Zm6-10h-6v8.5h7V4.5a1 1 0 0 0-1-1Zm-8 0H5a1 1 0 0 0-1 1V11h8V3.5Z" />
  );
}

function BriefcaseGlyph() {
  return (
    <Glyph path="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v2H2V8a2 2 0 0 1 2-2h6Zm4 0V5h-4v1h4Zm8 6v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6h20Z" />
  );
}

function InternshipGlyph() {
  return (
    <Glyph path="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3H4V7Zm0 5h16v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5Zm5-2v2m6-2v2" />
  );
}

function CalendarGlyph() {
  return (
    <Glyph path="M7 3v3m10-3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1Z" />
  );
}

function SparkGlyph() {
  return (
    <Glyph path="M12 2 9.5 8.5 3 11l6.5 2.5L12 20l2.5-6.5L21 11l-6.5-2.5L12 2Z" />
  );
}

function GridGlyph() {
  return (
    <Glyph path="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />
  );
}

function Glyph({ path }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}
