import { useId } from "react";

export default function Logo({ className = "", title = "InboxPilot" }) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <div
      className={`aspect-square h-8 w-8 shrink-0 sm:h-10 sm:w-10 ${className}`}
      aria-hidden="true"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 40 40"
        width="100%"
        height="100%"
        fill="none"
        role="img"
        aria-label={title}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient
            id={`logo-bg-${gradientId}`}
            x1="4"
            y1="4"
            x2="36"
            y2="36"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#2563EB" />
            <stop offset="1" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>

        <rect width="40" height="40" rx="10" fill={`url(#logo-bg-${gradientId})`} />
        <rect x="8" y="13" width="24" height="16" rx="2.5" fill="white" />
        <path d="M8 15.5 20 24 32 15.5" fill="#DBEAFE" />
        <path
          d="M8 15.5 20 24 32 15.5"
          stroke="#2563EB"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M8 27.5 15.5 21.5M32 27.5 24.5 21.5"
          stroke="#93C5FD"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="29" cy="15" r="4.5" fill="#F97316" stroke="white" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
