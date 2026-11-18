/* The Quote Bank: short, well-chosen lines about money and life. Anyone can turn one into a picture (JPG) with the Academy's mark and share it.
   Quotes live in one/data/quotes.json (built from content/quotes.tsv). Pictures are drawn on a canvas in the browser: nothing is uploaded. */
import { h, icon, toast, isoDay } from "./dom.js";
import { page } from "./ui.js";
import { pageHero } from "./pagehero.js";
import { pop } from "./analytics.js";

const THEMES = [["i", "Investing"], ["s", "Saving"], ["p", "Patience"], ["r", "Risk"], ["w", "Wealth"], ["m", "Mindset"], ["l", "Learning"], ["e", "Spending"], ["g", "Giving"]];
/* Light colours only. Each style is a background, a text colour, an accent and a soft shape colour. */
export const STYLES = [
  { id: "butter", name: "Butter", bg: "#FFF4C2", ink: "#3B3224", ac: "#E5A400", soft: "#FFE380" },
  { id: "mint", name: "Mint", bg: "#DFF5E8", ink: "#12382A", ac: "#1FA45B", soft: "#BFEBD2" },
  { id: "sky", name: "Sky", bg: "#E1EEFF", ink: "#12325B", ac: "#2F7CF6", soft: "#C3DBFF" },
  { id: "blush", name: "Blush", bg: "#FFE6E1", ink: "#4A1D17", ac: "#E5484D", soft: "#FFCFC7" },
  { id: "lilac", name: "Lilac", bg: "#EDE6FF", ink: "#2E1A5E", ac: "#7C4DFF", soft: "#D8CCFF" },
  { id: "peach", name: "Peach", bg: "#FFE9D6", ink: "#4A2A10", ac: "#F08A12", soft: "#FFD3AB" },
  { id: "cream", name: "Cream", bg: "#FBF3E1", ink: "#3B3224", ac: "#C9A24B", soft: "#F1E3BD" },
  { id: "paper", name: "Paper", bg: "#FFFFFF", ink: "#3B3224", ac: "#C9A24B", soft: "#F6F1E4", frame: true }
];
const SIZES = [["sq", "Square", 1080, 1080], ["po", "Portrait", 1080, 1350], ["st", "Story", 1080, 1920]];

/* ——— data ——— */
let cache = null;
export function loadQuotes() {
  if (!cache) cache = fetch("one/data/quotes.json").then(r => { if (!r.ok) throw new Error("quotes"); return r.json(); })
    .then(rows => rows.map(([id, text, author, tags, src]) => ({ id, text, author, tags, src }))).catch(e => { cache = null; throw e; });
  return cache;
}
const dayNo = () => Math.floor(Date.now() / 864e5);
export const quoteOfDay = list => list[dayNo() % list.length];
const styleFor = (q, k = 0) => STYLES[(parseInt(q.id, 16) + k) % STYLES.length];
const styleVars = s => `--qb:${s.bg};--qi:${s.ink};--qa:${s.ac};--qs:${s.soft}`;

/* ——— the picture ——— */
let markImg = null;
async function mark() {
  if (markImg) return markImg;
  try {
    const t = await (await fetch("assets/mark.svg")).text();
    const svg = t.replace("<svg ", '<svg width="304" height="168" ');
    const img = new Image(); img.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    await img.decode(); markImg = img;
  } catch { markImg = false; }
  return markImg;
}
function wrap(ctx, text, width) {
  const words = text.split(/\s+/), lines = []; let cur = "";
  for (const w of words) { const t = cur ? cur + " " + w : w; if (ctx.measureText(t).width > width && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
/* Draws one quote. Returns the canvas. */
export async function drawCard(q, style, sizeId) {
  const [, , W, H] = SIZES.find(s => s[0] === sizeId) || SIZES[0];
  try { await Promise.all([document.fonts.load('800 60px "Bricolage Grotesque"'), document.fonts.load('600 30px "Figtree"')]); } catch {}
  const logo = await mark();
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  x.fillStyle = style.bg; x.fillRect(0, 0, W, H);
  /* soft shapes */
  x.fillStyle = style.soft;
  x.beginPath(); x.arc(W * 0.92, H * 0.08, W * 0.34, 0, 7); x.fill();
  x.beginPath(); x.arc(W * 0.04, H * 0.94, W * 0.28, 0, 7); x.fill();
  if (style.frame) { x.strokeStyle = style.ac; x.lineWidth = 6; x.strokeRect(36, 36, W - 72, H - 72); x.lineWidth = 2; x.strokeRect(54, 54, W - 108, H - 108); }
  const pad = 96, boxW = W - pad * 2;
  /* opening mark */
  x.fillStyle = style.ac; x.font = '800 260px "Bricolage Grotesque", Georgia, serif'; x.textBaseline = "alphabetic";
  const top = H > 1500 ? 330 : 250;
  x.fillText("“", pad - 8, top + 100);
  /* the quote: the largest size that fits */
  const foot = 250, areaTop = top + 80, areaH = H - areaTop - foot - 150;
  let size = 84, lines = [];
  for (; size >= 36; size -= 2) { x.font = `800 ${size}px "Bricolage Grotesque", "Figtree", system-ui, sans-serif`; lines = wrap(x, q.text, boxW); if (lines.length * size * 1.22 <= areaH) break; }
  x.fillStyle = style.ink; x.textAlign = "left";
  const lh = size * 1.22, blockH = lines.length * lh, y0 = areaTop + Math.max(0, (areaH - blockH) / 2);
  lines.forEach((l, i) => x.fillText(l, pad, y0 + size * 0.9 + i * lh));
  /* the speaker */
  const ay = y0 + blockH + 70;
  x.fillStyle = style.ac; x.fillRect(pad, ay - 46, 90, 8);
  x.fillStyle = style.ink; x.font = '700 40px "Figtree", system-ui, sans-serif'; x.fillText(q.author, pad, ay + 20);
  if (q.src) { x.globalAlpha = 0.65; x.font = '600 28px "Figtree", system-ui, sans-serif'; x.fillText(q.src, pad, ay + 62); x.globalAlpha = 1; }
  /* the mark of the Academy */
  const fy = H - 150;
  x.fillStyle = style.ink; x.globalAlpha = 0.14; x.fillRect(pad, fy - 40, boxW, 3); x.globalAlpha = 1;
  if (logo) x.drawImage(logo, pad, fy - 6, 114, 63);
  const tx = pad + (logo ? 140 : 0);
  x.fillStyle = style.ink; x.font = '800 36px "Bricolage Grotesque", "Figtree", sans-serif'; x.fillText("UpperCrust Academy", tx, fy + 22);
  x.globalAlpha = 0.7; x.font = '600 26px "Figtree", system-ui, sans-serif'; x.fillText("Free money lessons · ucwacademy.in", tx, fy + 60); x.globalAlpha = 1;
  return c;
}
const toBlob = (canvas, type = "image/jpeg") => new Promise(r => canvas.toBlob(r, type, 0.92));
const slug = q => (q.author + "-" + q.id).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const quoteText = q => `“${q.text}” — ${q.author}\nucwacademy.in/#/quote/${q.id}`;

/* ——— share sheet ——— */
function sheet(q, startStyle) {
  let style = startStyle || styleFor(q), size = "sq", busy = 0;
  const preview = h("div", { class: "qs-pre" }), swatches = h("div", { class: "qs-sw", role: "group", "aria-label": "Colour" }), sizes = h("div", { class: "chips", role: "group", "aria-label": "Shape" });
  const done = () => { document.removeEventListener("keydown", key, true); veil.remove(); document.body.classList.remove("qs-open"); };
  const key = e => { if (e.key === "Escape") { e.stopPropagation(); done(); } };
  async function paint() {
    const mine = ++busy;
    swatches.replaceChildren(...STYLES.map(s => h("button", { type: "button", class: "qs-dot", style: `background:${s.bg};--dot:${s.ac}`, title: s.name, "aria-label": s.name, "aria-pressed": String(s.id === style.id), on: { click: () => { style = s; paint(); } } })));
    sizes.replaceChildren(...SIZES.map(([id, t]) => h("button", { type: "button", class: "chip", "aria-pressed": String(id === size), on: { click: () => { size = id; paint(); } } }, t)));
    const canvas = await drawCard(q, style, size);
    if (mine !== busy) return;
    canvas.setAttribute("role", "img"); canvas.setAttribute("aria-label", quoteText(q));
    preview.replaceChildren(canvas);
  }
  const file = async () => { const canvas = preview.querySelector("canvas") || await drawCard(q, style, size); return new File([await toBlob(canvas)], slug(q) + ".jpg", { type: "image/jpeg" }); };
  const canShare = typeof navigator.share === "function" && typeof navigator.canShare === "function";
  const act = h("div", { class: "qs-act" },
    h("button", { class: "btn primary", type: "button", on: { click: async () => { const f = await file(), a = h("a", { href: URL.createObjectURL(f), download: f.name }); document.body.append(a); a.click(); a.remove(); toast("Picture saved"); pop("page:quote-saved", false); } } }, icon("download", 18), "Download JPG"),
    canShare ? h("button", { class: "btn ghost", type: "button", on: { click: async () => { try { const f = await file(); if (navigator.canShare({ files: [f] })) await navigator.share({ files: [f], text: quoteText(q) }); else await navigator.share({ text: quoteText(q) }); } catch (e) { if (e?.name !== "AbortError") toast("Could not open sharing. Use Download instead."); } } } }, icon("share", 18), "Share") : null,
    h("button", { class: "btn ghost", type: "button", on: { click: async () => { try { await navigator.clipboard.writeText(quoteText(q)); toast("Copied"); } catch { toast("Could not copy"); } } } }, icon("copy", 18), "Copy text"));
  const veil = h("div", { class: "scrim qs", role: "dialog", "aria-modal": "true", "aria-label": "Share this quote" },
    h("div", { class: "qs-card stack" },
      h("div", { class: "row-flex between" }, h("h2", { class: "h2" }, "Make it a picture"), h("button", { class: "icon-btn", type: "button", "aria-label": "Close", on: { click: done } }, icon("x", 22))),
      preview, swatches, sizes, act,
      h("p", { class: "tiny mute" }, "The picture is made on your device and carries the UpperCrust Academy mark. Share it anywhere.")));
  document.addEventListener("keydown", key, true);
  document.body.classList.add("qs-open"); document.body.append(veil);
  paint();
}

/* ——— the cards ——— */
export function quoteCard(q, k = 0, big = false) {
  const s = styleFor(q, k);
  return h("article", { class: "qcard" + (big ? " big" : ""), style: styleVars(s) },
    h("span", { class: "qc-mark", "aria-hidden": "true" }, "“"),
    h("p", { class: "qc-t" }, q.text),
    h("div", { class: "qc-f" }, h("div", { class: "qc-a" }, h("b", {}, q.author), q.src ? h("small", {}, q.src) : null),
      h("button", { type: "button", class: "qc-b", "aria-label": `Share a quote by ${q.author} as a picture`, on: { click: () => sheet(q, s) } }, icon("share", 18), h("span", {}, "Share"))));
}

/* A small card for Home: today's quote. Fills in once the quotes have loaded. */
export function quoteOfDayCard() {
  const box = h("section", { class: "card stack stack-s qod" }, h("h3", { class: "h3" }, "Quote of the day"), h("p", { class: "small mute" }, "…"));
  loadQuotes().then(list => { const q = quoteOfDay(list), s = styleFor(q);
    box.replaceChildren(h("h3", { class: "h3" }, "Quote of the day"), h("blockquote", { class: "qod-q", style: styleVars(s) }, h("p", {}, q.text), h("footer", {}, "— " + q.author)),
      h("div", { class: "row-flex", style: "gap:12px;flex-wrap:wrap" }, h("button", { type: "button", class: "btn ghost sm", on: { click: () => sheet(q, s) } }, icon("share", 16), "Share as picture"), h("a", { class: "linkish", href: "#/quotes" }, "More quotes")));
  }).catch(() => box.remove());
  return box;
}

/* ——— the page ——— */
export function quotesPage(openId) {
  const f = { text: "", theme: "all", author: "all", n: 24 };
  const list = h("div", { class: "qgrid" }), top = h("div", { class: "stack" }), host = h("div", { class: "stack stack-l" }, h("p", { class: "mute" }, "Loading quotes…"));
  loadQuotes().then(all => {
    const authors = [...new Set(all.map(q => q.author))].sort((a, b) => a.localeCompare(b));
    const search = h("input", { class: "input", type: "search", placeholder: "Search by word or person", "aria-label": "Search quotes", on: { input: e => { f.text = e.target.value.trim().toLowerCase(); f.n = 24; paint(); } } });
    const who = h("select", { "aria-label": "Person", on: { change: e => { f.author = e.target.value; f.n = 24; paint(); } } }, h("option", { value: "all" }, "Everyone"), authors.map(a => h("option", { value: a }, a)));
    const chips = h("div", { class: "chips scroll", role: "group", "aria-label": "Theme" });
    const more = h("button", { class: "btn ghost", type: "button", on: { click: () => { f.n += 24; paint(); } } }, "Show more");
    const count = h("p", { class: "small mute" });
    function paint() {
      const pick = (v, t) => h("button", { type: "button", class: "chip", "aria-pressed": String(f.theme === v), on: { click: () => { f.theme = v; f.n = 24; paint(); } } }, t);
      chips.replaceChildren(pick("all", "All"), ...THEMES.map(([v, t]) => pick(v, t)));
      const res = all.filter(q => (f.theme === "all" || q.tags.includes(f.theme)) && (f.author === "all" || q.author === f.author) && (!f.text || (q.text + " " + q.author).toLowerCase().includes(f.text)));
      count.textContent = `${res.length} ${res.length === 1 ? "quote" : "quotes"}`;
      list.replaceChildren(...res.slice(0, f.n).map((q, i) => quoteCard(q, i)), ...(res.length ? [] : [h("p", { class: "mute" }, "Nothing matches. Try another word.")]));
      more.hidden = res.length <= f.n;
    }
    const today = quoteOfDay(all);
    const shuffle = h("button", { class: "btn ghost sm", type: "button", on: { click: () => { const q = all[Math.floor(Math.random() * all.length)]; sheet(q); } } }, icon("shuffle", 16), "Surprise me");
    host.replaceChildren(
      h("section", { class: "stack" }, h("h2", { class: "h2" }, "Quote of the day"), quoteCard(today, 0, true)),
      h("section", { class: "stack" }, h("div", { class: "row-flex between" }, h("h2", { class: "h2" }, "All quotes"), shuffle),
        h("div", { class: "search" }, icon("search"), search), chips, h("label", { class: "tiny mute qs-who" }, "Person", who), count, list, h("div", { style: "text-align:center" }, more)),
      h("p", { class: "tiny mute" }, "Quotes are attributed as widely published. If you spot a wrong attribution, write to us from the Contact page and we will fix it."));
    paint();
    const q = openId && all.find(x => x.id === openId);
    if (q) sheet(q);
  }).catch(() => host.replaceChildren(h("p", { class: "mute" }, "Quotes could not load. Check your connection and try again.")));
  return page(pageHero("quotes", "Quote bank", "Ideas worth sharing. Pick a quote, choose a colour, and share it as a picture.", []), host);
}
