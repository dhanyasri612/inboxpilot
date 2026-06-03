import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 8000,
});

const fetchApi = axios.create({
  baseURL: apiBaseUrl,
  timeout: 300000,
});

const longFetchApi = axios.create({
  baseURL: apiBaseUrl,
  timeout: 1800000,
});

const EMPTY_DASHBOARD = {
  totalEmails: 0,
  jobs: 0,
  internships: 0,
  interviews: 0,
  promotions: 0,
  newsletters: 0,
  learning: 0,
  securityAlerts: 0,
  spam: 0,
  deadlines: 0,
  categoryCounts: {},
};

const EMPTY_BRIEF = {
  brief: "Enter your Gmail address in Settings to load your inbox summary.",
};

function buildQuery({ email, scope }) {
  const params = new URLSearchParams();
  if (email) {
    params.set("email", email);
  }
  if (scope && scope !== "all") {
    params.set("range", scope);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

function buildBrowserApiUrl(path) {
  if (/^https?:\/\//i.test(apiBaseUrl)) {
    return `${apiBaseUrl.replace(/\/$/, "")}${path}`;
  }

  return `${window.location.origin}${apiBaseUrl}${path}`;
}

function buildOAuthNextUrl(pathname = "/settings") {
  return new URL(pathname, window.location.origin).toString();
}

async function requestGet(path, fallback) {
  try {
    const response = await api.get(path);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 401) {
      return fallback;
    }

    console.warn(`Failed to load ${path}`, error);
    throw error;
  }
}

export const inboxApi = {
  apiBaseUrl,

  async checkHealth() {
    try {
      const response = await api.get("/health");
      const ok = response.data?.status === "ok";
      return {
        connected: ok,
        url: apiBaseUrl,
        message: ok
          ? "FastAPI backend connected."
          : "Unexpected backend response.",
      };
    } catch (error) {
      return {
        connected: false,
        url: apiBaseUrl,
        message:
          error.code === "ERR_NETWORK"
            ? `Cannot reach backend at ${apiBaseUrl}. Start it with: uvicorn backend.main:app --reload --port 8000`
            : error.message || "Backend unavailable.",
      };
    }
  },

  getDashboard: (scope = "all", email = "") => {
    if (!email) {
      return Promise.resolve(EMPTY_DASHBOARD);
    }

    return requestGet(
      `/dashboard${buildQuery({ email, scope })}`,
      EMPTY_DASHBOARD,
    );
  },

  getEmails: (scope = "all", email = "") => {
    if (!email) {
      return Promise.resolve([]);
    }

    return requestGet(`/emails${buildQuery({ email, scope })}`, []);
  },

  getDailyBrief: (scope = "all", email = "") => {
    if (!email) {
      return Promise.resolve(EMPTY_BRIEF);
    }

    return requestGet(
      `/daily-brief${buildQuery({ email, scope })}`,
      EMPTY_BRIEF,
    );
  },

  getDeadlines: (scope = "all", email = "") => {
    if (!email) {
      return Promise.resolve({ items: [] });
    }

    return requestGet(`/deadlines${buildQuery({ email, scope })}`, {
      items: [],
    });
  },

  getGmailStatus: (email = "") =>
    requestGet(
      `/gmail/status${email ? `?email=${encodeURIComponent(email)}` : ""}`,
      {
        oauthReady: false,
        credentialsConfigured: false,
        message: "Backend not reachable.",
      },
    ),

  getGmailProfile: () =>
    requestGet("/gmail/profile", {
      connected: false,
    }),

  async disconnectGmail() {
    const response = await api.post("/gmail/disconnect");
    return response.data;
  },

  getGmailOauthStartUrl(nextPathname = "/settings") {
    const nextUrl = buildOAuthNextUrl(nextPathname);
    return `${buildBrowserApiUrl("/gmail/oauth/start")}?next=${encodeURIComponent(nextUrl)}`;
  },

  async fetchEmails(range = "today", email = "") {
    if (!email) {
      return {
        success: false,
        error: "Enter your Gmail address in Settings first.",
      };
    }

    try {
      const response = await longFetchApi.post("/gmail/fetch", {
        range,
        email,
      });
      return response.data;
    } catch (error) {
      const detail = error.response?.data?.detail;
      const message =
        (typeof detail === "string" ? detail : detail?.error) ||
        error.response?.data?.error ||
        (error.code === "ERR_NETWORK"
          ? `Cannot reach backend at ${apiBaseUrl}`
          : error.message) ||
        "Failed to fetch emails from Gmail.";
      return { success: false, error: message };
    }
  },

  async refreshInbox(email = "", range = "all") {
    if (!email) {
      return { success: false, error: "Email is required." };
    }

    try {
      const response = await longFetchApi.post("/refresh", { email, range });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.detail || error.message || "Refresh failed.",
      };
    }
  },

  async deleteEmail(messageId, email = "") {
    const response = await api.post("/emails/delete", { messageId, email });
    return response.data;
  },

  async bulkEmailAction(action, messageIds, email = "") {
    const response = await api.post("/emails/bulk-action", {
      action,
      messageIds,
      email,
    });
    return response.data;
  },

  async updateEmailStatus(messageId, status, email = "") {
    const response = await api.post("/emails/update-status", {
      messageId,
      status,
      email,
    });
    return response.data;
  },

  async generateReply(messageId, replyType, email = "") {
    const response = await api.post("/emails/generate-reply", {
      messageId,
      replyType,
      email,
    });
    return response.data;
  },
};

export { EMPTY_BRIEF, EMPTY_DASHBOARD };
