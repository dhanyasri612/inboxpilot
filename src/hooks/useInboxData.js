import { useEffect, useState } from "react";
import { useInboxScope } from "../context/InboxScopeContext";
import { useUser } from "../context/UserContext";
import { EMPTY_BRIEF, EMPTY_DASHBOARD, inboxApi } from "../services/api";

export function useInboxData({
  includeDashboard = false,
  includeBrief = false,
} = {}) {
  const { address, hasUser } = useUser();
  const { scope, scopeLabel } = useInboxScope();
  const [emails, setEmails] = useState([]);
  const [dashboard, setDashboard] = useState(
    includeDashboard ? EMPTY_DASHBOARD : null,
  );
  const [brief, setBrief] = useState(includeBrief ? EMPTY_BRIEF.brief : null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!hasUser) {
        setEmails([]);
        if (includeDashboard) {
          setDashboard(EMPTY_DASHBOARD);
        }
        if (includeBrief) {
          setBrief(EMPTY_BRIEF.brief);
        }
        setError("");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const requests = [inboxApi.getEmails(scope, address)];

        if (includeDashboard) {
          requests.push(inboxApi.getDashboard(scope, address));
        }

        if (includeBrief) {
          requests.push(inboxApi.getDailyBrief(scope, address));
        }

        const results = await Promise.all(requests);
        if (!active) {
          return;
        }

        let index = 0;
        setEmails(Array.isArray(results[index]) ? results[index++] : []);

        if (includeDashboard) {
          setDashboard(results[index++] ?? EMPTY_DASHBOARD);
        }

        if (includeBrief) {
          const briefData = results[index++];
          setBrief(briefData?.brief ?? EMPTY_BRIEF.brief);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message || "Failed to load inbox data.");
          setEmails([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [scope, includeDashboard, includeBrief, hasUser, address, reloadToken]);

  function refreshData() {
    setReloadToken((current) => current + 1);
  }

  function removeEmailsByIds(ids) {
    const idSet = new Set(ids);
    setEmails((current) => current.filter((email) => !idSet.has(email.id)));
  }

  return {
    emails,
    dashboard,
    brief,
    loading,
    error,
    scope,
    scopeLabel,
    hasUser,
    refreshData,
    removeEmailsByIds,
  };
}
