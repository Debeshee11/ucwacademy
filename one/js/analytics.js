/* First-party analytics. Sends anonymous event counts to the backend: no cookies, no personal data, no ad tools.
   The admin page shows them. Failures are silent: analytics must never break the app. */
import { fns } from "./fb.js";

const seen = new Set();
const send = (e, src) => { try { const f = fns(); if (f) f.httpsCallable("track")({ e, src }).catch(() => {}); } catch {} };

/* Where this visit came from: ?utm_source, ?ref, else the referring site, else "direct". */
export function source() {
  try {
    const q = new URLSearchParams(location.search), s = q.get("utm_source") || q.get("ref");
    if (s) return s.toLowerCase().replace(/[^a-z0-9.-]/g, "").slice(0, 30) || "direct";
    const r = document.referrer && new URL(document.referrer).hostname.replace(/^www\./, "");
    return r && r !== location.hostname ? r.slice(0, 30) : "direct";
  } catch { return "direct"; }
}

/* Count an event once per page load for the once-only kinds, every time for the rest. */
export function track(e, once = false) {
  if (once) { if (seen.has(e)) return; seen.add(e); }
  send(e, e === "view" ? source() : undefined);
}
