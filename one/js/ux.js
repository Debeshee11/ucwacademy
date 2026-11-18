/* Small shared UX parts: loading skeletons, a friendly error card, and the "continue where you stopped" bar. */
import { h } from "./dom.js";
import { D } from "./data.js";
import * as Store from "./store.js";
import { nextUp, hrefFor, labelFor } from "./path.js";
import { signIn } from "./auth.js";

/* Shimmering placeholder cards. */
export const skeleton = (n = 3) => h("div", { class: "skel-list", role: "status", "aria-label": "Loading" }, Array.from({ length: n }, () =>
  h("div", { class: "skel" }, h("i", { class: "sk a" }), h("i", { class: "sk b" }), h("i", { class: "sk c" }))));

/* Shown when something could not load. Says plainly whether the device is offline. */
export function errorCard(onRetry) {
  const off = typeof navigator !== "undefined" && navigator.onLine === false;
  return h("div", { class: "errcard", role: "alert" },
    h("span", { class: "err-emo", "aria-hidden": "true" }, off ? "📡" : "🔌"),
    h("h2", { class: "h2" }, off ? "You are offline" : "Could not load"),
    h("p", { class: "mute" }, off ? "Connect to the internet and try again. Your progress is safe." : "Check your connection and try again. Your progress is safe."),
    h("button", { class: "btn primary", on: { click: onRetry } }, "Try again"));
}

/* A slim bar that jumps back into the next lesson. Returns null when there is nothing to resume. */
export function resumeBar() {
  const s = Store.get();
  if (!Object.keys(s.done || {}).length && !Object.keys(s.part || {}).length) return null;
  const step = nextUp();
  if (!step) return null;
  const c = step.course, title = step.kind === "lesson" ? D.lessons[step.n]?.title : labelFor(step);
  return h("a", { class: "resume", href: hrefFor(step) },
    h("span", { class: "resume-go", "aria-hidden": "true" }, "▶"),
    h("span", { class: "resume-b" }, h("small", {}, "Continue learning"), h("b", {}, title || ""), c ? h("small", {}, c.title) : null),
    h("span", { class: "resume-cta" }, "Resume"));
}

/* ——— In-app dialogs. They replace the browser's own pop-ups, so they match the app, read in the learner's language and work in every in-app browser. ——— */
function dialog(build) {
  return new Promise(resolve => {
    const before = document.activeElement;
    const close = v => { document.removeEventListener("keydown", key, true); veil.remove(); try { before?.focus?.(); } catch {} resolve(v); };
    /* While a dialog is open, keys belong to it: the quiz underneath must not react to 1-4 or Enter. */
    const key = ev => {
      ev.stopPropagation();
      if (ev.key === "Escape") { ev.preventDefault(); close(false); }
      else if (ev.key === "Tab") { const f = [...card.querySelectorAll("button,input,a[href]")]; if (!f.length) return; const i = f.indexOf(document.activeElement); ev.preventDefault(); f[(i + (ev.shiftKey ? f.length - 1 : 1)) % f.length].focus(); }
    };
    const card = h("div", { class: "dlg-card stack", role: "document" });
    const veil = h("div", { class: "dlg", role: "alertdialog", "aria-modal": "true", on: { click: ev => { if (ev.target === veil) close(false); } } }, card);
    build(card, close);
    document.addEventListener("keydown", key, true);
    document.body.append(veil);
    (card.querySelector("[data-first]") || card.querySelector("button"))?.focus();
  });
}

/* A yes/no question. Resolves true or false. ask("Leave this quiz?", { ok: "Leave", cancel: "Stay" }) */
export function ask(message, { ok = "Yes", cancel = "Cancel", danger = false, title = "" } = {}) {
  return dialog((card, close) => {
    const id = "dlg-" + Math.random().toString(36).slice(2, 8);
    card.parentElement?.setAttribute("aria-labelledby", id);
    if (title) card.append(h("h2", { class: "h2" }, title));
    card.append(
      h("p", { class: title ? "mute" : "dlg-msg", id }, message),
      h("div", { class: "dlg-row" },
        h("button", { type: "button", class: "btn ghost", "data-first": !danger, on: { click: () => close(false) } }, cancel),
        h("button", { type: "button", class: "btn primary" + (danger ? " danger" : ""), on: { click: () => close(true) } }, ok)));
  });
}

/* Shown when the clipboard is blocked: the text sits selected in a box, ready to copy by hand. */
export function showCopy(label, text) {
  return dialog((card, close) => {
    const box = h("input", { class: "input", type: "text", readonly: true, value: text, "aria-label": label, "data-first": true, on: { focus: ev => ev.target.select() } });
    card.append(h("h2", { class: "h2" }, label), box, h("div", { class: "dlg-row" }, h("button", { type: "button", class: "btn primary", on: { click: () => close(true) } }, "Done")));
  });
}

/* ——— Guests ——— */
/* A page a guest cannot use yet: says why in one line and offers one button. */
export function accountWall(title, why) {
  const go = h("button", { class: "btn primary", on: { click: () => signIn() } }, "Sign in or create an account");
  return h("main", { class: "wrap page stack stack-l", id: "main" },
    h("div", { class: "wall stack" },
      h("span", { class: "wall-emo", "aria-hidden": "true" }, "🔑"),
      h("p", { class: "eyebrow" }, title),
      h("h1", { class: "h1" }, "This part needs an account"),
      h("p", { class: "lead" }, why),
      h("p", { class: "small mute" }, "It takes a minute, and everything you have done on this device comes with you."),
      h("div", { class: "row-flex", style: "justify-content:center" }, go, h("a", { class: "btn ghost", href: "#/courses" }, "Keep learning"))));
}

/* On Home, once a guest has finished a lesson: a gentle offer to save their progress. Dismissed for the rest of the visit with one tap. */
let nudgeOff = false;
export function saveNudge(host) {
  if (!Store.isGuest() || nudgeOff) return;
  const n = Object.keys(Store.get().done || {}).length;
  if (!n) return;
  const card = h("div", { class: "nudge", role: "note" },
    h("span", { class: "nudge-emo", "aria-hidden": "true" }, "💾"),
    h("div", { class: "nudge-b" }, h("b", {}, n === 1 ? "You finished your first lesson." : `You have finished ${n} lessons.`), h("span", { class: "small" }, "They are saved on this device only. Create an account to keep them safe, learn on any device and earn certificates.")),
    h("button", { class: "btn primary sm", on: { click: () => signIn() } }, "Save my progress"),
    h("button", { class: "icon-btn", "aria-label": "Not now", on: { click: () => { nudgeOff = true; card.remove(); } } }, "✕"));
  host.prepend(card);
}
