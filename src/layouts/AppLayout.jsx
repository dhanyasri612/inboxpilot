import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Logo from "../components/Logo";
import InboxScopeSelector from "../components/InboxScopeSelector";
import { useTheme } from "../context/ThemeContext";
import { useUser } from "../context/UserContext";
import { headerBadge, headerDot } from "../utils/categoryMeta";

const PAGE_TITLES = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Overview of your inbox intelligence and priority signals.",
  },
  "/career-tracker": {
    title: "Career Tracker",
    subtitle: "Search, filter, and act on career-related emails.",
  },
  "/categories": {
    title: "Categories",
    subtitle: "Browse all inbox emails by category with drilldown and search.",
  },
  "/deadlines": {
    title: "Deadlines",
    subtitle: "All time-sensitive emails sorted by nearest deadline.",
  },
  "/cleanup": {
    title: "Cleanup",
    subtitle:
      "Delete/archive and bulk actions for promotions, newsletters, and spam.",
  },
  "/daily-brief": {
    title: "Daily Brief",
    subtitle: "AI summary of what matters in your selected range.",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Enter your Gmail ID and fetch inbox data.",
  },
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { address, hasUser } = useUser();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  const pageMeta = useMemo(
    () => PAGE_TITLES[pathname] || PAGE_TITLES["/dashboard"],
    [pathname],
  );

  return (
    <div className="page-shell min-h-screen text-[color:var(--text-primary)]">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="min-w-0 lg:pl-[var(--sidebar-width)]">
        <header className="sticky top-0 z-20 border-b bg-[color:var(--surface-strong)]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-3 py-3 sm:gap-4 sm:px-6 sm:py-3.5 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                className="btn-secondary h-9 w-9 shrink-0 p-0 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation"
              >
                <MenuIcon />
              </button>

              <Logo className="lg:hidden" />

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-base font-semibold tracking-tight sm:text-lg md:text-xl">
                  {pageMeta.title}
                </h1>
                <p className="mt-0.5 hidden truncate text-sm text-[color:var(--text-muted)] md:block">
                  {pageMeta.subtitle}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {pathname !== "/settings" ? <InboxScopeSelector compact /> : null}

              {hasUser ? (
                <span
                  className={`hidden max-w-[12rem] items-center gap-1.5 truncate rounded-lg px-2 py-1 text-xs font-medium lg:inline-flex ${headerBadge.success}`}
                  title={address}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${headerDot.success}`}
                  />
                  <span className="truncate">{address}</span>
                </span>
              ) : null}

              <button
                type="button"
                onClick={toggleTheme}
                className="btn-secondary h-9 w-9 p-0 sm:w-auto sm:px-3"
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full min-w-0 max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
