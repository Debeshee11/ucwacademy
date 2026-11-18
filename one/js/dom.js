/* Small DOM helpers. h("div", { class: "card", on: { click } }, "text", child) builds elements without innerHTML, so content can never inject markup. */
import { locale } from "./i18n.js";
export const $ = (sel, el = document) => el.querySelector(sel);

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "on") for (const [ev, fn] of Object.entries(v)) el.addEventListener(ev, fn);
    else if (k === "style") el.style.cssText = v;
    else if (k === "value") el.value = v;
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, v);
  }
  add(el, kids);
  return el;
}
export function add(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k.nodeType ? k : document.createTextNode(String(k)));
  }
  return el;
}
export const clear = el => { while (el.firstChild) el.firstChild.remove(); return el; };

/* Icons: 24px stroke icons in currentColor. Static strings only. */
const PATHS = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  book: '<path d="M4 19V5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M8 7h7M8 11h7"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  trend: '<path d="M3 17l5-5 4 4 8-8"/><path d="M15 8h5v5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  left: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  flame: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>',
  print: '<path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="9" rx="2"/><path d="M7 14h10v7H7z"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 21l1.9-5.4A8 8 0 1 1 21 12z"/>',
  out: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 17l-5-5 5-5M5 12h11"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 17l-5.4 2.8 1.1-6.1L3.2 9.4l6.1-.8z"/>',
  trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0z"/><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 14v4M8 21h8M9 18h6"/>',
  team: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.5 1.5 6.5 5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5c2.3.2 3.9 1.6 4.5 4.5"/>',
  download: '<path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>',
  share: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  quote: '<path d="M7 7c-2 1-3 3-3 6v4h5v-5H6.5c0-2 .8-3 2-3.5z"/><path d="M17 7c-2 1-3 3-3 6v4h5v-5h-2.5c0-2 .8-3 2-3.5z"/>',
  shuffle: '<path d="M4 7h3c4 0 6 10 10 10h3M4 17h3c1.6 0 2.8-1 3.8-2.4M13 9.4C14 8 15.4 7 17 7h3"/><path d="M18 5l2 2-2 2M18 15l2 2-2 2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8M12 17h.01"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.3 7.8-8 9-4.7-1.2-8-4.5-8-9V6z"/>'
};
export function icon(name, size) {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor");
  s.setAttribute("stroke-width", "1.8"); s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round");
  s.setAttribute("aria-hidden", "true");
  if (size) { s.setAttribute("width", size); s.setAttribute("height", size); }
  s.innerHTML = PATHS[name] || "";
  return s;
}

export function toast(msg) {
  document.querySelectorAll(".toast").forEach(t => t.remove());
  const t = h("div", { class: "toast", role: "status" }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), 2800);
}

export const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pick = (a, n) => shuffle(a).slice(0, n);

/* Dates are kept as local YYYY-MM-DD strings. */
export const isoDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const dayMs = 86400e3;
export const fmtDate = ts => new Date(ts).toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric" });
/* "2026-11" -> "November 2026" in the learner's language. */
export const fmtMonth = ym => { const [y, m] = String(ym).split("-").map(Number); return y && m ? new Date(y, m - 1, 1).toLocaleDateString(locale(), { month: "long", year: "numeric" }) : String(ym); };
export const greeting = () => { const hr = new Date().getHours(); return hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening"; };
export const ago = ts => {
  const m = Math.round((Date.now() - ts) / 6e4);
  if (m < 1) return "just now"; if (m < 60) return m + " min ago";
  const hr = Math.round(m / 60); if (hr < 24) return hr + " hr ago";
  const d = Math.round(hr / 24); return d === 1 ? "yesterday" : d + " days ago";
};
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + "s"}`;
export const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
