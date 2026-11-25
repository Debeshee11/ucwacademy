/* Keys: a few doors in the Academy open as the learner earns points. Core lessons and every course's first exam are never locked.
   Anything the learner already used stays open, staff see everything, and a new key is celebrated once. */
import { h, icon, plural } from "./dom.js";
import * as Store from "./store.js";
import { nextUp, hrefFor } from "./path.js";
import { mascot } from "./mascot.js";

const used = k => { try { return !!localStorage.getItem(k) && localStorage.getItem(k) !== "0" && localStorage.getItem(k) !== "[]"; } catch { return false; } };
/* id, name, what it is, points to open, icon, where it lives, "already used" keys that keep it open */
export const GATES = [
  { id: "rw", name: "Right or wrong", sub: "Ten quick calls. Spot the trap.", at: 40, ic: "check", href: "#/game/rw", tone: "green", was: ["uc.best.rw"] },
  { id: "surv", name: "Survival", sub: "Three hearts. How far can you go?", at: 100, ic: "shield", href: "#/game/survive", tone: "pink", was: ["uc.best.surv"] },
  { id: "duel", name: "Duel a friend", sub: "Send a link. See who wins.", at: 60, ic: "team", href: "#/challenge", tone: "violet", was: ["uc.duels"] },
  { id: "tools", name: "Money calculators", sub: "SIP, EMI, emergency fund, retirement.", at: 250, ic: "trend", href: "#/tools", tone: "blue", was: [] }
];
const byId = id => GATES.find(g => g.id === id);
const seenKey = "uc.keys.seen";
const seen = () => { try { return JSON.parse(localStorage.getItem(seenKey) || "null"); } catch { return null; } };
const saveSeen = a => { try { localStorage.setItem(seenKey, JSON.stringify(a)); } catch {} };

export function gate(id) {
  const g = byId(id); if (!g) return { open: true };
  const have = Store.xp(), open = Store.isStaff() || have >= g.at || g.was.some(used);
  return { ...g, open, have, need: Math.max(0, g.at - have), pct: Math.min(100, Math.round(100 * have / g.at)) };
}
export const isOpen = id => gate(id).open;
export const nextKey = () => GATES.map(g => gate(g.id)).filter(g => !g.open).sort((a, b) => a.at - b.at)[0] || null;

/* the quickest way to earn points right now */
export function earnHref() { const st = nextUp(); return st ? hrefFor(st) : "#/quiz/daily"; }

const keySvg = (cls = "") => `<svg class="ky ${cls}" viewBox="0 0 120 64" aria-hidden="true"><g fill="none" stroke="#2B2118" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><circle cx="32" cy="32" r="22" fill="#FFC531"/><circle cx="32" cy="32" r="8" fill="#FFF3CF"/><path d="M54 32h58M96 32v14M82 32v10" fill="none"/></g></svg>`;
const html = (cls, s, tag = "span") => { const e = h(tag, { class: cls }); e.innerHTML = s; return e; };
const padlock = () => html("kp-lock", `<svg viewBox="0 0 120 140" aria-hidden="true"><path class="sh" d="M36 62V44a24 24 0 0 1 48 0v18" fill="none" stroke="#2B2118" stroke-width="9" stroke-linecap="round"/><rect x="18" y="58" width="84" height="68" rx="18" fill="#FFC531" stroke="#2B2118" stroke-width="6"/><circle cx="60" cy="88" r="9" fill="#2B2118"/><path d="M60 92v18" stroke="#2B2118" stroke-width="7" stroke-linecap="round"/></svg>`);
const meter = g => h("div", { class: "kp-meter", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": String(g.at), "aria-valuenow": String(g.have), "aria-label": `Points towards ${g.name}` }, h("i", { style: `width:${g.pct}%` }), h("span", {}, `${g.have} / ${g.at} points`));

/* Full-screen lock page for a route that is not open yet. */
export function lockPage(root, id) {
  const g = gate(id);
  const el = (h("main", { class: "kp wrap" },
    h("a", { class: "kp-x", href: "#/practice", "aria-label": "Back to Practice" }, icon("x", 22)),
    padlock(),
    h("p", { class: "kp-k" }, "Locked for now"), h("h1", { class: "kp-h" }, g.name), h("p", { class: "kp-s" }, g.sub),
    meter(g),
    h("div", { class: "kp-say" }, html("kp-m", mascot({ mood: "happy", pose: "explain", view: "bust", px: 64 })), h("p", {}, `${plural(g.need, "more point")} to open this. One lesson gives 20 points, a passed quiz gives 30.`)),
    h("a", { class: "btn primary kp-go", href: earnHref() }, "Earn points now"),
    h("a", { class: "kp-back", href: "#/practice" }, "Back to Practice")));
  if (root) { root.replaceChildren(); root.append(el); }
  return el;
}
export const guard = (id, view, root) => isOpen(id) ? view() : lockPage(root, id);

/* Small card: the next key and how far away it is. */
export function keyCard() {
  const g = nextKey(); if (!g) return h("div", { class: "kc kc-all" }, html("kc-ic", keySvg()), h("div", { class: "grow" }, h("small", {}, "Keys"), h("b", {}, "Every key is yours"), h("span", {}, "All doors are open. Go and collect trophies.")));
  return h("a", { class: "kc", href: earnHref() }, html("kc-ic", keySvg()), h("div", { class: "grow" }, h("small", {}, "Next key"), h("b", {}, `${g.name} opens at ${g.at} points`), h("div", { class: "kc-bar" }, h("i", { style: `width:${g.pct}%` })), h("span", {}, `${plural(g.need, "point")} to go. Tap to earn them.`)));
}

/* A locked tile for the Practice grids. */
export function lockedTile(g) {
  return h("a", { class: "ar-mode m-lock", href: g.href, "aria-label": `${g.name}, locked. Opens at ${g.at} points.` }, h("span", { class: "ar-ic" }, html("", `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="3"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`)),
    h("b", {}, g.name), h("small", {}, g.sub), h("div", { class: "kc-bar" }, h("i", { style: `width:${g.pct}%` })), h("span", { class: "ar-meta" }, `Opens at ${g.at} points`));
}

/* Once per new key: a small ceremony. Never interrupts a lesson, quiz or game. */
export function celebrate() {
  if (document.querySelector(".kcel")) return;
  const now = GATES.filter(g => gate(g.id).open).map(g => g.id), was = seen();
  if (!was) { saveSeen(now); return; }                 /* first visit with keys: nobody is shown things they already had */
  if (/^#\/(game|quiz|lesson|stories|story|challenge|nism)/.test(location.hash)) return;
  const fresh = now.filter(id => !was.includes(id)); if (!fresh.length) return;
  saveSeen(now);
  const g = byId(fresh[0]), more = fresh.length - 1, close = () => ov.remove();
  const ov = h("div", { class: "kcel", role: "dialog", "aria-modal": "true", "aria-label": "New key unlocked" }, h("div", { class: "kcel-b" },
    html("kcel-key", keySvg("spin")), h("p", { class: "kcel-k" }, "New key unlocked"), h("h2", { class: "kcel-h" }, g.name), h("p", { class: "kcel-s" }, g.sub + (more ? ` And ${plural(more, "more door")} opened.` : "")),
    h("a", { class: "btn primary", href: g.href, on: { click: close } }, "Try it now"), h("button", { class: "kcel-later", type: "button", on: { click: close } }, "Later")));
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) { const cols = ["#FFB703", "#2F8F5B", "#D6457A", "#1F7AC4", "#6B4FD6", "#F2780C"]; for (let i = 0; i < 40; i++) ov.append(h("i", { class: "kcf", style: `left:${Math.random() * 100}%;background:${cols[i % 6]};animation-delay:${Math.random() * .6}s;--dx:${(Math.random() - .5) * 180}px;--r:${Math.random() * 720}deg` })); }
  document.body.append(ov);
}
