/* Left side of the sign-in screen: "money knowledge, for every household". A house whose rooms are the topics.
   Rooms light up on their own until the visitor taps one. Education only; no figures, no promises. */
import { h } from "./dom.js";

const ROOMS = [
  { name: "Kitchen", icon: "M4 11h16v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM2 11h20M8 7.500c0-1.200 1-1.700 1-3M12 7.500c0-1.200 1-1.700 1-3M16 7.500c0-1.200 1-1.700 1-3",
    tag: "The kitchen table", title: "Where the monthly budget lives", body: "Track where money goes, build an emergency fund, and stop living paycheque to paycheque.", courses: ["Budgeting and the emergency fund", "Loans, EMIs and credit scores"] },
  { name: "Study", icon: "M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2zM22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z",
    tag: "The study", title: "Learn it, then prove it", body: "Short lessons and quizzes, then ten NISM exam courses with study guides and five mocks each.", courses: ["Ten NISM exams", "Certificates anyone can verify"] },
  { name: "Living room", icon: "M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3M2 13a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v4H2zM5 17v2M19 17v2",
    tag: "The living room", title: "The family money conversation", body: "Mutual funds, SIPs and goals, explained in plain language so everyone at home can join in.", courses: ["Mutual fund foundations", "SIP, SWP, STP and goal investing"] },
  { name: "Bedroom", icon: "M3 19V6M3 14h18v5M21 19v-5a3 3 0 0 0-3-3h-7v3M7 11.500h.01",
    tag: "The bedroom", title: "Sleep easy, you are covered", body: "What life and health insurance do, what they do not, and why cover and investing are separate jobs.", courses: ["Life and term insurance", "Health insurance"] },
  { name: "Garden", icon: "M12 21v-9M12 12c0-4-3-6-7-6 0 4 3 6 7 6zM12 15c0-3 2-5 6-5 0 3-2 5-6 5z",
    tag: "The garden", title: "Things that grow slowly", body: "Equity funds, index funds and the habit of patience. Plus tax and retirement planning.", courses: ["Equity fund categories", "Tax and retirement planning"] },
  { name: "Locker", icon: "M3 4h18v16H3zM9 20v1.500M15 20v1.500M12 8.500a3.500 3.500 0 1 0 .01 0M12 12h.01",
    tag: "The locker", title: "Gold and real assets", body: "Gold, silver, REITs and InvITs, and where they fit next to everything else you own.", courses: ["Gold: ways to own it", "REITs and InvITs: real-asset income"] }
];

const svg = (d, size = 28) => {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", size); s.setAttribute("height", size);
  s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", "1.7");
  s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round"); s.setAttribute("aria-hidden", "true");
  const p = document.createElementNS("http://www.w3.org/2000/svg", "path"); p.setAttribute("d", d); s.append(p);
  return s;
};

export function loginSide() {
  let cur = 0, auto = true;
  const tiles = ROOMS.map((r, i) => {
    const b = h("button", { type: "button", class: "lgh-room", "aria-pressed": "false", on: { click: () => { auto = false; pick(i); } } },
      h("span", { class: "lgh-ic" }), h("span", { class: "lgh-rn" }, r.name));
    b.querySelector(".lgh-ic").append(svg(r.icon));
    return b;
  });
  const tag = h("div", { class: "lgh-tag" }), ttl = h("div", { class: "lgh-title" }), body = h("p", { class: "lgh-body" }), chips = h("div", { class: "lgh-chips" });
  const card = h("div", { class: "lgh-card", "aria-live": "polite" }, tag, ttl, body, chips);

  function pick(i) {
    cur = i; const r = ROOMS[i];
    tiles.forEach((t, k) => { t.classList.toggle("on", k === i); t.setAttribute("aria-pressed", k === i ? "true" : "false"); });
    tag.textContent = r.tag; ttl.textContent = r.title; body.textContent = r.body;
    chips.replaceChildren(...r.courses.map(c => h("span", { class: "lgh-chip" }, c)));
    card.classList.remove("swap"); void card.offsetWidth; card.classList.add("swap");
  }
  pick(0);

  const house = h("div", { class: "lgh-house" },
    h("div", { class: "lgh-roof", "aria-hidden": "true" }, h("span", { class: "lgh-chim" })),
    h("div", { class: "lgh-rooms" }, ...tiles));

  const side = h("aside", { class: "lg-side lgh" },
    h("span", { class: "lgh-orb a" }), h("span", { class: "lgh-orb b" }),
    h("div", { class: "lg-mark" }, h("img", { src: "assets/logo-gold.svg", alt: "UpperCrust, The Wealth Company" }), h("span", { class: "lg-acad" }, "Academy")),
    h("div", { class: "lgh-head" },
      h("p", { class: "lg-eyebrow" }, "The Wealth Company"),
      h("h2", { class: "lg-big" }, "Money knowledge,", h("br"), h("em", {}, "for every household.")),
      h("p", { class: "lgh-lede" }, "Every room has something to learn. Tap one.")),
    h("div", { class: "lgh-stage" }, house, card),
    h("p", { class: "lg-foot" }, "For education only. Not investment advice."));

  /* rooms light up one after another until the visitor takes over; stops when the sign-in screen is gone */
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const t = setInterval(() => {
      if (!document.body.contains(side)) return clearInterval(t);
      if (auto) pick((cur + 1) % ROOMS.length); else clearInterval(t);
    }, 3600);
  }
  return side;
}
