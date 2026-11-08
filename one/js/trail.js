/* The lesson trail: the next few stops on the learner's path, drawn as a winding line of coins. Pure view over progress. */
import { h, icon } from "./dom.js";
import { D } from "./data.js";
import * as Store from "./store.js";

/* All stops of one course in order: lessons, then each module quiz, then the Beginner exam. */
export function stops(c) {
  const s = Store.get(), out = [];
  c.modules.forEach((m, mi) => {
    for (const n of m.lessons) out.push({ kind: "lesson", n, done: !!s.done[n], title: D.lessons[n]?.title || "Lesson", href: `#/lesson/${n}` });
    out.push({ kind: "quiz", done: !!s.quiz[`m:${c.id}:${mi}`]?.passed, title: `Unit check ${mi + 1}`, href: `#/quiz/module/${c.id}/${mi}` });
  });
  out.push({ kind: "exam", done: !!s.quiz["x:" + c.id]?.passed, title: "Beginner exam", href: `#/assess/${c.id}` });
  return out;
}

/* A window of the trail: one finished stop for context, the current stop, then what is next. */
export function trail(c, size = 5) {
  const all = stops(c), cur = Math.max(0, all.findIndex(x => !x.done)), at = all.every(x => x.done) ? all.length - 1 : cur;
  const from = Math.max(0, Math.min(at - 1, all.length - size)), win = all.slice(from, from + size);
  const ico = k => (k === "quiz" ? "bolt" : k === "exam" ? "trophy" : "book");
  const wave = [0, 38, 58, 38, 0, -38, -58, -38];
  return h("ol", { class: "trail", "aria-label": `Your path in ${c.title}` }, win.map((x, i) => {
    const idx = from + i, isCur = idx === at && !x.done, state = x.done ? "done" : isCur ? "now" : "next";
    const inner = [h("span", { class: "coin " + state + " k-" + x.kind }, x.done ? icon("check", 26) : icon(ico(x.kind), isCur ? 30 : 24)),
      h("span", { class: "tl-t" }, isCur ? h("b", {}, "Start here") : h("span", {}, x.title))];
    const style = `--x:${wave[idx % wave.length]}px`;
    return h("li", { class: "stop " + state, style }, state === "next" ? h("span", { class: "stop-in", "aria-disabled": "true" }, inner) : h("a", { class: "stop-in", href: x.href, "aria-label": `${x.title}${x.done ? ", done" : ""}` }, inner));
  }));
}
