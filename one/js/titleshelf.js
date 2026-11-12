/* A shelf of every title you can collect: one per course. Earned ones shine, the rest are locked. Decoration and motivation only. */
import { h, icon } from "./dom.js";
import { D } from "./data.js";
import * as Creds from "./creds.js";
import { nick } from "./certcopy.js";

export function titleShelf() {
  const items = D.courses.map(c => ({ c, got: !!Creds.find("course", c.id), name: nick({ kind: "course", key: c.id, level: c.level }) }));
  const n = items.filter(x => x.got).length;
  return h("section", { class: "stack" },
    h("div", { class: "row-flex between" }, h("h2", { class: "h2" }, "Titles to collect"), h("span", { class: "pill gold" }, `${n} of ${items.length}`)),
    h("p", { class: "small mute" }, "Every course you certify gives you a title to wear and share."),
    h("ul", { class: "ts-grid" }, items.sort((a, b) => b.got - a.got).map(({ c, got, name }) => h("li", { class: "ts-item" + (got ? " on" : ""), "data-lv": c.level, title: c.title },
      h("span", { class: "ts-ic" }, icon(got ? "award" : "lock", 20)), h("b", {}, name), h("small", {}, got ? "Unlocked" : c.title)))));
}
