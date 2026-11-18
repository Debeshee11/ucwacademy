/* Money calculators: move a slider, see the number change. Used on their own page (#/tools) and inside lessons ("Try it").
   The arithmetic lives in toolmath.js. Everything shown is an illustration from the learner's own inputs, not advice. */
import { h, icon } from "./dom.js";
import { t } from "./i18n.js";
import { page } from "./ui.js";
import * as M from "./toolmath.js";

const R = M.rupees, S = M.rupeesShort;
const yrs = m => { const y = Math.floor(m / 12), r = m % 12; return y && r ? t("{0} yr {1} mo", y, r) : y ? t("{0} years", y) : t("{0} months", r); };
const ASSUME = "This assumes the same return every year. Real returns go up and down, and can be negative in some years.";

/* field: [key, label, kind, min, max, step, default]   kind: r = rupees, p = per cent, y = years, n = plain number */
export const TOOLS = [
  { id: "sip", name: "SIP growth", emoji: "🌱", tint: "mint", blurb: "What a monthly investment can grow into.", course: "sip-planning",
    fields: [["monthly", "Invest every month", "r", 500, 100000, 500, 5000], ["years", "For how many years", "y", 1, 40, 1, 15], ["rate", "Expected return a year", "p", 1, 20, .5, 12], ["step", "Raise it each year by", "p", 0, 20, 1, 0]],
    run: v => { const o = M.sip(v); return { label: "It could grow to", big: S(o.value), split: [["You put in", o.invested, "a"], ["Growth", o.gain, "b"]], rows: [["You put in", R(o.invested)], ["Growth on top", R(o.gain)]], note: ASSUME }; } },
  { id: "goal", name: "Goal planner", emoji: "🎯", tint: "sky", blurb: "The monthly amount that reaches a target.", course: "sip-planning",
    fields: [["target", "Amount you need", "r", 50000, 20000000, 50000, 1000000], ["years", "Years until you need it", "y", 1, 40, 1, 10], ["rate", "Expected return a year", "p", 0, 20, .5, 11]],
    run: v => { const o = M.goal(v); return { label: "Invest every month", big: R(o.monthly), split: [["You put in", o.invested, "a"], ["Growth", Math.max(0, o.gain), "b"]], rows: [["You put in over the years", R(o.invested)], ["Growth does the rest", R(Math.max(0, o.gain))]], note: ASSUME }; } },
  { id: "emergency", name: "Emergency fund", emoji: "🛟", tint: "peach", blurb: "How big your safety cushion should be.", course: "budgeting-emergency-fund",
    fields: [["essentials", "Essential spending a month", "r", 5000, 300000, 1000, 40000], ["months", "Months to cover", "n", 3, 12, 1, 6], ["saved", "Already set aside", "r", 0, 2000000, 5000, 0], ["monthly", "You can add each month", "r", 0, 100000, 500, 10000]],
    run: v => { const o = M.emergency(v); return { label: "Your target", big: R(o.target), split: [["Set aside", Math.min(v.saved, o.target), "b"], ["Still to build", o.gap, "c"]],
      rows: [["Covered so far", t("{0} months", +o.covered.toFixed(1))], ["Still to build", R(o.gap)], ["Time to get there", o.gap === 0 ? "Done. You are covered." : o.monthsToFill == null ? "Add a monthly amount to see" : yrs(o.monthsToFill)]],
      note: "Count only essentials: rent or EMI, food, bills, school fees, insurance, medicines. Keep this money where you can reach it in a day." }; } },
  { id: "emi", name: "Loan EMI", emoji: "🏠", tint: "lilac", blurb: "The monthly instalment and the true cost of a loan.", course: "loans-credit-scores",
    fields: [["loan", "Loan amount", "r", 50000, 20000000, 50000, 3000000], ["rate", "Interest rate a year", "p", 5, 30, .25, 9], ["years", "Loan period in years", "y", 1, 30, 1, 20]],
    run: v => { const o = M.emi(v); return { label: "EMI every month", big: R(o.emi), split: [["Loan", v.loan, "a"], ["Interest", o.interest, "c"]], rows: [["Interest you pay", R(o.interest)], ["Total you repay", R(o.total)]], note: "Rates on floating loans change over time, so the real figures will move. Fees and insurance are not included." }; } },
  { id: "card", name: "Credit card debt", emoji: "💳", tint: "peach", blurb: "What paying a little each month really costs.", course: "budgeting-emergency-fund",
    fields: [["balance", "Amount you owe", "r", 5000, 1000000, 5000, 100000], ["rate", "Interest rate a year", "p", 12, 48, 1, 36], ["pay", "You pay each month", "r", 500, 100000, 500, 5000]],
    run: v => { const o = M.cardDebt(v); return o.months == null
      ? { label: "At this payment", big: "It never clears", rows: [["First month's interest alone", R(v.balance * v.rate / 1200)]], note: "Your payment is smaller than the interest added each month, so the debt keeps growing. Pay more than the interest to start clearing it." }
      : { label: "Debt-free in", big: yrs(o.months), split: [["You borrowed", v.balance, "a"], ["Interest", o.interest, "c"]], rows: [["Interest you pay", R(o.interest)], ["Total you repay", R(o.total)]], note: "Assumes no new spending on the card. Late fees and taxes on interest would add to the cost." }; } },
  { id: "inflation", name: "Rising prices", emoji: "🎈", tint: "sky", blurb: "What today's costs become in the future.", course: "budgeting-emergency-fund",
    fields: [["amount", "Cost today", "r", 1000, 10000000, 1000, 50000], ["years", "Years from now", "y", 1, 40, 1, 20], ["rate", "Prices rise each year by", "p", 1, 12, .5, 6]],
    run: v => { const o = M.inflation(v); return { label: "It will cost about", big: R(o.future), rows: [["Cost today", R(v.amount)], [t("What {0} will buy then, in today's money", R(v.amount)), R(o.worth)]], note: "Prices do not rise evenly. School fees and medical costs have often risen faster than groceries." }; } },
  { id: "lumpsum", name: "One-time investment", emoji: "💰", tint: "mint", blurb: "What a single amount can grow into.", course: "financial-maths",
    fields: [["amount", "Amount invested once", "r", 5000, 20000000, 5000, 100000], ["years", "For how many years", "y", 1, 40, 1, 10], ["rate", "Expected return a year", "p", 1, 20, .5, 10]],
    run: v => { const o = M.lumpsum(v); return { label: "It could grow to", big: S(o.value), split: [["You put in", o.invested, "a"], ["Growth", o.gain, "b"]], rows: [["You put in", R(o.invested)], ["Growth on top", R(o.gain)]], note: ASSUME }; } },
  { id: "retirement", name: "Retirement pot", emoji: "🌅", tint: "lilac", blurb: "How much you need, and what to invest each month.", course: "retirement-epf-ppf-nps",
    fields: [["age", "Your age", "n", 18, 65, 1, 30], ["retireAt", "Retire at", "n", 40, 75, 1, 60], ["till", "Plan until age", "n", 70, 100, 1, 85], ["spend", "Monthly spending today", "r", 10000, 500000, 5000, 50000], ["inflationRate", "Prices rise each year by", "p", 2, 10, .5, 6], ["before", "Return while you work", "p", 4, 16, .5, 11], ["after", "Return after you retire", "p", 3, 12, .5, 7], ["saved", "Already saved for this", "r", 0, 50000000, 50000, 0]],
    run: v => { const o = M.retirement(v); return { label: t("Pot you need at {0}", Math.max(v.retireAt, v.age + 1)), big: S(o.corpus), rows: [["Your monthly spending by then", R(o.monthlySpendThen)], ["What you have already grows to", S(o.fromSavings)], ["Invest every month from now", R(o.monthly)]], note: ASSUME + " EPF, NPS and pensions you will receive reduce what you need to build yourself." }; } }
];
export const toolById = id => TOOLS.find(x => x.id === id) || null;

const UNIT = { r: ["₹", ""], p: ["", "%"], y: ["", ""], n: ["", ""] };
const show = (kind, v) => kind === "r" ? Math.round(v).toLocaleString("en-IN") : String(v);
const parse = s => Number(String(s).replace(/[^\d.]/g, "")) || 0;

/* One working calculator. */
export function toolCard(id, opts = {}) {
  const T = toolById(id); if (!T) return h("div");
  const v = Object.fromEntries(T.fields.map(f => [f[0], f[6]]));
  const out = h("div", { class: "tool-out", "aria-live": "polite" });
  function paint() {
    const r = T.run(v), sum = (r.split || []).reduce((a, s) => a + Math.max(0, s[1]), 0);
    out.replaceChildren(...[
      h("p", { class: "tool-label" }, r.label), h("p", { class: "tool-big" }, r.big),
      r.split && sum > 0 ? h("div", { class: "tool-split", role: "img", "aria-label": r.split.map(s => `${s[0]} ${R(s[1])}`).join(", ") },
        h("div", { class: "tool-bar" }, r.split.map(s => h("i", { class: "seg " + s[2], style: `flex:${Math.max(0, s[1]) / sum}` }))),
        h("div", { class: "tool-key" }, r.split.map(s => h("span", {}, h("i", { class: "dot " + s[2] }), s[0], " ", h("b", {}, S(s[1])))))) : null,
      h("dl", { class: "tool-rows" }, r.rows.map(([a, b]) => h("div", {}, h("dt", {}, a), h("dd", {}, b)))),
      h("p", { class: "tool-note" }, r.note)].filter(Boolean));
  }
  const fields = T.fields.map(([k, label, kind, min, max, step, def]) => {
    const fid = `tl-${id}-${k}`;
    const box = h("input", { class: "tool-num", id: fid, type: "text", inputmode: kind === "p" ? "decimal" : "numeric", value: show(kind, def), autocomplete: "off" });
    const range = h("input", { class: "tool-range", type: "range", min, max, step, value: def, "aria-label": label, tabindex: "-1" });
    const set = (n, from) => {
      n = Math.max(0, n); v[k] = n;
      if (from !== "box") box.value = show(kind, n);
      if (from !== "range") range.value = Math.min(max, Math.max(min, n));
      range.style.setProperty("--p", (100 * (Math.min(max, Math.max(min, n)) - min) / (max - min)) + "%");
      paint();
    };
    box.addEventListener("input", () => set(parse(box.value), "box"));
    box.addEventListener("blur", () => { const n = Math.max(min, parse(box.value)); set(n); });
    range.addEventListener("input", () => set(Number(range.value), "range"));
    range.style.setProperty("--p", (100 * (def - min) / (max - min)) + "%");
    return h("div", { class: "tool-f" },
      h("div", { class: "tool-fl" }, h("label", { for: fid }, label), h("span", { class: "tool-in" }, UNIT[kind][0] ? h("span", { class: "tool-u" }, UNIT[kind][0]) : null, box, UNIT[kind][1] ? h("span", { class: "tool-u" }, UNIT[kind][1]) : null)),
      range);
  });
  paint();
  return h("section", { class: `tool tint-${T.tint}`, "aria-label": T.name },
    opts.head === false ? null : h("header", { class: "tool-h" }, h("span", { class: "tool-emo", "aria-hidden": "true" }, T.emoji), h("div", {}, h("h2", { class: "h2" }, T.name), h("p", { class: "small mute" }, T.blurb))),
    h("div", { class: "tool-body" }, h("div", { class: "tool-fields" }, fields), out));
}

/* #/tools: every calculator. */
export function toolsPage() {
  return page(
    h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Money calculators"), h("p", { class: "lead mute" }, "Move a slider and watch the number change. No account needed.")),
    h("div", { class: "tool-grid" }, TOOLS.map(T => h("a", { class: `tool-tile tint-${T.tint}`, href: `#/tool/${T.id}` },
      h("span", { class: "tool-emo", "aria-hidden": "true" }, T.emoji), h("b", {}, T.name), h("span", { class: "small" }, T.blurb), h("span", { class: "tool-go" }, "Open", icon("chev", 16))))),
    h("p", { class: "small mute" }, "For learning only. These are illustrations from the numbers you enter, not investment advice or a promise of returns."));
}

/* #/tool/<id>: one calculator, with the course that explains it. */
export function toolPage(id, courseTitle) {
  const T = toolById(id); if (!T) return null;
  return page(
    h("a", { class: "link small", href: "#/tools" }, "‹ ", "All calculators"),
    toolCard(id),
    courseTitle ? h("a", { class: "card tool-learn", href: `#/course/${T.course}` }, h("span", { class: "eyebrow" }, "Learn the idea behind it"), h("b", {}, courseTitle), h("span", { class: "tool-go" }, "Open the course", icon("chev", 16))) : null,
    h("p", { class: "small mute" }, "For learning only. These are illustrations from the numbers you enter, not investment advice or a promise of returns."));
}
