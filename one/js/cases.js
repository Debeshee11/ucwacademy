/* Case Files: short animated films about real events in Indian finance.
   The player is drawn inside a shadow root so its look cannot touch, or be touched by, the rest of the app.
   Everything is inline SVG and CSS. No pictures are downloaded. Scenes are data (see casedata.js). */
import { h, icon } from "./dom.js";
import { mascot } from "./mascot.js";
import * as Store from "./store.js";
import { CASES, caseById } from "./casedata.js";
import { shareButton } from "./share.js";
import { siteUrl } from "./rate.js";

const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const inr = n => Math.round(n).toLocaleString("en-IN");
const KEY = "uc.cases", AUTO = "uc.cases.auto";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
const save = (id, o) => { try { const a = read(); a[id] = { ...(a[id] || {}), ...o }; localStorage.setItem(KEY, JSON.stringify(a)); } catch {} };
export const watched = () => Object.keys(read()).filter(k => read()[k].done).length;

/* ——— small SVG icon set (24 grid, stroke) ——— */
const IC = {
  bank: '<path d="M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>', person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-4 4-6 7-6s6 2 7 6"/>',
  paper: '<path d="M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6"/>', coins: '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3 3 7 3s7-1.3 7-3v-5"/>',
  chart: '<path d="M3 20h18M5 16l4-5 3 3 6-8"/>', building: '<path d="M5 21V5h9v16M14 9h5v12M8 8h3M8 12h3M8 16h3M3 21h18"/>',
  warn: '<path d="M12 4l9 16H3zM12 10v5M12 18v.5"/>', lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>', fund: '<path d="M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7"/>',
  atm: '<rect x="4" y="3" width="16" height="12" rx="2"/><path d="M8 18h8M8 21h8M12 7v4"/>', cash: '<rect x="3" y="7" width="18" height="10" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  users: '<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c.8-3.5 3-5 6-5s5.2 1.5 6 5M15 15c3 0 5 1 6 4"/>', people: '<circle cx="9" cy="9" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 19c.8-3.5 3-5 6-5s5.2 1.5 6 5M15 15c3 0 5 1 6 4"/>',
  speaker: '<path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>', trend: '<path d="M3 17l6-6 4 4 7-8M15 7h5v5"/>', search: '<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/>'
};
const ico = (n, size = 24, stroke = "#2B2118") => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${stroke}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || IC.paper}</svg>`;

const icg = (n, stroke = "#2B2118") => `<g fill="none" stroke="${stroke}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${IC[n] || IC.paper}</g>`;

/* ——— scene renderers: each returns an HTML string; counters are filled in by runCounts ——— */
const cnt = (to, { pre = "", suf = "", delay = 0, dur = 1.6 } = {}) => `<span class="cn" data-to="${to}" data-pre="${esc(pre)}" data-suf="${esc(suf)}" data-delay="${delay}" data-dur="${dur}">${esc(pre)}${calm() ? inr(to) : "0"}${esc(suf)}</span>`;

function open(s) {
  return `<div class="op"><div class="op-card"><div class="op-top"><span class="op-rib">${esc(s.ribbon || "News")}</span><span class="op-date">${esc(s.date)}</span></div><h2 class="op-h">${esc(s.head)}</h2><p class="op-s">${esc(s.sub || "")}</p><div class="op-lines" aria-hidden="true"><i></i><i></i><i></i></div></div></div>`;
}

function chart(s, K) {
  const W = 360, H = 320, L = 52, R = 312, T = 56, B = 250, pts = s.pts, n = pts.length, vals = pts.map(p => p[1]);
  const lo = Math.min(...vals), hi = Math.max(...vals), pad = (hi - lo) * .3 || hi * .2, yLo = Math.max(0, lo - pad), yHi = hi + pad;
  const X = i => L + (R - L) * (n === 1 ? .5 : i / (n - 1)), Y = v => B - (B - T) * (v - yLo) / (yHi - yLo);
  const down = s.down ?? 99, upEnd = Math.min(down, n - 1), c = s.c || K.c;
  const poly = (a, b) => { let d = ""; for (let i = a; i <= b; i++) d += (i === a ? "M" : "L") + X(i).toFixed(1) + " " + Y(vals[i]).toFixed(1); return d; };
  const total = 2.8, span = X(n - 1) - X(0), t0 = i => .35 + total * (X(i) - X(0)) / span;
  let paths = "";
  if (upEnd > 0) paths += `<path class="ln" pathLength="1" d="${poly(0, upEnd)}" stroke="${c}" style="animation-delay:.35s;animation-duration:${(total * (X(upEnd) - X(0)) / span).toFixed(2)}s"/>`;
  if (down < n - 1 || down === 0) paths += `<path class="ln" pathLength="1" d="${poly(down, n - 1)}" stroke="#E8573D" style="animation-delay:${t0(down).toFixed(2)}s;animation-duration:${(total * (X(n - 1) - X(down)) / span).toFixed(2)}s"/>`;
  const area = `<path class="ar" d="${poly(0, n - 1)}L${X(n - 1)} ${B}L${X(0)} ${B}Z" fill="${c}" style="animation-delay:${(total + .2).toFixed(2)}s"/>`;
  let notes = "", dots = "";
  (s.notes || []).forEach(nt => {
    const x = X(nt.i), y = Y(vals[nt.i]), d = t0(nt.i).toFixed(2), lines = String(nt.t).split("|"), wd = Math.max(...lines.map(l => l.length)) * 6.9 + 18, hh = lines.length * 15 + 8, below = nt.pos === "down";
    const left = nt.pos === "left", bx = left ? Math.max(4, x - wd - 14) : Math.min(W - wd - 4, Math.max(4, x - wd / 2)), by = left ? y - hh / 2 : below ? y + 14 : y - 14 - hh;
    dots += `<circle class="dt" cx="${x}" cy="${y}" r="6.5" fill="#fff" stroke="${nt.i >= down ? "#E8573D" : c}" stroke-width="3.5" style="animation-delay:${d}s"/>`;
    notes += `<g class="nt" style="animation-delay:${(+d + .15).toFixed(2)}s"><rect x="${bx}" y="${by}" width="${wd}" height="${hh}" rx="9" fill="#fff" stroke="#2B2118" stroke-width="2.4"/>${lines.map((l, k) => `<text x="${bx + wd / 2}" y="${by + 17 + k * 15}" text-anchor="middle" class="${k ? "nt2" : "nt1"}">${esc(l)}</text>`).join("")}</g>`;
  });
  const xl = pts.map((p, i) => `<text x="${X(i)}" y="${B + 22}" text-anchor="middle" class="ax">${esc(p[0])}</text>`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(s.title)}: ${pts.map(p => p[0] + " " + inr(p[1])).join(", ")}"><text x="${L}" y="24" class="ct">${esc(s.title || "")}</text><path d="M${L} ${B}H${R + 8}" class="bs"/>${area}${paths}${dots}${notes}${xl}</svg>`;
}

function pairs(s, K) {
  const W = 360, H = 320, B = 252, MAXH = 170, ng = s.groups.length, gw = (W - 24) / ng;
  let out = "", delay = .3;
  s.groups.forEach((g, gi) => {
    const x0 = 12 + gi * gw, mx = Math.max(g.a.v, g.b.v), sc = MAXH / mx, bw = Math.min(62, gw / 2 - 18), ax = x0 + gw / 2 - bw - 8, bx = x0 + gw / 2 + 8;
    const ah = g.a.v * sc, bh = g.b.v * sc, fh = (g.a.fake || 0) * sc, d1 = delay, d2 = delay + .5;
    out += `<text x="${x0 + gw / 2}" y="22" text-anchor="middle" class="ct">${esc(g.t)}</text>`;
    out += `<g class="gr" style="animation-delay:${d1}s"><rect x="${ax}" y="${B - ah}" width="${bw}" height="${ah}" rx="8" fill="${K.c}" stroke="#2B2118" stroke-width="3"/>`;
    if (fh) out += `<rect class="fk" x="${ax}" y="${B - ah}" width="${bw}" height="${fh}" rx="8" fill="url(#hatch)" stroke="#E8573D" stroke-width="3" style="animation-delay:${d2 + 1.1}s"/>`;
    out += `</g><g class="gr" style="animation-delay:${d2}s"><rect x="${bx}" y="${B - bh}" width="${bw}" height="${bh}" rx="8" fill="#2F8F5B" stroke="#2B2118" stroke-width="3"/></g>`;
    out += `<text class="cn bv" x="${ax + bw / 2}" y="${B - ah - 8}" text-anchor="middle" data-to="${g.a.v}" data-pre="" data-suf="" data-delay="${d1}" data-dur="1.2">${calm() ? inr(g.a.v) : "0"}</text>`;
    out += `<text class="cn bv" x="${bx + bw / 2}" y="${B - bh - 8}" text-anchor="middle" data-to="${g.b.v}" data-pre="" data-suf="" data-delay="${d2}" data-dur="1.2">${calm() ? inr(g.b.v) : "0"}</text>`;
    out += `<text x="${ax + bw / 2}" y="${B + 20}" text-anchor="middle" class="ax">${esc(g.a.l)}</text><text x="${bx + bw / 2}" y="${B + 20}" text-anchor="middle" class="ax">${esc(g.b.l)}</text>`;
    if (s.stamp && g.a.fake) out += `<g transform="translate(${ax + bw / 2} ${B - ah + fh / 2}) rotate(-12)"><g class="sm" style="animation-delay:${d2 + 1.5}s"><rect x="-58" y="-15" width="116" height="30" rx="7" fill="#fff" stroke="#E8573D" stroke-width="3"/><text y="6" text-anchor="middle" class="sm-t">${esc(s.stamp)}</text></g></g>`;
    delay += 1.1;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(s.groups.map(g => g.t + ": " + g.a.l + " " + inr(g.a.v) + ", " + g.b.l + " " + inr(g.b.v)).join(". "))}"><defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#FFE1DA"/><rect width="3.5" height="8" fill="#E8573D" opacity=".55"/></pattern></defs>${out}<path d="M12 ${B}H${W - 12}" class="bs"/>${s.note ? `<text x="180" y="305" text-anchor="middle" class="ax">${esc(s.note)}</text>` : ""}</svg>`;
}

const wrapWords = (t, n) => { const w = String(t).split(" "), out = []; let cur = ""; for (const x of w) { if ((cur + " " + x).trim().length > n && cur) { out.push(cur); cur = x; } else cur = (cur + " " + x).trim(); } if (cur) out.push(cur); return out.slice(0, 3); };
function flow(s) {
  const W = 360, H = 330, R = 36, N = Object.fromEntries(s.nodes.map(n => [n.id, { ...n, y: 62 + (n.y - 60) * 1.5 }]));
  const fill = t => t === "gold" ? "#FFE9A8" : t === "red" ? "#FFD9D2" : "#fff";
  let defs = `<marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2B2118"/></marker><marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#E8573D"/></marker>`;
  let edges = "", pk = "", lb = "", k = 0;
  for (const e of s.edges) {
    const a = N[e.a], b = N[e.b]; let dx = b.x - a.x, dy = b.y - a.y; const len = Math.hypot(dx, dy); dx /= len; dy /= len; const sg = e.a < e.b ? 1 : -1, nx = -dy * sg, ny = dx * sg, o = e.o || 0;
    const x1 = a.x + dx * (R + 4) + nx * o, y1 = a.y + dy * (R + 4) + ny * o, x2 = b.x - dx * (R + 8) + nx * o, y2 = b.y - dy * (R + 8) + ny * o, d = e.d ?? .8, bad = e.kind === "bad", id = "e" + (k++);
    edges += `<path id="${id}" class="ed${bad ? " bad" : ""}" pathLength="1" d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" marker-end="url(#${bad ? "arr" : "ar"})" style="animation-delay:${d}s"/>`;
    if (!calm()) {
      const col = e.kind === "money" ? "#FFC531" : bad ? "#E8573D" : "#fff", shape = e.kind === "money" ? `<circle r="7" fill="${col}" stroke="#2B2118" stroke-width="2"/><text y="3.5" text-anchor="middle" font-size="9" font-weight="800" fill="#2B2118">₹</text>` : `<rect x="-7" y="-9" width="14" height="18" rx="2.5" fill="${col}" stroke="#2B2118" stroke-width="2"/><path d="M-3 -3h6M-3 1h6M-3 5h4" stroke="${bad ? "#fff" : "#2B2118"}" stroke-width="1.6"/>`;
      pk += `<g class="pk" style="animation-delay:${d + .5}s"><g>${shape}<animateMotion dur="2.4s" begin="${(d + .5).toFixed(1)}s" repeatCount="indefinite" rotate="0"><mpath href="#${id}"/></animateMotion></g></g>`;
    }
    if (e.l) { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, wd = e.l.length * 6.2 + 14; lb += `<g class="el" style="animation-delay:${d + .3}s"><rect x="${mx - wd / 2}" y="${my - 10}" width="${wd}" height="20" rx="10" fill="#fff" stroke="#2B2118" stroke-width="2"/><text x="${mx}" y="${my + 4}" text-anchor="middle" class="ax2">${esc(e.l)}</text></g>`; }
  }
  const nodes = s.nodes.map((n, i0) => N[n.id]).map((n, i) => `<g transform="translate(${n.x} ${n.y})"><g class="nd" style="animation-delay:${i * .18}s">${n.warn ? `<circle class="wp" r="${R + 4}" fill="none" stroke="#E8573D" stroke-width="3"/>` : ""}<rect x="${-R}" y="${-R}" width="${R * 2}" height="${R * 2}" rx="20" fill="${fill(n.tone)}" stroke="#2B2118" stroke-width="3"/><g transform="translate(-19 -19) scale(1.58)">${icg(n.ic)}</g>${wrapWords(n.l, 14).map((t, j) => `<text y="${R + 17 + j * 13}" text-anchor="middle" class="nl">${esc(t)}</text>`).join("")}</g></g>`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(s.title || "Diagram")}: ${esc(s.nodes.map(n => n.l).join(", "))}"><defs>${defs}</defs>${s.title ? `<text x="14" y="22" class="ct">${esc(s.title)}</text>` : ""}${edges}${nodes}${lb}${pk}</svg>`;
}

function stats(s) { return `<div class="sts n${s.tiles.length}">${s.tiles.map((t, i) => `<div class="st-t" style="animation-delay:${i * .35}s"><b>${cnt(t.v, { pre: t.pre, suf: t.suf, delay: i * .35 + .2, dur: 1.7 })}</b><span>${esc(t.l)}</span></div>`).join("")}</div>`; }

function ledger(s) {
  const mx = Math.max(...s.rows.map(r => r[1]));
  return `<div class="lg"><h3 class="lg-h">${esc(s.title)}</h3>${s.rows.map((r, i) => `<div class="lg-r" style="animation-delay:${i * .6 + .2}s"><div class="lg-l"><span>${esc(r[0])}</span><b>${cnt(r[1], { pre: "₹", suf: " cr", delay: i * .6 + .3, dur: 1.1 })}</b></div><div class="lg-b"><i style="--w:${Math.max(6, 100 * r[1] / mx)}%;animation-delay:${i * .6 + .3}s"></i></div></div>`).join("")}<div class="lg-t" style="animation-delay:${s.rows.length * .6 + .5}s"><span>Together</span><b>${esc(s.total)}</b></div></div>`;
}

function lanes(s, K) {
  const max = Math.max(...s.rows.flatMap(r => r.segs.map(g => g[1])));
  return `<div class="ln-w"><h3 class="lg-h">${esc(s.title)}</h3>${s.rows.map((r, ri) => `<div class="ln-r"><span class="ln-l">${esc(r.l)}</span><div class="ln-t">${r.segs.map((g, i) => `<i style="left:${100 * g[0] / max}%;width:${100 * (g[1] - g[0]) / max}%;background:${g[2]};animation-delay:${.3 + ri * 1.2 + i * .25}s"></i>`).join("")}</div></div>`).join("")}<div class="ln-ax"><span class="ln-l"></span><div class="ln-ta">${s.axis.map(a => `<span>${esc(a)}</span>`).join("")}</div></div></div>`;
}

function timeline(s) {
  return `<div class="tl"><h3 class="lg-h">${esc(s.title)}</h3><ol>${s.items.map((it, i) => `<li class="tl-i ${esc(it[2] || "")}" style="animation-delay:${i * .55 + .2}s"><span class="tl-d">${esc(it[0])}</span><span class="tl-x">${esc(it[1])}</span></li>`).join("")}</ol></div>`;
}

function ripple(s) {
  const pos = [[64, 56], [296, 56], [64, 264], [296, 264]];
  const sats = s.sats.map((t, i) => `<g transform="translate(${pos[i][0]} ${pos[i][1]})"><g class="nd" style="animation-delay:${1.2 + i * .45}s"><rect x="-38" y="-30" width="76" height="60" rx="16" fill="#fff" stroke="#2B2118" stroke-width="3"/><g transform="translate(-11 -21) scale(.92)">${icg(t.ic)}</g>${wrapWords(t.l, 11).map((x, j) => `<text y="${12 + j * 11}" text-anchor="middle" class="nl2">${esc(x)}</text>`).join("")}</g></g>`).join("");
  const rings = [60, 95, 135].map((r, i) => `<circle class="rg" cx="180" cy="160" r="${r}" style="animation-delay:${.4 + i * .5}s"/>`).join("");
  return `<svg class="chart" viewBox="0 0 360 320" role="img" aria-label="${esc(s.center)} spreads to ${esc(s.sats.map(x => x.l).join(", "))}">${rings}<g transform="translate(180 160)"><g class="nd"><circle r="44" fill="#FFD9D2" stroke="#2B2118" stroke-width="3.5"/><circle class="wp" r="48" fill="none" stroke="#E8573D" stroke-width="3"/>${wrapWords(s.center, 9).map((x, j, a) => `<text y="${4 + (j - (a.length - 1) / 2) * 15}" text-anchor="middle" class="nl3">${esc(x)}</text>`).join("")}</g></g>${sats}</svg>`;
}

function split(s) {
  return `<div class="sp">${s.cols.map((c, i) => `<div class="sp-c ${c.tone}" style="animation-delay:${i * .6 + .2}s"><span class="sp-i">${ico(c.ic, 30, c.tone === "red" ? "#B3282D" : "#17714A")}</span><h3>${esc(c.h)}</h3>${c.lines.map((l, j) => `<p style="animation-delay:${i * .6 + .8 + j * .5}s">${esc(l)}</p>`).join("")}</div>`).join("")}</div>`;
}
const chips = s => `<div class="ch"><h3 class="lg-h">${esc(s.title)}</h3><div class="ch-w">${s.chips.map((c, i) => `<span class="ch-c" style="animation-delay:${i * .28 + .2}s">${esc(c)}</span>`).join("")}</div></div>`;
const lesson = s => `<div class="ls"><h3 class="lg-h">${esc(s.title)}</h3>${s.items.map((it, i) => `<div class="ls-c" style="animation-delay:${i * .45 + .15}s"><span class="ls-i">${ico(it[0], 24)}</span><p>${esc(it[1])}</p></div>`).join("")}</div>`;
const choice = s => `<div class="cq"><span class="cq-k">Pause and think</span><h3 class="cq-q">${esc(s.q)}</h3><div class="cq-o">${s.opts.map((o, i) => `<button type="button" class="cq-b" data-i="${i}"><span class="cq-l">${"ABC"[i]}</span><span>${esc(o.t)}</span></button>`).join("")}</div><p class="cq-w" aria-live="polite"></p></div>`;

const RENDER = { open, chart, pairs, flow, stats, ledger, lanes, timeline, ripple, split, chips, lesson, choice };

/* count-up numbers inside the stage */
function runCounts(root, tok) {
  if (calm()) return;
  root.querySelectorAll(".cn").forEach(el => {
    const to = +el.dataset.to, pre = el.dataset.pre || "", suf = el.dataset.suf || "", dur = (+el.dataset.dur || 1.5) * 1000, del = (+el.dataset.delay || 0) * 1000;
    let t0 = null;
    const step = ts => { if (tok.dead) return; if (t0 === null) t0 = ts + del; const p = Math.min(1, Math.max(0, (ts - t0) / dur)), e = 1 - Math.pow(1 - p, 3); el.textContent = pre + inr(to * e) + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}

const CSS = `
:host{display:block;background:#F3E9CF;min-height:100dvh}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}button{font:inherit;color:inherit;cursor:pointer}
.cs{--ink:#2B2118;--mute:#6B5A44;--c:#E08A00;--bg:#FFF1D0;display:flex;flex-direction:column;max-width:430px;height:100dvh;margin:0 auto;color:var(--ink);font-family:"Figtree","Noto Sans Devanagari","Noto Sans Gujarati",system-ui,sans-serif;background:linear-gradient(180deg,var(--bg),#FFFDF6 64%);position:relative;overflow:hidden}
@media(min-width:520px){.cs{height:min(900px,100dvh - 32px);margin:16px auto;border:3px solid var(--ink);border-radius:40px}}
.top{padding:14px 16px 6px;display:grid;grid-template-columns:minmax(0,1fr);gap:10px}.bars{display:flex;gap:4px}.bars i{flex:1;height:6px;border-radius:99px;background:rgba(43,33,24,.14);overflow:hidden}.bars i b{display:block;height:100%;width:0;background:var(--ink);border-radius:99px}.bars i.on b{width:100%}
.hd{display:flex;align-items:center;gap:10px}.hd .ttl{flex:1;min-width:0;font:800 15px var(--display,inherit);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hd .ttl small{display:block;font-weight:700;font-size:12px;color:var(--mute)}
.ib{width:42px;height:42px;border-radius:50%;border:3px solid var(--ink);background:#fff;display:grid;place-items:center;text-decoration:none;color:var(--ink);flex:none}.ib:focus-visible,.nb:focus-visible,.cq-b:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.stage{flex:1;min-height:0;overflow:auto;padding:6px 14px 8px;display:grid;align-items:center}.stage>*{animation:in .45s both}
.side{padding:6px 14px 14px;display:grid;gap:10px}.guide{display:flex;gap:10px;align-items:flex-end}.guide svg{flex:none;width:64px;height:auto}
.bub{position:relative;background:#fff;border:3px solid var(--ink);border-radius:20px;padding:11px 14px;font-size:16.5px;line-height:1.42;font-weight:600;min-height:64px;flex:1}.bub::before{content:"";position:absolute;left:-11px;bottom:18px;width:16px;height:16px;background:#fff;border-left:3px solid var(--ink);border-bottom:3px solid var(--ink);transform:rotate(45deg)}
.nav{display:flex;gap:8px;align-items:center}.nb{flex:1;height:50px;border-radius:16px;border:3px solid var(--ink);background:#fff;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center;gap:8px}.nb.go{background:var(--c);color:#fff;text-shadow:0 1px 0 rgba(0,0,0,.25);box-shadow:0 4px 0 var(--ink)}.nb.sq{flex:none;width:50px}.nb[disabled]{opacity:.45;cursor:default}
@media(min-width:1000px){.cs{max-width:1180px;height:min(860px,100dvh - 32px);display:grid;grid-template-columns:minmax(0,1fr) 380px;grid-template-rows:auto minmax(0,1fr);border-radius:44px}.top{grid-column:1/-1;padding:20px 30px 6px}.stage{grid-column:1;padding:10px 20px 20px}.side{grid-column:2;grid-row:2;align-content:end;padding:10px 28px 28px;gap:16px}.guide{flex-direction:column;align-items:stretch}.guide svg{width:160px;align-self:center}.bub::before{left:50%;bottom:auto;top:-11px;margin-left:-8px;border-left:3px solid var(--ink);border-top:3px solid var(--ink);border-bottom:0;transform:rotate(45deg)}}
@keyframes in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}@keyframes pop{0%{opacity:0;transform:scale(.6)}70%{transform:scale(1.08)}100%{opacity:1;transform:none}}@keyframes draw{to{stroke-dashoffset:0}}@keyframes fade{to{opacity:1}}@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}@keyframes slam{0%{opacity:0;transform:scale(2.2)}60%{opacity:1;transform:scale(.94)}100%{opacity:1;transform:none}}@keyframes pulse{0%{transform:scale(.9);opacity:.9}100%{transform:scale(1.35);opacity:0}}@keyframes ring{0%{opacity:0;transform:scale(.4)}20%{opacity:.5}100%{opacity:0;transform:scale(1.15)}}@keyframes slide{from{opacity:0;transform:translateX(-14px)}to{opacity:1;transform:none}}@keyframes bar{from{width:0}to{width:var(--w)}}@keyframes scx{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.chart{width:100%;height:auto;max-height:100%;background:#fff;border:3px solid var(--ink);border-radius:22px;display:block}
.ct{font:800 12.5px var(--display,inherit);fill:#2B2118}.ax{font:700 10.5px inherit;fill:#6B5A44}.ax2{font:800 10.5px inherit;fill:#2B2118}.bs{stroke:#2B2118;stroke-width:2.5;fill:none}.bv{font:800 15px var(--display,inherit);fill:#2B2118}.nl{font:800 11.5px inherit;fill:#2B2118}.nl2{font:800 10px inherit;fill:#2B2118}.nl3{font:800 13px var(--display,inherit);fill:#B3282D}
.ln{fill:none;stroke-width:6;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1s ease-out forwards}.ar{opacity:0;animation:fade .8s forwards;fill-opacity:.14}
.dt{opacity:0;transform-box:fill-box;transform-origin:center;animation:pop .45s forwards}.nt{opacity:0;animation:pop .45s forwards;transform-box:fill-box;transform-origin:center}.nt1{font:800 12.5px inherit;fill:#2B2118}.nt2{font:700 10.5px inherit;fill:#6B5A44}
.gr{transform-box:fill-box;transform-origin:50% 100%;animation:grow .8s cubic-bezier(.3,1.2,.5,1) both}.gr rect{transform-box:fill-box}.fk{opacity:0;animation:fade .6s forwards}.sm{opacity:0;transform-box:fill-box;transform-origin:center;animation:slam .5s forwards}.sm-t{font:800 12px inherit;fill:#B3282D;text-transform:uppercase;letter-spacing:.04em}
.ed{fill:none;stroke:#2B2118;stroke-width:3.5;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:draw .7s ease-out forwards}.ed.bad{stroke:#E8573D;stroke-width:3.5}.nd{opacity:0;transform-box:fill-box;animation:pop .5s forwards}.el{opacity:0;animation:fade .4s forwards}.pk{opacity:0;animation:fade .3s forwards}.wp{transform-box:fill-box;transform-origin:center;animation:pulse 1.5s infinite}
.rg{fill:none;stroke:#E8573D;stroke-width:3;opacity:0;transform-box:fill-box;transform-origin:center;animation:ring 2.4s ease-out infinite}
.op{position:relative;display:grid;place-items:center;padding:10px 4px}.op-card{width:100%;background:#fff;border:3px solid var(--ink);border-radius:22px;padding:18px 18px 20px;box-shadow:0 6px 0 var(--ink);transform:rotate(-1.2deg);animation:in .6s both}.op-top{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px}.op-rib{background:#E8573D;color:#fff;font:800 12px inherit;letter-spacing:.08em;text-transform:uppercase;padding:4px 10px;border-radius:8px}.op-date{font:800 13px inherit;color:var(--mute)}.op-h{margin:0 0 8px;font:900 29px/1.12 var(--display,inherit);letter-spacing:-.01em}.op-s{margin:0;font-size:16px;line-height:1.4;color:#4A3C2C;font-weight:600}.op-lines{margin-top:14px;display:grid;gap:6px}.op-lines i{height:7px;border-radius:99px;background:#EFE6CF}.op-lines i:nth-child(2){width:86%}.op-lines i:nth-child(3){width:58%}
.op-stamp{position:absolute;right:6px;top:-2px;transform:rotate(9deg);border:4px solid var(--c);color:var(--c);padding:3px 12px;border-radius:10px;font:900 15px var(--display,inherit);text-transform:uppercase;background:rgba(255,255,255,.85);opacity:0;animation:slam .5s 1s forwards}
.sts{display:grid;gap:12px}.st-t{background:#fff;border:3px solid var(--ink);border-radius:20px;padding:14px 16px;display:grid;grid-template-columns:auto 1fr;gap:4px 16px;align-items:center;opacity:0;animation:pop .5s forwards}.st-t b{font:900 40px/1 var(--display,inherit);color:var(--c);min-width:0}.st-t span{font:700 15px/1.3 inherit;color:#4A3C2C}.sts.n3 .st-t b{font-size:32px}
.lg-h{margin:0 0 10px;font:900 18px var(--display,inherit)}.lg{display:grid;gap:10px}.lg-r{opacity:0;animation:slide .5s forwards;background:#fff;border:3px solid var(--ink);border-radius:16px;padding:10px 12px}.lg-l{display:flex;justify-content:space-between;gap:10px;font-weight:700;font-size:14.5px}.lg-l b{font-weight:900;white-space:nowrap}.lg-b{height:10px;margin-top:7px;border-radius:99px;background:#EFE6CF;overflow:hidden}.lg-b i{display:block;height:100%;width:0;background:#E8573D;border-radius:99px;animation:bar 1s ease-out forwards}.lg-t{opacity:0;animation:slam .5s forwards;display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-radius:16px;background:#2B2118;color:#fff;font-weight:800}.lg-t b{font:900 19px var(--display,inherit);color:#FFC531}
.ln-w{background:#fff;border:3px solid var(--ink);border-radius:22px;padding:14px}.ln-r{display:grid;grid-template-columns:88px 1fr;gap:10px;align-items:center;margin:12px 0}.ln-l{font:800 13px/1.2 inherit}.ln-t{position:relative;height:30px;border-radius:10px;background:#F4ECD6}.ln-t i{position:absolute;top:0;height:100%;border:2.5px solid var(--ink);border-radius:9px;transform-origin:left;transform:scaleX(0);animation:scx .7s forwards}.ln-ax{display:grid;grid-template-columns:88px 1fr;gap:10px}.ln-ta{display:flex;justify-content:space-between;font:700 11px inherit;color:var(--mute)}
.tl ol{list-style:none;margin:0;padding:0 0 0 18px;border-left:4px solid var(--ink);display:grid;gap:10px}.tl-i{position:relative;opacity:0;animation:slide .5s forwards;background:#fff;border:3px solid var(--ink);border-radius:16px;padding:9px 12px;display:grid;gap:2px}.tl-i::before{content:"";position:absolute;left:-31px;top:16px;width:16px;height:16px;border-radius:50%;background:#fff;border:4px solid var(--ink)}.tl-i.red::before{background:#E8573D}.tl-i.green::before{background:#2F8F5B}.tl-d{font:800 12px inherit;letter-spacing:.04em;text-transform:uppercase;color:var(--mute)}.tl-x{font:700 15px/1.3 inherit}
.sp{display:grid;grid-template-columns:1fr 1fr;gap:12px}.sp-c{opacity:0;animation:pop .55s forwards;background:#fff;border:3px solid var(--ink);border-radius:22px;padding:14px;display:grid;gap:8px;align-content:start}.sp-c.green{background:#E4F6EC}.sp-c.red{background:#FFE6E1}.sp-c h3{margin:0;font:900 17px var(--display,inherit)}.sp-c p{margin:0;font:700 14px/1.35 inherit;opacity:0;animation:slide .5s forwards}.sp-i{display:grid}
.ch-w{display:flex;flex-wrap:wrap;gap:10px}.ch-c{opacity:0;animation:pop .45s forwards;background:#fff;border:3px solid var(--ink);border-radius:99px;padding:9px 15px;font:800 15px inherit;box-shadow:0 3px 0 var(--ink)}
.ls{display:grid;gap:10px}.ls-c{opacity:0;animation:pop .5s forwards;display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;background:#fff;border:3px solid var(--ink);border-radius:18px;padding:11px 13px}.ls-i{width:44px;height:44px;border-radius:14px;background:var(--bg);border:2.5px solid var(--ink);display:grid;place-items:center}.ls-c p{margin:0;font:700 15px/1.35 inherit}
.cq{display:grid;gap:12px;background:#fff;border:3px solid var(--ink);border-radius:22px;padding:16px;box-shadow:0 5px 0 var(--ink)}.cq-k{justify-self:start;background:var(--c);color:#fff;font:800 12px inherit;text-transform:uppercase;letter-spacing:.08em;padding:4px 10px;border-radius:8px}.cq-q{margin:0;font:900 19px/1.25 var(--display,inherit)}.cq-o{display:grid;gap:8px}.cq-b{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:center;text-align:left;background:#FFFBEF;border:3px solid var(--ink);border-radius:16px;padding:10px 12px;font:700 15px/1.3 inherit}.cq-l{width:28px;height:28px;border-radius:50%;background:#fff;border:2.5px solid var(--ink);display:grid;place-items:center;font:900 13px inherit}.cq-b.ok{background:#CFF1DD;animation:pop .4s}.cq-b.no{background:#FFD9D2;animation:pop .4s}.cq-b[disabled]{cursor:default}.cq-w{margin:0;font:700 14.5px/1.4 inherit;color:#4A3C2C;min-height:20px}
.end{display:grid;gap:12px;text-align:center;justify-items:center}.end h2{margin:0;font:900 26px var(--display,inherit)}.end .sc{font:900 54px/1 var(--display,inherit);color:var(--c)}.end p{margin:0;font-weight:700;color:#4A3C2C}.end .pts{background:#FFE9A8;border:3px solid var(--ink);border-radius:99px;padding:5px 14px;font:800 14px inherit}.end .acts{display:grid;gap:8px;width:100%}.end .nb{width:100%}.end details{width:100%;text-align:left;background:#fff;border:3px solid var(--ink);border-radius:16px;padding:10px 14px;font-size:14px}.end summary{font-weight:800;cursor:pointer}.end ul{margin:8px 0 0;padding-left:18px;display:grid;gap:6px}.end a{color:#1F4FA8;word-break:break-word}.end .dis{font-size:12.5px;color:var(--mute);font-weight:600}
@media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-delay:0s!important;animation-iteration-count:1!important}.ln{stroke-dashoffset:0}.op-stamp,.nd,.el,.pk,.dt,.nt,.fk,.sm,.ar,.lg-r,.lg-t,.tl-i,.sp-c,.sp-c p,.ch-c,.ls-c,.st-t{opacity:1}.rg{opacity:.3}}
`;

/* ——— the player ——— */
export function play(root, id) {
  const K = caseById(id);
  root.replaceChildren();
  if (!K) { root.append(h("main", { class: "wrap page stack" }, h("h1", { class: "h1" }, "That case file does not exist."), h("a", { class: "btn primary", href: "#/cases" }, "All case files"))); return; }
  const host = document.createElement("div"); root.append(host);
  const sh = host.attachShadow({ mode: "open" });
  sh.innerHTML = `<style>${CSS}</style><div class="cs" style="--c:${K.c};--bg:${K.bg}"></div>`;
  document.title = `${K.short} · Case Files`;
  const el = sh.querySelector(".cs"), scenes = K.scenes, N = scenes.length + 1;   /* the last card is the wrap-up */
  let i = 0, auto = (() => { try { return localStorage.getItem(AUTO) !== "0"; } catch { return true; } })(), tok = { dead: false }, t0 = 0, dur = 0, raf = 0, paused = false, right = 0, asked = 0, answered = false, voice = false;
  const choices = scenes.filter(s => s.t === "choice").length;
  const alive = () => host.isConnected;

  el.innerHTML = `<div class="top"><div class="bars">${Array.from({ length: N }, () => "<i><b></b></i>").join("")}</div><div class="hd"><a class="ib" href="#/cases" aria-label="Back to all case files">${icon("left", 20).outerHTML}</a><div class="ttl">${esc(K.short)}<small>Case file · ${esc(K.year)}</small></div><button class="ib" type="button" data-sound aria-label="Read aloud" aria-pressed="false" title="Read aloud">${ico("speaker", 20)}</button><button class="ib" type="button" data-pause aria-label="Pause" title="Pause"></button></div></div><div class="stage" aria-live="off"></div><div class="side"><div class="guide"><span class="gm"></span><div class="bub" role="status"></div></div><div class="nav"><button class="nb sq" type="button" data-prev aria-label="Previous">‹</button><button class="nb go" type="button" data-next>Next</button></div></div>`;
  const stage = el.querySelector(".stage"), bub = el.querySelector(".bub"), gm = el.querySelector(".gm"), next = el.querySelector("[data-next]"), prev = el.querySelector("[data-prev]"), pauseB = el.querySelector("[data-pause]"), sound = el.querySelector("[data-sound]"), bars = [...el.querySelectorAll(".bars i")];
  const setPause = () => { pauseB.innerHTML = auto && !paused ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="#2B2118"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>` : `<svg viewBox="0 0 24 24" width="18" height="18" fill="#2B2118"><path d="M7 4l13 8-13 8z"/></svg>`; pauseB.setAttribute("aria-label", auto && !paused ? "Pause autoplay" : "Play autoplay"); };
  const guide = m => { gm.innerHTML = mascot({ mood: m || "happy", pose: m === "joy" ? "cheer" : m === "explain" ? "explain" : "stand", view: "bust", px: 64 }); };

  function speak(t) { try { speechSynthesis.cancel(); if (voice && t) { const u = new SpeechSynthesisUtterance(t); u.lang = "en-IN"; u.rate = .98; speechSynthesis.speak(u); } } catch {} }
  function stop() { tok.dead = true; cancelAnimationFrame(raf); try { speechSynthesis.cancel(); } catch {} }
  function lengthOf(s) { return Math.max(6500, String(s.cap || "").split(/\s+/).length * 380 + 3800); }

  function tick(ts) {
    if (!alive()) { stop(); return; }
    if (!auto || paused || dur === 0) { t0 = 0; return; }
    if (!t0) t0 = ts;
    const p = Math.min(1, (ts - t0) / dur); bars[i].firstChild.style.width = (p * 100) + "%";
    if (p >= 1) { go(i + 1); return; }
    raf = requestAnimationFrame(tick);
  }
  function arm() { cancelAnimationFrame(raf); t0 = 0; const s = scenes[i]; dur = i >= scenes.length || s.t === "choice" ? 0 : lengthOf(s); if (auto && dur && !paused) raf = requestAnimationFrame(tick); }

  function end() {
    const pct = choices ? Math.round(100 * right / choices) : 100, passed = true, was = Store.get().quiz["case:" + K.id]?.passed;
    save(K.id, { done: 1, right, of: choices, at: Date.now() }); Store.recordQuiz("case:" + K.id, pct, passed);
    const idx = CASES.findIndex(c => c.id === K.id), nx = CASES[idx + 1];
    stage.innerHTML = `<div class="end"><span class="pts">${was ? "Case file watched again" : "+30 points"}</span><h2>Case closed</h2><div class="sc">${right}<small style="font-size:.4em;color:#6B5A44"> / ${choices}</small></div><p>${choices ? "pause-and-think answers right" : ""}</p><div class="acts" data-acts></div><details><summary>Sources</summary><ul>${K.sources.map(s => `<li><a href="${esc(s[1])}" target="_blank" rel="noopener noreferrer">${esc(s[0])}</a></li>`).join("")}</ul></details><p class="dis">Education only. Facts are from public records and news reports, checked on 25 November 2026. This is not investment advice, and it is not a view on any company's securities.</p></div>`;
    const acts = stage.querySelector("[data-acts]");
    const mk = (cls, label, fn, href) => { const b = document.createElement(href ? "a" : "button"); b.className = "nb " + cls; b.textContent = label; if (href) { b.href = href; b.style.textDecoration = "none"; } else { b.type = "button"; b.addEventListener("click", fn); } return b; };
    const sb = shareButton({ kicker: "Case file closed", big: choices ? `${right}/${choices}` : "Done", title: K.short, sub: "Real events, short films, what to learn.", tone: "violet" }, `I just watched the case file on ${K.short} on UpperCrust Academy.`, "Share a picture", "nb");
    acts.append(nx ? mk("go", "Next: " + nx.short, null, `#/case/${nx.id}`) : mk("go", "All case files", null, "#/cases"), sb, mk("", "Watch again", () => { right = 0; asked = 0; go(0); }));
    bub.textContent = pct === 100 ? "Sharp eyes. Spotting red flags is the whole point." : "Good. Now you know what to look for next time.";
    guide(pct === 100 ? "joy" : "happy"); next.style.display = "none";
    bars.forEach(b => b.classList.add("on"));
  }

  function go(n) {
    if (n < 0) n = 0; if (n > N - 1) return;
    tok.dead = true; tok = { dead: false }; i = n; answered = false; next.style.display = "";
    bars.forEach((b, k) => { b.classList.toggle("on", k < i); b.firstChild.style.width = k < i ? "100%" : "0"; });
    prev.disabled = i === 0;
    if (i >= scenes.length) { end(); arm(); return; }
    const s = scenes[i];
    stage.scrollTop = 0; stage.innerHTML = RENDER[s.t](s, K); stage.firstElementChild.style.animation = "in .45s both";
    bub.textContent = s.cap || ""; guide(s.m); speak(s.cap);
    next.disabled = s.t === "choice"; next.textContent = i === scenes.length - 1 ? "Finish" : "Next";
    runCounts(stage, tok);
    if (s.t === "choice") wireChoice(s);
    setPause(); arm();
    try { sh.activeElement && sh.activeElement.blur(); } catch {}
  }
  function wireChoice(s) {
    stage.querySelectorAll(".cq-b").forEach(b => b.addEventListener("click", () => {
      if (answered) return; answered = true; const o = s.opts[+b.dataset.i]; asked++;
      stage.querySelectorAll(".cq-b").forEach((x, k) => { x.disabled = true; if (s.opts[k].ok) x.classList.add("ok"); });
      if (o.ok) right++; else b.classList.add("no");
      stage.querySelector(".cq-w").textContent = (o.ok ? "Right. " : "Not quite. ") + o.why;
      guide(o.ok ? "joy" : "think"); next.disabled = false; next.focus && next.focus();
    }));
  }

  next.addEventListener("click", () => go(i + 1)); prev.addEventListener("click", () => go(i - 1));
  pauseB.addEventListener("click", () => { if (!auto) { auto = true; paused = false; } else paused = !paused; try { localStorage.setItem(AUTO, auto ? "1" : "0"); } catch {} setPause(); arm(); });
  sound.addEventListener("click", () => { voice = !voice; sound.setAttribute("aria-pressed", String(voice)); sound.style.background = voice ? "#FFE9A8" : "#fff"; if (voice) speak(scenes[i]?.cap); else try { speechSynthesis.cancel(); } catch {} });
  const key = e => { if (!alive()) { removeEventListener("keydown", key); stop(); return; } if (e.key === "ArrowRight" || e.key === " ") { if (e.target.closest && e.target.closest("button,a")) return; e.preventDefault(); if (!next.disabled) go(i + 1); } else if (e.key === "ArrowLeft") go(i - 1); else if (e.key === "Escape") location.hash = "#/cases"; };
  addEventListener("keydown", key);
  let sx = null; stage.addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true }); stage.addEventListener("touchend", e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 70) { if (dx < 0 && !next.disabled) go(i + 1); else if (dx > 0) go(i - 1); } }, { passive: true });
  addEventListener("hashchange", stop, { once: true });
  document.addEventListener("visibilitychange", () => { if (document.hidden) { paused = true; setPause(); } });
  go(0);
}

/* ——— the hub ——— */
const ART = {
  spike: c => `<svg viewBox="0 0 160 110" aria-hidden="true"><path d="M8 94 L44 70 L80 78 L112 20 L152 96" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" class="cfa-l"/><circle cx="112" cy="20" r="9" fill="#fff" stroke="#2B2118" stroke-width="4"/><path d="M8 100H152" stroke="#2B2118" stroke-width="4" stroke-linecap="round"/></svg>`,
  stack: c => `<svg viewBox="0 0 160 110" aria-hidden="true"><g stroke="#2B2118" stroke-width="4"><ellipse cx="80" cy="92" rx="46" ry="13" fill="${c}"/><ellipse cx="80" cy="76" rx="46" ry="13" fill="${c}"/><ellipse cx="80" cy="60" rx="46" ry="13" fill="${c}"/><ellipse class="cfa-g" cx="80" cy="42" rx="46" ry="13" fill="#fff" stroke-dasharray="6 6"/><ellipse class="cfa-g" cx="80" cy="26" rx="46" ry="13" fill="#fff" stroke-dasharray="6 6"/></g></svg>`,
  bridge: c => `<svg viewBox="0 0 160 110" aria-hidden="true"><path d="M6 78H154" stroke="#2B2118" stroke-width="6" stroke-linecap="round"/><path d="M20 78V98M60 78V98M100 78V98M140 78V98" stroke="#2B2118" stroke-width="5"/><path d="M20 78Q50 22 80 78Q110 22 140 78" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/><path class="cfa-c" d="M80 40L72 58L86 62L78 80" fill="none" stroke="#E8573D" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  door: c => `<svg viewBox="0 0 160 110" aria-hidden="true"><rect x="52" y="12" width="56" height="86" rx="10" fill="#fff" stroke="#2B2118" stroke-width="5"/><rect x="60" y="22" width="40" height="76" rx="6" fill="${c}"/><circle cx="92" cy="62" r="4" fill="#2B2118"/><g class="cfa-q" fill="#2B2118"><circle cx="18" cy="84" r="7"/><circle cx="34" cy="86" r="7"/><circle cx="130" cy="84" r="7"/><circle cx="146" cy="86" r="7"/></g></svg>`,
  atm: c => `<svg viewBox="0 0 160 110" aria-hidden="true"><rect x="38" y="10" width="84" height="92" rx="12" fill="#fff" stroke="#2B2118" stroke-width="5"/><rect x="50" y="22" width="60" height="30" rx="6" fill="${c}"/><text x="80" y="43" text-anchor="middle" font-size="15" font-weight="900" fill="#fff">₹50,000</text><rect x="52" y="64" width="56" height="8" rx="4" fill="#2B2118"/><rect x="62" y="82" width="36" height="8" rx="4" fill="#E8573D" class="cfa-c"/></svg>`
};

export function hub() {
  const prog = read(), seen = CASES.filter(c => prog[c.id]?.done).length;
  const card = c => { const p = prog[c.id]; return h("a", { class: "cf-card", href: `#/case/${c.id}`, style: `--c:${c.c};--bg:${c.bg}`, "aria-label": `${c.short}. ${c.min} minute film.` },
    (() => { const a = h("div", { class: "cf-art" }); a.innerHTML = `<span class="cf-yr">${c.year}</span>` + ART[c.art](c.c); return a; })(),
    h("div", { class: "cf-b" }, h("div", { class: "cf-tags" }, c.tags.map(t => h("span", {}, t)), h("span", { class: "cf-min" }, `${c.min} min`)),
      h("h3", {}, c.title), h("p", { class: "cf-s" }, c.short), h("p", { class: "cf-hook" }, c.hook),
      h("span", { class: "cf-go" }, p?.done ? `Watched · ${p.right}/${p.of} spotted. Watch again` : "Watch the film", icon("chev", 16)))); };
  const m = h("span", { class: "cf-m" }); m.innerHTML = mascot({ mood: "think", pose: "explain", view: "bust", px: 92 });
  return h("main", { class: "wrap page stack cf" },
    h("section", { class: "cf-hero" }, m, h("div", { class: "cf-ht" }, h("span", { class: "cf-k" }, "Case Files"), h("h1", { class: "h1" }, "Real events. Short films."), h("p", { class: "lead" }, "See how money stories really unfold, scene by scene. Spot the red flags. Learn what to check next time."), h("span", { class: "pill gold" }, `${seen} of ${CASES.length} watched`))),
    h("div", { class: "cf-grid" }, CASES.map(card), h("div", { class: "cf-soon" }, h("b", {}, "More coming"), h("small", {}, "New case files are added over time."))),
    h("p", { class: "tiny mute" }, "Education only. Facts come from public records and news reports. Not investment advice."));
}
