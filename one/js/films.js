/* Case Films: real events in finance, explained as short vertical videos with narration.
   The videos are plain files in assets/films/ (mp4 plus a poster picture). Nothing is downloaded until a film is opened. */
import { h, icon } from "./dom.js";

const KEY = "uc:films";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
const mark = (id, p) => { try { const d = read(); d[id] = { ...(d[id] || {}), ...p }; localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* private mode */ } };

export const FILMS = [
  { id: "yes-bank", cat: "shocks", n: 1, title: "Yes Bank", line: "The ₹50,000 limit", year: "2020", min: "2:20", tags: ["Bank run", "Deposit insurance"], learn: ["Banks lend out most of what you deposit", "Bad loans, falling ratings and leaving deposits are warning signs", "Deposit insurance covers ₹5 lakh per depositor per bank"] },
  { id: "franklin", cat: "shocks", n: 2, title: "Franklin Templeton", line: "The fund that stopped withdrawals", year: "2020", min: "2:18", tags: ["Debt funds", "Liquidity"], learn: ["A debt fund is not a fixed deposit", "Lower rated bonds can be hard to sell in a crisis", "Check holdings and the riskometer before investing"] },
  { id: "march-2020", cat: "shocks", n: 3, title: "The March 2020 crash", line: "and the SIP question", year: "2020", min: "2:15", tags: ["Market crash", "SIP"], learn: ["Markets can fall fast, even in one day", "An SIP buys more units when prices are low", "Staying steady usually beats reacting to fear"] },
  { id: "paytm", cat: "shocks", n: 4, title: "Paytm IPO", line: "Listing day, 2021", year: "2021", min: "2:04", tags: ["IPO", "Valuation"], learn: ["The issue price is what the company asked, not a promise", "On listing day the market decides the price", "Check valuation and business; invest only what you can afford to lose"] },
  { id: "svb", cat: "shocks", n: 5, title: "Silicon Valley Bank", line: "Two days in March 2023", year: "2023", min: "1:54", tags: ["Bank run", "Interest rates"], learn: ["Rising interest rates can cut the value of bonds", "A bank runs on cash and trust", "Insurance has limits; know how your cover works"] },
  { id: "nirma", cat: "business", n: 6, title: "Nirma vs Hindustan Lever", line: "A cycle against a giant", year: "1969", min: "1:35", tags: ["Pricing", "Strategy"], learn: ["Find the customer the big players ignore", "A lower price can open a much bigger market", "Price winners get copied, so keep improving"] },
  { id: "lijjat", cat: "business", n: 7, title: "Lijjat Papad", line: "From ₹80 to ₹1,600 crore", year: "1959", min: "1:29", tags: ["Cooperative", "Women-led"], learn: ["Start small, with a skill you already have", "Shared ownership builds loyalty", "Keep quality the same everywhere"] },
  { id: "aravind", cat: "business", n: 8, title: "Aravind Eye Care", line: "Efficiency that funds fairness", year: "1976", min: "1:30", tags: ["Cross-subsidy", "Scale"], learn: ["Efficiency can fund fairness", "Paying customers can cross-subsidise others", "High volume and one standard process cut the cost of each surgery"] },
  { id: "cipla", cat: "business", n: 9, title: "Cipla and the AIDS drug", line: "$350 a year, not $10,400", year: "2001", min: "1:35", tags: ["Margins", "Generics"], learn: ["A lower margin can work at large volume", "Competition can push prices down fast", "Price decides who gets treated"] },
  { id: "honda", cat: "business", n: 10, title: "Honda Super Cub in America", line: "The little bike that turned it around", year: "1959", min: "1:30", tags: ["Pivot", "Customer demand"], learn: ["Watch what customers actually choose", "Be ready to change the plan", "A small, affordable product can become the biggest"] },
  { id: "ikea", cat: "business", n: 11, title: "IKEA's flat pack", line: "The legs that built a business", year: "1956", min: "1:21", tags: ["Design", "Costs"], learn: ["Look for the idea hidden inside a problem", "Design for how a product travels, not just how it looks", "Let customers do some of the work, and share the saving"] },
  { id: "cadbury", cat: "business", n: 12, title: "Cadbury and the worm crisis", line: "Winning back trust", year: "2003", min: "1:22", tags: ["Crisis", "Trust"], learn: ["Own the problem and fix the root cause", "A trusted voice helps rebuild trust", "Protect customers first. Profit follows"] },
  { id: "lego", cat: "business", n: 13, title: "Lego's close call", line: "Back to the brick", year: "2003", min: "1:22", tags: ["Turnaround", "Focus"], learn: ["Doing everything can hurt a business", "Complexity is a cost", "Go back to what customers value most"] },
  { id: "dabbawala", cat: "business", n: 14, title: "The Mumbai Dabbawalas", line: "Lunch with no computers", year: "1890", min: "1:40", tags: ["Systems", "Logistics"], learn: ["Simple systems can beat complicated ones", "Clear codes and teamwork beat paperwork", "Be careful with famous statistics, many are rough estimates"] },
  { id: "netflix", cat: "business", n: 15, title: "Blockbuster and Netflix", line: "The late fee that shaped a market", year: "2000", min: "1:44", tags: ["Disruption", "Pricing"], learn: ["Do not defend an old income stream at all costs", "A customer's pain point is an opportunity", "Big failures usually have many causes"] }
];
const byId = id => FILMS.find(f => f.id === id);
const src = (f, ext) => `assets/films/${f.id}.${ext}`;

const HOMES = { shocks: ["Money events", "Crashes, runs and listings"], business: ["Business stories", "How great businesses won"] };
export function hub(cat = "shocks") {
  const card = f => h("a", { class: "fl2-card", href: `#/film/${f.id}`, "aria-label": `${f.title}. ${f.line}. ${f.min} minutes.` },
    h("img", { src: src(f, "jpg"), alt: "", loading: "lazy", width: 540, height: 960 }));
  return h("main", { class: "wrap page stack csp" }, h("a", { class: "btn ghost sm fl2-back", href: "#/cases" }, icon("left", 16), "All topics"),
    h("h1", { class: "fl2-t" }, (HOMES[cat] || HOMES.shocks)[0]), h("div", { class: "fl2-grid" }, FILMS.filter(f => f.cat === cat).map(card)));
}
export function promo() {
  return h("a", { class: "cs-promo", href: "#/cases" }, h("img", { src: "assets/cases/topic-shocks.jpg", alt: "", loading: "lazy", width: 720, height: 450 }),
    h("span", { class: "cs-pt" }, h("b", {}, "Case studies"), h("small", {}, "Real money and business stories, as short films")), h("span", { class: "cs-go", "aria-hidden": "true" }, icon("play", 20)));
}

export function play(id) {
  const f = byId(id), home = f ? "#/cases/" + f.cat : "#/cases";
  if (!f) return h("main", { class: "wrap page stack" }, h("h1", { class: "h1" }, "That film does not exist."), h("a", { class: "btn primary", href: home }, "All films"));
  const v = h("video", { class: "fl2-video", controls: true, playsinline: true, preload: "metadata", poster: src(f, "jpg"), "aria-label": `${f.title}. ${f.line}` });
  v.append(h("source", { src: src(f, "mp4"), type: "video/mp4" }), "Your browser cannot play this video.");
  v.addEventListener("ended", () => mark(f.id, { done: true }));
  return h("main", { class: "wrap page fl2-page" }, h("a", { class: "btn ghost sm", href: home }, icon("left", 16), "Back"), h("div", { class: "fl2-stage" }, v));
}
