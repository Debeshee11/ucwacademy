/* A first-visit tour of the main menu. Spotlights one menu item at a time; can be skipped and replayed from the account menu. */
import { h } from "./dom.js";

const STEPS = [
  ["#/", "Home", "Your next step is always on top. Open the app and press Start."],
  ["#/courses", "Learn", "Every course, in order. Finish lessons to earn points and unlock exams."],
  ["#/practice", "Practice", "A daily five, revision and the client lab. Two minutes is enough."],
  ["#/assess", "Exams", "Pass Beginner, Intermediate and Hard exams to earn certificates. NISM prep lives here too."],
  ["#/news", "News & Markets", "Today's headlines, and what to tell clients about them."],
  ["#/me", "Progress", "Your points, streak, certificates and the leaderboard."]
];
const KEY = u => "one:tour:" + u;
export const tourSeen = u => { try { return !!localStorage.getItem(KEY(u)); } catch { return true; } };
const markSeen = u => { try { localStorage.setItem(KEY(u), "1"); } catch {} };

/* The menu that is actually on screen: the sidebar on desktop, the bottom bar on phones. */
const target = href => [...document.querySelectorAll(".nav a, .tabs a")].find(a => a.getAttribute("href") === href && a.offsetParent !== null);

export function startTour(uid) {
  if (document.querySelector(".tour")) return;
  let i = 0;
  const ring = h("div", { class: "tour-ring", "aria-hidden": "true" });
  const title = h("h2", { class: "tour-t", id: "tour-t" }), text = h("p", { class: "tour-p" }), dots = h("div", { class: "tour-dots", "aria-hidden": "true" });
  const next = h("button", { class: "btn primary", on: { click: () => (i < STEPS.length - 1 ? (i++, paint()) : end()) } });
  const skip = h("button", { class: "btn quiet", on: { click: () => end() } }, "Skip");
  const card = h("div", { class: "tour-card", role: "dialog", "aria-modal": "true", "aria-labelledby": "tour-t" }, dots, title, text, h("div", { class: "row-flex tour-act" }, next, skip));
  const box = h("div", { class: "tour" }, ring, card);
  const key = e => { if (e.key === "Escape") end(); };
  function end() { document.removeEventListener("keydown", key); removeEventListener("resize", paint); box.remove(); markSeen(uid); }
  function paint() {
    const [href, name, body] = STEPS[i], t = target(href);
    title.textContent = name; text.textContent = body;
    next.textContent = i === STEPS.length - 1 ? "Start learning" : "Next";
    skip.hidden = i === STEPS.length - 1;
    dots.replaceChildren(...STEPS.map((_, k) => h("i", { class: k === i ? "on" : "" })));
    const small = matchMedia("(max-width: 900px)").matches;
    if (t) {
      const r = t.getBoundingClientRect(), pad = 6;
      Object.assign(ring.style, { display: "block", left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + pad * 2 + "px", height: r.height + pad * 2 + "px" });
      if (small) Object.assign(card.style, { left: "16px", right: "16px", top: "auto", bottom: innerHeight - r.top + 18 + "px", width: "auto" });
      else Object.assign(card.style, { left: r.right + 22 + "px", right: "auto", top: Math.max(16, Math.min(r.top - 10, innerHeight - 260)) + "px", bottom: "auto", width: "340px" });
    } else { ring.style.display = "none"; Object.assign(card.style, { left: "16px", right: "16px", top: "30%", bottom: "auto", width: "auto", maxWidth: "380px", margin: "0 auto" }); }
    next.focus();
  }
  document.addEventListener("keydown", key); addEventListener("resize", paint);
  document.body.append(box); paint();
}
