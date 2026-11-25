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
import { nismBanner } from "./nismbanner.js";
import { pageHero } from "./pagehero.js";
import { resumeBar, ask } from "./ux.js";
import { signOut } from "./auth.js";
import { quoteOfDayCard } from "./quotes.js";
import { aboutYou, personalise, tipFor, intNames } from "./guide.js";

import { stagesFor } from "./curriculum.js";
import { DOORS, SEGMENTS, doorOf, pathCourses, proCourses, PRO_ONLY, isPro, segOfDoor, T, levelBlurb } from "./audience.js";
export { DOORS, doorOf, pathCourses };
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

/* ——— choosing a Door ——— */
export function doorPicker(current, onPick) {
  /* Step one: which of two audiences. Step two: which kind of learner. Whoever is already set sees their own group open. */
  const staff = Store.isStaff();
  let seg = current ? segOfDoor(doorOf(current)) : staff ? "pro" : "everyday";
  const host = h("div", { class: "stack" });
  function paint() {
    const doors = DOORS.filter(d => segOfDoor(d) === seg && (!d.staff || staff));
    const pro = seg === "pro", g = SEGMENTS.find(x => x.id === seg);
    host.replaceChildren(
      h("p", { class: "pk-step" }, h("b", {}, "Step 1"), " Which describes you?"),
      h("div", { class: "segs", role: "group", "aria-label": "Which describes you?" }, SEGMENTS.map(x => h("button", { type: "button", class: "seg pk-" + x.id, "aria-pressed": String(seg === x.id), on: { click: () => { seg = x.id; paint(); } } },
        h("span", { class: "pk-ic", "aria-hidden": "true" }, x.id === "pro" ? "💼" : "🌱"),
        h("b", {}, x.name), h("span", { class: "small mute" }, x.who), seg === x.id ? h("span", { class: "pk-tick" }, "✓ Chosen") : null))),
      h("p", { class: "pk-step" }, h("b", {}, "Step 2"), pro ? " Which role do you work in?" : " Which of these fits you best?"),
      h("div", { class: "doors pk-doors pk-d-" + seg }, doors.map(d => h("button", { type: "button", class: "door", "aria-pressed": String(current === d.id), on: { click: ev => {
        current = d.id; host.querySelectorAll(".door").forEach(b => b.setAttribute("aria-pressed", "false")); ev.currentTarget.setAttribute("aria-pressed", "true"); onPick(d.id); } } },
        h("b", {}, d.name), h("span", { class: "small mute" }, d.who), h("span", { class: "tiny door-hook" }, d.hook)))));
  }
  paint();
  return host;
}

/* ——— Today ——— */
export function today() {
  const s = Store.get(), door = doorOf(s.door), hr = new Date().getHours();
  const first = (s.name || "").split(" ")[0];
  const stages = stagesFor(door, door?.track).map(st => ({ ...st, cs: st.c.map(id => { const r = id.replace(/^\+/, ""); return course(r) || { id: r, soon: true, title: r }; }) }));
  const real = stages.flatMap(st => st.cs.filter(c => !c.soon));
  const examOk = c => !!s.quiz["x:" + c.id]?.passed;
  const nextCourse = real.find(c => Store.courseProgress(c).done < c.lessons.length) || real.find(c => !examOk(c)) || real[0];
  const step = nextUp(nextCourse?.id), c = step?.course || nextCourse, p = c ? Store.courseProgress(c) : { done: 0, pct: 0 };
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
  /* stage states: done when every written course is finished and the stage exam is passed; the first stage that is not done is "now" */
  const st2 = stages.map(st => { const rc = st.cs.filter(x => !x.soon), exam = rc[rc.length - 1];
    const lessons = rc.reduce((n, x) => n + x.lessons.length, 0), did = rc.reduce((n, x) => n + Store.courseProgress(x).done, 0);
    return { ...st, rc, exam, lessons, did, passed: !!exam && examOk(exam), ready: lessons > 0 && did >= lessons }; });
  const nowIx = st2.findIndex(x => !x.passed);
  const stageCard = (st, i) => {
    const state = st.passed ? "done" : i === nowIx ? "now" : "next", pctv = st.lessons ? Math.round(100 * st.did / st.lessons) : 0;
    return h("section", { class: "stage " + state },
      h("div", { class: "stage-n" }, st.passed ? icon("check", 18) : String(i + 1)),
      h("div", { class: "stage-b stack stack-xs" },
        h("div", { class: "stage-h" }, h("h3", { class: "h3" }, st.t), h("span", { class: "pill " + (st.passed ? "ok" : state === "now" ? "gold" : "") }, st.passed ? "Passed" : state === "now" ? "You are here" : "Up next")),
        h("p", { class: "small mute" }, st.g),
        h("div", { class: "stage-cs" }, st.cs.map(x => x.soon ? h("span", { class: "chip soon" }, "Being written") : h("a", { class: "chip" + (Store.courseProgress(x).done >= x.lessons.length ? " on" : ""), href: "#/course/" + x.id }, x.title))),
        st.lessons ? h("div", { class: "row-flex between tiny mute" }, h("span", {}, `${st.did} of ${st.lessons} lessons`), h("span", {}, pctv + "%")) : null,
        st.lessons ? bar(pctv) : null,
        st.exam ? h("a", { class: "btn " + (st.ready && !st.passed ? "gold" : "ghost") + " sm", href: "#/assess/" + st.exam.id }, st.passed ? "Retake the stage exam" : "Stage exam") : null));
  };
  const heading = h("div", { class: "stack stack-s" },
    h("h1", { class: "h1" }, `${hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening"}${first ? ", " + first : ""}`),
    h("p", { class: "mute" }, door ? h("span", {}, `Your path: ${door.name}. `, h("a", { class: "linkish", href: "#/me" }, "Change")) : "Pick who you are in Me and your path appears here."));
  return widePage(heading, hero,
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Your path"), h("p", { class: "small mute" }, "Finish a stage's lessons, then sit its exam. Each stage builds on the one before."),
      h("div", { class: "stages" }, st2.map(stageCard))),
    h("a", { class: "linkish", href: "#/courses" }, "Browse all courses"));
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
      h("div", { class: "lg-row head", role: "row" }, h("span", { role: "columnheader" }, "Subject"), SEALS.map(([, n, e]) => h("span", { role: "columnheader", title: e }, n))),
      realms().map(r => { const cs = core().filter(c => c.sec === r.id);
        return h("div", { class: "lg-row", role: "row" }, h("span", { class: "lg-realm", role: "rowheader" }, h("b", {}, r.name), h("small", { class: "tiny mute" }, r.blurb)),
          cs.length ? SEALS.map(([k]) => { const n = cs.filter(c => passed(c.id, k)).length, full = n === cs.length;
            return h("span", { role: "cell", class: "lg-cell" + (full ? " full" : n ? " part" : ""), "aria-label": `${n} of ${cs.length}` }, full ? icon("check", 18) : n + "/" + cs.length); })
            : h("span", { class: "lg-soon", role: "cell" }, "Courses opening soon")); })));
}

export function settingsCard() {
  const s = Store.get();
  const show = h("input", { type: "checkbox", id: "showroll", checked: s.show !== 0, on: { change: ev => { Store.setShow(ev.target.checked); toast(ev.target.checked ? "You are on the leaderboard" : "You are hidden from the leaderboard"); } } });
  return h("section", { class: "stack" }, h("h2", { class: "h2" }, "Who are you?"),
    h("p", { class: "small mute" }, "This sets the courses we recommend first and the examples you see. You can change it any time."),
    doorPicker(s.door, id => { Store.setDoor(id); toast("Saved"); }),
    h("h2", { class: "h2" }, "About you"), h("p", { class: "small mute" }, "Your age group and interests set which courses come first and the advice you see on Home."), aboutYou(() => toast("Saved")),
    h("label", { class: "row-flex small", for: "showroll", style: "gap:10px;margin-top:6px" }, show, "Show my first name and last initial on the leaderboard"),
    accountCard());
}

/* Delete everything the Academy holds about this learner. */
function accountCard() {
  const msg = h("p", { class: "small", role: "status" });
  const btn = h("button", { class: "btn ghost", on: { click: async () => {
    if (!(await ask("This removes your progress, leaderboard entry and certificates for good. It cannot be undone.", { title: "Delete your account?", ok: "Delete", cancel: "Keep my account", danger: true }))) return;
    if (!(await ask("Last check: delete everything now?", { ok: "Delete everything", cancel: "Keep my account", danger: true }))) return;
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
    const r = p.exams[T.id], open = T.id === "b" ? true : !!p.exams[T.id === "i" ? "b" : "i"]?.passed;
    return h("div", { class: "as-tier t-" + T.id + (r?.passed ? " ok" : "") + (open ? "" : " locked") },
      h("div", { class: "row-flex between" }, h("b", {}, T.name), r?.passed ? h("span", { class: "pill ok" }, "Passed") : !open ? icon("lock", 16) : null),
      h("div", { class: "tiny mute" }, `20 questions · ${RULES.tierPass[T.id]}% to pass${r ? ` · best ${r.best}%` : ""}`),
      h("div", { class: "row-flex", style: "gap:8px" },
        open ? h("a", { class: "btn primary sm", href: `#/quiz/exam/${c.id}/${T.id}` }, r?.passed ? "Retake" : "Start") : h("span", { class: "tiny mute" }, `Pass the ${T.id === "i" ? "Beginner" : "Intermediate"} exam first`),
        h("a", { class: "btn ghost sm", href: `#/syllabus/${c.id}/${T.id}` }, "Syllabus")));
  };
  const card = c => { const p = Store.courseProgress(c);
    return h("article", { class: "card stack as-card", id: "as-" + c.id, style: realmVars(c.sec) },
      h("div", { class: "row-flex between" }, h("div", {}, h("div", { class: "tiny mute" }, realmName(c.sec) + " · " + level(c.level).name), h("h3", { class: "h3" }, c.title)),
        p.examReady ? null : h("a", { class: "btn ghost sm", href: `#/course/${c.id}` }, `Study this course · ${p.pct}%`)),
      h("div", { class: "as-tiers" }, TIERS().map(T => tierCell(c, T, p)))); };
  const focus = cid ? course(cid) : null;
  return widePage(
    pageHero("exams", "Exams", "Every scored exam starts here, and nowhere else. Read the syllabus, check you are ready, then take the exam. Each course has a Beginner, Intermediate and Hard exam.", [[list.length, "Courses"], [3, "Exams"]]),
    resumeBar(), nismBanner(),
    focus ? h("section", { class: "stack" }, h("h2", { class: "h2" }, "Your course"), card(focus)) : null,
    realms().map(r => { const cs = list.filter(c => c.sec === r.id && c.id !== cid);
      return cs.length ? h("details", { class: "exsec", open: !!focus && false }, h("summary", { class: "exsec-s" }, h("span", { class: "exsec-t" }, h("b", {}, r.name), h("small", {}, r.blurb)), h("span", { class: "acc-n" }, String(cs.length)), h("span", { class: "acc-chev" }, icon("chev", 18))), h("div", { class: "stack exsec-b" }, cs.map(card))) : null; }));
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
    const hidden = c => !isPro() && PRO_ONLY.has(c.id) && !f.text;
    const match = c => !hidden(c) && (f.level === "all" || c.level === f.level) && (!f.text || `${c.title} ${c.blurb} ${c.topic} ${c.tag}`.toLowerCase().includes(f.text));
    const chip = (v, cur, set, t) => h("button", { class: "chip", "aria-pressed": String(cur === v), on: { click: () => { set(v); paint(); } } }, t);
    const filtering = f.text || f.level !== "all" || f.cat !== "all";
    const rec = !filtering && door ? pathCourses(s.door).filter(c => !s.quiz["x:" + c.id]?.passed).slice(0, 3) : [];
    const cats = D.sections.filter(c => f.cat === "all" || c.id === f.cat);
    host.replaceChildren(...[
      h("a", { class: "fl-promo", href: "#/cases" }, h("span", { class: "fl-pi", "aria-hidden": "true" }, icon("play", 22)), h("span", { class: "fl-pt" }, h("b", {}, "Case studies"), h("small", {}, "Real events in money, explained in short animated films")), icon("chev", 18)),
      h("div", { class: "stack" },
        h("div", { class: "search" }, icon("search"), search),
        h("div", { class: "chips scroll", role: "group", "aria-label": "Subject" }, chip("all", f.cat, v => (f.cat = v), "All subjects"), ...D.sections.map(c => chip(c.id, f.cat, v => (f.cat = v), c.name))),
        h("div", { class: "chips scroll", role: "group", "aria-label": "Level" }, chip("all", f.level, v => (f.level = v), "All levels"), ...D.levels.map(l => chip(l.id, f.level, v => (f.level = v), l.name)))),
      rec.length ? h("section", { class: "stack" }, h("div", { class: "sec-h" }, h("h2", { class: "h2" }, "Recommended for you"), h("p", { class: "small mute" }, `Picked for: ${door.name}`)), h("div", { class: "cgrid" }, rec.map(courseCard))) : null,
      h("div", { class: "acc-list" }, cats.map(cat => {
        const blocks = cat.tracks.map(t => [t, D.courses.filter(c => c.sec === cat.id && c.track === t.id && match(c))]).filter(([t, cs]) => cs.length || (t.soon && !filtering));
        if (!blocks.length) return null;
        const all = D.courses.filter(c => c.sec === cat.id && !hidden(c)), soonN = cat.tracks.filter(t => t.soon).length;
        const d = h("details", { class: "acc", style: subjStyle(cat.id), id: "subj-" + cat.id }, 
          h("summary", { class: "acc-s" }, h("span", { class: "acc-ic" }, (cat.name.match(/\b\w/g) || []).slice(0, 2).join("").toUpperCase()), h("span", { class: "acc-h" }, h("b", { class: "acc-t" }, cat.name), h("span", { class: "acc-m" }, T(cat.blurb))), h("span", { class: "acc-n" }, `${all.length} ${all.length === 1 ? "course" : "courses"}${soonN ? ` · ${soonN} soon` : ""}`), h("span", { class: "acc-chev" }, icon("chev", 18))),
          h("div", { class: "acc-b" }, blocks.map(([t, cs]) => h("div", { class: "track stack stack-s" },
            cs.length ? h("div", { class: "track-h" }, h("h3", { class: "track-t" }, t.name), h("p", { class: "small mute" }, T(t.blurb))) : null,
            cs.length ? h("div", { class: "crows" }, cs.map(courseRow)) : soonRow(t, cat.id)))));
        d.open = filtering || openSet.has(cat.id) || (!openSet.size && cats[0] === cat && cats.length > 1 && false);
        d.addEventListener("toggle", () => { d.open ? openSet.add(cat.id) : openSet.delete(cat.id); });
        return d;
      }).filter(Boolean)),
      !isPro() && !f.text && f.cat === "all" ? h("details", { class: "acc pro-more", style: subjStyle("mf") },
        h("summary", { class: "acc-s" }, h("span", { class: "acc-ic" }, "PRO"), h("span", { class: "acc-h" }, h("b", { class: "acc-t" }, "For finance professionals"), h("span", { class: "acc-m" }, "Written for advisers, distributors and analysts: the working side of finance.")), h("span", { class: "acc-n" }, `${proCourses().length} courses`), h("span", { class: "acc-chev" }, icon("chev", 18))),
        h("div", { class: "acc-b" }, h("div", { class: "crows" }, proCourses().filter(c => f.level === "all" || c.level === f.level).map(courseRow)))) : null,
      filtering && !D.courses.some(match) ? h("p", { class: "mute" }, "Nothing matches. Try a different word or clear the filters.") : null].flat(Infinity).filter(Boolean));
  }
  paint();
  return widePage(pageHero("courses", "Courses", `${D.courses.length} courses in ${D.sections.length} subjects. Tap a subject to open it.`), resumeBar(), nismBanner(), host);
}
