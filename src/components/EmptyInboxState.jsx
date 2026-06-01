import { Link } from "react-router-dom";

export default function EmptyInboxState({
  title = "Connect your Gmail first",
  description = "Go to Settings, enter your Gmail address, and fetch your inbox. Dashboard and automations will use that account only.",
}) {
  return (
    <div className="panel mx-auto max-w-lg text-center">
      <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">{title}</h2>
      <p className="mt-2 text-sm text-[color:var(--text-muted)]">{description}</p>
      <Link to="/settings" className="btn-primary mt-5 inline-flex">
        Open Settings
      </Link>
    </div>
  );
}
