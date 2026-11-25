/* The lesson player: a few short parts, one at a time. */
import { cheer } from "./cheer.js";
import { h, icon, clear } from "./dom.js";
import { D, lesson, courseOf, moduleIndexOf, partsOf, liveQs } from "./data.js";
import { toolCard } from "./tools.js";
import { fmtMonth } from "./dom.js";
import * as Store from "./store.js";
import { tr } from "./i18n.js";
import { runQuiz } from "./quiz.js";
import { nextLessonAfter } from "./path.js";
import { levelTag } from "./ui.js";
import { stories } from "./stories.js";
import { rateDue } from "./rate.js";
import { buildStory, handStory } from "./storify.js";

/* Who is reading: someone who advises others sees the client wording; everyone else reads it as their own money. */
const isPro = () => Store.isStaff() || ["partner", "team"].includes(Store.get().door);
/* "A client frustrated by…" reads as "Someone frustrated by…" for a learner who is not an adviser. */
const mine = t => String(t || "").replace(/^A client\b/, "Someone").replace(/^An? ([a-z-]+) client\b/, (m, w) => (/^[aeiou]/.test(w) ? "An " : "A ") + w + " earner");

function partBody(l, k) {
  const pro = isPro();
  if (k === "story") {
    const s = l.story;
    return h("div", { class: "stack stack-l" },
      h("div", { class: "stack stack-s" }, h("div", { class: "eyebrow" + (s.kicker ? " story-kick" : "") }, (s.kicker || "The big story") + (s.date ? " · " + s.date : "")), h("h1", { class: "h1" }, s.headline)),
      h("div", {}, s.paras.map(p => h("p", {}, p))),
      s.src && h("p", { class: "source" }, "Source: ", s.url ? h("a", { href: s.url, target: "_blank", rel: "noopener" }, s.src) : s.src));
  }
  if (k === "concept") {
    return h("div", { class: "stack stack-l" },
      h("h1", { class: "h1" }, l.deep ? "The idea" : "Key facts"),
      l.deep ? h("div", {}, l.concept.map(p => h("p", {}, p))) : h("ul", { class: "facts" }, l.concept.map(p => h("li", {}, p))));
  }
  if (k === "example") {
    const e = l.example;
    return h("div", { class: "stack stack-l" },
      h("div", { class: "eyebrow" }, "Worked example"),
      /* A table whose last column is words, not amounts, is laid out as two readable columns. */
      h("div", { class: "eg" + (e.rows.some(r => String(r[r.length - 1]).length > 22) ? " eg-text" : "") },
        h("h1", { class: "eg-t" }, e.title),
        e.intro ? h("p", { class: "eg-note" }, e.intro) : null,
        h("table", {}, e.head ? h("thead", {}, h("tr", {}, e.head.map(c => h("th", { scope: "col" }, c)))) : null,
          h("tbody", {}, e.rows.map(r => h("tr", { class: r[0] === "=" ? "sum" : null }, (r[0] === "=" ? r.slice(1) : r).map(c => h("td", {}, c)))))),
        e.note ? h("p", { class: "eg-note" }, e.note) : null));
  }
  if (k === "tool") {
    return h("div", { class: "stack stack-l" },
      h("div", { class: "stack stack-s" }, h("div", { class: "eyebrow" }, "Try it"), h("h1", { class: "h1" }, l.toolAsk || "Now use your own numbers.")),
      toolCard(l.tool));
  }
  if (k === "client") {
    return h("div", { class: "stack stack-l" },
      h("div", { class: "eyebrow" }, pro ? "A client asks" : "A common question"),
      h("p", { class: "quote" }, l.client.quote),
      h("p", { class: "mute" }, pro ? l.client.context : mine(l.client.context)),
      h("div", { class: "card tint" }, h("p", { class: "small" }, pro ? "Take a moment. How would you answer her in two sentences? The next parts show how to think about it." : "Take a moment. What would you say to a friend who asked you this? The next parts show how to think about it.")));
  }
  if (k === "talk") {
    return h("div", { class: "stack stack-l" },
      h("div", { class: "eyebrow" }, !pro ? "The short answer" : l.deep ? "In the conversation" : "What to tell a client"),
      h("p", { class: "quote" }, l.talk));
  }
  if (k === "remember") {
    return h("div", { class: "stack stack-l" }, h("h1", { class: "h1" }, "Remember"), h("ul", { class: "facts" }, l.remember.map(p => h("li", {}, p))),
      l.upd ? h("p", { class: "lesson-foot" }, "Written by ", l.by || "UpperCrust Academy", " · ", "Updated ", fmtMonth(l.upd), l.rev ? [" · ", "Reviewed by ", l.rev] : null, " · ", "For learning, not investment advice.") : null);
  }
  return h("div");
}

/* Every lesson opens as a story: illustrated cards, Sarthi reading aloud. "/classic" opens the earlier page-by-page view (it also holds the calculators). */
async function storyLesson(root, n) {
  const l = lesson(n), c = courseOf(n);
  Store.openLesson(n);
  const hand = await handStory(n);
  const next = nextLessonAfter(n), m = moduleIndexOf(c, n), mod = c.modules[m];
  const acts = [];
  const finish = () => { const first = !Store.get().done[n]; Store.finishLesson(n); if (first) cheer("+20 points", 22);
    const modDone = mod.lessons.every(x => Store.get().done[x]);
    acts.length = 0;
    if (modDone && !Store.get().quiz[`m:${c.id}:${m}`]?.passed) acts.push({ label: tr("Take the module quiz"), href: `#/quiz/module/${c.id}/${m}`, go: true }, { label: tr("Back to course"), href: `#/course/${c.id}` });
    else if (next) acts.push({ label: tr("Next lesson"), href: `#/lesson/${next}`, go: true }, { label: tr("Back to course"), href: `#/course/${c.id}` });
    else acts.push({ label: tr(backLabel(c)), href: backTo(c), go: true });
  };
  const story = buildStory(l, n, { pro: isPro(), hand });
  /* The finish screen reads custom.next when it is drawn, after finish() has run. */
  const custom = { lesson: story, exit: backTo(c), answer: (id, ok) => Store.recordAnswer(id, ok), finish, get next() { return acts; }, get rateOn() { return rateDue("lesson"); } };
  stories(root, null, custom);
}

/* Where Close and Finish go: the page the learner came from (Learn home, a course), else the course. */
const backTo = c => { try { const f = sessionStorage.getItem("uc.from"); if (f && !/^#\/(lesson|quiz)\//.test(f) && f !== "#/lesson") return f; } catch {} return `#/course/${c.id}`; };
const backLabel = c => { const t = backTo(c); return t === `#/course/${c.id}` ? "Back to course" : /^#\/?(learn)?$/.test(t) ? "Back to Learn" : "Back"; };
export function renderLesson(root, n, classic) {
  const l = lesson(n);
  if (!l) { location.hash = "#/courses"; return; }
  if (!classic) { storyLesson(root, n); return; }
  const c = courseOf(n), parts = partsOf(l, isPro());
  let idx = Math.min(Store.get().part[n] || 0, parts.length - 1);
  Store.openLesson(n);

  const fill = h("i");
  const title = h("span", { class: "small mute", style: "white-space:nowrap" });
  const close = h("a", { class: "icon-btn", href: backTo(c), "aria-label": "Close lesson" }, icon("x", 22));
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
      title: l.title, questions: liveQs(l).map(q => ({ ...q, n })), exit: backTo(c),
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
    if (first) cheer("+20 points", 22);
    const next = nextLessonAfter(n), m = moduleIndexOf(c, n), mod = c.modules[m];
    const modDone = mod.lessons.every(x => Store.get().done[x]);
    let act;
    if (modDone && !Store.get().quiz[`m:${c.id}:${m}`]?.passed) act = [h("a", { class: "btn primary", href: `#/quiz/module/${c.id}/${m}` }, "Take the module quiz"), h("a", { class: "btn ghost", href: `#/course/${c.id}` }, "Not now")];
    else if (next) act = [h("a", { class: "btn primary", href: `#/lesson/${next}` }, "Next lesson"), h("a", { class: "btn ghost", href: `#/course/${c.id}` }, "Back to course")];
    else act = [h("a", { class: "btn primary", href: backTo(c) }, backLabel(c))];
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
