/* Left side of the sign-in screen: the tagline, and a ten-second quiz that gives a reason to stay. */
import { h } from "./dom.js";
import { playHero } from "./loginplay.js";
import { tryCard } from "./logintry.js";

const SQUIGGLE = '<svg viewBox="0 0 220 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 9 Q 20 0 37 9 T 71 9 T 105 9 T 139 9 T 173 9 T 217 9" /></svg>';
const sq = () => { const s = document.createElement("span"); s.className = "lgl-sq"; s.innerHTML = SQUIGGLE; return s; };

export function loginSide() {
  const word = h("span", { class: "lgl-word", "data-c": "0" }, "for Everyone");
  /* "Keep learning" takes the learner to the sign-in field */
  const keep = () => { const f = document.querySelector("#ph, #em"); f?.scrollIntoView({ block: "center", behavior: "smooth" }); setTimeout(() => f?.focus({ preventScroll: true }), 350); };
  const side = h("aside", { class: "lg-side lgl" },
    h("span", { class: "lgl-blob b1", "aria-hidden": "true" }), h("span", { class: "lgl-blob b2", "aria-hidden": "true" }), h("span", { class: "lgl-blob b3", "aria-hidden": "true" }),
    h("div", { class: "lg-mark" }, h("img", { src: "assets/mark.svg", alt: "" }), h("span", { class: "bt" }, h("b", {}, "UpperCrust"), h("i", {}, "Academy"))),
    h("div", { class: "lgl-stage" },
      h("h2", { class: "lgl-big" }, h("span", { class: "l1" }, "Learning "), h("span", { class: "l2" }, word), h("span", { class: "l3" }, "Made fun!", sq())),
      tryCard(keep)),
    h("div", { class: "lg-foot" }, h("p", { class: "lgl-trust" }, "From UpperCrust Wealth · 25+ years of wealth wisdom"), h("p", {}, "For education only. Not investment advice.")));
  playHero(word);
  return side;
}
