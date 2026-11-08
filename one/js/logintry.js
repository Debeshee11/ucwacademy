/* A ten-second money quiz on the sign-in screen: guess, reveal, then carry on to sign in. Teaching only; touches no account. */
import { h } from "./dom.js";

const CHALLENGES = [
  { q: "Invest ₹10,000 a month for 20 years at 12% a year. What does it grow to?", o: ["₹24 lakh", "₹60 lakh", "₹1 crore"], a: 2, big: "₹1 crore", why: "You put in only ₹24 lakh. The rest is compounding doing the work." },
  { q: "At 12% a year, how many years for your money to double?", o: ["3 years", "6 years", "12 years"], a: 1, big: "6 years", why: "Divide 72 by the rate. That is the Rule of 72." },
  { q: "With 6% inflation, what will today's ₹100 buy in 10 years?", o: ["₹94 worth", "₹80 worth", "₹56 worth"], a: 2, big: "₹56 worth", why: "Prices rise quietly. Money that does not grow loses ground." },
];
const HUES = ["#4CC9F0", "#2EC4B6", "#FF8FA3"];
const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function tryCard(onKeepLearning) {
  let n = Math.floor(Math.random() * CHALLENGES.length);
  const card = h("section", { class: "lgt", "aria-label": "Money quiz" });

  const burst = from => {
    if (reduce()) return;
    const r = from.getBoundingClientRect(), c = card.getBoundingClientRect();
    for (let k = 0; k < 14; k++) {
      const p = document.createElement("i"); p.className = "lgt-bit";
      const a = (k / 14) * Math.PI * 2, d = 50 + Math.random() * 50;
      p.style.cssText = `left:${r.left - c.left + r.width / 2}px;top:${r.top - c.top + r.height / 2}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 20}px;--c:${["#FFB703", "#FF6B6B", "#2EC4B6", "#4CC9F0", "#9B5DE5"][k % 5]}`;
      card.append(p); setTimeout(() => p.remove(), 800);
    }
  };

  function paint() {
    const c = CHALLENGES[n];
    const opts = c.o.map((t, i) => h("button", { type: "button", class: "lgt-o", style: `--h:${HUES[i]}`, on: { click: ev => pick(i, ev.currentTarget) } }, t));
    const body = h("div", { class: "lgt-body" }, h("p", { class: "lgt-q" }, c.q), h("div", { class: "lgt-opts" }, opts));
    card.replaceChildren(h("span", { class: "lgt-chip" }, "10-second money quiz"), body, h("p", { class: "lgt-fine" }, "Illustration only. Returns are not guaranteed."));
    function pick(i, btn) {
      const ok = i === c.a;
      opts.forEach((b, k) => { b.disabled = true; if (k === c.a) b.classList.add("right"); else if (k === i) b.classList.add("wrong"); });
      if (ok) burst(btn);
      setTimeout(() => {
        const next = h("button", { type: "button", class: "lgt-b ghost", on: { click: () => { n = (n + 1) % CHALLENGES.length; paint(); } } }, "Another one");
        const go = h("button", { type: "button", class: "lgt-b", on: { click: () => onKeepLearning?.() } }, "Keep learning");
        body.replaceChildren(
          h("p", { class: `lgt-verdict${ok ? " yes" : ""}` }, ok ? "Yes! You nailed it." : "Surprising, right? That is why we learn."),
          h("p", { class: "lgt-big" }, c.big),
          h("p", { class: "lgt-why" }, c.why),
          h("div", { class: "lgt-act" }, next, go));
      }, reduce() ? 0 : 650);
    }
  }
  paint();
  return card;
}
