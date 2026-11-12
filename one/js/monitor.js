/* Sends short browser error reports to Firestore (errors/*), where the admin dashboard lists them.
   At most five per visit, and the same message is sent once. Nothing is sent before sign-in. */
import { db } from "./fb.js";
import { BUILD } from "./config.js";
import * as Store from "./store.js";

const IGNORE = /ResizeObserver|Script error|Non-Error promise rejection|cancelled-popup|popup-closed/i;
const seen = new Set();
let sent = 0;

/* Error text can echo what a person typed. Mask emails and phone numbers before sending. */
const scrub = t => String(t || "").replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]").replace(/(?:\+?\d[\s().-]?){9,15}\d/g, "[number]");

function report(m, s) {
  try {
    const msg = scrub(String(m || "").trim()), d = db(), uid = Store.userId();
    if (!msg || IGNORE.test(msg) || !d || !uid || sent >= 5 || seen.has(msg.slice(0, 80))) return;
    seen.add(msg.slice(0, 80)); sent++;
    d.collection("errors").add({ m: msg.slice(0, 300), s: scrub(s).slice(0, 1200), u: String(location.hash || "#/").slice(0, 200), t: Date.now(), uid, v: BUILD }).catch(() => {});
  } catch {}
}

addEventListener("error", e => report(e.message, e.error?.stack));
addEventListener("unhandledrejection", e => report(e.reason?.message || e.reason, e.reason?.stack));
export const reportError = e => report(e?.message || e, e?.stack);
