/* Who is learning. Two audiences, one academy.
   Everyday: students, people at work, homemakers, business owners, retired people. They learn about their own money, with no "client" in sight.
   Professionals: advisers, distributors, analysts, planners and the team. They get the client side as well: client questions, scripts, the Client Lab.
   Each door (a kind of learner) belongs to one audience and has its own course order. Pure data plus a few small helpers. */
import * as Store from "./store.js";
import { plain, plainDeep } from "./plain.js";
import { D } from "./data.js";
import { personalise } from "./guide.js";

export const SEGMENTS = [
  { id: "everyday", name: "I want to understand money", who: "Students, working people, homemakers, business owners, retired people", hook: "Plain words. Real examples. No jargon." },
  { id: "pro", name: "I work in finance", who: "Advisers, distributors, analysts, planners", hook: "Client conversations, rules and technique." }
];

export const DOORS = [
  /* everyday */
  { id: "student", seg: "everyday", name: "Student", who: "School or college", hook: "Money habits before your first salary", realms: ["basics", "mf"], exams: ["nism-xii"],
    track: ["budgeting-emergency-fund", "scam-safety", "loans-credit-scores", "sip-planning", "stock-basics", "mf-start", "tax-on-investments", "ipo-investing", "gold-asset", "behaviour"] },
  { id: "firstjob", seg: "everyday", name: "First job", who: "Starting your career", hook: "Make your first salary work for you", realms: ["basics", "mf"], exams: ["nism-xii"],
    track: ["budgeting-emergency-fund", "scam-safety", "sip-planning", "health-insurance-basics", "term-life-insurance", "mf-start", "tax-on-investments", "retirement-epf-ppf-nps", "loans-credit-scores", "stock-basics"] },
  { id: "salaried", seg: "everyday", name: "Working professional", who: "Building a career and a family", hook: "Payslip to portfolio", realms: ["basics", "mf", "stocks"], exams: ["nism-xii", "nism-v-a"],
    track: ["health-insurance-basics", "term-life-insurance", "sip-planning", "retirement-epf-ppf-nps", "tax-on-investments", "mf-start", "loans-credit-scores", "general-insurance", "equity-funds", "passive-etf", "behaviour", "wealth-succession"] },
  { id: "homemaker", seg: "everyday", name: "Homemaker", who: "Runs the household money", hook: "Make the household a team", realms: ["basics", "mf"],
    track: ["budgeting-emergency-fund", "scam-safety", "health-insurance-basics", "general-insurance", "term-life-insurance", "gold-asset", "sip-planning", "loans-credit-scores", "silver-asset", "wealth-succession"] },
  { id: "business", seg: "everyday", name: "Business owner", who: "Shop, practice or startup", hook: "Separate you from the business", realms: ["basics", "assets", "mf"],
    track: ["budgeting-emergency-fund", "loans-credit-scores", "tax-on-investments", "general-insurance", "health-insurance-basics", "term-life-insurance", "debt-start", "debt-funds", "sip-planning", "wealth-succession", "gold-asset"] },
  { id: "retiree", seg: "everyday", name: "Retired", who: "Protect and use what you saved", hook: "Make savings last, and stay safe from fraud", realms: ["basics", "assets", "mf"],
    track: ["scam-safety", "health-insurance-basics", "retirement-epf-ppf-nps", "tax-retirement", "bonds-gsecs", "debt-funds", "wealth-succession", "general-insurance", "gold-asset", "hybrid-funds", "behaviour"] },
  { id: "teacher", seg: "everyday", name: "Teacher", who: "Educators and trainers", hook: "Teach money in your classroom", realms: ["basics", "mf", "teach"],
    track: ["budgeting-emergency-fund", "scam-safety", "sip-planning", "retirement-epf-ppf-nps", "tax-on-investments", "mf-start", "behaviour"] },
  { id: "global", seg: "everyday", name: "Living abroad (NRI)", who: "NRI and overseas Indians", hook: "Money across borders", realms: ["nri", "mf", "basics"], exams: ["nism-xii"],
    track: ["nri-banking-investing", "nri-tax-residency", "nri-investing-routes", "global-investing", "tax-on-investments", "mf-start", "sip-planning"] },
  /* finance professionals */
  { id: "mfd", seg: "pro", name: "Mutual fund distributor", who: "AMFI-registered, ARN holder", hook: "Rules, products and client conversations", realms: ["mf", "basics", "stocks", "assets"], exams: ["nism-v-a", "nism-v-d"],
    track: ["mf-foundations", "regulation", "sip-planning", "equity-funds", "debt-funds", "hybrid-funds", "passive-etf", "fund-analysis", "behaviour", "multi-asset", "financial-maths"] },
  { id: "ria", seg: "pro", name: "Investment adviser", who: "SEBI-registered adviser (RIA)", hook: "Advice that holds up on paper", realms: ["basics", "mf", "assets", "stocks"], exams: ["nism-x-a", "nism-xb"],
    track: ["regulation", "financial-maths", "fund-analysis", "behaviour", "multi-asset", "tax-retirement", "pms-aif-sif", "wealth-succession", "debt-funds"] },
  { id: "analyst", seg: "pro", name: "Analyst or researcher", who: "Markets, companies and funds", hook: "Read the numbers behind the story", realms: ["stocks", "mf", "assets", "basics"],
    track: ["economy-markets", "financial-statements", "company-fundamentals", "valuation-methods", "industry-analysis", "technical-analysis", "research-reports-sebi", "stock-basics", "fund-analysis", "options-explained", "futures-explained"],
    exams: ["nism-xv", "nism-xii", "nism-viii"] },
  { id: "planner", seg: "pro", name: "Financial planner", who: "Goal-based and wealth planning", hook: "From goals to a written plan", realms: ["basics", "mf", "assets"], exams: ["nism-x-a", "nism-xb"],
    track: ["financial-maths", "tax-retirement", "wealth-succession", "term-life-insurance", "health-insurance-basics", "general-insurance", "retirement-epf-ppf-nps", "fund-analysis", "behaviour", "pms-aif-sif"] },
  { id: "partner", seg: "pro", name: "Partner", who: "Community leader or adviser", hook: "Host a Gurukul session", realms: ["mf", "stocks", "assets", "teach"], exams: ["nism-v-a", "nism-xii"] },
  { id: "team", seg: "pro", name: "UpperCrust team", who: "Employees and advisers", hook: "Learn alongside the firm", realms: ["mf", "stocks", "assets", "basics"], exams: ["nism-v-a", "nism-xii"], staff: true }
];
export const doorOf = id => DOORS.find(d => d.id === id) || null;

/* Courses written for the working side of finance. Everyday learners see them last, under "For finance professionals". */
export const PRO_ONLY = new Set(["regulation", "mf-foundations", "fund-analysis", "pms-aif-sif", "pms-explained", "aif-explained", "sif-explained", "financial-maths"]);

export const segOfDoor = d => (d?.seg === "pro" ? "pro" : "everyday");
export const isPro = () => Store.isStaff() || segOfDoor(doorOf(Store.get().door)) === "pro";
export const segOf = () => (isPro() ? "pro" : "everyday");

/* ——— the order of courses for one kind of learner ——— */
const HOUSEHOLD_FIRST = ["budgeting-emergency-fund", "scam-safety", "loans-credit-scores", "health-insurance-basics", "term-life-insurance", "general-insurance", "behaviour"];
export function pathCourses(doorId) {
  const door = doorOf(doorId), seen = new Set(), out = [];
  const everyday = !door ? !Store.isStaff() : segOfDoor(door) === "everyday" && !door.staff;
  const core = () => D.courses.filter(c => !c.optional);
  const lv = c => D.levels.findIndex(l => l.id === c.level);
  const own = everyday;
  const first = c => { const i = own ? HOUSEHOLD_FIRST.indexOf(c.id) : -1; return i < 0 ? 50 : i; };
  const add = c => { if (c && !seen.has(c.id)) { seen.add(c.id); out.push(c); } };
  for (const id of door?.track || []) add(D.courses.find(c => c.id === id));
  for (const r of door ? door.realms : D.sections.map(x => x.id))
    for (const c of core().filter(c => c.sec === r && !(everyday && PRO_ONLY.has(c.id))).sort((a, b) => lv(a) - lv(b) || first(a) - first(b))) add(c);
  for (const c of core()) if (!(everyday && PRO_ONLY.has(c.id))) add(c);
  if (everyday) for (const c of core()) add(c);
  return personalise(out);
}
/* The courses an everyday learner finds under "For finance professionals". */
export const proCourses = () => D.courses.filter(c => !c.optional && PRO_ONLY.has(c.id));

/* ——— wording: the same lesson, read as your own money ——— */
export const T = t => (isPro() ? t : plain(t));
const LEVEL_BLURB = { foundation: "Learn the language. Spot the myths.", practitioner: "Apply the ideas to your own money.", expert: "Judge trade-offs. Make confident choices." };
export const levelBlurb = l => (isPro() ? l.blurb : LEVEL_BLURB[l.id] || plain(l.blurb));

/* A few lessons were written as sales scripts. Everyday learners get plain titles and a plain closing line for them. */
const TITLES = {
  11: "MF, SIF, PMS, AIF: how they differ", 29: "The data calendar: dates that move markets", 30: "The macro story in plain words", 45: "Defence investing: what to weigh",
  60: "Gold and silver: the key points", 75: "Multi-asset funds: what to know before you buy", 100: "REITs and InvITs: is it right for you, and how much?",
  120: "Matching debt funds to your goals", 140: "Working with an adviser: goals, documents and humility", 326: "Matching a hybrid fund to your needs"
};
const TALK = {
  29: "Fresh data beats generic talk. “Last month SIPs hit a record” tells you more than “markets are doing well”.",
  44: "Keep these four lines in mind. They cover most of what people ask about defence investing.",
  45: "Defence is a strong five-year theme. A measured slice, entered gradually and reviewed every year, is a sensible way in.",
  60: "Gold for safety and silver for a bit of extra growth: both in measured slices, added gradually.",
  70: "Two multi-asset funds can be very different. Open the factsheet before you invest.",
  75: "One fund, three engines and automatic rebalancing: a simple way to start."
};
/* Practice questions that only make sense to someone selling the product. */
const HIDE_Q = new Set(["v2-75-1", "v2-45-1"]);

/* Courses whose blurb or unit titles talk about "the client". */
const COURSE = {
  "economy-markets": { blurb: "Growth, rates, inflation, flows and valuation, and how to turn the big picture into a simple story you can follow.", units: { "Sectors, global links and the client story": "Sectors, global links and the big story" } },
  "hybrid-funds": { blurb: "Aggressive, conservative, balanced advantage, arbitrage and equity savings: how each works, how it is taxed, and who it fits.", units: { "Income, tax and matching to clients": "Income, tax and matching to your needs" } },
  "gold-silver": { title: "Gold and silver in your portfolio", blurb: "What drives precious metals, which product fits which need, how much is enough, and how to keep expectations honest." },
  "defence": { blurb: "The budget, production, exports and order pipeline behind the theme, and how to invest in it without overpaying for the story.", units: { "Valuation and the client pitch": "Valuation and the investing case" } }
};

/* Rewrites the loaded course content in place for the learner's audience, and back again for a professional.
   Nothing is deleted: the first time through, the original wording is kept on the object. Call after the data loads and after the door changes. */
let applied = "";
export function applyAudience() {
  const seg = segOf(); if (applied === seg || !D.courses.length) return; applied = seg;
  const everyday = seg === "everyday";
  for (const c of D.courses) {
    c._o = c._o || { title: c.title, blurb: c.blurb, units: c.modules.map(m => m.title) };
    const o = COURSE[c.id] || {};
    c.title = everyday ? o.title || plain(c._o.title) : c._o.title;
    c.blurb = everyday ? o.blurb || plain(c._o.blurb) : c._o.blurb;
    c.modules.forEach((m, i) => { m.title = everyday ? o.units?.[c._o.units[i]] || plain(c._o.units[i]) : c._o.units[i]; });
  }
  for (const n of Object.keys(D.lessons)) {
    const l = D.lessons[n], o = l._o || l;
    if (!everyday) { D.lessons[n] = o; continue; }
    const { qs, ...body } = o, v = plainDeep(body);
    if (TITLES[o.n]) v.title = TITLES[o.n];
    if (TALK[o.n]) v.talk = TALK[o.n];
    D.lessons[n] = { ...v, _o: o, qs: (qs || []).map(q => { const w = plainDeep(q); return HIDE_Q.has(q.id) ? { ...w, legacy: true } : w; }) };
  }
}
Store.subscribe(() => applyAudience());
/* Exam questions come from the server as plain text: reword them the same way when the learner is not a professional. */
export const questionFor = q => (isPro() ? q : plainDeep(q));
