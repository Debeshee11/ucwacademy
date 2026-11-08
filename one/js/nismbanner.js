/* A banner of its own for NISM exam prep, shown on Exams and Courses so it is never lost. */
import { h, icon } from "./dom.js";

export function nismBanner() {
  return h("a", { class: "nmban", href: "#/nism" },
    h("span", { class: "nmban-badge", "aria-hidden": "true" }, "NISM"),
    h("span", { class: "nmban-b" },
      h("b", { class: "nmban-t" }, "NISM exam prep"),
      h("span", { class: "nmban-s" }, "Study guides you can download, plus five full mock exams for each series.")),
    h("span", { class: "nmban-go" }, "Open", icon("chev", 18)));
}
