import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_INBOX_SCOPE,
  getInboxScopeLabel,
  getInboxScopeOption,
  INBOX_SCOPE_OPTIONS,
  INBOX_SCOPE_STORAGE_KEY,
} from "../utils/inboxScope";

const InboxScopeContext = createContext(null);

function getInitialScope() {
  if (typeof window === "undefined") {
    return DEFAULT_INBOX_SCOPE;
  }

  const stored = window.localStorage.getItem(INBOX_SCOPE_STORAGE_KEY);
  if (INBOX_SCOPE_OPTIONS.some((option) => option.id === stored)) {
    return stored;
  }

  return DEFAULT_INBOX_SCOPE;
}

export function InboxScopeProvider({ children }) {
  const [scope, setScopeState] = useState(getInitialScope);

  useEffect(() => {
    window.localStorage.setItem(INBOX_SCOPE_STORAGE_KEY, scope);
    window.dispatchEvent(new CustomEvent("inbox-scope-changed", { detail: { scope } }));
  }, [scope]);

  const value = useMemo(() => {
    const option = getInboxScopeOption(scope);

    return {
      scope,
      scopeLabel: getInboxScopeLabel(scope),
      scopeOption: option,
      options: INBOX_SCOPE_OPTIONS,
      setScope: setScopeState,
    };
  }, [scope]);

  return (
    <InboxScopeContext.Provider value={value}>{children}</InboxScopeContext.Provider>
  );
}

export function useInboxScope() {
  const context = useContext(InboxScopeContext);
  if (!context) {
    throw new Error("useInboxScope must be used inside InboxScopeProvider");
  }

  return context;
}
