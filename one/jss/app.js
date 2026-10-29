/* UpperCrust One: boot and routes. */
import { h, toast, clear } from "./dom.js";
import { loadData, loadTx } from "./data.js";
import * as Store from "./store.js";
import * as Auth from "./auth.js";
import { frame, isAdmin, notFound } from "./ui.js";
import { renderLesson } from "./lesson.js";
import * as Q from "./quizzes.js";
import * as Home from "./home.js";
import * as P from "./practice.js";
import * as C from "./credview.js";
import { team } from "./team.js";

const root = document.getElementById("app");
const skip = h("button", { style: "position:absolute;left:-999px;top:8px;background:#fff;border:1px solid #DDD9D0;padding:8px 14px;border-radius:8px;z-index:99", on: { focus: e => (e.target.style.left = "8px"), blur: e => (e.target.style.left = "-999px"), click: () => document.getElementById("main")?.focus() } }, "Skip to content");
document.body.prepend(skip);

/* route table: [pattern, view, nav id, title, focus?] */
const ROUTES = [
  [/^$/, () => Home.home(), "home", "Home"],
  [/^courses$/, () => Home.courses(), "courses", "Courses"],
  [/^course\/([\w-]+)$/, id => Home.coursePage(id), "courses", "Course"],
  [/^practice$/, () => P.practice(), "practice", "Practice"],
  [/^desk$/, () => P.desk(), "desk", "Desk"],
  [/^lab$/, () => P.lab(), "practice", "Client lab"],
  [/^lab\/([\w-]+)$/, id => P.labScenario(id), "practice", "Client lab"],
  [/^me$/, () => C.me(), "me", "Credentials"],
  [/^cert\/([\w-]+)$/, id => C.cert(id), "me", "Certificate"],
  [/^team$/, () => (isAdmin() ? team() : notFound("Only the administrator can open this.")), "", "Team"],
  /* full-screen routes draw into the root themselves */
  [/^lesson\/(\d+)$/, n => renderLesson(root, +n), "", "Lesson", true],
  [/^quiz\/module\/([\w-]+)\/(\d+)$/, (c, i) => Q.moduleQuiz(root, c, +i), "", "Quiz", true],
  [/^quiz\/exam\/([\w-]+)$/, c => Q.exam(root, c), "", "Exam", true],
  [/^quiz\/refresh\/([\w-]+)$/, c => Q.refresher(root, c), "", "Refresher", true],
  [/^quiz\/daily$/, () => Q.daily(root), "", "Daily five", true],
  [/^quiz\/revise$/, () => Q.revise(root), "", "Revise", true],
  [/^quiz\/place$/, () => Q.placement(root), "", "Placement test", true]
];

let ui = null;
function route() {
  const path = location.hash.replace(/^#\/?/, "").split("?")[0].replace(/\/$/, "");
  for (const [re, view, nav, title, focus] of ROUTES) {
    const m = path.match(re);
    if (!m) continue;
    document.title = `${title} · UpperCrust One`;
    ui.show(!focus); ui.active(nav);
    try {
      const out = view(...m.slice(1));
      if (!focus) { clear(root); if (out) root.append(out); }
    } catch (e) {
      console.error(e);
      clear(root).append(h("main", { class: "wrap page stack" }, h("h1", { class: "h1" }, "Something went wrong."), h("p", { class: "mute" }, "Reload the page. If it keeps happening, tell the administrator."), h("a", { class: "btn primary", href: "#/" }, "Home")));
    }
    if (!focus) window.scrollTo(0, 0);
    return;
  }
  ui.show(true); clear(root).append(notFound());
}

async function boot() {
  const pub = location.hash.match(/^#\/verify\/([\w-]+)$/);
  if (pub) {
    document.title = "Verify · UpperCrust One";
    root.append(C.verify(pub[1]));
    addEventListener("hashchange", () => location.reload());
    return;
  }
  const user = await Auth.start();
  root.replaceChildren(h("main", { class: "wrap page" }, h("p", { class: "mute" }, "Loading your courses…")));
  try {
    await Promise.all([loadData(), Store.init(user)]);
  } catch (e) {
    console.error(e);
    root.replaceChildren(h("main", { class: "wrap page stack" }, h("h1", { class: "h1" }, "Could not load."), h("p", { class: "mute" }, "Check your connection and reload."), h("button", { class: "btn primary", on: { click: () => location.reload() } }, "Reload")));
    return;
  }
  await loadTx(Store.get().lang);
  document.addEventListener("one:syncerror", () => toast("Progress saved on this device only. We'll retry."));
  if (!Store.get().name) {
    const r = await Auth.welcome();
    if (r === "place") location.hash = "#/quiz/place";
  }
  ui = frame(route);
  addEventListener("hashchange", route);
  document.addEventListener("one:rerender", route);
  route();
}
boot();
