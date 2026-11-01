/* The Academy's own structure: Doors (who you are), Realms (what you need), Seals (what you own), Today, the Assessment Centre. */
import { RULES } from "./config.js";
import { h, icon, plural, toast } from "./dom.js";
import { D, course, level, TIERS } from "./data.js";
import * as Store from "./store.js";
import * as Creds from "./creds.js";
import { nextUp, hrefFor, labelFor } from "./path.js";
import { page, widePage, bar, notFound } from "./ui.js";

export const DOORS = [
  { id: "student", name: "Student", who: "School to early career", hook: "First salary, first SIP", realms: ["keep", "earn", "grow"] },
  { id: "homemaker", name: "Homemaker", who: "Runs the household money", hook: "Make the household a team", realms: ["keep", "protect", "grow"] },
  { id: "teacher", name: "Teacher", who: "Educators and trainers", hook: "Teach money in your classroom", realms: ["keep", "grow", "pass"] },
  { id: "salaried", name: "Salaried", who: "Early to mid career", hook: "Payslip to portfolio", realms: ["earn", "protect", "grow"] },
  { id: "business", name: "Business owner", who: "Shop, practice or startup", hook: "Separate you from the business", realms: ["earn", "borrow", "protect"] },
  { id: "retiree", name: "Retiree", who: "55 and above", hook: "Make savings last", realms: ["protect", "pass", "keep"] },
  { id: "partner", name: "Partner", who: "Community leader or adviser", hook: "Host a Gurukul session", realms: ["grow", "pass", "keep"] },
  { id: "global", name: "Global", who: "NRI and overseas Indians", hook: "Money across borders", realms: ["pass", "grow", "keep"] }
];
export const doorOf = id => DOORS.find(d => d.id === id) || null;
export const realms = () => D.sections.filter(s => s.id !== "idx");
const realmName = id => D.sections.find(s => s.id === id)?.name || "";
const core = () => D.courses.filter(c => !c.optional && c.sec !== "idx");

/* Rank titles on the Roll, named the way a firm names its people. */
export const RANKS = [[0, "Observer"], [100, "Analyst"], [400, "Associate"], [1000, "Principal"], [2500, "Director"], [6000, "Partner"]];
export function rankOf(xp) {
  let i = 0; RANKS.forEach(([t], k) => { if (xp >= t) i = k; });
  const next = RANKS[i + 1];
  return { title: RANKS[i][1], next: next ? next[1] : null, need: next ? next[0] - xp : 0 };
}

export function pathCourses(doorId) {
  const door = doorOf(doorId), seen = new Set(), out = [];
  const lv = c => D.levels.findIndex(l => l.id === c.level);
  for (const r of door ? door.realms : realms().map(x => x.id))
    for (const c of core().filter(c => c.sec === r).sort((a, b) => lv(a) - lv(b))) if (!seen.has(c.id)) { seen.add(c.id); out.push(c); }
  for (const c of core()) if (!seen.has(c.id)) { seen.add(c.id); out.push(c); }
  return out;
}

/* ——— choosing a Door ——— */
export function doorPicker(current, onPick) {
  return h("div", { class: "doors" }, DOORS.map(d => h("button", { type: "button", class: "door", "aria-pressed": String(current === d.id), on: { click: ev => {
    ev.currentTarget.parentElement.querySelectorAll(".door").forEach(b => b.setAttribute("aria-pressed", "false")); ev.currentTarget.setAttribute("aria-pressed", "true"); onPick(d.id); } } },
    h("b", {}, d.name), h("span", { class: "small mute" }, d.who), h("span", { class: "tiny door-hook" }, d.hook))));
}

/* ——— Today ——— */
export function today() {
  const s = Store.get(), door = doorOf(s.door), hr = new Date().getHours();
  const first = (s.name || "").split(" ")[0];
  const path = pathCourses(s.door), pick = path.find(c => !s.quiz["x:" + c.id]?.passed) || path[0];
  const step = nextUp(pick?.id), c = step?.course || pick, p = Store.courseProgress(c), a = Store.todayAct(), due = Store.dueIds().length;
  const seals = sealTotals(), xp = Store.xp(), rk = rankOf(xp);
  const stepLine = !step ? "You have finished everything. Retake an exam to improve your score." : step.kind === "lesson" ? "Lesson · about 8 minutes" : step.kind === "module" ? "Unit check · 10 questions" : "You are ready for the exam";

  const hero = h("section", { class: "td-hero stack" },
    h("div", { class: "eyebrow gold" }, "Your next step"),
    h("h2", { class: "td-title" }, step?.kind === "lesson" ? "Lesson " + (step.course.lessons.indexOf(step.n) + 1) + ": " + (D.lessons[step.n]?.title || "") : step ? labelFor(step) : "All caught up"),
    h("p", { class: "td-sub" }, c ? `${c.title} · ${realmName(c.sec)}` : ""), h("p", { class: "td-sub dim" }, stepLine),
    h("div", { class: "row-flex" }, h("a", { class: "btn gold", href: step ? hrefFor(step) : "#/courses" }, step ? (step.kind === "lesson" && s.part[step.n] > 0 ? "Continue" : "Start") : "Browse the Map"),
      p.done ? h("span", { class: "td-sub dim" }, `${p.pct}% of this course`) : null));

  const goals = [
    due ? { t: `Review ${plural(due, "question")}`, sub: "Spaced revision", href: "#/quiz/revise", done: a.r } : null,
    { t: "Daily five", sub: "Five questions, two minutes", href: "#/quiz/daily", done: a.d }
  ].filter(Boolean);

  return widePage(
    h("div", { class: "stack stack-s" },
      h("h1", { class: "h1" }, `${hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening"}${first ? ", " + first : ""}`),
      h("p", { class: "mute" }, door ? h("span", {}, `Your door: ${door.name}. `, h("a", { class: "linkish", href: "#/me" }, "Change")) : "Choose your door in Ledger to personalise this page.")),
    h("div", { class: "cols" },
      h("div", { class: "stack stack-l" }, hero,
        h("section", { class: "stack" }, h("h2", { class: "h2" }, "Your path"),
          h("div", { class: "divide" }, path.slice(0, 6).map(x => { const q = Store.courseProgress(x), done = !!s.quiz["x:" + x.id]?.passed;
            return h("a", { class: "list-row", href: `#/course/${x.id}` }, h("div", { class: "grow stack stack-xs" }, h("div", { class: "list-title" }, x.title), h("div", { class: "tiny mute" }, realmName(x.sec) + " · " + level(x.level).name), bar(q.pct, done)), h("span", { class: "small mute" }, done ? "Aware" : q.pct + "%")); })),
          h("a", { class: "linkish", href: "#/courses" }, "See the whole Map"))),
      h("div", { class: "rail" },
        h("section", { class: "card stack" }, h("h3", { class: "h3" }, "Today"),
          h("div", { class: "divide" }, goals.map(g => h("a", { class: "list-row", href: g.href }, h("span", { class: "check " + (g.done ? "on" : "") }, g.done ? icon("check") : null), h("div", { class: "grow" }, h("div", { class: "list-title" }, g.t), h("div", { class: "tiny mute" }, g.sub)))))),
        h("section", { class: "card stack stack-s" }, h("h3", { class: "h3" }, "Your Ledger"),
          h("div", { class: "seal-row" }, [["Aware", seals.b], ["Capable", seals.i], ["Certified", seals.h]].map(([t, n]) => h("div", { class: "seal-mini" }, h("b", {}, n), h("span", { class: "tiny mute" }, t)))),
          h("a", { class: "linkish", href: "#/me" }, "Open Ledger")),
        h("section", { class: "card stack stack-s" }, h("h3", { class: "h3" }, "The Roll"),
          h("p", { class: "small" }, h("b", {}, rk.title), ` · ${xp} points`, rk.next ? ` · ${rk.need} to ${rk.next}` : ""),
          h("a", { class: "linkish", href: "#/board" }, "See the standings")))));
}

/* ——— Seals ——— */
const KEY = { b: "x:", i: "x2:", h: "x3:" };
const passed = (cid, t) => !!Store.get().quiz[KEY[t] + cid]?.passed;
export function sealTotals() { const t = { b: 0, i: 0, h: 0 }; for (const c of core()) for (const k of ["b", "i", "h"]) if (passed(c.id, k)) t[k]++; return t; }
export const sealCount = () => { const t = sealTotals(); return t.b + t.i + t.h; };

export function ledger() {
  const SEALS = [["b", "Aware", "Beginner exam"], ["i", "Capable", "Intermediate exam"], ["h", "Certified", "Hard exam"]];
  return h("section", { class: "stack" },
    h("div", { class: "stack stack-xs" }, h("h2", { class: "h2" }, "Your Ledger"), h("p", { class: "small mute" }, "Six realms of money, three seals each. A seal is earned by passing that exam in the Assessment Centre.")),
    h("div", { class: "ledger", role: "table", "aria-label": "Ledger" },
      h("div", { class: "lg-row head", role: "row" }, h("span", {}, "Realm"), SEALS.map(([, n, e]) => h("span", { title: e }, n))),
      realms().map(r => { const cs = core().filter(c => c.sec === r.id);
        return h("div", { class: "lg-row", role: "row" }, h("span", { class: "lg-realm" }, h("b", {}, r.name), h("small", { class: "tiny mute" }, r.blurb)),
          cs.length ? SEALS.map(([k]) => { const n = cs.filter(c => passed(c.id, k)).length, full = n === cs.length;
            return h("span", { class: "lg-cell" + (full ? " full" : n ? " part" : ""), "aria-label": `${n} of ${cs.length}` }, full ? icon("check", 18) : n + "/" + cs.length); })
            : h("span", { class: "lg-soon" }, "Opening soon")); })));
}

export function settingsCard() {
  const s = Store.get();
  const show = h("input", { type: "checkbox", id: "showroll", checked: s.show !== 0, on: { change: ev => { Store.setShow(ev.target.checked); toast(ev.target.checked ? "You are on the Roll" : "You are hidden from the Roll"); } } });
  return h("section", { class: "stack" }, h("h2", { class: "h2" }, "Your door"),
    h("p", { class: "small mute" }, "Your door sets your starting path and the examples you see. You can change it any time."),
    doorPicker(s.door, id => { Store.setDoor(id); toast("Door updated"); }),
    h("label", { class: "row-flex small", for: "showroll", style: "gap:10px;margin-top:6px" }, show, "Show my first name and last initial on The Roll"));
}

/* ——— Assessment Centre: the only place a scored exam starts ——— */
export function assess(cid) {
  const s = Store.get(), list = core();
  if (cid && !course(cid)) return notFound("That course does not exist.");
  const tierCell = (c, T, p) => {
    const r = p.exams[T.id], open = T.id === "b" ? p.examReady : !!p.exams[T.id === "i" ? "b" : "i"]?.passed;
    return h("div", { class: "as-tier" + (r?.passed ? " ok" : "") + (open ? "" : " locked") },
      h("div", { class: "row-flex between" }, h("b", {}, T.name), r?.passed ? h("span", { class: "pill ok" }, "Passed") : !open ? icon("lock", 16) : null),
      h("div", { class: "tiny mute" }, `20 questions · ${RULES.tierPass[T.id]}% to pass${r ? ` · best ${r.best}%` : ""}`),
      h("div", { class: "row-flex", style: "gap:8px" },
        open ? h("a", { class: "btn primary sm", href: `#/quiz/exam/${c.id}/${T.id}` }, r?.passed ? "Retake" : "Start") : h("span", { class: "tiny mute" }, T.id === "b" ? "Pass every unit quiz first" : `Pass the ${T.id === "i" ? "Beginner" : "Intermediate"} exam first`),
        h("a", { class: "btn ghost sm", href: `#/syllabus/${c.id}/${T.id}` }, "Syllabus")));
  };
  const card = c => { const p = Store.courseProgress(c);
    return h("article", { class: "card stack as-card", id: "as-" + c.id },
      h("div", { class: "row-flex between" }, h("div", {}, h("div", { class: "tiny mute" }, realmName(c.sec) + " · " + level(c.level).name), h("h3", { class: "h3" }, c.title)),
        p.examReady ? null : h("a", { class: "btn ghost sm", href: `#/course/${c.id}` }, `Finish the course · ${p.pct}%`)),
      h("div", { class: "as-tiers" }, TIERS().map(T => tierCell(c, T, p)))); };
  const focus = cid ? course(cid) : null;
  return widePage(
    h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Assessment Centre"), h("p", { class: "lead mute" }, "Every scored exam starts here, and nowhere else. Read the syllabus, check you are ready, then sit the exam. Each pass adds a seal to your Ledger.")),
    focus ? h("section", { class: "stack" }, h("h2", { class: "h2" }, "Selected course"), card(focus)) : null,
    realms().map(r => { const cs = list.filter(c => c.sec === r.id && c.id !== cid);
      return cs.length ? h("section", { class: "stack" }, h("div", { class: "sec-h" }, h("h2", { class: "h2" }, r.name), h("p", { class: "small mute" }, r.blurb)), h("div", { class: "stack" }, cs.map(card))) : null; }));
}
