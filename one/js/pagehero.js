/* Bright banner at the top of the Courses, Exams and News pages. */
import { h } from "./dom.js";

/* kind: "courses" | "exams" | "news". stats: [[number, label], ...] */
export function pageHero(kind, title, lead, stats = [], note = null) {
  const EMO = { courses: "🎓", exams: "🏆", news: "📰" };
  return h("section", { class: "pghero pg-" + kind },
    h("i", { class: "pgh-blob b1", "aria-hidden": "true" }), h("i", { class: "pgh-blob b2", "aria-hidden": "true" }),
    h("span", { class: "pgh-emo", "aria-hidden": "true" }, EMO[kind] || "✨"),
    h("div", { class: "pgh-copy stack stack-xs" }, h("h1", { class: "pgh-t" }, title), h("p", { class: "pgh-l" }, lead),
      stats.length ? h("div", { class: "pgh-stats" }, stats.map(([n, t]) => h("span", { class: "pgh-s" }, h("b", {}, String(n)), " ", t))) : null, note));
}
