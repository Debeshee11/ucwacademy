/* Case Films: real events in finance, explained as short vertical videos with narration.
   The videos are plain files in assets/films/ (mp4 plus a poster picture). Nothing is downloaded until a film is opened. */
import { h, icon } from "./dom.js";

const KEY = "uc:films";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
const mark = (id, p) => { try { const d = read(); d[id] = { ...(d[id] || {}), ...p }; localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* private mode */ } };

export const FILMS = [
  { id: "yes-bank", n: 1, title: "Yes Bank", line: "The ₹50,000 limit", year: "2020", min: "2:20", tags: ["Bank run", "Deposit insurance"], learn: ["Banks lend out most of what you deposit", "Bad loans, falling ratings and leaving deposits are warning signs", "Deposit insurance covers ₹5 lakh per depositor per bank"] },
  { id: "franklin", n: 2, title: "Franklin Templeton", line: "The fund that stopped withdrawals", year: "2020", min: "2:18", tags: ["Debt funds", "Liquidity"], learn: ["A debt fund is not a fixed deposit", "Lower rated bonds can be hard to sell in a crisis", "Check holdings and the riskometer before investing"] },
  { id: "march-2020", n: 3, title: "The March 2020 crash", line: "and the SIP question", year: "2020", min: "2:15", tags: ["Market crash", "SIP"], learn: ["Markets can fall fast, even in one day", "An SIP buys more units when prices are low", "Staying steady usually beats reacting to fear"] },
  { id: "paytm", n: 4, title: "Paytm IPO", line: "Listing day, 2021", year: "2021", min: "2:04", tags: ["IPO", "Valuation"], learn: ["The issue price is what the company asked, not a promise", "On listing day the market decides the price", "Check valuation and business; invest only what you can afford to lose"] },
  { id: "svb", n: 5, title: "Silicon Valley Bank", line: "Two days in March 2023", year: "2023", min: "1:54", tags: ["Bank run", "Interest rates"], learn: ["Rising interest rates can cut the value of bonds", "A bank runs on cash and trust", "Insurance has limits; know how your cover works"] }
];
const byId = id => FILMS.find(f => f.id === id);
const src = (f, ext) => `assets/films/${f.id}.${ext}`;

export function hub() {
  const seen = read();
  const card = f => h("a", { class: "fl-card", href: `#/film/${f.id}`, "aria-label": `Case film ${f.n}: ${f.title}, ${f.line}. ${f.min} minutes.` },
    h("div", { class: "fl-poster" }, h("img", { src: src(f, "jpg"), alt: "", loading: "lazy", width: 360, height: 640 }), h("span", { class: "fl-play", "aria-hidden": "true" }, icon("play", 26)), h("span", { class: "fl-no" }, `Film ${f.n}`), h("span", { class: "fl-min" }, f.min)),
    h("div", { class: "fl-b" }, h("div", { class: "cf-tags" }, f.tags.map(t => h("span", {}, t)), h("span", { class: "cf-min" }, f.year)),
      h("h3", {}, f.title), h("p", { class: "cf-s" }, f.line), h("span", { class: "cf-go" }, seen[f.id]?.done ? "Watched. Watch again" : "Watch the film", icon("chev", 16))));
  return h("main", { class: "wrap page stack csp" },
    h("section", { class: "cf-hero" }, h("div", { class: "cf-ht" }, h("span", { class: "cf-k" }, "Case Films"), h("h1", { class: "h1" }, "Watch how it happened."), h("p", { class: "lead" }, "Real events in money, told in short animated films with a voice-over. Best watched with sound on."))),
    h("div", { class: "fl-grid" }, FILMS.map(card), h("div", { class: "cf-soon" }, h("b", {}, "More coming"), h("small", {}, "New films are added over time."))),
    h("p", { class: "small" }, "Prefer to tap through? ", h("a", { href: "#/cases/files" }, "Open the interactive Case Files.")),
    h("p", { class: "tiny mute" }, "Education only. Facts come from public records and news reports. Not investment advice."));
}

export function play(id) {
  const f = byId(id);
  if (!f) return h("main", { class: "wrap page stack" }, h("h1", { class: "h1" }, "That film does not exist."), h("a", { class: "btn primary", href: "#/films" }, "All case films"));
  const i = FILMS.indexOf(f), nx = FILMS[i + 1];
  const v = h("video", { class: "fl-video", controls: true, playsinline: true, preload: "metadata", poster: src(f, "jpg"), "aria-label": `Case film: ${f.title}, ${f.line}` });
  v.append(h("source", { src: src(f, "mp4"), type: "video/mp4" }), "Your browser cannot play this video.");
  v.addEventListener("ended", () => { mark(f.id, { done: true }); const n = document.querySelector(".fl-next"); if (n) n.hidden = false; });
  return h("main", { class: "wrap page stack fl-page" },
    h("a", { class: "btn ghost sm", href: "#/cases/shocks" }, icon("left", 16), "All case films"),
    h("div", { class: "fl-wrap" }, v),
    h("div", { class: "fl-info stack stack-s" },
      h("span", { class: "cf-k" }, `Film ${f.n} · ${f.year}`), h("h1", { class: "h1" }, f.title), h("p", { class: "lead" }, f.line),
      h("h2", { class: "h3" }, "What to take away"), h("ul", { class: "fl-learn" }, f.learn.map(x => h("li", {}, x))),
      h("div", { class: "fl-next", hidden: !read()[f.id]?.done }, nx ? h("a", { class: "btn primary", href: `#/film/${nx.id}` }, `Next: ${nx.title}`, icon("chev", 16)) : h("a", { class: "btn primary", href: "#/films" }, "All case films")),
      h("p", { class: "tiny mute" }, "Education only. Facts come from public records and news reports. Not investment advice.")));
}
