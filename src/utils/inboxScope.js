/** Same options as read_emails.py — applies to all inbox automations */
export const INBOX_SCOPE_OPTIONS = [
  {
    id: "today",
    choice: "1",
    label: "Today",
    shortLabel: "Today",
    description: "Last 24 hours",
    days: 1,
  },
  {
    id: "7d",
    choice: "2",
    label: "Last 7 Days",
    shortLabel: "7 days",
    description: "Past week",
    days: 7,
  },
  {
    id: "30d",
    choice: "3",
    label: "Last 30 Days",
    shortLabel: "30 days",
    description: "Past month",
    days: 30,
  },
  {
    id: "all",
    choice: "4",
    label: "All Emails",
    shortLabel: "All",
    description: "Full inbox",
    days: null,
  },
];

export const DEFAULT_INBOX_SCOPE = "today";
export const INBOX_SCOPE_STORAGE_KEY = "inboxpilot-inbox-scope";

export function getInboxScopeOption(id) {
  return INBOX_SCOPE_OPTIONS.find((option) => option.id === id);
}

export function getInboxScopeLabel(id) {
  return getInboxScopeOption(id)?.label ?? "All Emails";
}
