/* Library: fund factsheets and index pages, from data/funds.json, data/indices.json and the monthly holdings the admin uploads. */
import { h, icon } from "./dom.js";
import { D, t3 } from "./data.js";
import * as Store from "./store.js";
import { page, notFound } from "./ui.js";
import { monthsOf, monthLabel, diff, fundIds, fundMeta } from "./holdings.js";

const lang = () => Store.get().lang || "en";
const num = (v, d = 2) => (v == null || v === "" ? "–" : Number(v).toLocaleString("en-IN", { maximumFractionDigits: d }));
const sgn = v => (v == null ? "–" : (v > 0 ? "+" : "") + v.toFixed(2) + "%");
const cls = v => (v == null ? "" : v < 0 ? "down" : "up");
const PALETTE = ["#2F7CF6", "#1FA45B", "#F08A12", "#7C5CFA", "#E5484D", "#0FA3B1", "#C98F00", "#D6409F"];
const colour = s => PALETTE[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
const initials = s => s.replace(/Mutual Fund|Prudential|Capital|Sun Life|Mahindra|India/g, "").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase() || s[0];
const avatar = (house, size) => h("span", { class: "lib-av", style: "background:" + colour(house) + (size ? ";width:" + size + "px;height:" + size + "px;font-size:" + Math.round(size / 3) + "px" : "") }, initials(house));
const pct = (v, max) => Math.max(0, Math.min(100, (v / max) * 100));

const tabs = cur => h("div", { class: "lib-tabs", role: "tablist" }, [["#/funds", "Funds", "funds"], ["#/indices", "Indices", "indices"]].map(([href, t, id]) =>
  h("a", { href, role: "tab", "aria-selected": String(cur === id) }, t)));
const head = (cur, title, lead) => h("header", { class: "lib-head" }, h("div", { class: "lib-eyebrow" }, "Library"), h("h1", { class: "h1" }, title), h("p", { class: "lead" }, lead), tabs(cur));
const stat = (k, v, tone) => h("div", { class: "lib-stat" }, h("span", {}, k), h("b", { class: tone || "" }, v));
const panel = (title, ...kids) => h("section", { class: "lib-panel" }, h("h2", { class: "lib-ptitle" }, title), ...kids);
const source = url => url ? h("a", { class: "btn ghost", href: url, target: "_blank", rel: "noopener noreferrer" }, icon("link", 18), "Official factsheet") : null;

/* a single stacked bar with a legend underneath */
const SEG = ["#2F7CF6", "#1FA45B", "#F6B800", "#F08A12", "#7C5CFA", "#0FA3B1", "#D6409F", "#8E8CA8"];
function stacked(rows) {
  const total = rows.reduce((a, r) => a + r[1], 0) || 1;
  return h("div", { class: "lib-stack" },
    h("div", { class: "lib-seg" }, rows.map((r, i) => h("i", { style: "width:" + (r[1] / total * 100) + "%;background:" + SEG[i % SEG.length], title: r[0] + " " + num(r[1]) + "%" }))),
    h("ul", { class: "lib-legend" }, rows.map((r, i) => h("li", {}, h("i", { style: "background:" + SEG[i % SEG.length] }), h("span", {}, r[0]), h("b", {}, num(r[1]) + "%")))));
}
const meter = (rows, max) => h("ul", { class: "lib-rows" }, rows.map(([k, v, sub]) => h("li", {},
  h("div", { class: "lib-rowtop" }, h("span", { class: "lib-rowname" }, k, sub ? h("small", {}, sub) : null), h("b", {}, num(v) + "%")),
  h("div", { class: "lib-track" }, h("i", { style: "width:" + pct(v, max || Math.max(...rows.map(r => r[1]))) + "%" })))));

/* ——— funds ——— */
const SORTS = { r3: ["3-year return", f => f.ret?.fund[f.ret.periods.indexOf("3Y")] ?? -999, -1], r1: ["1-year return", f => f.ret?.fund[f.ret.periods.indexOf("1Y")] ?? -999, -1], aum: ["Fund size", f => f.aum ?? -1, -1], er: ["Lowest expense", f => f.er ?? 99, 1] };
/* Groups from funds.json, plus funds the daily feed found, plus funds the admin added by hand. */
const allGroups = () => {
  const groups = D.fundGroups.map(g => ({ ...g, funds: [...g.funds] }));
  for (const a of D.auto.groups) {
    const g = groups.find(x => x.id === a.id) || (groups.push({ id: a.id, name: a.name, funds: [] }), groups[groups.length - 1]);
    if (a.type) g.type = a.type;
    for (const id of a.funds) if (!g.funds.includes(id) && fundMeta(id)) g.funds.push(id);
  }
  const mine = Object.keys(D.live.funds).filter(id => !groups.some(g => g.funds.includes(id)));
  return mine.length ? [...groups, { id: "more", name: { en: "More funds" }, funds: mine }] : groups;
};
const groupOf = id => allGroups().find(g => g.funds.includes(id));
const latest = id => { const m = monthsOf(id); return m[m.length - 1] || null; };
const retOf = f => { const r = f?.ret; if (!r) return null; const i3 = r.periods.indexOf("3Y"), i1 = r.periods.indexOf("1Y"); return { r, i3, i1 }; };

export function funds() {
  const st = { g: "all", k: "all", sort: "r3", q: "", n: 60 };
  const L = lang(), groups = allGroups(), kinds = [...new Set(groups.map(g => g.type || "Other"))];
  const catSel = h("select", { class: "lib-select", "aria-label": "Category", on: { change: ev => { st.g = ev.target.value; st.n = 60; paint(); } } });
  const more = h("button", { class: "btn ghost", style: "margin:16px auto;display:block", on: { click: () => { st.n += 60; paint(); } } }, "Show more");
  const results = h("div", { class: "lib-grid" }), count = h("span", { class: "lib-count" });
  const chips = h("div", { class: "lib-chips", role: "group", "aria-label": "Category" });
  const sel = h("select", { class: "lib-select", "aria-label": "Sort by", on: { change: ev => { st.sort = ev.target.value; paint(); } } }, Object.entries(SORTS).map(([k, v]) => h("option", { value: k }, "Sort: " + v[0])));
  const search = h("input", { class: "lib-search", type: "search", placeholder: "Search funds or fund houses", "aria-label": "Search funds", on: { input: ev => { st.q = ev.target.value.trim().toLowerCase(); st.n = 60; paint(); } } });

  function card(id) {
    const f = fundMeta(id), x = retOf(f), m = latest(id);
    let hero, sub, vs = null;
    if (x) {
      const use3 = x.r.fund[x.i3] != null, i = use3 ? x.i3 : x.i1, diffv = x.r.fund[i] != null && x.r.cat[i] != null ? x.r.fund[i] - x.r.cat[i] : null;
      hero = h("div", { class: "lib-big " + cls(x.r.fund[i]) }, sgn(x.r.fund[i])); sub = use3 ? "3-year, a year" : "1-year";
      vs = diffv != null ? h("span", { class: "lib-vs " + cls(diffv) }, (diffv > 0 ? "▲ " : "▼ ") + Math.abs(diffv).toFixed(1) + " vs category") : null;
    } else { hero = h("div", { class: "lib-big sm" }, m ? m.rows[0][0] : "Holdings coming"); sub = m ? "Largest holding · " + m.rows[0][1] + "%" : ""; }
    return h("a", { class: "lib-fc", href: "#/fund/" + id },
      h("div", { class: "lib-fc-top" }, avatar(f.house || f.name), h("div", { class: "lib-fc-name" }, h("small", {}, f.house || f.category || ""), h("b", {}, f.name))),
      h("div", { class: "lib-fc-hero" }, h("div", {}, hero, h("div", { class: "lib-cap" }, sub)), vs),
      h("div", { class: "lib-fc-meta" }, x ? stat("1 year", sgn(x.r.fund[x.i1]), cls(x.r.fund[x.i1])) : stat("Holdings", m ? m.rows.length + " stocks" : "–"),
        stat("Size", f.aum != null ? "₹" + num(f.aum, 0) + " cr" : "–"), stat(m ? "Holdings" : "Expense", m ? monthLabel(m.month) : (f.er != null ? f.er + "%" : "–"))));
  }
  function paint() {
    chips.replaceChildren(...[["all", "All"], ...kinds.map(k => [k, k])].map(([id, t]) =>
      h("button", { class: "lib-chip", "aria-pressed": String(st.k === id), on: { click: () => { st.k = id; st.g = "all"; st.n = 60; paint(); } } }, t)));
    const inKind = groups.filter(g => st.k === "all" || (g.type || "Other") === st.k);
    catSel.replaceChildren(h("option", { value: "all" }, "All categories (" + inKind.length + ")"), ...inKind.map(g => h("option", { value: g.id, selected: st.g === g.id }, t3(g.name, L) + " (" + g.funds.length + ")")));
    const [, key, dir] = SORTS[st.sort];
    const ids = inKind.filter(g => st.g === "all" || g.id === st.g).flatMap(g => g.funds).filter(id => fundMeta(id))
      .filter(id => !st.q || ((fundMeta(id).name || "") + " " + (fundMeta(id).house || "") + " " + (fundMeta(id).category || "")).toLowerCase().includes(st.q))
      .sort((a, b) => dir * (key(fundMeta(a)) - key(fundMeta(b))));
    count.textContent = ids.length + (ids.length === 1 ? " fund" : " funds");
    results.replaceChildren(...(ids.length ? ids.slice(0, st.n).map(card) : [h("p", { class: "mute", style: "grid-column:1/-1;padding:24px 0" }, "No fund matches that search.")]));
    more.hidden = ids.length <= st.n;
  }
  paint();
  return page(
    head("funds", "Fund factsheets", "Real schemes, real numbers. Open one and read it the way a fund analyst does."),
    h("div", { class: "lib-quiz" }, h("div", {}, h("b", {}, "Test what you read"), h("p", {}, "Questions built from these factsheets, this month's holdings and live returns.")),
      h("div", { class: "lib-quiz-btns" }, h("a", { class: "btn primary", href: "#/quiz/holdings" }, "Holdings quiz"), h("a", { class: "btn ghost", href: "#/quiz/fund" }, "Fund quiz"))),
    h("div", { class: "lib-tools" }, h("div", { class: "lib-searchwrap" }, icon("search", 20), search), catSel, sel),
    h("div", { class: "lib-bar" }, chips, count),
    results, more,
    h("p", { class: "tiny mute" }, D.fundSource + (D.auto.updated ? " NAV and returns refresh weekly from AMFI data." : "") + " Past returns do not predict future returns. For learning, not a recommendation."));
}

/* Holdings for one fund: pick a month, then see what changed since the month before. */
function holdingsPanels(id) {
  const ms = monthsOf(id); if (!ms.length) return [panel("Holdings", h("p", { class: "mute" }, "Holdings for this fund appear here once the monthly portfolio has been added."))];
  let cur = ms.length - 1;
  const box = h("div", { class: "lib-col" });
  function paint() {
    const m = ms[cur], prev = cur > 0 ? ms[cur - 1] : null, shown = m.rows.slice(0, 15);
    const chips = h("div", { class: "lib-chips", role: "group", "aria-label": "Month" }, ms.slice().reverse().slice(0, 12).map(x => { const i = ms.indexOf(x);
      return h("button", { class: "lib-chip", "aria-pressed": String(i === cur), on: { click: () => { cur = i; paint(); } } }, monthLabel(x.month)); }));
    const panels = [panel("Holdings", chips, meter(shown), h("p", { class: "lib-note" }, m.full ? `Top ${shown.length} of ${m.rows.length} holdings · as on ${m.asOf || monthLabel(m.month)}` : "Top 10 from the factsheet · as on " + m.asOf))];
    if (prev) {
      const d = diff(prev, m), line = (arr, f) => h("ul", { class: "lib-chg" }, arr.slice(0, 5).map(f));
      const parts = [];
      if (d.added.length) parts.push(h("div", {}, h("h3", { class: "lib-sub" }, "New entries"), line(d.added, r => h("li", {}, h("span", {}, r[0]), h("b", { class: "up" }, "+" + r[1] + "%")))));
      if (d.exited.length) parts.push(h("div", {}, h("h3", { class: "lib-sub" }, "Exited"), line(d.exited, r => h("li", {}, h("span", {}, r[0]), h("b", { class: "down" }, "was " + r[1] + "%")))));
      if (d.up.length) parts.push(h("div", {}, h("h3", { class: "lib-sub" }, "Increased the most"), line(d.up, r => h("li", {}, h("span", {}, r.name), h("b", { class: "up" }, "+" + r.d + " pts")))));
      if (d.down.length) parts.push(h("div", {}, h("h3", { class: "lib-sub" }, "Reduced the most"), line(d.down, r => h("li", {}, h("span", {}, r.name), h("b", { class: "down" }, r.d + " pts")))));
      if (parts.length) panels.push(panel("What changed since " + monthLabel(prev.month), ...parts, !d.full ? h("p", { class: "lib-note" }, "Only stocks listed in both months are compared, because one of the months shows just the top 10.") : null));
    }
    box.replaceChildren(...panels);
  }
  paint();
  return [box];
}

export function fund(id) {
  const f = fundMeta(id); if (!f) return notFound("That fund is not in the library.");
  const L = lang(), x = retOf(f), r = f.ret, m = latest(id);
  const list = arr => h("ul", { class: "lib-bullets" }, (arr || []).map(z => h("li", {}, t3(z, L))));
  const gid = allGroups().find(g => g.funds.includes(id))?.id || "";
  const maxR = r ? Math.max(...r.fund.concat(r.cat).map(v => Math.abs(v ?? 0)), 1) : 1;
  const facts = [["Manager", f.manager], ["Since", f.inception], ["Minimum SIP / lump sum", f.min], ["Exit load", f.exitLoad], ["Turnover", f.turnover], ["Return since launch", f.si != null ? f.si + "% a year" : null]].filter(z => z[1]);
  const mainCol = [
    r ? panel("Returns versus category",
      h("div", { class: "lib-ret" }, r.periods.map((p, i) => h("div", { class: "lib-ret-col" },
        h("div", { class: "lib-ret-bars" },
          h("i", { class: "f " + cls(r.fund[i]), style: "height:" + Math.max(3, pct(Math.abs(r.fund[i] ?? 0), maxR)) + "%", title: "Fund " + sgn(r.fund[i]) }),
          h("i", { class: "c", style: "height:" + Math.max(3, pct(Math.abs(r.cat[i] ?? 0), maxR)) + "%", title: "Category " + sgn(r.cat[i]) })),
        h("b", { class: cls(r.fund[i]) }, sgn(r.fund[i])), h("span", {}, "cat " + sgn(r.cat[i])), h("small", {}, p), h("em", {}, "Rank " + r.rank[i])))),
      h("p", { class: "lib-note" }, h("i", { class: "f" }), "Fund ", h("i", { class: "c" }), "Category · as of " + r.asOf + " · periods over a year are annualised")) : null,
    f.alloc ? panel("Where the money sits", stacked(f.alloc), f.allocNote ? h("p", { class: "lib-note" }, f.allocNote) : null) : null,
    ...holdingsPanels(id),
    f.notes?.obs?.length ? panel("What stands out", list(f.notes.obs)) : null,
    f.notes?.risks?.length ? panel("Risks to explain", list(f.notes.risks)) : null].filter(Boolean);
  const side = [
    facts.length ? panel("Key facts", h("dl", { class: "lib-dl" }, facts.map(([k, v]) => h("div", {}, h("dt", {}, k), h("dd", {}, v))))) : null,
    f.mcap ? panel("Size and concentration", stacked([["Large cap", f.mcap.large], ["Mid cap", f.mcap.mid], ["Small cap", f.mcap.small]]),
      f.conc ? h("div", { class: "lib-mini" }, stat("Stocks", f.conc.stocks), stat("Top 10", num(f.conc.top10) + "%"), stat("P/E", f.conc.pe), stat("P/B", f.conc.pb)) : null) : null,
    f.debt ? panel("Debt and credit quality", h("div", { class: "lib-mini" }, stat("Securities", f.debt.n), stat("Mod. duration", f.debt.md + " yr"), stat("Avg maturity", f.debt.mat + " yr"), stat("YTM", f.debt.ytm + "%")), meter(f.credit, 100)) : null,
    h("div", { class: "lib-cta" }, monthsOf(id).length ? h("a", { class: "btn primary block", href: "#/quiz/holdings/" + id }, "Quiz me on this fund's holdings") : null, gid ? h("a", { class: "btn ghost block", href: "#/quiz/fund/" + gid }, "Fund quiz") : null, source(f.pdf))].filter(Boolean);
  const stats = [f.nav != null ? stat("NAV" + (f.navDate ? " · " + f.navDate : ""), "₹" + num(f.nav)) : null, f.aum != null ? stat("Fund size", "₹" + num(f.aum, 0) + " cr") : null, f.er != null ? stat("Expense ratio", f.er + "%") : null,
    x ? stat("3-year return", sgn(r.fund[x.i3]), cls(r.fund[x.i3])) : null, m ? stat("Holdings as of", monthLabel(m.month)) : null].filter(Boolean);
  return page(
    h("a", { class: "lib-back", href: "#/funds" }, icon("left", 18), "All funds"),
    h("section", { class: "lib-hero" },
      h("div", { class: "lib-hero-top" }, avatar(f.house || f.name, 56), h("div", {}, h("div", { class: "lib-eyebrow" }, f.house || "Fund"), h("h1", { class: "h1" }, f.name))),
      f.objective ? h("p", { class: "lib-obj" }, f.objective) : null,
      h("div", { class: "lib-pills" }, [f.category, f.tax, f.benchmark ? "Benchmark: " + f.benchmark : null].filter(Boolean).map(z => h("span", {}, z))),
      stats.length ? h("div", { class: "lib-hero-stats" }, stats) : null),
    h("div", { class: "lib-two" }, h("div", { class: "lib-col" }, mainCol), h("aside", { class: "lib-col lib-side" }, side)),
    h("p", { class: "tiny mute" }, D.fundSource + (D.auto.updated ? " NAV and returns refresh weekly from AMFI data." : "") + " For learning, not a recommendation."));
}

/* ——— indices ——— */
export function indices() {
  const kinds = [...new Set(D.indices.map(i => i.kind))], st = { k: "all", q: "" };
  const results = h("div", { class: "lib-groups" }), chips = h("div", { class: "lib-chips", role: "group", "aria-label": "Type" });
  const search = h("input", { class: "lib-search", type: "search", placeholder: "Search indices", "aria-label": "Search indices", on: { input: ev => { st.q = ev.target.value.trim().toLowerCase(); paint(); } } });
  function card(i) {
    return h("a", { class: "lib-ic", href: "#/index/" + i.id },
      h("b", {}, i.name),
      h("div", { class: "lib-ic-meta" }, h("span", {}, "P/E ", h("b", {}, num(i.stats.pe))), h("span", {}, "1Y ", h("b", { class: cls(i.stats.r1y) }, sgn(i.stats.r1y)))));
  }
  function paint() {
    chips.replaceChildren(...[["all", "All"], ...kinds.map(k => [k, k])].map(([id, t]) => h("button", { class: "lib-chip", "aria-pressed": String(st.k === id), on: { click: () => { st.k = id; paint(); } } }, t)));
    const groups = kinds.filter(k => st.k === "all" || k === st.k).map(k => [k, D.indices.filter(i => i.kind === k && (!st.q || i.name.toLowerCase().includes(st.q)))]).filter(([, a]) => a.length);
    results.replaceChildren(...(groups.length ? groups.map(([k, a]) => h("section", { class: "lib-group" }, h("h2", { class: "lib-gtitle" }, k, h("span", {}, a.length)), h("div", { class: "lib-igrid" }, a.map(card)))) : [h("p", { class: "mute" }, "No index matches that search.")]));
  }
  paint();
  return page(head("indices", "NSE indices", "What is inside each index, how it is weighted and how it has behaved."),
    h("div", { class: "lib-quiz" }, h("div", {}, h("b", {}, "Test what you read"), h("p", {}, "Questions on index construction, weights and valuation.")),
      h("div", { class: "lib-quiz-btns" }, h("a", { class: "btn primary", href: "#/quiz/market" }, "Market quiz"), h("a", { class: "btn ghost", href: "#/quiz/index/nifty50" }, "Index quiz"))),
    h("div", { class: "lib-tools" }, h("div", { class: "lib-searchwrap" }, icon("search", 20), search)),
    h("div", { class: "lib-bar" }, chips), results);
}

export function index(id) {
  const i = D.indices.find(x => x.id === id); if (!i) return notFound("That index is not in the library.");
  const L = lang(), snap = i.snapshots?.[0], st = i.stats;
  const co = key => { if (key.startsWith("x:")) return { name: key.slice(2) }; const c = D.companies.en[key]; return c ? { ...c, short: D.companies.tx?.[L]?.[key] || c.short } : { name: key }; };
  return page(
    h("a", { class: "lib-back", href: "#/indices" }, icon("left", 18), "All indices"),
    h("section", { class: "lib-hero" }, h("div", { class: "lib-eyebrow" }, i.kind), h("h1", { class: "h1" }, i.name), h("p", { class: "lib-obj" }, i.about),
      h("div", { class: "lib-hero-stats" }, stat("P/E", num(st.pe)), stat("P/B", num(st.pb)), stat("Dividend yield", num(st.dy) + "%"), stat("1 year", sgn(st.r1y), cls(st.r1y)), stat("5 years, a year", sgn(st.r5y), cls(st.r5y)), stat("This year", sgn(st.ytd), cls(st.ytd)))),
    h("div", { class: "lib-two" },
      h("div", { class: "lib-col" },
        snap ? panel("Top holdings", h("ul", { class: "lib-co" }, snap.top.map(([k, w]) => { const c = co(k); return h("li", {}, h("div", {}, h("b", {}, c.name), c.short ? h("p", {}, c.short) : null), h("span", {}, num(w) + "%")); })),
          h("p", { class: "lib-note" }, snap.src + (snap.count ? " · " + snap.count + " stocks" : ""))) : null,
        i.method?.length ? panel("How it works", h("ul", { class: "lib-bullets" }, i.method.map(m => h("li", {}, m)))) : null),
      h("aside", { class: "lib-col lib-side" },
        i.sectors?.length ? panel("Sectors", meter(i.sectors.slice(0, 10))) : null,
        h("div", { class: "lib-cta" }, h("a", { class: "btn primary block", href: "#/quiz/index/" + id }, "Quiz me on this index"), source(i.factsheet)))));
}
