/* Exams, redesigned as "Prove it": one exam to take next, a readiness ring, three doors per course, and a shelf of certificates. */
import { RULES } from "./config.js";
import { h, icon, plural } from "./dom.js";
import { D, course, level, TIERS } from "./data.js";
import * as Store from "./store.js";
import * as Creds from "./creds.js";
import { orderedCourses } from "./path.js";
import { widePage, notFound } from "./ui.js";
import { realmVars } from "./art.js";
import { resumeBar } from "./ux.js";
import { nismBanner } from "./nismbanner.js";
import { mascot } from "./mascot.js";
import * as K from "./unlock.js";

const KEY = { b: "x:", i: "x2:", h: "x3:" }, PREV = { i: "b", h: "i" }, TNAME = { b: "Beginner", i: "Intermediate", h: "Hard" };
const html = (cls, s, tag = "span") => { const e = h(tag, { class: cls }); e.innerHTML = s; return e; };
const core = () => D.courses.filter(c => !c.optional);
const passed = (cid, t) => !!Store.get().quiz[KEY[t] + cid]?.passed;
const best = (cid, t) => Store.get().quiz[KEY[t] + cid]?.best;
const isOpen = (cid, t) => t === "b" || passed(cid, PREV[t]);
const nextTier = cid => ["b", "i", "h"].find(t => !passed(cid, t));

/* How ready a learner is for a course's exams: lessons done, and unit quizzes passed. */
export function readiness(c) {
  const p = Store.courseProgress(c), q = p.modules.length ? p.modules.filter(m => m.quiz?.passed).length / p.modules.length : 1;
  return Math.round(60 * p.pct / 100 + 40 * q);
}
const mood = r => r >= 90 ? ["Ready", "Walk in like you own the room.", "joy"] : r >= 60 ? ["Almost there", "One more lesson or quiz and you are set.", "happy"] : ["Keep studying", "Finish the lessons and unit quizzes first. The exam will feel easy.", "think"];

const ring = (pct, big) => html("pv-ring" + (big ? " big" : ""), `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="none" stroke="#F3E7C2" stroke-width="12"/><circle class="pv-arc" cx="50" cy="50" r="42" fill="none" stroke="url(#pvg)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(2 * Math.PI * 42).toFixed(1)}" stroke-dashoffset="${(2 * Math.PI * 42 * (1 - pct / 100)).toFixed(1)}" transform="rotate(-90 50 50)"/><defs><linearGradient id="pvg" x1="0" x2="1"><stop offset="0" stop-color="#FFC531"/><stop offset="1" stop-color="#2F8F5B"/></linearGradient></defs></svg><b>${pct}%</b><small>ready</small>`);

/* Three doors for one course. */
function doors(c) {
  return h("div", { class: "pv-doors" }, TIERS().map(T => {
    const t = T.id, ok = passed(c.id, t), open = isOpen(c.id, t), b = best(c.id, t), now = open && !ok && nextTier(c.id) === t;
    const body = [html("pv-arch", ok ? icon("check", 34).outerHTML : open ? `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 3l2.5 5.5L20 9.3l-4 3.9 1 5.8-5-2.8-5 2.8 1-5.8-4-3.9 5.5-.8z"/></svg>` : `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="3"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>`),
      h("b", {}, TNAME[t]), h("small", {}, ok ? `Passed${b != null ? " · best " + b + "%" : ""}` : open ? `20 questions · ${RULES.tierPass[t]}% to pass` : `Pass ${TNAME[PREV[t]]} first`),
      open ? h("a", { class: "btn " + (now ? "primary" : "ghost") + " sm", href: `#/quiz/exam/${c.id}/${t}` }, ok ? "Retake" : "Open door") : h("span", { class: "pv-hint" }, "Locked"),
      open ? h("a", { class: "pv-syl", href: `#/syllabus/${c.id}/${t}` }, "Syllabus") : null];
    return h("div", { class: "pv-door t-" + t + (ok ? " ok" : open ? " open" : " locked") + (now ? " now" : "") }, body);
  }));
}

/* The exam to take next, and why. */
function nextExam() {
  for (const c of orderedCourses()) { const t = nextTier(c.id); if (t) return { c, t }; }
  return null;
}
function hero(n) {
  const certs = Creds.all().filter(x => x.kind === "course").length, total = core().length * 3;
  let done = 0; for (const c of core()) for (const t of ["b", "i", "h"]) if (passed(c.id, t)) done++;
  return h("section", { class: "pv-hero" }, html("pv-hm", mascot({ mood: "joy", pose: "cheer", view: "bust", px: 124 })),
    h("div", { class: "pv-ht" }, h("p", { class: "pv-k" }, "Exams"), h("h1", {}, "Prove it."), h("p", {}, "Pass an exam. Earn a certificate with your name on it."),
      h("div", { class: "pv-chips" }, h("span", {}, icon("award", 16), plural(certs, "certificate")), h("span", {}, icon("check", 16), `${done} of ${total} exams passed`))));
}
function bossCard(n, focused) {
  const { c, t } = n, r = readiness(c), [lab, say, md] = mood(r), p = Store.courseProgress(c);
  return h("section", { class: "pv-boss", style: realmVars(c.sec) }, ring(r, true),
    h("div", { class: "pv-bt" }, h("p", { class: "pv-k" }, focused ? "Your course" : "Your next exam"), h("h2", {}, c.title), h("p", { class: "pv-bs" }, `${TNAME[t]} exam · 20 questions · ${RULES.tierPass[t]}% to pass`),
      h("div", { class: "pv-say" }, html("pv-sm", mascot({ mood: md, pose: "explain", view: "bust", px: 52 })), h("p", {}, h("b", {}, lab + ". "), say)),
      h("div", { class: "pv-act" }, h("a", { class: "btn primary", href: `#/quiz/exam/${c.id}/${t}` }, "Start the exam"), !p.examReady ? h("a", { class: "btn ghost", href: `#/course/${c.id}` }, `Study first · ${p.pct}%`) : null)));
}
/* Certificates earned, and empty frames for the ones still to win. */
function shelf() {
  const have = Creds.all().filter(x => x.kind === "course").slice(0, 5), slots = Math.max(0, 4 - have.length);
  return h("section", { class: "stack stack-s" }, h("div", { class: "row-flex between" }, h("h2", { class: "h2" }, "Your certificates"), h("a", { class: "pv-all", href: "#/me" }, "See all")),
    h("div", { class: "pv-shelf" }, have.map(x => h("a", { class: "pv-frame got", href: `#/cert/${x.id}` }, icon("award", 26), h("b", {}, x.title || "Certificate"), h("small", {}, Creds.standing(x) === "valid" ? "Valid" : "Needs renewal"))),
      Array.from({ length: slots }, () => h("div", { class: "pv-frame empty", "aria-label": "Empty frame" }, h("span", {}, "?"), h("small", {}, "Pass a Beginner exam")))));
}
function pips(c) { return h("span", { class: "pv-pips", "aria-label": "Exams passed" }, ["b", "i", "h"].map(t => h("i", { class: passed(c.id, t) ? "on" : isOpen(c.id, t) ? "open" : "", title: TNAME[t] }))); }

export function assess(cid) {
  if (cid && !course(cid)) return notFound("That course does not exist.");
  const focus = cid ? course(cid) : null, n = focus ? { c: focus, t: nextTier(focus.id) || "h" } : nextExam();
  const list = core();
  return widePage(hero(n), resumeBar(),
    n ? bossCard(n, !!focus) : h("section", { class: "pv-boss done" }, h("h2", {}, "Every exam passed"), h("p", {}, "You have cleared every exam. Retake any to beat your best.")),
    n ? h("section", { class: "stack stack-s" }, h("h2", { class: "h2" }, "Three doors"), h("p", { class: "small mute" }, "Open them in order. Each one is a little harder."), doors(n.c)) : null,
    shelf(), K.keyCard(), nismBanner(),
    h("section", { class: "stack stack-s" }, h("h2", { class: "h2" }, "All courses"),
      D.sections.map(r => { const cs = list.filter(c => c.sec === r.id);
        return cs.length ? h("details", { class: "exsec" }, h("summary", { class: "exsec-s" }, h("span", { class: "exsec-t" }, h("b", {}, r.name), h("small", {}, r.blurb)), h("span", { class: "acc-n" }, String(cs.length)), h("span", { class: "acc-chev" }, icon("chev", 18))),
          h("div", { class: "pv-rows" }, cs.map(c => h("a", { class: "pv-row", href: `#/assess/${c.id}`, style: realmVars(c.sec) }, h("span", { class: "pv-rt" }, h("b", {}, c.title), h("small", {}, `${level(c.level).name} · ${readiness(c)}% ready`)), pips(c), icon("chev", 18))))) : null; })));
}
