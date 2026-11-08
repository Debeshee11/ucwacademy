/* UpperCrust Academy: boot and routes. */
import { contactPage } from "./contact.js";
import { startTour, tourSeen } from "./tour.js";
import "./monitor.js";
import * as I18n from "./i18n.js";
import { reportError } from "./monitor.js";
import { legalPage, consentGate } from "./legal.js";
import { h, toast, clear } from "./dom.js";
import { loadData, loadTx } from "./data.js";
import * as Store from "./store.js";
import * as Auth from "./auth.js";
import { needsVerify } from "./mobileverify.js";
import { frame, isAdmin, notFound } from "./ui.js";
import { renderLesson } from "./lesson.js";
import * as Q from "./quizzes.js";
import * as Home from "./home.js";
import * as Ac from "./academy.js";
import * as Syl from "./syllabus.js";
import * as P from "./practice.js";
import * as C from "./credview.js";
import { board } from "./board.js";
import { fundData } from "./funddata.js";
import { loadLive } from "./holdings.js";
import * as Lib from "./library.js";
import { team } from "./team.js";
import { errorCard } from "./ux.js";
import { admin } from "./admin.js";
import * as Nism from "./nism.js";

const root = document.getElementById("app");
const splash = () => h("div", { class: "splash", role: "status", "aria-label": "Loading" }, h("img", { src: "assets/mark.svg", alt: "UpperCrust Academy" }), h("div", { class: "splash-line" }, h("i")), h("p", { class: "splash-t" }, "Preparing your academy"));
const skip = h("button", { style: "position:absolute;left:-999px;top:8px;background:#fff;border:1px solid #DDD9D0;padding:8px 14px;border-radius:8px;z-index:99", on: { focus: e => (e.target.style.left = "8px"), blur: e => (e.target.style.left = "-999px"), click: () => document.getElementById("main")?.focus() } }, "Skip to content");
document.body.prepend(skip);

/* route table: [pattern, view, nav id, title, focus?] */
const ROUTES = [
  [/^$/, () => Ac.today(), "home", "Home"],
  [/^assess(?:\/([\w-]+))?$/, id => Ac.assess(id), "assess", "Exams"],
  [/^courses$/, () => Ac.courses(), "courses", "Courses"],
  [/^course\/([\w-]+)$/, id => Home.coursePage(id), "courses", "Course"],
  [/^funddata$/, () => (isAdmin() ? fundData() : notFound("Only the administrator can open this.")), "", "Fund data"],
  [/^board$/, () => board(), "me", "Leaderboard"],
  [/^funds$/, () => Lib.funds(), "desk", "Funds"],
  [/^fund\/([\w-]+)$/, id => Lib.fund(id), "desk", "Fund"],
  [/^indices$/, () => Lib.indices(), "desk", "Indices"],
  [/^index\/([\w-]+)$/, id => Lib.index(id), "desk", "Index"],
  [/^practice$/, () => P.practice(), "practice", "Practice"],
  [/^news$/, () => P.desk(), "desk", "News & Markets"],
  [/^desk$/, () => P.desk(), "desk", "News & Markets"],
  [/^lab$/, () => P.lab(), "practice", "Client lab"],
  [/^lab\/([\w-]+)$/, id => P.labScenario(id), "practice", "Client lab"],
  [/^nism$/, () => Nism.hub(), "assess", "NISM prep"],
  [/^nism\/([\w-]+)$/, id => Nism.examPage(id), "assess", "NISM exam"],
  [/^me$/, () => C.me(), "me", "Progress"],
  [/^privacy$/, () => legalPage("privacy"), "", "Privacy notice"],
  [/^terms$/, () => legalPage("terms"), "", "Terms of use"],
  [/^contact$/, () => contactPage(), "", "Contact us"],
  [/^cert\/([\w-]+)$/, id => C.cert(id), "me", "Certificate"],
  [/^admin$/, () => (isAdmin() ? admin() : notFound("Only the administrator can open this.")), "", "Admin"],
  [/^team$/, () => (isAdmin() ? team() : notFound("Only the administrator can open this.")), "", "Team"],
  /* full-screen routes draw into the root themselves */
  [/^lesson\/(\d+)$/, n => renderLesson(root, +n), "", "Lesson", true],
  [/^quiz\/module\/([\w-]+)\/(\d+)$/, (c, i) => Q.moduleQuiz(root, c, +i), "", "Quiz", true],
  [/^quiz\/exam\/([\w-]+)(?:\/([bih]))?$/, (c, t) => Q.exam(root, c, t || "b"), "", "Exam", true],
  [/^syllabus\/([\w-]+)\/([bih])$/, (c, t) => Syl.syllabus(c, t), "courses", "Syllabus"],
  [/^nism\/([\w-]+)\/mock\/(\d)$/, (id, n) => Nism.mock(root, id, +n, /review=1/.test(location.hash)), "", "NISM mock", true],
  [/^quiz\/refresh\/([\w-]+)$/, c => Q.refresher(root, c), "", "Refresher", true],
  [/^quiz\/daily$/, () => Q.daily(root), "", "Daily five", true],
  [/^quiz\/revise$/, () => Q.revise(root), "", "Revise", true],
  [/^quiz\/fund(?:\/(ma|def))?$/, g => Q.fundQuiz(root, g), "", "Fund quiz", true],
  [/^quiz\/holdings(?:\/([\w-]+))?$/, f => Q.holdingsQuiz(root, f), "", "Holdings quiz", true],
  [/^quiz\/market$/, () => Q.marketQuiz(root), "", "Market quiz", true],
  [/^quiz\/index\/([\w-]+)$/, i => Q.indexQuiz(root, i), "", "Index quiz", true],
  [/^quiz\/place$/, () => Q.placement(root), "", "Placement test", true]
];

let ui = null;
function route() {
  const path = location.hash.replace(/^#\/?/, "").split("?")[0].replace(/\/$/, "");
  for (const [re, view, nav, title, focus] of ROUTES) {
    const m = path.match(re);
    if (!m) continue;
    document.title = `${title} · UpperCrust Academy`;
    ui.show(!focus); ui.active(nav);
    try {
      const out = view(...m.slice(1));
      if (!focus) { clear(root); if (out) root.append(out); }
    } catch (e) {
      console.error(e); reportError(e);
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
    document.title = "Verify · UpperCrust Academy";
    root.replaceChildren(C.verify(pub[1]));
    addEventListener("hashchange", () => location.reload());
    return;
  }
  if (/^#\/contact$/.test(location.hash)) {
    document.title = "Contact us · UpperCrust Academy";
    root.replaceChildren(contactPage());
    addEventListener("hashchange", () => location.reload());
    return;
  }
  const legal = location.hash.match(/^#\/(privacy|terms)$/);
  if (legal) {
    document.title = (legal[1] === "terms" ? "Terms of use" : "Privacy notice") + " · UpperCrust Academy";
    root.replaceChildren(legalPage(legal[1]));
    addEventListener("hashchange", () => location.reload());
    return;
  }
  const user = await Auth.start();
  root.replaceChildren(splash());
  try {
    await Promise.all([loadData(), Store.init(user)]);
    await loadLive();
  } catch (e) {
    console.error(e); reportError(e);
    root.replaceChildren(h("main", { class: "wrap page stack" }, errorCard(() => location.reload())));
    return;
  }
  /* One language everywhere: this browser's choice wins; a choice made on another device is picked up once. */
  const sl = Store.get().lang || "en";
  if (I18n.hasPref()) { if (sl !== I18n.getLang()) Store.setLang(I18n.getLang()); }
  else if (sl !== "en" && I18n.remember(sl)) { location.reload(); return; }
  await loadTx(Store.get().lang);
  document.addEventListener("one:syncerror", () => toast("Progress saved on this device only. We'll retry."));
  const np = Auth.takeProfile(); if (np) Store.setProfile(np);
  if (!Store.hasConsent()) await consentGate();
  if (!Store.get().onb && !Object.keys(Store.get().done).length) {
    const r = await Auth.welcome();
    Store.setOnboarded();
    if (r === "place") location.hash = "#/quiz/place";
  } else if (!Store.get().door || !Store.get().mobile || !Store.get().name || needsVerify()) { await Auth.welcome(); }
  ui = frame(route);
  document.addEventListener("one:tour", () => startTour(Store.uidNow()));
  addEventListener("hashchange", route);
  document.addEventListener("one:rerender", route);
  route();
  if (!tourSeen(Store.uidNow()) && !/^#\/(lesson|quiz|syllabus|nism\/[\w-]+\/mock)/.test(location.hash)) setTimeout(() => startTour(Store.uidNow()), 600);
}
boot();
