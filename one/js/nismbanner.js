/* A banner of its own for NISM exam prep, shown on Exams and Courses so it is never lost. Lists the exams that fit the learner's profile. */
import { h, icon } from "./dom.js";
import * as Store from "./store.js";
import { doorOf } from "./audience.js";

const NAMES = { "nism-v-a": "Mutual Fund Distributors", "nism-v-d": "Mutual Fund Foundation", "nism-xii": "Securities Markets Foundation", "nism-viii": "Equity Derivatives", "nism-x-a": "Investment Adviser Level 1", "nism-xb": "Investment Adviser Level 2", "nism-xv": "Research Analyst" };

export function nismBanner() {
  const door = doorOf(Store.get().door), mine = (door?.exams || []).filter(id => NAMES[id]);
  return h("div", { class: "nmban-wrap" },
    h("a", { class: "nmban", href: "#/nism" },
      h("span", { class: "nmban-badge", "aria-hidden": "true" }, "NISM"),
      h("span", { class: "nmban-b" },
        h("b", { class: "nmban-t" }, "NISM exam prep"),
        h("span", { class: "nmban-s" }, "Study guides you can download, plus five full mock exams for each series.")),
      h("span", { class: "nmban-go" }, "Open", icon("chev", 18))),
    mine.length ? h("div", { class: "nmfor" }, h("b", {}, "Exams for you"), mine.map(id => h("a", { class: "chip", href: "#/nism/" + id }, NAMES[id]))) : null);
}
