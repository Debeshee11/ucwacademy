/* Small shared UX parts: loading skeletons, a friendly error card, and the "continue where you stopped" bar. */
import { h } from "./dom.js";
import { D } from "./data.js";
import * as Store from "./store.js";
import { nextUp, hrefFor, labelFor } from "./path.js";

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
