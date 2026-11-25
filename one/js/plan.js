/* After a missed exam: a short, honest plan built from what this learner has actually answered, not a generic "study more". */
import { h, icon } from "./dom.js";
import { D, questionsFor } from "./data.js";
import * as Store from "./store.js";
import { weakIds } from "./arena.js";

/* lessons of this course where the learner's own answers are weakest, then lessons not yet studied */
export function weakLessons(c, max = 3) {
  const s = Store.get(), by = {};
  for (const q of questionsFor(c.lessons, true)) { const e = s.q[q.id]; if (!e || !e.n) continue; const o = (by[q.n] = by[q.n] || { n: q.n, r: 0, t: 0 }); o.r += e.r; o.t += e.n; }
  const tried = Object.values(by).filter(o => o.t >= 2 && o.r / o.t < .8).sort((a, b) => a.r / a.t - b.r / b.t).map(o => ({ n: o.n, acc: Math.round(100 * o.r / o.t) }));
  const untouched = c.lessons.filter(n => !s.done[n]).map(n => ({ n, acc: null }));
  return [...tried, ...untouched].slice(0, max);
}

export function retakePlan(c, tier, res) {
  const lessons = weakLessons(c), weak = weakIds().length, gap = Math.max(0, res.pass - res.score);
  const step = (i, title, body, action) => h("li", { class: "rp-s" }, h("span", { class: "rp-n" }, String(i)), h("div", { class: "rp-t" }, h("b", {}, title), body, action || null));
  const lessonList = lessons.length
    ? h("div", { class: "rp-ls" }, lessons.map(l => h("a", { class: "rp-l", href: `#/lesson/${l.n}` }, h("span", {}, D.lessons[l.n]?.title || `Lesson ${l.n}`), h("small", {}, l.acc == null ? "Not studied yet" : `${l.acc}% right so far`), icon("chev", 16))))
    : h("p", { class: "small mute" }, "Your lesson answers look solid. Read the explanations of the questions you missed.");
  return h("section", { class: "card rp", "aria-label": "Your retake plan" },
    h("div", { class: "rp-h" }, h("b", {}, "Your plan to pass"), h("span", { class: "pill gold" }, gap ? `${gap} points to go` : "So close")),
    h("ol", { class: "rp-o" },
      step(1, "Fix the weak spots", lessonList),
      step(2, weak ? `Train ${Math.min(weak, 8)} questions you miss` : "Warm up with the Daily five", h("p", { class: "small mute" }, "Short and quick. Wrong answers come back sooner."), h("a", { class: "btn ghost sm", href: weak ? "#/quiz/weak" : "#/quiz/daily" }, weak ? "Start training" : "Start Daily five")),
      step(3, "Retake with fresh questions", h("p", { class: "small mute" }, "A new set is drawn each time. Retake when the first two feel easy."))));
}
