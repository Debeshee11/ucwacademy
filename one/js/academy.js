/* The Academy's own structure: Doors (who you are), Realms (what you need), Seals (what you own), Today, the Assessment Centre. */
import { RULES, CONTACT_EMAIL } from "./config.js";
import { h, icon, plural, toast, isoDay, dayMs } from "./dom.js";
import { D, course, level, TIERS } from "./data.js";
import * as Store from "./store.js";
import * as Creds from "./creds.js";
import { nextUp, hrefFor, labelFor } from "./path.js";
import { page, widePage, bar, notFound } from "./ui.js";
import { cover, realmVars } from "./art.js";
import { trail } from "./trail.js";
import { newsFeed, newsPreview } from "./news.js";
import { signOut } from "./auth.js";

export const DOORS = [
  { id: "student", name: "Student", who: "School to early career", hook: "First salary, first SIP", realms: ["basics", "mf"] },
  { id: "homemaker", name: "Homemaker", who: "Runs the household money", hook: "Make the household a team", realms: ["basics", "mf"] },
  { id: "teacher", name: "Teacher", who: "Educators and trainers", hook: "Teach money in your classroom", realms: ["basics", "mf", "teach"] },
  { id: "salaried", name: "Working professional", who: "Early to mid career", hook: "Payslip to portfolio", realms: ["basics", "mf", "stocks"] },
  { id: "business", name: "Business owner", who: "Shop, practice or startup", hook: "Separate you from the business", realms: ["basics", "assets", "mf"] },
  { id: "retiree", name: "Retiree", who: "55 and above", hook: "Make savings last", realms: ["basics", "assets", "mf"] },
  { id: "partner", name: "Partner", who: "Community leader or adviser", hook: "Host a Gurukul session", realms: ["mf", "stocks", "assets", "teach"] },
  { id: "team", name: "UpperCrust team", who: "Employees and advisers", hook: "Learn alongside the firm", realms: ["mf", "stocks", "assets", "basics"], staff: true },
  { id: "global", name: "Global", who: "NRI and overseas Indians", hook: "Money across borders", realms: ["nri", "mf", "basics"] }
];
export const doorOf = id => DOORS.find(d => d.id === id) || null;
export const realms = () => D.sections;
const realmName = id => D.sections.find(s => s.id === id)?.name || "";
const core = () => D.courses.filter(c => !c.optional);

/* Rank titles on the Roll, named the way a firm names its people. */
export const RANKS = [[0, "Observer"], [100, "Analyst"], [400, "Associate"], [1000, "Principal"], [2500, "Director"], [6000, "Partner"]];
export function rankOf(xp) {
  let i = 0; RANKS.forEach(([t], k) => { if (xp >= t) i = k; });
  const next = RANKS[i + 1];
  return { title: RANKS[i][1], next: next ? next[1] : null, need: next ? next[0] - xp : 0, pct: next ? Math.round(100 * (xp - RANKS[i][0]) / (next[0] - RANKS[i][0])) : 100 };
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
  return h("div", { class: "doors" }, DOORS.filter(d => !d.staff || Store.isStaff()).map(d => h("button", { type: "button", class: "door", "aria-pressed": String(current === d.id), on: { click: ev => {
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

  const lessonTitle = step?.kind === "lesson" ? D.lessons[step.n]?.title || "" : "";
  const hero = h("section", { class: "play-hero", style: c ? realmVars(c.sec) : "" },
    h("div", { class: "ph-copy" },
      h("p", { class: "ph-kicker" }, step ? (step.kind === "lesson" && s.part[step.n] > 0 ? "Pick up where you stopped" : "Your next step") : "All caught up"),
      h("h2", { class: "ph-title" }, step?.kind === "lesson" ? lessonTitle : step ? labelFor(step) : "You have finished everything"),
      h("p", { class: "ph-sub" }, c ? `${c.title} · ${realmName(c.sec)}` : ""),
      h("p", { class: "ph-sub dim" }, stepLine),
      h("div", { class: "row-flex ph-act" }, h("a", { class: "btn gold big", href: step ? hrefFor(step) : "#/courses" }, step ? (step.kind === "lesson" && s.part[step.n] > 0 ? "Continue" : "Start") : "Browse courses"),
        p.done ? h("span", { class: "ph-pct" }, `${p.pct}% of this course`) : null)),
    c ? h("div", { class: "ph-trail" }, trail(c, 5)) : null);

  /* the last seven days, oldest first: filled when the learner did anything that day */
  const week = (() => { const out = []; for (let k = 6; k >= 0; k--) { const d = isoDay(new Date(Date.now() - k * dayMs)), e = s.act[d]; out.push(h("span", { class: "wk" + (e && (e.l || e.r || e.d) ? " on" : "") + (k === 0 ? " today" : ""), title: d }, new Date(Date.now() - k * dayMs).toLocaleDateString("en", { weekday: "narrow" }))); } return h("div", { class: "week", "aria-label": "Your last seven days" }, out); })();

  const goals = [
    due ? { t: `Review ${plural(due, "question")}`, sub: "Spaced revision", href: "#/quiz/revise", done: a.r } : null,
    { t: "Daily five", sub: "Five questions, two minutes", href: "#/quiz/daily", done: a.d }
  ].filter(Boolean);

  const guide = h("section", { class: "card tint stack stack-s" }, h("h3", { class: "h3" }, "How UpperCrust Academy works"),
    h("ol", { class: "facts" },
      h("li", {}, h("b", {}, "Learn"), " – short lessons in a fixed order. Start with the next step above."),
      h("li", {}, h("b", {}, "Practice"), " – a daily five and revision keep what you learned."),
      h("li", {}, h("b", {}, "Exams"), " – pass Beginner, Intermediate, Hard to earn seals. NISM prep is here too."),
      h("li", {}, h("b", {}, "News & Markets"), " – daily headlines and what to tell clients."),
      h("li", {}, h("b", {}, "Progress"), " – streak, certificates, leaderboard.")),
    h("a", { class: "linkish", href: "#/courses" }, "See all courses"));
  const news = h("section", { class: "card stack stack-s" }, h("h3", { class: "h3" }, "In the news today"), newsPreview(3), h("a", { class: "linkish", href: "#/news" }, "All news & markets"));

  return widePage(
    h("div", { class: "stack stack-s" },
      h("h1", { class: "h1" }, `${hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening"}${first ? ", " + first : ""}`),
      h("p", { class: "mute" }, door ? h("span", {}, `Learning as: ${door.name}. `, h("a", { class: "linkish", href: "#/me" }, "Change")) : "Tell us who you are in Progress to personalise this page.")),
    h("div", { class: "cols" },
      h("div", { class: "stack stack-l" }, hero, p.done ? null : guide,
        h("section", { class: "stack" }, h("h2", { class: "h2" }, "Recommended for you"),
          h("div", { class: "divide" }, path.slice(0, 6).map(x => { const q = Store.courseProgress(x), done = !!s.quiz["x:" + x.id]?.passed;
            return h("a", { class: "list-row", href: `#/course/${x.id}` }, h("div", { class: "grow stack stack-xs" }, h("div", { class: "list-title" }, x.title), h("div", { class: "tiny mute" }, realmName(x.sec) + " · " + level(x.level).name), bar(q.pct, done)), h("span", { class: "small mute" }, done ? "Passed" : q.pct + "%")); })),
          h("a", { class: "linkish", href: "#/courses" }, "Browse all courses"))),
      h("div", { class: "rail" }, news,
        h("section", { class: "card stack" }, h("h3", { class: "h3" }, "Today's goals"), week,
          h("div", { class: "divide" }, goals.map(g => h("a", { class: "list-row", href: g.href }, h("span", { class: "check " + (g.done ? "on" : "") }, g.done ? icon("check") : null), h("div", { class: "grow" }, h("div", { class: "list-title" }, g.t), h("div", { class: "tiny mute" }, g.sub)))))),
        h("section", { class: "card stack stack-s" }, h("h3", { class: "h3" }, "Progress"),
          h("div", { class: "seal-row" }, [["Beginner", seals.b], ["Intermediate", seals.i], ["Hard", seals.h]].map(([t, n]) => h("div", { class: "seal-mini" }, h("b", {}, n), h("span", { class: "tiny mute" }, t + " exams")))),
          h("a", { class: "linkish", href: "#/me" }, "Open Progress")),
        h("section", { class: "card stack stack-s" }, h("h3", { class: "h3" }, "Leaderboard"),
          h("p", { class: "small" }, h("b", {}, rk.title), ` · ${xp} points`, rk.next ? ` · ${rk.need} to ${rk.next}` : ""),
          h("a", { class: "linkish", href: "#/board" }, "See the leaderboard")))));
}

/* ——— Seals ——— */
const KEY = { b: "x:", i: "x2:", h: "x3:" };
const passed = (cid, t) => !!Store.get().quiz[KEY[t] + cid]?.passed;
export function sealTotals() { const t = { b: 0, i: 0, h: 0 }; for (const c of core()) for (const k of ["b", "i", "h"]) if (passed(c.id, k)) t[k]++; return t; }
export const sealCount = () => { const t = sealTotals(); return t.b + t.i + t.h; };

export function ledger() {
  const SEALS = [["b", "Beginner", "Beginner exam"], ["i", "Intermediate", "Intermediate exam"], ["h", "Hard", "Hard exam"]];
  return h("section", { class: "stack" },
    h("div", { class: "stack stack-xs" }, h("h2", { class: "h2" }, "Exams passed, by subject"), h("p", { class: "small mute" }, "Each course has three exams. Pass one in the Exams section and its box fills here.")),
    h("div", { class: "ledger", role: "table", "aria-label": "Ledger" },
      h("div", { class: "lg-row head", role: "row" }, h("span", {}, "Subject"), SEALS.map(([, n, e]) => h("span", { title: e }, n))),
      realms().map(r => { const cs = core().filter(c => c.sec === r.id);
        return h("div", { class: "lg-row", role: "row" }, h("span", { class: "lg-realm" }, h("b", {}, r.name), h("small", { class: "tiny mute" }, r.blurb)),
          cs.length ? SEALS.map(([k]) => { const n = cs.filter(c => passed(c.id, k)).length, full = n === cs.length;
            return h("span", { class: "lg-cell" + (full ? " full" : n ? " part" : ""), "aria-label": `${n} of ${cs.length}` }, full ? icon("check", 18) : n + "/" + cs.length); })
            : h("span", { class: "lg-soon" }, "Courses opening soon")); })));
}

export function settingsCard() {
  const s = Store.get();
  const show = h("input", { type: "checkbox", id: "showroll", checked: s.show !== 0, on: { change: ev => { Store.setShow(ev.target.checked); toast(ev.target.checked ? "You are on the leaderboard" : "You are hidden from the leaderboard"); } } });
  return h("section", { class: "stack" }, h("h2", { class: "h2" }, "Who are you?"),
    h("p", { class: "small mute" }, "This sets the courses we recommend first and the examples you see. You can change it any time."),
    doorPicker(s.door, id => { Store.setDoor(id); toast("Saved"); }),
    h("label", { class: "row-flex small", for: "showroll", style: "gap:10px;margin-top:6px" }, show, "Show my first name and last initial on the leaderboard"),
    accountCard());
}

/* Delete everything the Academy holds about this learner. */
function accountCard() {
  const msg = h("p", { class: "small", role: "status" });
  const btn = h("button", { class: "btn ghost", on: { click: async () => {
    if (!confirm("Delete your account? This removes your progress, leaderboard entry and certificates for good. It cannot be undone.")) return;
    if (!confirm("Last check: delete everything now?")) return;
    btn.disabled = true; msg.textContent = "Deleting…";
    try { await Store.deleteAccount(); await signOut(); }
    catch (e) { btn.disabled = false; msg.textContent = /offline|unavailable|network/.test(e?.code || e?.message || "") ? "No connection. Try again online." : "Could not delete just now. Write to " + CONTACT_EMAIL + "."; }
  } } }, "Delete my account and data");
  const exp = h("button", { class: "btn ghost", on: { click: async () => {
    exp.disabled = true; msg.textContent = "Preparing your file…";
    try { const d = await Store.exportData(), a = h("a", { href: URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: "application/json" })), download: "my-uppercrust-academy-data.json" }); document.body.append(a); a.click(); a.remove(); msg.textContent = "Downloaded."; }
    catch { msg.textContent = "Could not export just now. Write to " + CONTACT_EMAIL + "."; }
    exp.disabled = false;
  } } }, "Download my data");
  return h("div", { class: "card stack stack-s", style: "margin-top:18px" }, h("h3", { class: "h3" }, "Your data"),
    h("p", { class: "small mute" }, "Download everything we hold about you, or delete it all. See the ", h("a", { href: "#/privacy" }, "Privacy notice"), "."), h("div", { class: "row-flex", style: "gap:10px;flex-wrap:wrap" }, exp, btn), msg);
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
    h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Exams"), h("p", { class: "lead mute" }, "Every scored exam starts here, and nowhere else. Read the syllabus, check you are ready, then take the exam. Each course has a Beginner, Intermediate and Hard exam.")),
    focus ? h("section", { class: "stack" }, h("h2", { class: "h2" }, "Your course"), card(focus)) : null,
    realms().map(r => { const cs = list.filter(c => c.sec === r.id && c.id !== cid);
      return cs.length ? h("section", { class: "stack" }, h("div", { class: "sec-h" }, h("h2", { class: "h2" }, r.name), h("p", { class: "small mute" }, r.blurb)), h("div", { class: "stack" }, cs.map(card))) : null; }));
}

/* ——— Courses: subject accordion, then track, then course rows ——— */
const levelTxt = c => level(c.level).name;
const subjStyle = realmVars;
export function courseCard(c) {
  const p = Store.courseProgress(c), cred = Creds.find("course", c.id);
  return h("a", { class: "ccard", href: `#/course/${c.id}`, style: subjStyle(c.sec) }, cover(c),
    h("div", { class: "ccard-b" },
      h("div", { class: "ccard-meta" }, h("span", { class: "lv-dot " + c.level }), levelTxt(c)),
      h("h3", { class: "ccard-t" }, c.title),
      h("p", { class: "tiny mute" }, `${c.lessons.length} lessons · 3 exams`),
      h("div", { class: "ccard-f" }, cred ? h("span", { class: "pill ok" }, "Certified") : p.done ? h("div", { class: "stack stack-xs" }, bar(p.pct), h("span", { class: "tiny mute" }, `${p.pct}% done`)) : h("span", { class: "ccard-go" }, "Start course"))));
}
const courseRow = c => {
  const p = Store.courseProgress(c), cred = Creds.find("course", c.id);
  return h("a", { class: "crow", href: `#/course/${c.id}`, style: subjStyle(c.sec) },
    h("span", { class: "crow-tag" }, String(c.tag || c.topic).split(/[^A-Za-z0-9/]+/)[0].slice(0, 5)),
    h("span", { class: "crow-b" }, h("b", { class: "crow-t" }, c.title), h("span", { class: "crow-m" }, h("span", { class: "lv-dot " + c.level }), `${levelTxt(c)} · ${c.lessons.length} lessons`)),
    cred ? h("span", { class: "pill ok" }, "Certified") : p.done ? h("span", { class: "crow-pct" }, p.pct + "%") : icon("chev", 18));
};
const soonRow = (t, sec) => h("div", { class: "crow soon", style: subjStyle(sec) }, h("span", { class: "crow-tag" }, "···"), h("span", { class: "crow-b" }, h("b", { class: "crow-t" }, t.name), h("span", { class: "crow-m" }, t.blurb)), h("span", { class: "pill" }, "Opening soon"));
export function courses() {
  const f = { text: "", level: "all", cat: "all" }, s = Store.get(), door = doorOf(s.door);
  const host = h("div", { class: "stack stack-l" }), openSet = new Set();
  const search = h("input", { class: "input", type: "search", placeholder: "Search courses: SIP, gold, SEBI, tax…", "aria-label": "Search courses", on: { input: ev => { f.text = ev.target.value.trim().toLowerCase(); paint(); } } });
  function paint() {
    const match = c => (f.level === "all" || c.level === f.level) && (!f.text || `${c.title} ${c.blurb} ${c.topic} ${c.tag}`.toLowerCase().includes(f.text));
    const chip = (v, cur, set, t) => h("button", { class: "chip", "aria-pressed": String(cur === v), on: { click: () => { set(v); paint(); } } }, t);
    const filtering = f.text || f.level !== "all" || f.cat !== "all";
    const rec = !filtering && door ? pathCourses(s.door).filter(c => !s.quiz["x:" + c.id]?.passed).slice(0, 3) : [];
    const cats = D.sections.filter(c => f.cat === "all" || c.id === f.cat);
    host.replaceChildren(...[
      h("div", { class: "stack" },
        h("div", { class: "search" }, icon("search"), search),
        h("div", { class: "chips scroll", role: "group", "aria-label": "Subject" }, chip("all", f.cat, v => (f.cat = v), "All subjects"), ...D.sections.map(c => chip(c.id, f.cat, v => (f.cat = v), c.name))),
        h("div", { class: "chips scroll", role: "group", "aria-label": "Level" }, chip("all", f.level, v => (f.level = v), "All levels"), ...D.levels.map(l => chip(l.id, f.level, v => (f.level = v), l.name)))),
      rec.length ? h("section", { class: "stack" }, h("div", { class: "sec-h" }, h("h2", { class: "h2" }, "Recommended for you"), h("p", { class: "small mute" }, `Picked for: ${door.name}`)), h("div", { class: "cgrid" }, rec.map(courseCard))) : null,
      h("div", { class: "acc-list" }, cats.map(cat => {
        const blocks = cat.tracks.map(t => [t, D.courses.filter(c => c.sec === cat.id && c.track === t.id && match(c))]).filter(([t, cs]) => cs.length || (t.soon && !filtering));
        if (!blocks.length) return null;
        const all = D.courses.filter(c => c.sec === cat.id), soonN = cat.tracks.filter(t => t.soon).length;
        const d = h("details", { class: "acc", style: subjStyle(cat.id), id: "subj-" + cat.id }, 
          h("summary", { class: "acc-s" }, h("span", { class: "acc-ic" }, (cat.name.match(/\b\w/g) || []).slice(0, 2).join("").toUpperCase()), h("span", { class: "acc-h" }, h("b", { class: "acc-t" }, cat.name), h("span", { class: "acc-m" }, cat.blurb)), h("span", { class: "acc-n" }, `${all.length} ${all.length === 1 ? "course" : "courses"}${soonN ? ` · ${soonN} soon` : ""}`), h("span", { class: "acc-chev" }, icon("chev", 18))),
          h("div", { class: "acc-b" }, blocks.map(([t, cs]) => h("div", { class: "track stack stack-s" },
            cs.length ? h("div", { class: "track-h" }, h("h3", { class: "track-t" }, t.name), h("p", { class: "small mute" }, t.blurb)) : null,
            cs.length ? h("div", { class: "crows" }, cs.map(courseRow)) : soonRow(t, cat.id)))));
        d.open = filtering || openSet.has(cat.id) || (!openSet.size && cats[0] === cat && cats.length > 1 && false);
        d.addEventListener("toggle", () => { d.open ? openSet.add(cat.id) : openSet.delete(cat.id); });
        return d;
      }).filter(Boolean)),
      filtering && !D.courses.some(match) ? h("p", { class: "mute" }, "Nothing matches. Try a different word or clear the filters.") : null].flat(Infinity).filter(Boolean));
  }
  paint();
  return widePage(h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Courses"), h("p", { class: "lead mute" }, `${D.courses.length} courses in ${D.sections.length} subjects. Tap a subject to open it.`)), host);
}
