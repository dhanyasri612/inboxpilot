const ADDRESS_KEY = "inboxpilot-gmail-address";
const CONNECTED_KEY = "inboxpilot-gmail-connected";

export function getGmailState() {
  return {
    address: window.localStorage.getItem(ADDRESS_KEY) || "",
    connected: window.localStorage.getItem(CONNECTED_KEY) === "true",
  };
}

export function setGmailState({ address, connected }) {
  if (address !== undefined) {
    window.localStorage.setItem(ADDRESS_KEY, address);
  }
  window.localStorage.setItem(CONNECTED_KEY, String(Boolean(connected)));
  window.dispatchEvent(new Event("gmail-updated"));
}

export function clearGmailConnection() {
  window.localStorage.removeItem(ADDRESS_KEY);
  window.localStorage.setItem(CONNECTED_KEY, "false");
  window.dispatchEvent(new Event("gmail-updated"));
}
