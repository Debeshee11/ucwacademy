/* Personal guidance: age band and interests decide which courses come first and what we tell the learner to do. */
import { h } from "./dom.js";
import * as Store from "./store.js";

export const AGES = [["u18", "Under 18"], ["18-25", "18 to 25"], ["26-40", "26 to 40"], ["41-60", "41 to 60"], ["60+", "Over 60"]];

/* sec = subject areas, ids = specific courses that fit the interest */
export const INTS = [
  { id: "save", name: "Save and budget", sec: ["basics"], ids: ["budgeting-emergency-fund", "loans-credit-scores"] },
  { id: "grow", name: "Mutual funds and SIPs", sec: ["mf"], ids: ["mf-foundations", "sip-planning", "equity-funds"] },
  { id: "stocks", name: "Stock market", sec: ["stocks"], ids: ["stock-basics", "company-fundamentals"] },
  { id: "gold", name: "Gold and real assets", sec: ["assets"], ids: ["gold-asset", "gold-silver", "reit-invit"] },
  { id: "insure", name: "Insurance and protection", sec: [], ids: ["term-life-insurance", "health-insurance-basics"] },
  { id: "tax", name: "Tax and retirement", sec: [], ids: ["tax-retirement"] },
  { id: "nism", name: "NISM exams and a career", sec: [], ids: ["regulation", "financial-maths", "fund-analysis"] },
  { id: "nri", name: "Money abroad (NRI)", sec: ["nri"], ids: ["nri-banking-investing"] }
];

/* What to do first, by age. Plain advice for learning, not investment advice. */
export const AGE_TIP = {
  "u18": "Start with how money works: budgeting, saving and how compounding grows small amounts. Real investing needs a parent or guardian.",
  "18-25": "Build an emergency fund, learn what a SIP is, and start small and early. Time is your biggest advantage.",
  "26-40": "Protect first: understand term and health cover. Then plan goals like a home or your children's education with SIPs.",
  "41-60": "Check your retirement readiness, review your insurance, and learn how to balance equity, debt and gold.",
  "60+": "Focus on steady income, health cover, tax on withdrawals, and passing wealth on in a simple way."
};
const AGE_IDS = {
  "u18": ["budgeting-emergency-fund", "loans-credit-scores", "stock-basics"],
  "18-25": ["budgeting-emergency-fund", "sip-planning", "mf-foundations", "term-life-insurance"],
  "26-40": ["term-life-insurance", "health-insurance-basics", "sip-planning", "tax-retirement"],
  "41-60": ["tax-retirement", "health-insurance-basics", "debt-funds", "multi-asset"],
  "60+": ["tax-retirement", "health-insurance-basics", "debt-funds", "gold-asset"]
};

/* Stable re-order: interests count most, then age, then the order the door already gave. */
export function personalise(list, s = Store.get()) {
  const ints = INTS.filter(i => (s.ints || []).includes(i.id)), ageIds = AGE_IDS[s.age] || [];
  const score = c => ints.reduce((n, i) => n + (i.ids.includes(c.id) ? 3 : i.sec.includes(c.sec) ? 2 : 0), 0) + (ageIds.includes(c.id) ? 2 : 0);
  return list.map((c, i) => [c, i]).sort((a, b) => score(b[0]) - score(a[0]) || a[1] - b[1]).map(x => x[0]);
}

export const tipFor = s => AGE_TIP[s.age] || "";
export const intNames = s => INTS.filter(i => (s.ints || []).includes(i.id)).map(i => i.name);

/* Two small pickers: one age band, up to four interests. onChange runs after each tap. */
export function aboutYou(onChange = () => {}) {
  const s = Store.get(), box = h("div", { class: "stack stack-s" });
  function paint() {
    const cur = Store.get();
    box.replaceChildren(
      h("div", { class: "field" }, h("label", {}, "Your age group"), h("div", { class: "chips scroll", role: "group", "aria-label": "Age group" },
        AGES.map(([id, t]) => h("button", { type: "button", class: "chip", "aria-pressed": String(cur.age === id), on: { click: () => { Store.setAge(id); paint(); onChange(); } } }, t)))),
      h("div", { class: "field" }, h("label", {}, "What do you want to learn? Pick up to 4"), h("div", { class: "chips", role: "group", "aria-label": "Interests" },
        INTS.map(i => h("button", { type: "button", class: "chip", "aria-pressed": String((cur.ints || []).includes(i.id)), on: { click: () => { Store.toggleInt(i.id); paint(); onChange(); } } }, i.name)))));
  }
  paint();
  return box;
}
