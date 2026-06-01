import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { inboxApi } from "../services/api";
import { getGmailState } from "../utils/gmailStorage";
import { clearGmailConnection, setGmailState } from "../utils/gmailStorage";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [address, setAddress] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let active = true;

    function syncUser() {
      const state = getGmailState();
      setAddress(state.address);
      setConnected(state.connected);
    }

    async function syncFromBackend() {
      try {
        const profile = await inboxApi.getGmailProfile();

        if (!active) {
          return;
        }

        const profileEmail = profile?.emailAddress || profile?.email || "";
        if (profile?.connected && profileEmail) {
          setGmailState({ address: profileEmail, connected: true });
          setAddress(profileEmail);
          setConnected(true);
          return;
        }

        clearGmailConnection();
        setAddress("");
        setConnected(false);
      } catch {
        syncUser();
      }
    }

    syncUser();
    syncFromBackend();
    window.addEventListener("gmail-updated", syncUser);
    window.addEventListener("inbox-synced", syncUser);
    return () => {
      active = false;
      window.removeEventListener("gmail-updated", syncUser);
      window.removeEventListener("inbox-synced", syncUser);
    };
  }, []);

  const value = useMemo(() => {
    const hasUser = connected && address.includes("@");

    return {
      address,
      connected,
      hasUser,
    };
  }, [address, connected]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}
