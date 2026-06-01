import { NavLink } from "react-router-dom";
import Logo from "./Logo";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { path: "/career-tracker", label: "Career Tracker", icon: BriefcaseIcon },
  { path: "/categories", label: "Categories", icon: GridIcon },
  { path: "/deadlines", label: "Deadlines", icon: CalendarIcon },
  { path: "/cleanup", label: "Cleanup", icon: TrashIcon },
  { path: "/daily-brief", label: "Daily Brief", icon: SparklesIcon },
  { path: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[var(--sidebar-width-mobile)] max-w-[var(--sidebar-width)] flex-col border-r bg-[color:var(--surface-strong)] backdrop-blur-xl transition-transform duration-300 lg:w-[var(--sidebar-width)] lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <Logo className="drop-shadow-sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[color:var(--text-primary)]">
                InboxPilot
              </p>
              <p className="truncate text-xs text-[color:var(--text-muted)]">
                Email intelligence
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn-ghost h-8 w-8 shrink-0 p-0 lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "nav-item-active" : ""}`
                }
              >
                <Icon />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t px-4 py-3 sm:px-5 sm:py-4">
          <p className="text-xs text-[color:var(--text-faint)]">
            AI-powered inbox management
          </p>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar"
          onClick={onClose}
        />
      ) : null}
    </>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <SvgIcon path="M4 13.5V19a1 1 0 0 0 1 1h5v-6.5H4Zm10 0V20h5a1 1 0 0 0 1-1v-5.5h-6Zm6-10h-6v8.5h7V4.5a1 1 0 0 0-1-1Zm-8 0H5a1 1 0 0 0-1 1V11h8V3.5Z" />
  );
}

function BriefcaseIcon() {
  return (
    <SvgIcon path="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1h4a2 2 0 0 1 2 2v2H2V8a2 2 0 0 1 2-2h6Zm4 0V5a0 0 0 0 0 0 0h-2a0 0 0 0 0 0 0v1h2Zm8 6v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6h20Z" />
  );
}

function GridIcon() {
  return (
    <SvgIcon path="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />
  );
}

function TrashIcon() {
  return (
    <SvgIcon
      path="M5 7h14l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7Zm3-3h8l1 2H7l1-2Zm3 4v9m4-9-1 9m-6-9 1 9"
      strokeWidth="1.8"
    />
  );
}

function SparklesIcon() {
  return (
    <SvgIcon path="M12 2 9.5 8.5 3 11l6.5 2.5L12 20l2.5-6.5L21 11l-6.5-2.5L12 2Z" />
  );
}

function CalendarIcon() {
  return (
    <SvgIcon path="M7 3v3m10-3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1Z" />
  );
}

function SettingsIcon() {
  return (
    <SvgIcon path="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8.5 4-.9-.5.2-1 1-1.7-1.7-1.7-1.7 1-.9-.2-.5-.9-.4-1.9h-2.4l-.4 1.9-.5.9-.9.2-1.7-1L5.1 8.8l1 1.7.2 1-.9.5-1.9.4v2.4l1.9.4.9.5-.2 1-1 1.7 1.7 1.7 1.7-1 .9.2.5.9.4 1.9h2.4l.4-1.9.5-.9.9-.2 1.7 1 1.7-1.7-1-1.7-.2-1 .9-.5 1.9-.4v-2.4l-1.9-.4Z" />
  );
}

function SvgIcon({ path, strokeWidth = "1.6" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px] flex-none opacity-80"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      <path d={path} />
    </svg>
  );
}
