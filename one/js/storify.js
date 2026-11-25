/* Turns a lesson from the course data into story cards for the Stories player.
   A hand-written story (one/data/stories/<n>.json, an array of cards) wins; otherwise the lesson's own parts become cards, so every lesson is a visual story. */
import { localize, liveQs, courseOf } from "./data.js";
import { sceneKey } from "./storyart.js";
import * as I18n from "./i18n.js";
const tr = I18n.tr;

const COLORS = { grow: "#FFF1C2", shield: "#DDEBFF", house: "#FFE6D8", car: "#FFE3E3", health: "#FFE3EC", gold: "#FFF1C2", silver: "#EAF0F8", bank: "#DDEBFF", stocks: "#E3F6EB", pie: "#EFE4FF", calendar: "#FFF1C2", percent: "#FFF1C2", globe: "#DDEBFF", doc: "#EFE4FF", scam: "#FFE9A8", scales: "#FFF1C2", factory: "#DDEBFF", family: "#EFE4FF", wallet: "#FFF1C2", loan: "#E3F6EB", growth: "#E3F6EB" };
const LEVEL = { foundation: "Beginner", practitioner: "Intermediate", expert: "Advanced" };
const strip = t => String(t || "").replace(/^["“]|["”]$/g, "");

export async function handStory(n) {
  try { const r = await fetch(`one/data/stories/${n}.json`, { cache: "no-cache" }); if (!r.ok) return null; const j = await r.json(); return Array.isArray(j) ? j : null; } catch { return null; }
}

export function buildStory(l, n, { pro, hand } = {}) {
  const c = courseOf(n), key = sceneKey(l.title, sceneKey(`${c ? c.title : ""} ${(l.tags || []).join(" ")}`)), lang = I18n.getLang();
  const cards = [{ k: "hook", art: key, h: l.story && !hand ? l.story.headline : l.title, s: `${c ? c.title : ""} · ${LEVEL[c && c.level] || ""}` }];
  if (hand) { if (hand[0] && hand[0].k === "hook") cards.shift(); cards.push(...hand); }
  else {
    if (l.story) l.story.paras.forEach(p => cards.push({ k: "fact", art: sceneKey(p, key), big: p, long: p.length > 150 }));
    (l.concept || []).forEach(p => cards.push({ k: "fact", art: sceneKey(p, key), big: p, long: p.length > 150 }));
    if (l.example) cards.push({ k: "eg", h: l.example.title, intro: l.example.intro, rows: l.example.rows.map(r => r[0] === "=" ? r : (l.example.head && r.length > 2 ? [r[0], ...r.slice(1)] : r)), note: l.example.note });
    if (l.client) cards.push({ k: "dialog", h: tr(pro ? "A client asks" : "A common question"), lines: [["meena", strip(l.client.quote)], ["sikka", tr(pro ? "How would you answer her in two sentences? Think, then try the questions." : "What would you say to a friend? Think, then try the questions.")]] });
    { const tt = `${l.title} ${(l.tags || []).join(" ")}`.toLowerCase(), model = /\bsip\b|systematic invest/.test(tt) ? "sip" : /inflation|purchasing power/.test(tt) ? "inflation" : /\bemi\b|loan|borrow/.test(tt) ? "emi" : /compound|lump ?sum|power of time/.test(tt) ? "lump" : null;
      if (model) cards.push({ k: "try", model }); }
    liveQs(l).forEach(q0 => { const q = localize(q0, lang), ans = q.answer, why = (q.options || []).map((_, i) => i === ans ? q.why : ((q0.wrong || [])[i] || ""));
      cards.push({ k: "pick", id: q0.id, h: tr("Check yourself"), q: q.prompt, opts: q.options, ans, why }); });
    if (l.talk) cards.push({ k: "fact", art: key, h: !pro ? "The short answer" : "What to tell a client", big: strip(l.talk), long: true });
    if ((l.remember || []).length) cards.push({ k: "remember", h: tr("Remember"), pts: l.remember.slice(0, 3) });
  }
  if (l.tool) cards.push({ k: "link", art: "loan", h: tr("Try it with your own numbers"), href: `#/lesson/${n}/classic`, label: tr("Open the calculator") });
  return { id: "L" + n, color: COLORS[key] || "#FFF1C2", n, title: l.title, sub: c ? c.title : "", cards };
}
