/* The lesson player: a few short parts, one at a time. */
import { h, icon, clear } from "./dom.js";
import { D, lesson, courseOf, moduleIndexOf, partsOf } from "./data.js";
import * as Store from "./store.js";
import { runQuiz } from "./quiz.js";
import { nextLessonAfter } from "./path.js";
import { levelTag } from "./ui.js";

function partBody(l, k) {
  if (k === "story") {
    const s = l.story;
    return h("div", { class: "stack stack-l" },
      h("div", { class: "stack stack-s" }, h("div", { class: "eyebrow" }, "The big story" + (s.date ? " · " + s.date : "")), h("h1", { class: "h1" }, s.headline)),
      h("div", {}, s.paras.map(p => h("p", {}, p))),
      s.src && h("p", { class: "source" }, "Source: ", s.url ? h("a", { href: s.url, target: "_blank", rel: "noopener" }, s.src) : s.src));
  }
  if (k === "concept") {
    return h("div", { class: "stack stack-l" },
      h("h1", { class: "h1" }, l.deep ? "The idea" : "Key facts"),
      l.deep ? h("div", {}, l.concept.map(p => h("p", {}, p))) : h("ul", { class: "facts" }, l.concept.map(p => h("li", {}, p))));
  }
  if (k === "client") {
    return h("div", { class: "stack stack-l" },
      h("div", { class: "eyebrow" }, "A client asks"),
      h("p", { class: "quote" }, l.client.quote),
      h("p", { class: "mute" }, l.client.context),
      h("div", { class: "card tint" }, h("p", { class: "small" }, "Take a moment. How would you answer her in two sentences? The next parts show how to think about it.")));
  }
  if (k === "talk") {
    return h("div", { class: "stack stack-l" },
      h("div", { class: "eyebrow" }, l.deep ? "In the conversation" : "What to tell a client"),
      h("p", { class: "quote" }, l.talk));
  }
  if (k === "remember") {
    return h("div", { class: "stack stack-l" }, h("h1", { class: "h1" }, "Remember"), h("ul", { class: "facts" }, l.remember.map(p => h("li", {}, p))));
  }
  return h("div");
}

export function renderLesson(root, n) {
  const l = lesson(n);
  if (!l) { location.hash = "#/courses"; return; }
  const c = courseOf(n), parts = partsOf(l);
  let idx = Math.min(Store.get().part[n] || 0, parts.length - 1);
  Store.openLesson(n);

  const fill = h("i");
  const title = h("span", { class: "small mute", style: "white-space:nowrap" });
  const close = h("a", { class: "icon-btn", href: `#/course/${c.id}`, "aria-label": "Close lesson" }, icon("x", 22));
  const top = h("div", { class: "focus-top" }, h("div", { class: "focus-in" }, close, h("div", { class: "bar" }, fill), title));
  const body = h("div", { class: "read" });
  const dock = h("div", { class: "dock" });
  clear(root).append(top, body, dock);

  function go(to) { idx = to; Store.setPart(n, idx); paint(); }

  function paint() {
    const p = parts[idx];
    fill.style.width = `${Math.round(100 * (idx + (p.k === "quiz" ? 0 : 1)) / parts.length)}%`;
    title.textContent = `${idx + 1} of ${parts.length}`;
    if (p.k === "quiz") return quizPart();
    clear(body).append(idx === 0 ? h("div", { class: "stack stack-l" },
      h("div", { class: "row-flex" }, levelTag(D.levels.find(x => x.id === c.level)), h("span", { class: "tiny mute" }, `${c.title} · Lesson ${c.lessons.indexOf(n) + 1}`)),
      h("h2", { class: "tiny mute", style: "font-weight:500" }, l.title), partBody(l, p.k)) : partBody(l, p.k));
    clear(dock).append(h("div", { class: "dock-in" },
      idx > 0 ? h("button", { class: "btn quiet", on: { click: () => go(idx - 1) } }, icon("left", 18), "Back") : h("span"),
      h("button", { class: "btn primary", on: { click: () => idx === parts.length - 1 ? finish() : go(idx + 1) } }, idx === parts.length - 1 ? "Finish lesson" : "Continue")));
    window.scrollTo(0, 0);
  }

  function quizPart() {
    runQuiz(root, {
      title: l.title, questions: l.qs.map(q => ({ ...q, n })), exit: `#/course/${c.id}`,
      done: res => ({
        head: res.right === res.total ? "All right." : `${res.right} of ${res.total}.`,
        sub: res.right === res.total ? "You have this one." : "Review what you missed, then carry on.",
        actions: h("button", { class: "btn primary", on: { click: () => { Store.setPart(n, idx + 1); renderLesson(root, n); } } }, "Continue lesson")
      })
    });
  }

  function finish() {
    const first = !Store.get().done[n];
    Store.finishLesson(n);
    const next = nextLessonAfter(n), m = moduleIndexOf(c, n), mod = c.modules[m];
    const modDone = mod.lessons.every(x => Store.get().done[x]);
    let act;
    if (modDone && !Store.get().quiz[`m:${c.id}:${m}`]?.passed) act = [h("a", { class: "btn primary", href: `#/quiz/module/${c.id}/${m}` }, "Take the module quiz"), h("a", { class: "btn ghost", href: `#/course/${c.id}` }, "Not now")];
    else if (next) act = [h("a", { class: "btn primary", href: `#/lesson/${next}` }, "Next lesson"), h("a", { class: "btn ghost", href: `#/course/${c.id}` }, "Back to course")];
    else act = [h("a", { class: "btn primary", href: `#/course/${c.id}` }, "Back to course")];
    clear(top); dock.remove();
    clear(body).append(h("div", { class: "stack stack-l", style: "text-align:center;padding-top:48px" },
      h("span", { class: "check on", style: "width:64px;height:64px;margin:0 auto" }, icon("check", 30)),
      h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, first ? "Lesson complete." : "Done again."), h("p", { class: "lead" }, l.title)),
      first && Store.streakNow() > 0 ? h("p", { class: "streak", style: "justify-content:center" }, icon("flame", 18), `${Store.streakNow()} day streak`) : null,
      h("div", { class: "row-flex", style: "justify-content:center" }, act)));
    window.scrollTo(0, 0);
  }
  paint();
}
