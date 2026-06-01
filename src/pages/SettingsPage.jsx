import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import { useUser } from "../context/UserContext";
import { inboxApi } from "../services/api";
import { INBOX_SCOPE_OPTIONS } from "../utils/inboxScope";
import {
  clearGmailConnection,
  getGmailState,
  setGmailState,
} from "../utils/gmailStorage";

const EMPTY_PROFILE = {
  connected: false,
  emailAddress: "",
};

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { address: savedAddress } = useUser();
  const [gmailProfile, setGmailProfile] = useState(EMPTY_PROFILE);
  const [selectedRange, setSelectedRange] = useState("today");
  const [notice, setNotice] = useState("");
  const [noticeTone, setNoticeTone] = useState("info");
  const [fetching, setFetching] = useState(false);

  const connectedEmail =
    gmailProfile.emailAddress || savedAddress || getGmailState().address;

  useEffect(() => {
    refreshAccountState();
  }, [savedAddress]);

  useEffect(() => {
    const gmailStatus = searchParams.get("gmail");
    if (!gmailStatus) {
      return;
    }

    const callbackMessage = searchParams.get("message");
    const callbackEmail = searchParams.get("email");

    if (gmailStatus === "connected") {
      showNotice(
        callbackEmail
          ? `Gmail connected: ${callbackEmail}`
          : "Gmail connected successfully.",
        "success",
      );
      refreshAccountState();
    } else if (gmailStatus === "error") {
      showNotice(
        callbackMessage ||
          "Gmail OAuth failed. Check credentials and redirect URI settings.",
        "error",
      );
    }

    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  async function loadProfile() {
    const profile = await inboxApi.getGmailProfile();
    const isConnected = Boolean(profile.connected && profile.emailAddress);

    setGmailProfile({
      connected: isConnected,
      emailAddress: profile.emailAddress || "",
    });

    if (isConnected) {
      setGmailState({ address: profile.emailAddress, connected: true });
      return profile.emailAddress;
    }

    clearGmailConnection();
    return "";
  }

  async function refreshAccountState() {
    await loadProfile();
  }

  function showNotice(message, tone = "info") {
    setNoticeTone(tone);
    setNotice(message);
  }

  async function handleConnect() {
    window.location.assign(inboxApi.getGmailOauthStartUrl("/settings"));
  }

  async function handleDisconnect() {
    try {
      await inboxApi.disconnectGmail();
      clearGmailConnection();
      setGmailProfile(EMPTY_PROFILE);
      showNotice("Disconnected from Gmail.", "success");
      window.dispatchEvent(new Event("gmail-updated"));
      window.dispatchEvent(new Event("inbox-synced"));
      return true;
    } catch (error) {
      showNotice(error.message || "Failed to disconnect Gmail.", "error");
      return false;
    }
  }

  async function handleSwitchAccount() {
    const disconnected = await handleDisconnect();
    if (disconnected) {
      window.location.assign(inboxApi.getGmailOauthStartUrl("/settings"));
    }
  }

  async function handleFetchEmails() {
    if (!connectedEmail) {
      showNotice("Connect Gmail first.", "error");
      return;
    }

    setFetching(true);
    showNotice(`Fetching inbox for ${connectedEmail}…`, "info");

    try {
      const result = await inboxApi.fetchEmails(selectedRange, connectedEmail);

      if (!result.success) {
        showNotice(result.error || "Failed to fetch emails.", "error");
        return;
      }

      showNotice(
        result.message ||
          `Loaded ${result.count} emails for ${connectedEmail}. Run main.py to analyze.`,
        "success",
      );
      window.dispatchEvent(new Event("inbox-synced"));
    } finally {
      setFetching(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="panel space-y-3">
        <SectionHeader
          title="Gmail settings"
          description="Connect Gmail, switch accounts, or fetch the inbox."
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">
            {gmailProfile.connected
              ? connectedEmail
              : "No Gmail account connected"}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {INBOX_SCOPE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={fetching}
              onClick={() => setSelectedRange(option.id)}
              className={`rounded-xl border p-3 text-left transition ${
                selectedRange === option.id
                  ? "border-brand-500/60 bg-[color:var(--accent-muted)]"
                  : "border-[color:var(--border-color)] bg-[color:var(--surface-elevated)] hover:border-[color:var(--border-strong)]"
              }`}
            >
              <span className="block text-sm font-semibold text-[color:var(--text-primary)]">
                {option.choice}. {option.label}
              </span>
              <span className="mt-1 block text-xs text-[color:var(--text-muted)]">
                {option.description}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={handleConnect}>
            Connect Gmail
          </button>

          {gmailProfile.connected ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleDisconnect}
            >
              Disconnect Gmail
            </button>
          ) : null}

          {gmailProfile.connected ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSwitchAccount}
            >
              Switch Account
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn-secondary"
            disabled={fetching || !connectedEmail}
            onClick={handleFetchEmails}
          >
            {fetching ? "Fetching…" : "Fetch emails"}
          </button>
        </div>

        {notice ? (
          <p
            className={`rounded-xl px-4 py-2.5 text-sm ${
              noticeTone === "error"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-300"
                : noticeTone === "success"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "bg-[color:var(--accent-muted)] text-[color:var(--accent)]"
            }`}
          >
            {notice}
          </p>
        ) : null}
      </div>
    </div>
  );
}
