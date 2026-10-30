/* Library: fund factsheets and index pages, from the classic app's data. */
import { h, icon } from "./dom.js";
import { D, t3 } from "./data.js";
import * as Store from "./store.js";
import { page, notFound } from "./ui.js";

const lang = () => Store.get().lang || "en";
const num = (v, d = 2) => (v == null || v === "" ? "–" : Number(v).toLocaleString("en-IN", { maximumFractionDigits: d }));
const sgn = v => (v == null ? "–" : (v > 0 ? "+" : "") + v.toFixed(2) + "%");
const tone = v => (v == null ? "" : v < 0 ? "color:#D43B3B" : "color:#1FA45B");
const stat = (k, v) => h("div", { class: "card", style: "padding:14px 16px" }, h("div", { class: "tiny mute" }, k), h("div", { style: "font-weight:900;font-size:19px;margin-top:2px" }, v));
const grid = (...kids) => h("div", { style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px" }, kids);
const bars = (rows, max) => h("div", { class: "stack stack-xs" }, rows.map(([k, v]) => h("div", { class: "stack stack-xxs" },
  h("div", { class: "row-flex between small" }, h("span", {}, k), h("b", {}, num(v) + "%")),
  h("div", { class: "bar" }, h("i", { style: width:${Math.min(100, (v / (max || Math.max(...rows.map(r => r[1])))) * 100)}% })))));
const tabs = cur => h("div", { class: "chips" }, [["#/funds", "Funds", "funds"], ["#/indices", "Indices", "indices"]].map(([href, t, id]) =>
  h("a", { class: "chip", href, style: cur === id ? "background:var(--ink,#1D1B2E);color:#fff;border-color:var(--ink,#1D1B2E)" : "" }, t)));
const section = (title, ...kids) => h("section", { class: "stack" }, h("h2", { class: "h2" }, title), ...kids);
const source = url => url ? h("a", { class: "btn ghost", href: url, target: "_blank", rel: "noopener noreferrer", style: "align-self:flex-start" }, icon("link", 18), "Official factsheet") : null;

/* ——— funds ——— */
let sortBy = "r3";
const SORTS = [["r3", "3Y return"], ["r1", "1Y return"], ["aum", "Biggest"], ["er", "Lowest cost"]];
const houseShort = f => f.house.replace(/\s+Mutual Fund$/i, "");
/* drop the fund-house words the scheme name repeats: "Kotak Mahindra" + "Kotak Multi Asset…" → "Multi Asset…" */
const schemeName = f => { const hw = houseShort(f).split(/\s+/), nw = f.name.split(/\s+/); let i = 0; while (i < hw.length && i < nw.length - 1 && hw[i].toLowerCase() === nw[i].toLowerCase()) i++; return nw.slice(i).join(" "); };
const retAt = (f, p) => { const i = f.ret.periods.indexOf(p); return i < 0 ? null : f.ret.fund[i]; };
const SORT_KEY = { r3: f => -(retAt(f, "3Y") ?? -1e9), r1: f => -(retAt(f, "1Y") ?? -1e9), aum: f => -(f.aum ?? 0), er: f => f.er ?? 1e9 };
const toneCls = v => (v == null ? "" : v < 0 ? "down" : "up");

const sortBar = () => h("div", { class: "chips", role: "group", "aria-label": "Sort funds" }, SORTS.map(([id, t]) =>
  h("button", { type: "button", class: "chip", "aria-pressed": String(sortBy === id), on: { click: () => { sortBy = id; document.dispatchEvent(new Event("one:rerender")); } } }, t)));

function fundRow(id) {
  const f = D.funds[id], r1 = retAt(f, "1Y"), r3 = retAt(f, "3Y");
  return h("a", { class: "fund-row", href: "#/fund/" + id },
    h("div", { class: "fr-head" },
      h("div", { class: "fr-title" }, h("div", { class: "fr-house" }, houseShort(f)), h("div", { class: "fr-scheme" }, schemeName(f))),
      h("div", { class: "fr-hero" }, h("div", { class: "fr-big " + toneCls(r3) }, sgn(r3)), h("div", { class: "fr-cap" }, "3Y a year")),
      h("span", { class: "chev" }, icon("chev", 18))),
    h("div", { class: "fr-meta" },
      h("div", {}, h("span", {}, "1Y"), h("b", { class: toneCls(r1) }, sgn(r1))),
      h("div", {}, h("span", {}, "AUM"), h("b", {}, "₹" + num(f.aum, 0) + " cr")),
      h("div", {}, h("span", {}, "Expense"), h("b", {}, f.er + "%"))));
}

export function funds() {
  const sorted = ids => ids.filter(id => D.funds[id]).sort((a, b) => SORT_KEY[sortBy](D.funds[a]) - SORT_KEY[sortBy](D.funds[b]));
  return page(
    h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Library"), h("p", { class: "lead mute" }, "Real fund factsheets. Read them the way a fund analyst does."), tabs("funds")),
    h("div", { class: "stack stack-xs" }, h("div", { class: "eyebrow" }, "Test yourself"),
      h("div", { class: "chips" }, h("a", { class: "chip", href: "#/quiz/fund" }, "All funds"),
        D.fundGroups.map(g => h("a", { class: "chip", href: "#/quiz/fund/" + g.id }, t3(g.name, lang()).replace(/\s+funds$/i, ""))))),
    h("div", { class: "stack stack-xs" }, h("div", { class: "eyebrow" }, "Sort by"), sortBar()),
    D.fundGroups.map(g => section(t3(g.name, lang()), h("div", { class: "fund-list" }, sorted(g.funds).map(fundRow)))),
    h("p", { class: "tiny mute" }, D.fundSource + " Past returns do not predict future returns."));
}

export function fund(id) {
  const f = D.funds[id]; if (!f) return notFound("That fund is not in the library.");
  const L = lang(), r = f.ret;
  const list = arr => (arr || []).map(x => h("li", {}, t3(x, L)));
  return page(
    h("div", { class: "stack stack-s" }, h("a", { class: "small", href: "#/funds" }, "← Funds"), h("div", { class: "tiny mute" }, f.house + " · " + f.category), h("h1", { class: "h1" }, f.name), h("p", { class: "mute" }, f.objective)),
    grid(stat("NAV", "₹" + num(f.nav) + " · " + f.navDate), stat("AUM", "₹" + num(f.aum, 0) + " cr"), stat("Expense ratio", f.er + "%"), stat("Turnover", f.turnover), stat("Exit load", f.exitLoad), stat("Since", f.inception), stat("Min SIP / lump", f.min), stat("Manager", f.manager), stat("Benchmark", f.benchmark), stat("Tax", f.tax)),
    section("Returns vs category", h("div", { style: "overflow-x:auto" }, h("table", { style: "width:100%;border-collapse:collapse;min-width:420px" },
      h("thead", {}, h("tr", {}, ["", ...r.periods].map(x => h("th", { style: "text-align:right;padding:8px;font-size:13px" }, x)))),
      h("tbody", {}, [["Fund", r.fund, 1], ["Category", r.cat, 1], ["Rank", r.rank, 0]].map(([n, a, c]) => h("tr", {}, h("td", { style: "padding:8px;font-weight:800" }, n), a.map(v => h("td", { style: "padding:8px;text-align:right;" + (c ? tone(v) : "") }, c ? sgn(v) : v))))))),
      h("p", { class: "tiny mute" }, "As of " + r.asOf + ". Periods over one year are annualised.")),
    section("Where the money sits", bars(f.alloc, 100), f.allocNote ? h("p", { class: "tiny mute" }, f.allocNote) : null),
    section("Top holdings", bars(f.holdings)),
    h("div", { class: "cols", style: "grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px" },
      section("Size and concentration", grid(stat("Large cap", num(f.mcap.large) + "%"), stat("Mid cap", num(f.mcap.mid) + "%"), stat("Small cap", num(f.mcap.small) + "%"), stat("Stocks", f.conc.stocks), stat("Top 10", num(f.conc.top10) + "%"), stat("P/E", f.conc.pe), stat("P/B", f.conc.pb))),
      f.debt ? section("Debt and credit quality", grid(stat("Securities", f.debt.n), stat("Mod. duration", f.debt.md + " yr"), stat("Avg maturity", f.debt.mat + " yr"), stat("YTM", f.debt.ytm + "%")), bars(f.credit, 100)) : null),
    f.notes?.obs?.length ? section("What stands out", h("ul", { class: "stack stack-xs", style: "padding-left:20px" }, list(f.notes.obs))) : null,
    f.notes?.risks?.length ? section("Risks to explain", h("ul", { class: "stack stack-xs", style: "padding-left:20px" }, list(f.notes.risks))) : null,
    h("div", { class: "row-flex", style: "gap:10px;flex-wrap:wrap" }, source(f.pdf), h("a", { class: "btn primary", href: "#/quiz/fund/" + (D.fundGroups.find(g => g.funds.includes(id))?.id || "") }, "Quiz me on this group")),
    h("p", { class: "tiny mute" }, D.fundSource + " For learning, not a recommendation."));
}

/* ——— indices ——— */
export function indices() {
  const kinds = [...new Set(D.indices.map(i => i.kind))];
  return page(
    h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Library"), h("p", { class: "lead mute" }, "NSE indices: what is inside, how it is weighted, how it behaves."), tabs("indices")),
    h("div", { class: "row-flex", style: "gap:10px;flex-wrap:wrap" }, h("a", { class: "btn primary", href: "#/quiz/market" }, "Market quiz"), h("a", { class: "btn ghost", href: "#/quiz/index/nifty50" }, "Index quiz")),
    kinds.map(k => section(k, h("div", { class: "cols", style: "grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px" },
      D.indices.filter(i => i.kind === k).map(i => h("a", { class: "card link stack stack-xs", href: "#/index/" + i.id }, h("b", {}, i.name),
        h("div", { class: "small mute" }, `P/E ${num(i.stats.pe)} · 1Y `, h("span", { style: tone(i.stats.r1y) }, sgn(i.stats.r1y)))))))));
}

export function index(id) {
  const i = D.indices.find(x => x.id === id); if (!i) return notFound("That index is not in the library.");
  const L = lang(), snap = i.snapshots?.[0], st = i.stats;
  const co = key => { if (key.startsWith("x:")) return { name: key.slice(2) }; const c = D.companies.en[key]; return c ? { ...c, short: D.companies.tx?.[L]?.[key] || c.short } : { name: key }; };
  return page(
    h("div", { class: "stack stack-s" }, h("a", { class: "small", href: "#/indices" }, "← Indices"), h("div", { class: "tiny mute" }, i.kind), h("h1", { class: "h1" }, i.name), h("p", { class: "mute" }, i.about)),
    grid(stat("P/E", num(st.pe)), stat("P/B", num(st.pb)), stat("Dividend yield", num(st.dy) + "%"), stat("1Y", sgn(st.r1y)), stat("5Y / yr", sgn(st.r5y)), stat("YTD", sgn(st.ytd))),
    i.sectors?.length ? section("Sectors", bars(i.sectors)) : null,
    snap ? section("Top holdings", h("div", { class: "divide" }, snap.top.map(([k, w]) => { const c = co(k); return h("div", { class: "list-row", style: "align-items:flex-start" }, h("div", { class: "grow stack stack-xxs" }, h("div", { class: "list-title" }, c.name), c.short ? h("div", { class: "small mute" }, c.short) : null), h("b", {}, num(w) + "%")); })),
      h("p", { class: "tiny mute" }, ${snap.src}${snap.count ? " · " + snap.count + " stocks" : ""})) : null,
    i.method?.length ? section("How it works", h("ul", { class: "stack stack-xs", style: "padding-left:20px" }, i.method.map(m => h("li", {}, m)))) : null,
    h("div", { class: "row-flex", style: "gap:10px;flex-wrap:wrap" }, source(i.factsheet), h("a", { class: "btn primary", href: "#/quiz/index/" + id }, "Quiz me")));
}
