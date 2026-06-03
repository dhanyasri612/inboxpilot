import { CATEGORY_ALIASES, CATEGORY_ORDER } from "./categoryMeta";
import { getInboxScopeOption } from "./inboxScope";

export function normalizeCategory(category) {
  const normalized = (category || "Other").trim().toLowerCase();
  return CATEGORY_ALIASES[normalized] || "Other";
}

export function formatDeadline(deadline) {
  if (!deadline) {
    return "—";
  }

  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) {
    return deadline;
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function groupEmailsByCategory(emails) {
  const grouped = Object.fromEntries(
    CATEGORY_ORDER.map((category) => [category, []]),
  );

  emails.forEach((email) => {
    const category = normalizeCategory(email.category);
    const matchedKey = CATEGORY_ORDER.includes(category) ? category : "Other";

    grouped[matchedKey].push(email);
  });

  return grouped;
}

export function getDistinctCategoryCount(emails) {
  return new Set(emails.map((email) => email.category || "Other")).size;
}

export function getGmailUrl(email) {
  if (email?.id) {
    return `https://mail.google.com/mail/u/0/#inbox/${encodeURIComponent(email.id)}`;
  }

  const subject = (email?.subject || "").trim();
  if (subject) {
    return `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(`subject:"${subject}"`)}`;
  }

  return "https://mail.google.com/mail/u/0/#inbox";
}

export function openEmailInGmail(email) {
  window.open(getGmailUrl(email), "_blank", "noopener,noreferrer");
}

function getEmailTimestamp(email) {
  if (email?.internalDate) {
    return Number(email.internalDate);
  }

  if (email?.date) {
    const parsed = new Date(email.date).getTime();
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

export function filterEmailsByScope(emails, scope) {
  if (!scope || scope === "all") {
    return emails;
  }

  const option = getInboxScopeOption(scope);
  if (!option?.days) {
    return emails;
  }

  const datedEmails = emails.filter(
    (email) => getEmailTimestamp(email) !== null,
  );
  if (datedEmails.length === 0) {
    return emails;
  }

  const cutoff = Date.now() - option.days * 24 * 60 * 60 * 1000;

  return emails.filter((email) => {
    const timestamp = getEmailTimestamp(email);
    return timestamp !== null && timestamp >= cutoff;
  });
}

export function buildDashboardFromEmails(emails) {
  const categoryCounts = {};
  let jobs = 0;
  let internships = 0;
  let interviews = 0;
  let promotions = 0;
  let spam = 0;
  let securityAlerts = 0;
  let deadlines = 0;

  emails.forEach((email) => {
    const category = normalizeCategory(email.category);
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;

    if (category === "Job") {
      jobs += 1;
    } else if (category === "Internship") {
      internships += 1;
    } else if (category === "Interview") {
      interviews += 1;
    } else if (category === "Promotion") {
      promotions += 1;
    } else if (category === "Spam") {
      spam += 1;
    } else if (category === "Security") {
      securityAlerts += 1;
    }

    if (email.deadline) {
      deadlines += 1;
    }

    const subject =
      `${email.subject || ""} ${email.summary || ""}`.toLowerCase();
    if (
      /offer|discount|sale|promotion|promotional|free|limited time|exclusive|deal|upgrade|webinar/.test(
        subject,
      ) &&
      category !== "Promotion"
    ) {
      promotions += 1;
    }
  });

  return {
    totalEmails: emails.length,
    jobs,
    internships,
    interviews,
    promotions,
    spam,
    securityAlerts,
    deadlines,
    categoryCounts,
  };
}

export function buildBriefFromEmails(emails) {
  const dashboard = buildDashboardFromEmails(emails);
  const sortedEmails = [...emails].sort(
    (left, right) => (right.priority || 0) - (left.priority || 0),
  );
  const topEmail = sortedEmails[0];

  const lines = ["Inbox Summary", ""];
  lines.push(`- ${dashboard.jobs} Job Opportunities`);
  lines.push(`- ${dashboard.internships} Internships`);
  lines.push(`- ${dashboard.interviews} Interviews`);
  lines.push(
    `- ${emails.filter((email) => normalizeCategory(email.category) === "Learning").length} Learning Emails`,
  );
  lines.push(`- ${dashboard.promotions} Promotions`);
  lines.push("");
  lines.push("Top Opportunity:");
  lines.push(topEmail?.subject || "No high-priority opportunity detected");

  return { brief: lines.join("\n") };
}

export function stripHtml(html) {
  if (!html) return "";

  // 1. Remove script and style tags and their contents
  let doc = html.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
  doc = doc.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");

  // 2. Replace common block elements with newlines to preserve some layout structure
  doc = doc.replace(/<\/p>/gi, "\n\n");
  doc = doc.replace(/<\/div>/gi, "\n");
  doc = doc.replace(/<br\s*\/?>/gi, "\n");
  doc = doc.replace(/<\/tr>/gi, "\n");
  doc = doc.replace(/<\/li>/gi, "\n");

  // 3. Strip remaining tags
  doc = doc.replace(/<[^>]+>/g, " ");

  // 4. Decode common html entities using browser DOMParser if available
  if (typeof DOMParser !== "undefined") {
    try {
      const parser = new DOMParser();
      const decodedDoc = parser.parseFromString(`<!DOCTYPE html><body>${doc}`, "text/html");
      doc = decodedDoc.body.textContent || doc;
    } catch (e) {
      // Fallback: simple textarea decoding
      try {
        const txt = document.createElement("textarea");
        txt.innerHTML = doc;
        doc = txt.value;
      } catch (err) {}
    }
  }

  // 5. Clean up multiple newlines and trailing whitespace
  return doc.replace(/\r\n/g, "\n").replace(/\n\s*\n\s*\n+/g, "\n\n").trim();
}
