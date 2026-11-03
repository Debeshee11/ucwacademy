/* Left side of the sign-in screen. One idea: learning never ends. A light travels round the loop, for every age. */
import { h } from "./dom.js";

const NS = "http://www.w3.org/2000/svg";
const LOOP = "M100 100 C78 62 40 62 40 100 C40 138 78 138 100 100 C122 62 160 62 160 100 C160 138 122 138 100 100Z";
const WHO = ["Kids", "Students", "Professionals", "Homemakers", "Retirees"];

function orbit() {
  const s = document.createElementNS(NS, "svg");
  s.setAttribute("viewBox", "20 50 160 100"); s.setAttribute("class", "lgl-orbit"); s.setAttribute("aria-hidden", "true");
  s.innerHTML = `<defs><linearGradient id="lgl-g" gradientUnits="userSpaceOnUse" x1="34" y1="0" x2="166" y2="0"><stop offset="0" stop-color="#FFB000"/><stop offset=".55" stop-color="#FFC531"/><stop offset="1" stop-color="#FFD866"/></linearGradient></defs>
<path d="${LOOP}"/><circle class="dot" r="11"><animateMotion dur="9s" repeatCount="indefinite" path="${LOOP}"/></circle>`;
  return s;
}

export function loginSide() {
  return h("aside", { class: "lg-side lgl" },
    h("div", { class: "lg-mark" }, h("img", { src: "assets/mark.svg", alt: "" }), h("span", { class: "bt" }, h("b", {}, "UpperCrust"), h("i", {}, "Academy"))),
    h("div", { class: "lgl-stage" },
      orbit(),
      h("h2", { class: "lgl-big" }, "Learning never ends."),
      h("p", { class: "lgl-sub" }, "Money skills for every age and every stage of life."),
      h("ul", { class: "lgl-chips", "aria-label": "Made for" }, WHO.map(w => h("li", { class: "lgl-chip" }, w)))),
    h("p", { class: "lg-foot" }, "For education only. Not investment advice."));
}
