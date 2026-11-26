/* Case studies: the home of every real-event story. Each topic is a card; topics without content yet say "Coming soon". */
import { h, icon } from "./dom.js";
import { FILMS } from "./films.js";
import { SCAM_IDS } from "./cases.js";

const ART = {
  shocks: c => `<svg viewBox="0 0 320 170" aria-hidden="true"><rect width="320" height="170" fill="${c}"/><circle cx="260" cy="40" r="70" fill="rgba(255,255,255,.22)"/><rect x="70" y="40" width="130" height="90" rx="14" fill="#fff" stroke="#2B2118" stroke-width="5"/><path d="M92 105 L118 78 L140 92 L170 58 L186 70" fill="none" stroke="#E5484D" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="230" cy="120" r="28" fill="#FFB703" stroke="#2B2118" stroke-width="5"/><path d="M222 108 L240 120 L222 132z" fill="#2B2118"/></svg>`,
  scams: c => `<svg viewBox="0 0 320 170" aria-hidden="true"><rect width="320" height="170" fill="${c}"/><circle cx="60" cy="130" r="80" fill="rgba(255,255,255,.2)"/><rect x="60" y="34" width="120" height="100" rx="12" fill="#fff" stroke="#2B2118" stroke-width="5"/><path d="M80 62h80M80 82h60M80 102h70" stroke="#B9AFA0" stroke-width="7" stroke-linecap="round"/><circle cx="214" cy="104" r="36" fill="rgba(255,255,255,.55)" stroke="#2B2118" stroke-width="7"/><path d="M240 130 L272 160" stroke="#2B2118" stroke-width="12" stroke-linecap="round"/><path d="M214 88v22" stroke="#E5484D" stroke-width="8" stroke-linecap="round"/><circle cx="214" cy="122" r="5" fill="#E5484D"/></svg>`,
  products: c => `<svg viewBox="0 0 320 170" aria-hidden="true"><rect width="320" height="170" fill="${c}"/><circle cx="270" cy="30" r="70" fill="rgba(255,255,255,.22)"/><rect x="50" y="36" width="150" height="100" rx="12" fill="#FFFDF6" stroke="#2B2118" stroke-width="5"/><text x="125" y="78" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="22" fill="#2B2118">BOND</text><path d="M72 98h106M72 114h70" stroke="#B9AFA0" stroke-width="6" stroke-linecap="round"/><circle cx="222" cy="112" r="30" fill="#FFB703" stroke="#2B2118" stroke-width="5"/><text x="222" y="122" text-anchor="middle" font-family="Bricolage Grotesque, sans-serif" font-weight="800" font-size="28" fill="#2B2118">₹</text></svg>`,
  more: c => `<svg viewBox="0 0 320 170" aria-hidden="true"><rect width="320" height="170" fill="${c}"/><circle cx="80" cy="140" r="80" fill="rgba(255,255,255,.22)"/><circle cx="160" cy="85" r="44" fill="#fff" stroke="#2B2118" stroke-width="5"/><path d="M146 85h28M160 71v28" stroke="#2B2118" stroke-width="8" stroke-linecap="round"/></svg>`
};

export function hub() {
  const TOPICS = [
    { id: "shocks", href: "#/cases/shocks", art: "shocks", bg: "#FFD98A", title: "Crashes, runs and listings", sub: "Yes Bank, Franklin Templeton, the March 2020 crash, Paytm, Silicon Valley Bank", tag: `${FILMS.filter(f => f.cat === "shocks").length} films`, live: true },
    { id: "scams", href: "#/cases/scams", art: "scams", bg: "#FFC9C2", title: "Scams and frauds", sub: "How well-known financial frauds worked, and the red flags to spot", tag: `${SCAM_IDS.length} interactive files`, live: true },
    { id: "business", href: "#/cases/business", art: "business", bg: "#CDEFD6", title: "Business cases", sub: "Nirma, Lijjat, IKEA, Cadbury, Lego, Netflix and more: lesser-known stories with big lessons", tag: `${FILMS.filter(f => f.cat === "business").length} films`, live: true },
    { id: "products", art: "products", bg: "#BFE0FF", title: "Products explained", sub: "Debentures, bonds, InvITs, REITs and more, told through real cases", tag: "Coming soon", live: false },
    { id: "more", art: "more", bg: "#DFF7EB", title: "More topics", sub: "New topics will appear here as we add them", tag: "Coming soon", live: false }
  ];
  const card = t => {
    const a = h("div", { class: "ch-art" }, h("img", { src: `assets/cases/topic-${t.id}.jpg`, alt: "", loading: "lazy", width: 720, height: 450 }));
    const body = h("div", { class: "ch-b" }, h("span", { class: "ch-tag" + (t.live ? "" : " soon") }, t.tag), h("h3", {}, t.title), h("p", {}, t.sub), t.live ? h("span", { class: "cf-go" }, "Open", icon("chev", 16)) : null);
    return t.live ? h("a", { class: "ch-card", href: t.href, "aria-label": `${t.title}. ${t.tag}.` }, a, body) : h("div", { class: "ch-card off", "aria-label": `${t.title}. ${t.tag}.` }, a, body);
  };
  return h("main", { class: "wrap page stack csp" },
    h("section", { class: "cf-hero" }, h("div", { class: "cf-ht" }, h("span", { class: "cf-k" }, "Case studies"), h("h1", { class: "h1" }, "Learn from real events."), h("p", { class: "lead" }, "Pick a topic. Each story shows what happened, why it happened and what to check next time."))),
    h("div", { class: "ch-grid" }, TOPICS.map(card)),
    h("p", { class: "tiny mute" }, "Education only. Facts come from public records and news reports. Not investment advice."));
}
