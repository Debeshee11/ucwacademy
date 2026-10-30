/* Monthly fund holdings: parse what the admin pastes, load saved months, show what changed, and build the holdings quiz. */
import { db } from "./fb.js";
import { FUNDS_BASE } from "./config.js";
import { D } from "./data.js";

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const monthLabel = m => { const [y, k] = m.split("-").map(Number); return `${MON[k - 1]} ${y}`; };
export const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
const key = s => s.toLowerCase().replace(/\b(ltd|limited|corporation|corp|inc|the|co)\b/g, "").replace(/[^a-z0-9]+/g, "");
const tidy = s => s.replace(/\s+/g, " ").replace(/\s*\(.*?\)\s*$/, "").trim();

/* Text pasted from Excel or a CSV: security name plus its % of NAV. Other columns (ISIN, quantity, value) are ignored. */
export function parseHoldings(text) {
  const rows = new Map(), skipped = [];
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.trim(); if (!line) continue;
    let name = "", w = null;
    const cells = line.includes("\t") ? line.split("\t").map(c => c.trim()).filter(Boolean) : null;
    if (cells) {
      const nums = cells.map(c => (/^-?\d+(\.\d+)?\s*%?$/.test(c) ? parseFloat(c) : null));
      for (let i = cells.length - 1; i >= 0; i--) if (nums[i] != null) { w = nums[i]; break; }
      name = cells.find((c, i) => nums[i] == null && /[a-z]/i.test(c) && !/^INE[A-Z0-9]{9}$/.test(c)) || "";
    } else {
      const m = line.match(/^"?(.*?)"?[\s,;|]+(-?\d+(?:\.\d+)?)\s*%?\s*$/);
      if (m) { name = m[1].replace(/^"|"$/g, "").trim(); w = parseFloat(m[2]); }
    }
    if (!name || w == null || !(w > 0 && w <= 100) || /^(total|grand total|sub total|subtotal|net assets|name of|instrument|security|company|portfolio|% to nav|isin)/i.test(name)) { skipped.push(line.slice(0, 50)); continue; }
    name = tidy(name); const k = key(name);
    if (!k) continue;
    const e = rows.get(k) || { name, w: 0 }; e.w = Math.round((e.w + w) * 100) / 100; rows.set(k, e);
  }
  const list = [...rows.values()].sort((a, b) => b.w - a.w).map(r => [r.name, r.w]);
  return { rows: list, total: Math.round(list.reduce((a, r) => a + r[1], 0) * 100) / 100, skipped };
}

/* ——— saved data ——— */
export async function loadLive() {
  D.live = { funds: {}, months: {} };
  await loadAuto();
  const d = db();
  if (d) {
    try {
      const [a, b] = await Promise.all([d.collection("fundx").get(), d.collection("fundmonths").get()]);
      a.docs.forEach(x => { D.live.funds[x.id] = x.data(); });
      b.docs.forEach(x => { const v = x.data(); if (v?.fund && v?.month) (D.live.months[v.fund] ||= {})[v.month] = v; });
    } catch (e) { console.warn("Fund data not loaded", e); }
  }
  D.holdQs = buildQuestions();
}

/* The daily feed: new funds in the listed categories, and fresh NAV and returns for funds we already describe. */
async function loadAuto() {
  try {
    const r = await fetch(FUNDS_BASE + "funds-live.json", { cache: "no-cache" });
    if (!r.ok) throw new Error(r.status);
    const a = await r.json();
    D.auto = { groups: a.groups || [], funds: {}, updated: a.updated || "" };
    for (const [id, f] of Object.entries(a.funds || {})) {
      if (!f.ret?.fund?.some(v => v != null)) continue;
      if (D.funds[id]) Object.assign(D.funds[id], { nav: f.nav, navDate: f.navDate, ret: f.ret });
      else D.auto.funds[id] = { ...f, auto: true };
    }
  } catch (e) { D.auto = { groups: [], funds: {}, updated: "" }; }
}

export const fundIds = () => [...new Set([...Object.keys(D.funds), ...Object.keys(D.auto.funds), ...Object.keys(D.live.funds)])];
export const fundMeta = id => { const base = D.funds[id] || D.auto.funds[id] || null, extra = D.live.funds[id]; return base && extra ? { ...base, ...extra } : base || extra || null; };
export const fundName = id => fundMeta(id)?.name || id;
const baseMonth = () => "2026-09";

/* Months we hold for a fund, oldest first. The factsheet in funds.json counts as the base month (top 10 only). */
export function monthsOf(id) {
  const out = [], live = D.live.months[id] || {};
  for (const m of Object.keys(live).sort()) out.push({ month: m, rows: live[m].holdings, full: true, asOf: live[m].asOf });
  const f = D.funds[id];
  if (f?.holdings?.length && !live[baseMonth()]) out.unshift({ month: baseMonth(), rows: f.holdings, full: false, asOf: "30-Sep-26" });
  return out;
}

/* What changed between two months. Additions and exits are only reported when both months list full portfolios. */
export function diff(prev, cur) {
  const pm = new Map(prev.rows.map(r => [key(r[0]), r])), cm = new Map(cur.rows.map(r => [key(r[0]), r]));
  const both = [...cm].filter(([k]) => pm.has(k)).map(([k, r]) => ({ name: r[0], from: pm.get(k)[1], to: r[1], d: Math.round((r[1] - pm.get(k)[1]) * 100) / 100 }));
  const full = prev.full && cur.full;
  return {
    added: full ? [...cm].filter(([k]) => !pm.has(k)).map(([, r]) => r) : [],
    exited: full ? [...pm].filter(([k]) => !cm.has(k)).map(([, r]) => r) : [],
    up: both.filter(x => x.d > 0).sort((a, b) => b.d - a.d), down: both.filter(x => x.d < 0).sort((a, b) => a.d - b.d), full
  };
}

/* ——— the monthly holdings quiz ——— */
function rng(seed) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => { h += 0x6D2B79F5; let t = Math.imul(h ^ (h >>> 15), 1 | h); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function mix(correct, wrong, r) {
  const o = [correct, ...wrong.slice(0, 3)]; if (new Set(o.map(key)).size < 4) return null;
  const pos = Math.floor(r() * 4); o.splice(pos, 0, o.shift()); return [o, pos];
}
/* Questions from the daily returns feed. The month is in the id, so each month brings fresh ones. */
function returnsQuestions() {
  const out = [], groups = [...D.fundGroups, ...D.auto.groups.filter(a => !D.fundGroups.some(g => g.id === a.id))];
  for (const g of groups) {
    const ids = [...new Set([...(D.fundGroups.find(x => x.id === g.id)?.funds || []), ...(D.auto.groups.find(x => x.id === g.id)?.funds || [])])].filter(id => fundMeta(id)?.ret);
    const rows = ids.map(id => { const r = fundMeta(id).ret, i = r.periods.indexOf("3Y"), j = r.periods.indexOf("1Y"); return { id, name: fundName(id), y3: r.fund[i], y1: r.fund[j], c1: r.cat[j], when: fundMeta(id).navDate }; });
    const withY3 = rows.filter(x => x.y3 != null).sort((a, b) => b.y3 - a.y3);
    const month = new Date().toISOString().slice(0, 7), label = typeof g.name === "string" ? g.name : g.name?.en || g.id;
    if (withY3.length >= 4 && withY3[0].y3 - withY3[1].y3 >= .3) {
      const r = rng(`rq-${g.id}-${month}`), p = mix(withY3[0].name, withY3.slice(1).map(x => x.name).sort(() => r() - .5), r);
      if (p) out.push({ id: `fr-${g.id}-${month}-3y`, prompt: `Among these ${label.toLowerCase()}, which has the highest 3-year annual return today?`, options: p[0], answer: p[1], why: `${withY3[0].name} leads at ${withY3[0].y3}% a year over 3 years. Returns are as of ${withY3[0].when} and change daily.`, wrong: [], tags: ["returns", "equity"], fund: g.id, month });
    }
    for (const x of rows.filter(z => z.y1 != null && z.c1 != null && Math.abs(z.y1 - z.c1) >= .5).slice(0, 3)) {
      const beat = x.y1 > x.c1;
      out.push({ id: `fr-${x.id}-${month}-1y`, prompt: `Over the last year, did ${x.name} beat the average of its category group (${label})?`, options: ["Yes, it beat the group average", "No, it lagged the group average", "It matched the average exactly", "Cannot be compared"], answer: beat ? 0 : 1,
        why: `${x.name} returned ${x.y1}% over 1 year against a group average of ${x.c1}% (as of ${x.when}).`, wrong: [], tags: ["returns", "equity"], fund: x.id, month });
    }
  }
  return out;
}

export function buildQuestions() {
  const out = returnsQuestions(), pool = new Map();
  const ids = fundIds().filter(id => monthsOf(id).length);
  for (const id of ids) for (const m of monthsOf(id).slice(-1)) for (const [n] of m.rows.slice(0, 25)) pool.set(key(n), n);
  const names = [...pool.values()];
  for (const id of ids) {
    const ms = monthsOf(id), cur = ms[ms.length - 1], prev = ms.length > 1 ? ms[ms.length - 2] : null, f = fundName(id), when = monthLabel(cur.month);
    const rows = cur.rows, keys = new Set(rows.map(r => key(r[0]))), top10 = new Set(rows.slice(0, 10).map(r => key(r[0])));
    const outside = names.filter(n => !keys.has(key(n))), base = `fh-${id}-${cur.month}`, tags = ["holdings", "equity"];
    const push = (t, prompt, pair, why) => { if (pair) out.push({ id: `${base}-${t}`, prompt, options: pair[0], answer: pair[1], why, wrong: [], tags, fund: id, month: cur.month }); };
    let r = rng(base + "a");
    if (rows.length >= 4 && outside.length >= 3)
      push("top", `In ${when}, which stock has the largest weight in ${f}?`, mix(rows[0][0], outside.sort(() => r() - .5), r), `${rows[0][0]} is the largest holding at ${rows[0][1]}% of the portfolio in ${when}.`);
    r = rng(base + "b");
    if (rows.length >= 10 && outside.length >= 1)
      push("not", `Which of these is NOT among ${f}'s top 10 holdings in ${when}?`, mix(outside[Math.floor(r() * outside.length)], rows.slice(0, 10).map(x => x[0]).sort(() => r() - .5), r), `The top 10 are ${rows.slice(0, 10).map(x => x[0]).join(", ")}. The other name is not in the top 10 this month.`);
    r = rng(base + "c");
    if (rows.length >= 5) {
      const t5 = Math.round(rows.slice(0, 5).reduce((a, x) => a + x[1], 0) * 10) / 10, c = [t5, t5 * .5, Math.min(t5 * 1.6, 97), t5 * .25].map(v => `About ${v.toFixed(0)}%`);
      if (new Set(c).size === 4) { const p = mix(c[0], c.slice(1), r); if (p) out.push({ id: `${base}-t5`, prompt: `Roughly what share of ${f} do its top 5 holdings make up in ${when}?`, options: p[0], answer: p[1], why: `The top five add up to about ${t5}%.`, wrong: [], tags, fund: id, month: cur.month }); }
    }
    if (prev) {
      const d = diff(prev, cur), pl = monthLabel(prev.month), held = rows.slice(0, 12).map(x => x[0]);
      r = rng(base + "d");
      if (d.added.length && held.length >= 4) { const a = d.added[0]; push("new", `Which stock is a new entry in ${f} in ${when}, compared with ${pl}?`, mix(a[0], held.filter(n => key(n) !== key(a[0])).sort(() => r() - .5), r), `${a[0]} was not in the portfolio in ${pl} and holds ${a[1]}% in ${when}.`); }
      if (d.exited.length) { const x = d.exited[0], still = rows.slice(0, 12).map(z => z[0]); r = rng(base + "e"); push("out", `Which stock did ${f} exit between ${pl} and ${when}?`, mix(x[0], still.sort(() => r() - .5), r), `${x[0]} was ${x[1]}% of the portfolio in ${pl} and is gone in ${when}.`); }
      if (d.up.length && d.up[0].d >= .2) { const u = d.up[0]; r = rng(base + "f"); push("up", `Which holding of ${f} gained the most weight from ${pl} to ${when}?`, mix(u.name, rows.slice(0, 12).map(z => z[0]).filter(n => key(n) !== key(u.name)).sort(() => r() - .5), r), `${u.name} went from ${u.from}% to ${u.to}%, up ${u.d} points.`); }
    }
  }
  return out;
}
