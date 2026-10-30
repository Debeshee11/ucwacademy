/* Library: fund factsheets and index pages, from the classic app's data. */
import { h, icon } from "./dom.js";
import { D, t3 } from "./data.js";
import * as Store from "./store.js";
import { page, notFound } from "./ui.js";

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
const SORTS = { r3: ["3-year return", f => f.ret.fund[f.ret.periods.indexOf("3Y")] ?? -999, -1], r1: ["1-year return", f => f.ret.fund[f.ret.periods.indexOf("1Y")] ?? -999, -1], aum: ["Fund size", f => f.aum, -1], er: ["Lowest expense", f => f.er, 1] };
const groupOf = id => D.fundGroups.find(g => g.funds.includes(id));

export function funds() {
  const st = { g: "all", sort: "r3", q: "" };
  const L = lang();
  const results = h("div", { class: "lib-grid" }), count = h("span", { class: "lib-count" });
  const chips = h("div", { class: "lib-chips", role: "group", "aria-label": "Category" });
  const sel = h("select", { class: "lib-select", "aria-label": "Sort by", on: { change: ev => { st.sort = ev.target.value; paint(); } } }, Object.entries(SORTS).map(([k, v]) => h("option", { value: k }, "Sort: " + v[0])));
  const search = h("input", { class: "lib-search", type: "search", placeholder: "Search funds or fund houses", "aria-label": "Search funds", on: { input: ev => { st.q = ev.target.value.trim().toLowerCase(); paint(); } } });

  function card(id) {
    const f = D.funds[id], r = f.ret, i3 = r.periods.indexOf("3Y"), i1 = r.periods.indexOf("1Y");
    const hero = r.fund[i3] != null ? [r.fund[i3], "3-year, a year", r.cat[i3]] : [r.fund[i1], "1-year", r.cat[i1]];
    const diff = hero[0] != null && hero[2] != null ? hero[0] - hero[2] : null;
    return h("a", { class: "lib-fc", href: "#/fund/" + id },
      h("div", { class: "lib-fc-top" }, avatar(f.house), h("div", { class: "lib-fc-name" }, h("small", {}, f.house), h("b", {}, f.name))),
      h("div", { class: "lib-fc-hero" }, h("div", {}, h("div", { class: "lib-big " + cls(hero[0]) }, sgn(hero[0])), h("div", { class: "lib-cap" }, hero[1])),
        diff != null ? h("span", { class: "lib-vs " + cls(diff) }, (diff > 0 ? "▲ " : "▼ ") + Math.abs(diff).toFixed(1) + " vs category") : null),
      h("div", { class: "lib-fc-meta" }, stat("1 year", sgn(r.fund[i1]), cls(r.fund[i1])), stat("Size", "₹" + num(f.aum, 0) + " cr"), stat("Expense", f.er + "%")));
  }
  function paint() {
    chips.replaceChildren(...[["all", "All funds"], ...D.fundGroups.map(g => [g.id, t3(g.name, L)])].map(([id, t]) =>
      h("button", { class: "lib-chip", "aria-pressed": String(st.g === id), on: { click: () => { st.g = id; paint(); } } }, t)));
    const [, key, dir] = SORTS[st.sort];
    const ids = D.fundGroups.filter(g => st.g === "all" || g.id === st.g).flatMap(g => g.funds).filter(id => D.funds[id])
      .filter(id => !st.q || (D.funds[id].name + " " + D.funds[id].house + " " + D.funds[id].category).toLowerCase().includes(st.q))
      .sort((a, b) => dir * (key(D.funds[a]) - key(D.funds[b])));
    count.textContent = ids.length + (ids.length === 1 ? " fund" : " funds");
    results.replaceChildren(...(ids.length ? ids.map(card) : [h("p", { class: "mute", style: "grid-column:1/-1;padding:24px 0" }, "No fund matches that search.")]));
  }
  paint();
  return page(
    head("funds", "Fund factsheets", "Real schemes, real numbers. Open one and read it the way a fund analyst does."),
    h("div", { class: "lib-quiz" }, h("div", {}, h("b", {}, "Test what you read"), h("p", {}, "Questions built from these factsheets.")),
      h("div", { class: "lib-quiz-btns" }, h("a", { class: "btn primary", href: "#/quiz/fund" }, "Fund quiz"), D.fundGroups.map(g => h("a", { class: "btn ghost", href: "#/quiz/fund/" + g.id }, t3(g.name, L).replace(/ funds?$/i, ""))))),
    h("div", { class: "lib-tools" }, h("div", { class: "lib-searchwrap" }, icon("search", 20), search), sel),
    h("div", { class: "lib-bar" }, chips, count),
    results,
    h("p", { class: "tiny mute" }, D.fundSource + " Past returns do not predict future returns. For learning, not a recommendation."));
}

export function fund(id) {
  const f = D.funds[id]; if (!f) return notFound("That fund is not in the library.");
  const L = lang(), r = f.ret, i3 = r.periods.indexOf("3Y");
  const list = arr => h("ul", { class: "lib-bullets" }, (arr || []).map(x => h("li", {}, t3(x, L))));
  const gid = groupOf(id)?.id || "";
  const maxR = Math.max(...r.fund.concat(r.cat).map(v => Math.abs(v ?? 0)), 1);
  return page(
    h("a", { class: "lib-back", href: "#/funds" }, icon("left", 18), "All funds"),
    h("section", { class: "lib-hero" },
      h("div", { class: "lib-hero-top" }, avatar(f.house, 56), h("div", {}, h("div", { class: "lib-eyebrow" }, f.house), h("h1", { class: "h1" }, f.name))),
      h("p", { class: "lib-obj" }, f.objective),
      h("div", { class: "lib-pills" }, h("span", {}, f.category), h("span", {}, f.tax), h("span", {}, "Benchmark: " + f.benchmark)),
      h("div", { class: "lib-hero-stats" },
        stat("NAV · " + f.navDate, "₹" + num(f.nav)), stat("Fund size", "₹" + num(f.aum, 0) + " cr"), stat("Expense ratio", f.er + "%"),
        stat("3-year return", sgn(r.fund[i3]), cls(r.fund[i3])))),
    h("div", { class: "lib-two" },
      h("div", { class: "lib-col" },
        panel("Returns versus category",
          h("div", { class: "lib-ret" }, r.periods.map((p, i) => h("div", { class: "lib-ret-col" },
            h("div", { class: "lib-ret-bars" },
              h("i", { class: "f " + cls(r.fund[i]), style: "height:" + Math.max(3, pct(Math.abs(r.fund[i] ?? 0), maxR)) + "%", title: "Fund " + sgn(r.fund[i]) }),
              h("i", { class: "c", style: "height:" + Math.max(3, pct(Math.abs(r.cat[i] ?? 0), maxR)) + "%", title: "Category " + sgn(r.cat[i]) })),
            h("b", { class: cls(r.fund[i]) }, sgn(r.fund[i])), h("span", {}, "cat " + sgn(r.cat[i])), h("small", {}, p), h("em", {}, "Rank " + r.rank[i])))),
          h("p", { class: "lib-note" }, h("i", { class: "f" }), "Fund ", h("i", { class: "c" }), "Category · as of " + r.asOf + " · periods over a year are annualised")),
        panel("Where the money sits", stacked(f.alloc), f.allocNote ? h("p", { class: "lib-note" }, f.allocNote) : null),
        panel("Top holdings", meter(f.holdings)),
        f.notes?.obs?.length ? panel("What stands out", list(f.notes.obs)) : null,
        f.notes?.risks?.length ? panel("Risks to explain", list(f.notes.risks)) : null),
      h("aside", { class: "lib-col lib-side" },
        panel("Key facts", h("dl", { class: "lib-dl" }, [["Manager", f.manager], ["Since", f.inception], ["Minimum SIP / lump sum", f.min], ["Exit load", f.exitLoad], ["Turnover", f.turnover], ["Return since launch", f.si != null ? f.si + "% a year" : "–"]].map(([k, v]) => h("div", {}, h("dt", {}, k), h("dd", {}, v))))),
        panel("Size and concentration", stacked([["Large cap", f.mcap.large], ["Mid cap", f.mcap.mid], ["Small cap", f.mcap.small]]),
          h("div", { class: "lib-mini" }, stat("Stocks", f.conc.stocks), stat("Top 10", num(f.conc.top10) + "%"), stat("P/E", f.conc.pe), stat("P/B", f.conc.pb))),
        f.debt ? panel("Debt and credit quality", h("div", { class: "lib-mini" }, stat("Securities", f.debt.n), stat("Mod. duration", f.debt.md + " yr"), stat("Avg maturity", f.debt.mat + " yr"), stat("YTM", f.debt.ytm + "%")), meter(f.credit, 100)) : null,
        h("div", { class: "lib-cta" }, h("a", { class: "btn primary block", href: "#/quiz/fund/" + gid }, "Quiz me on these funds"), source(f.pdf)))),
    h("p", { class: "tiny mute" }, D.fundSource + " For learning, not a recommendation."));
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
