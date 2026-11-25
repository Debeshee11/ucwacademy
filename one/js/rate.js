/* A quick "how was it?" after a lesson or an exam, followed by a share. Stars go to the existing review system for signed-in learners who have not reviewed yet.
   Guests keep the rating on this device only. Nothing here asks for personal details. */
import { h, icon, toast } from "./dom.js";
import * as Store from "./store.js";
import { send, mine } from "./reviewdata.js";

const K = "uc.rate", HOURS = 12;
const read = () => { try { return JSON.parse(localStorage.getItem(K)) || {}; } catch { return {}; } };
export const FACES = ["😞", "🙁", "😐", "🙂", "😍"];
/* Exams always ask once per attempt; lessons ask at most every 12 hours so it never nags. */
export const rateDue = kind => kind === "exam" || Date.now() - (read().t || 0) > HOURS * 3600e3;
export async function rateSave(stars) {
  try { localStorage.setItem(K, JSON.stringify({ t: Date.now(), stars })); } catch {}
  if (Store.isGuest() || !Store.userId()) return;
  try { if (!(await mine())) await send({ stars, areas: {}, tags: [], note: "", recommend: null }); } catch {}
}
export const siteUrl = () => `${location.origin}${location.pathname}?ref=friend`;
export const shareText = () => `I am learning money basics on UpperCrust Academy: short animated stories, quizzes and duels with friends. Try it: ${siteUrl()}`;
export const waHref = () => `https://wa.me/?text=${encodeURIComponent(shareText())}`;
export const FIX = ["Too fast", "Too hard", "Too easy", "Boring", "A bug", "The voice"];

export function rateCard(kind, label) {
  const out = h("div", { class: "rt-out" }), card = h("section", { class: "rt card" });
  const faces = h("div", { class: "rt-faces", role: "group", "aria-label": "Rate " + label }, FACES.map((f, i) => h("button", { type: "button", "aria-label": `${i + 1} of 5`, on: { click: () => pickStar(i + 1) } }, f)));
  function pickStar(n) {
    faces.querySelectorAll("button").forEach((b, i) => { b.disabled = true; b.classList.toggle("on", i === n - 1); }); rateSave(n);
    if (n >= 4) out.replaceChildren(h("p", { class: "rt-thx" }, "Glad you liked it. Tell a friend?"),
      h("div", { class: "row-flex", style: "gap:10px;flex-wrap:wrap;justify-content:center" },
        h("a", { class: "btn gold", href: waHref(), target: "_blank", rel: "noopener" }, icon("share", 18), "Share on WhatsApp"),
        h("button", { class: "btn ghost", type: "button", on: { click: async () => { try { await navigator.clipboard.writeText(siteUrl()); toast("Link copied"); } catch { toast("Could not copy"); } } } }, icon("copy", 18), "Copy link"),
        h("a", { class: "btn ghost", href: "#/challenge" }, icon("team", 18), "Duel a friend")),
      Store.isGuest() ? null : h("a", { class: "linkish small", href: "#/review" }, "Write a full review"));
    else out.replaceChildren(h("p", { class: "rt-thx" }, "Sorry about that. What was it?"), h("div", { class: "du-chips tags" }, FIX.map(t => h("button", { type: "button", class: "du-chip", on: { click: e => { e.currentTarget.setAttribute("aria-checked", "true"); toast("Thank you. We will fix it."); } } }, h("b", {}, t)))), h("a", { class: "linkish small", href: "#/contact" }, "Tell us more"));
  }
  card.append(h("b", { class: "rt-q" }, `How was ${label}?`), faces, out);
  return card;
}
