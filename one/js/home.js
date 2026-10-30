/* Home, Explore, and a single course. */
import { h, icon, plural, isoDay, dayMs, toast } from "./dom.js";
import { D, level, course, lesson, partsOf, loadTx } from "./data.js";
import * as Store from "./store.js";
import * as Creds from "./creds.js";
import { nextUp, hrefFor, labelFor } from "./path.js";
import { levelStats, weekLessons, currentLevel, skillsOf, questionCount } from "./progress.js";
import { page, widePage, levelTag, bar, checkMark, notFound } from "./ui.js";

const rerender = () => document.dispatchEvent(new Event("one:rerender"));
const chev = () => h("span", { class: "chev" }, icon("chev", 18));
const stepTitle = st => st.kind === "lesson" ? lesson(st.n).title : st.kind === "module" ? `Module ${st.module + 1} quiz` : "Course exam";

/* Real stories from the lessons, each with what to tell a client. */
export function stories(n) {
  return Object.values(D.lessons).filter(l => l.story && l.talk).slice(0, n);
}
export const storyCard = l => h("a", { class: "list-row", href: `#/lesson/${l.n}`, style: "align-items:flex-start" },
  h("div", { class: "grow" },
    h("div", { class: "tiny mute" }, (l.story.src || "").split("(")[0].trim() + (l.story.date ? " · " + l.story.date : "")),
    h("div", { class: "list-title", style: "margin-top:2px" }, l.story.headline),
    h("div", { class: "news-for" }, h("b", {}, "For clients: "), l.talk.replace(/^["“]|["”]$/g, "").split(/(?<=[.!?])\s/)[0])), chev());

const OFF = [0, -46, -74, -46, 0, 46, 74, 46];

export function home() {
  const s = Store.get(), step = nextUp(), a = Store.todayAct(), due = Store.dueIds().length;
  const c = step?.course || D.courses[0], lv = level(c.level), p = Store.courseProgress(c), cred = Creds.find("course", c.id);
  const ls = levelStats(lv);
  let k = 0;
  const trail = [];

  c.modules.forEach((m, mi) => {
    const qd = s.quiz[`m:${c.id}:${mi}`], allDone = m.lessons.every(n => s.done[n]);
    trail.push(h("div", { class: `unit ${c.level}` },
      h("div", {}, h("div", { class: "eyebrow" }, `Unit ${mi + 1}`), h("h3", {}, m.title)),
      h("a", { href: `#/course/${c.id}` }, "Syllabus")));
    const items = h("div", { class: "trail" });
    for (const n of m.lessons) {
      const isNow = step?.kind === "lesson" && step.n === n, done = !!s.done[n], off = OFF[k++ % OFF.length];
      items.append(stepEl(off, h("a", { class: `node ${done ? c.level : isNow ? c.level + " now" : "todo"}`, href: `#/lesson/${n}`, "aria-label": lesson(n).title }, icon(done ? "check" : "book")), lesson(n).title, isNow ? (s.part[n] > 0 ? "CONTINUE" : "START") : null, c.level, `Lesson ${c.lessons.indexOf(n) + 1}`));
    }
    const off = OFF[k++ % OFF.length], isNow = step?.kind === "module" && step.module === mi;
    items.append(stepEl(off, qd?.passed
      ? h("a", { class: "node gold", href: `#/quiz/module/${c.id}/${mi}`, "aria-label": "Module quiz, passed" }, icon("check"))
      : allDone ? h("a", { class: "node gold" + (isNow ? " now" : ""), href: `#/quiz/module/${c.id}/${mi}`, "aria-label": "Module quiz" }, icon("star"))
        : h("button", { class: "node lock", "aria-label": "Module quiz, locked", on: { click: () => toast("Finish this unit's lessons first") } }, icon("lock")),
      "Unit quiz", isNow ? "START" : null, c.level, qd?.passed ? `Passed · ${qd.best}%` : "10 questions"));
    trail.push(items);
  });
  const ready = p.examReady, isExam = step?.kind === "exam";
  trail.push(h("div", { class: "trail" }, stepEl(0, cred
    ? h("a", { class: "node gold", href: `#/cert/${cred.id}`, "aria-label": "Certificate" }, icon("trophy"))
    : ready ? h("a", { class: "node gold" + (isExam ? " now" : ""), href: `#/quiz/exam/${c.id}`, "aria-label": "Course exam" }, icon("trophy"))
      : h("button", { class: "node lock", "aria-label": "Course exam, locked", on: { click: () => toast("Pass every module quiz first") } }, icon("lock")),
    cred ? "Your certificate" : "Course exam", isExam ? "START" : null, c.level, cred ? "Earned" : "20 questions · 80% to pass")));

  const goals = [
    due ? { t: `Review ${plural(due, "due question")}`, href: "#/quiz/revise", done: a.r } : null,
    step?.kind === "lesson" ? { t: s.part[step.n] > 0 ? "Finish your lesson" : "Do one lesson", href: hrefFor(step), done: a.l > 0 } : null,
    { t: "Answer 5 daily questions", href: "#/quiz/daily", done: a.d }
  ].filter(Boolean);
  const now = new Date(), monday = new Date(now.getTime() - ((now.getDay() + 6) % 7) * dayMs);
  const week = ["M", "T", "W", "T", "F"].map((d, i) => { const key = isoDay(new Date(monday.getTime() + i * dayMs)), x = s.act[key], on = x && (x.l || x.d || x.r); return h("div", {}, h("i", { class: (on ? "on " : "") + (key === isoDay() ? "today" : "") }, on ? icon("check") : null), d); });

  const main = h("div", { class: "stack" },
    h("div", { class: "row-flex between" },
      h("div", {}, h("div", { class: "row-flex", style: "gap:10px" }, levelTag(lv), h("span", { class: "tiny mute" }, `${p.done} of ${p.total} lessons`)), h("h1", { class: "h1", style: "margin-top:4px" }, c.title)),
      h("a", { class: "btn ghost", href: "#/courses", style: "height:44px" }, "Change course")),
    ...trail);

  const rail = h("div", { class: "rail" },
    h("section", { class: "card stack" },
      h("div", { class: "big-flame" }, icon("flame"), h("div", {}, h("b", {}, Store.streakNow()), h("span", { class: "small mute" }, "day streak"))),
      h("div", { class: "week" }, week), h("p", { class: "tiny mute" }, "Study on weekdays. Weekends never break your streak.")),
    h("section", { class: "card stack" },
      h("div", { class: "row-flex between" }, h("h3", { class: "h3" }, "Today's goals"), h("span", { class: "pill" }, `${goals.filter(g => g.done).length}/${goals.length}`)),
      h("div", { class: "stack stack-s" }, goals.map(g => h("a", { class: "row-flex", href: g.href, style: "gap:12px;flex-wrap:nowrap" }, checkMark(g.done ? "done" : ""), h("span", { style: g.done ? "color:var(--mute);text-decoration:line-through" : "font-weight:800" }, g.t))))),
    h("section", { class: "card stack" },
      h("div", { class: "row-flex between" }, h("h3", { class: "h3" }, `${lv.name} certificate`), ls.earned ? h("span", { class: "pill ok" }, "Earned") : null),
      bar(Math.round(100 * (ls.doneL + ls.doneM + ls.doneE) / (ls.lessons + ls.mods + ls.exams)), ls.earned),
      h("p", { class: "small mute" }, `${ls.doneL}/${ls.lessons} lessons · ${ls.doneM}/${ls.mods} quizzes · ${ls.doneE}/${ls.exams} exam`),
      h("a", { class: "small", style: "color:var(--blue-d);font-weight:800", href: "#/me" }, "See all awards")),
    h("section", { class: "card tint stack stack-s" }, h("h3", { class: "h3" }, "Client Lab"), h("p", { class: "small" }, "Practise real client questions and compare with a model answer."), h("a", { class: "btn primary", href: "#/lab" }, "Try one")));

  const out = widePage(h("div", { class: "cols" }, main, rail));
  requestAnimationFrame(() => { const now = out.querySelector(".node.now"); if (now) now.scrollIntoView({ block: "center" }); });
  return out;
}

function stepEl(off, node, label, bubble, level, sub) {
  const side = off <= 0 ? "left" : "right";
  node.style.transform = `translateX(${off}px)`;
  const el = h("div", { class: `step ${side}`, style: `--off:${off}px;--c:var(--lv-${level})` }, node,
    h("div", { class: "step-label" }, label, h("small", {}, sub)));
  if (bubble) node.append(h("span", { class: "bubble", "aria-hidden": "true" }, bubble));
  return el;
}

/* ——— Explore ——— */
export function courses() {
  const q = new URLSearchParams(location.hash.split("?")[1] || "");
  const f = { level: q.get("level") || "all", text: "" };
  const grid = h("div", { class: "grid3" }), cont = h("section", { class: "stack" });
  const chips = h("div", { class: "chips", role: "group", "aria-label": "Level" });
  const search = h("input", { class: "input", type: "search", placeholder: "Search courses: SIP, gold, SEBI…", "aria-label": "Search courses", on: { input: ev => { f.text = ev.target.value.trim().toLowerCase(); paint(); } } });

  function paint() {
    const all = [...D.courses.map(c => ({ ...c, soon: false })), ...D.soon.map(c => ({ ...c, soon: true }))];
    chips.replaceChildren(...[["all", "All"], ...D.levels.map(l => [l.id, l.name])].map(([id, t]) => h("button", { class: "chip", "aria-pressed": String(f.level === id), on: { click: () => { f.level = id; paint(); } } }, t)));
    const match = c => (f.level === "all" || c.level === f.level) && (!f.text || `${c.title} ${c.blurb} ${c.topic} ${c.tag}`.toLowerCase().includes(f.text));
    const shown = all.filter(match);
    const started = D.courses.filter(c => Store.courseProgress(c).done > 0 && !Creds.find("course", c.id));
    cont.replaceChildren(); cont.hidden = !started.length || !!f.text || f.level !== "all";
    if (!cont.hidden) cont.append(h("h2", { class: "h2" }, "Continue learning"), h("div", { class: "grid3" }, started.map(card)));
    grid.replaceChildren(...shown.map(c => c.soon ? soonCard(c) : card(c)), ...(!f.text && f.level === "all" ? [labCard()] : []));
    if (!shown.length) grid.replaceChildren(h("p", { class: "mute" }, "Nothing matches. Try a different word."));
  }
  paint();
  return widePage(
    h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "What do you want to learn today?"), h("p", { class: "lead" }, "Every course ends in a quiz and a verifiable certificate."),),
    h("div", { class: "search" }, icon("search"), search), cont, h("div", { class: "stack stack-s" }, chips, grid));
}

function card(c) {
  const p = Store.courseProgress(c), cred = Creds.find("course", c.id), lv = level(c.level);
  return h("a", { class: "card link stack", href: `#/course/${c.id}`, style: "padding:12px 12px 20px" },
    h("div", { class: "tile " + c.level }, h("span", {}, c.tag)),
    h("div", { class: "stack stack-xs", style: "padding:6px 8px 0" },
      levelTag(lv), h("h3", { class: "h3" }, c.title), h("div", { class: "tiny mute" }, `UpperCrust Research · ${c.lessons.length} lessons`),
      h("div", { style: "padding-top:12px" }, cred ? h("span", { class: "pill ok" }, "Certified") : p.done ? h("div", { class: "stack stack-xs" }, bar(p.pct), h("div", { class: "tiny mute" }, `${p.pct}% complete`)) : h("span", { class: "pill gold" }, "Certificate included"))));
}
const soonCard = c => h("div", { class: "card stack", style: "padding:12px 12px 20px;border-style:dashed" },
  h("div", { class: "tile soon " + c.level }, h("span", {}, c.tag)),
  h("div", { class: "stack stack-xs", style: "padding:6px 8px 0" }, levelTag(level(c.level)), h("h3", { class: "h3" }, c.title), h("p", { class: "small mute" }, c.blurb), h("span", { class: "pill", style: "align-self:flex-start" }, "Coming soon")));
const labCard = () => h("a", { class: "card link stack", href: "#/lab", style: "padding:12px 12px 20px" },
  h("div", { class: "tile open" }, h("span", {}, "Lab")),
  h("div", { class: "stack stack-xs", style: "padding:6px 8px 0" }, h("span", { class: "level" }, "All levels"), h("h3", { class: "h3" }, "Client Lab: difficult conversations"), h("div", { class: "tiny mute" }, `UpperCrust Research · ${D.sims.length} scenarios`)));

/* ——— One course ——— */
export function coursePage(id) {
  const c = course(id);
  if (!c) return notFound("That course does not exist.");
  const s = Store.get(), p = Store.courseProgress(c), step = nextUp(id), lv = level(c.level), cred = Creds.find("course", id);
  const body = h("div", { class: "stack stack-l" });
  let tab = "overview";
  const TABS = [["overview", "Overview"], ["syllabus", "Syllabus"], ["quizzes", "Quizzes"], ["certificate", "Certificate"], ["skills", "Skills"]];
  const strip = h("div", { class: "utabs", role: "tablist" });
  const nextCourse = D.courses[D.courses.indexOf(c) + 1];

  const modules = () => c.modules.map((m, mi) => {
    const q = s.quiz[`m:${id}:${mi}`], doneN = m.lessons.filter(n => s.done[n]).length;
    return h("section", { class: "stack" },
      h("div", { class: "row-flex between" }, h("div", {}, h("div", { class: "eyebrow" }, `Module ${mi + 1} · ${doneN === m.lessons.length ? "Complete" : doneN ? "In progress" : "Not started"}`), h("h3", { class: "h2" }, m.title)), h("span", { class: "small mute" }, `${doneN} of ${m.lessons.length} lessons`)),
      h("div", { class: "divide" }, m.lessons.map((n, i) => h("a", { class: "list-row", href: `#/lesson/${n}` }, checkMark(s.done[n] ? "done" : s.part[n] > 0 ? "now" : ""), h("div", { class: "grow list-title" }, `${c.lessons.indexOf(n) + 1}. ${lesson(n).title}`), chev())),
        quizRow(mi, q, doneN === m.lessons.length)));
  });
  const quizRow = (mi, q, open) => open || q?.passed
    ? h("a", { class: "list-row", href: `#/quiz/module/${id}/${mi}` }, checkMark(q?.passed ? "done" : "now"), h("div", { class: "grow" }, h("div", { class: "list-title" }, `Module ${mi + 1} quiz`), h("div", { class: "small mute" }, q ? `Best ${q.best}%${q.passed ? " · passed" : ""}` : "10 questions · 70% to pass")), chev())
    : h("div", { class: "list-row", style: "color:var(--mute)" }, h("span", { class: "check" }, icon("lock")), h("div", { class: "grow" }, h("div", {}, `Module ${mi + 1} quiz`), h("div", { class: "small" }, "Opens when all five lessons are done")));
  const examBlock = () => p.examReady
    ? h("a", { class: "card link row-flex between", href: `#/quiz/exam/${id}` }, h("div", {}, h("div", { class: "list-title" }, p.exam?.passed ? "Retake the course exam" : "Take the course exam"), h("div", { class: "small mute" }, p.exam ? `Best ${p.exam.best}%` : "20 questions · 80% to pass · certificate on pass")), chev())
    : h("div", { class: "card row-flex", style: "color:var(--mute)" }, icon("lock", 20), h("span", {}, "The exam opens when every module quiz is passed."));

  function paint() {
    strip.replaceChildren(...TABS.map(([k, t]) => h("button", { role: "tab", "aria-selected": String(tab === k), on: { click: () => { tab = k; paint(); } } }, t)));
    body.replaceChildren();
    if (tab === "overview") body.append(
      h("section", { class: "stack" }, h("h2", { class: "h2" }, "How a lesson works"),
        h("ul", { class: "facts" }, [["The big story", " from this week's markets"], ["Concept", " in plain language"], ["Think like a client", " before you answer"], ["Questions", " that explain every option"], ["Client conversation", " talk track"], ["Remember", " one line to keep"]].map(([b, t]) => h("li", {}, h("b", {}, b), t)))),
      h("section", { class: "stack" }, h("h2", { class: "h2" }, "Skills you will gain"), h("div", { class: "chips" }, skillsOf(c).map(t => h("span", { class: "pill" }, t)))),
      nextCourse ? h("a", { class: "card link row-flex between", href: `#/course/${nextCourse.id}` }, h("div", {}, h("div", { class: "eyebrow" }, "Next up after this"), h("div", { class: "list-title" }, nextCourse.title), h("div", { class: "small mute" }, `${level(nextCourse.level).name} · ${nextCourse.lessons.length} lessons`)), chev()) : null);
    if (tab === "syllabus") body.append(...modules(), examBlock());
    if (tab === "quizzes") body.append(h("section", { class: "stack" }, h("h2", { class: "h2" }, "Module quizzes"), h("div", { class: "divide" }, c.modules.map((m, mi) => quizRow(mi, s.quiz[`m:${id}:${mi}`], m.lessons.every(n => s.done[n]))))),
      h("section", { class: "stack" }, h("h2", { class: "h2" }, "Course exam"), examBlock()),
      h("p", { class: "small mute" }, "Every wrong answer comes with the reason it is wrong. Missed questions come back in your revision queue."));
    if (tab === "certificate") body.append(
      h("div", { class: "cert-mini" }, h("div", { class: "stack stack-xs" }, h("div", { class: "eyebrow" }, "Course certificate"), h("div", { class: "serif", style: "font-size:28px;font-style:italic" }, s.name || "Your name"), h("div", { class: "small mute" }, c.title))),
      h("ul", { class: "facts" }, h("li", {}, "Pass each module quiz at 70%, then the course exam at 80%."), h("li", {}, "Valid 12 months. A 15-question refresher renews it."), h("li", {}, "Verified by link and QR code. Add it to LinkedIn.")),
      cred ? h("a", { class: "btn primary", style: "align-self:flex-start", href: `#/cert/${cred.id}` }, "View your certificate") : null);
    if (tab === "skills") body.append(h("section", { class: "stack" }, h("h2", { class: "h2" }, "Skills this course verifies"), h("div", { class: "chips" }, skillsOf(c).map(t => h("span", { class: "pill" }, t)))));
  }
  paint();

  const nQ = questionCount(c);
  return widePage(
    h("section", { class: "hero stack" },
      h("a", { class: "small", href: "#/courses" }, icon("left", 16), "Explore"),
      h("div", { class: "row-flex", style: "gap:10px" }, levelTag(lv), h("span", { class: "pill gold" }, "Certificate included"), h("span", { class: "pill" }, "English · हिन्दी · ગુજરાતી")),
      h("h1", { class: "h1", style: "font-size:clamp(30px,5vw,44px)" }, c.title), h("p", { class: "lead" }, c.blurb),
      h("div", { class: "stats" }, h("span", {}, h("b", {}, c.lessons.length), " lessons"), h("span", {}, h("b", {}, c.modules.length), " unit quizzes"), h("span", {}, h("b", {}, 1), " course exam"), h("span", {}, h("b", {}, nQ), " practice questions")),
      h("div", { class: "row-flex" },
        step && step.course.id === id ? h("a", { class: "btn primary", href: hrefFor(step) }, labelFor(step)) : cred ? h("a", { class: "btn primary", href: `#/cert/${cred.id}` }, "View certificate") : null,
        p.done ? h("span", { class: "small", style: "color:rgba(255,255,255,.8);font-weight:800" }, `${p.pct}% complete`) : null)),
    h("div", { class: "cols" },
      h("div", { class: "stack stack-l" }, strip, body),
      h("aside", {}, h("div", { class: "card stack" },
        h("h3", { class: "h3" }, "This course includes"),
        h("div", { class: "stack stack-s small" }, ["Six-part lessons with client scenarios", "Quizzes with a reason for every wrong answer", "Spaced revision of what you missed", "Certificate you can verify and share"].map(t => h("div", { class: "row-flex", style: "gap:10px;align-items:flex-start;flex-wrap:nowrap" }, h("span", { style: "color:var(--ok);flex:none" }, icon("check", 18)), t))),
        h("a", { class: "small", style: "color:var(--blue-d);font-weight:800", href: "#/quiz/place" }, "Take the placement quiz")))));
}
