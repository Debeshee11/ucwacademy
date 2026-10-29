/* Each learner's progress: one document, learners/<uid>, mirrored in localStorage so the app still works offline. */
import { RULES } from "./config.js";
import { db } from "./fb.js";
import { isoDay, dayMs, pct } from "./dom.js";

const blank = () => ({
  v: 1, name: "", lang: "en", start: null,
  done: {},            /* lesson number -> time completed */
  part: {},            /* lesson number -> part last reached */
  q: {},               /* question id -> { b: box 0-4, d: due time, n: tries, r: right, f: first try right 1/0 } */
  quiz: {},            /* "m:course:0" module quiz, "x:course" exam, "r:course" refresher -> { best, n, last, passed } */
  creds: {},           /* credential id -> credential */
  lab: {},             /* scenario id -> { score, n, last } */
  act: {},             /* YYYY-MM-DD -> { l: lessons finished, r: revision done, d: daily quiz done } */
  streak: { n: 0, last: "" },
  last: null,          /* lesson number last opened */
  created: Date.now(), updated: 0
});

let state = blank(), uid = null, email = "", timer = null, warned = false;
const subs = new Set();
const KEY = u => "one:v1:" + u;
const emit = () => subs.forEach(fn => fn(state));

/* ——— load and save ——— */
function clean(raw) {
  const s = { ...blank(), ...(raw || {}) };
  for (const k of ["done", "part", "q", "quiz", "creds", "lab", "act"]) if (!s[k] || typeof s[k] !== "object") s[k] = {};
  if (!s.streak || typeof s.streak !== "object") s.streak = { n: 0, last: "" };
  return s;
}

export async function init(user) {
  uid = user.uid; email = (user.email || "").toLowerCase();
  let local = null;
  try { local = JSON.parse(localStorage.getItem(KEY(uid)) || "null"); } catch {}
  state = clean(local);
  const d = db();
  if (d) {
    try {
      const snap = await d.doc("learners/" + uid).get();
      if (snap.exists) { const remote = clean(JSON.parse(JSON.stringify(snap.data()))); if ((remote.updated || 0) >= (state.updated || 0)) state = remote; }
    } catch (e) { console.warn("Could not read progress", e); }
  }
  emit();
}

function persist() {
  try { localStorage.setItem(KEY(uid), JSON.stringify(state)); } catch {}
  clearTimeout(timer);
  timer = setTimeout(flush, 700);
}
export async function flush() {
  clearTimeout(timer); timer = null;
  const d = db(); if (!d || !uid) return;
  try { await d.doc("learners/" + uid).set({ ...JSON.parse(JSON.stringify(state)), email }); warned = false; }
  catch (e) { console.warn("Could not save progress", e); if (!warned) { warned = true; document.dispatchEvent(new CustomEvent("one:syncerror")); } }
}
addEventListener("pagehide", () => { if (timer) flush(); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && timer) flush(); });

function mutate(fn) { fn(state); state.updated = Date.now(); persist(); emit(); }

export const get = () => state;
export const subscribe = fn => { subs.add(fn); return () => subs.delete(fn); };
export const userId = () => uid;
export const userEmail = () => email;

/* ——— activity and streak (weekends never break a streak) ——— */
const weekday = d => d.getDay() !== 0 && d.getDay() !== 6;
const parseDay = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
function prevWorkday(s) { let d = parseDay(s); do { d = new Date(d.getTime() - dayMs); } while (!weekday(d)); return isoDay(d); }

function touch(s) {
  const t = isoDay(), st = s.streak;
  if (st.last !== t) s.streak = st.last && st.last >= prevWorkday(t) ? { n: st.n + 1, last: t } : { n: 1, last: t };
  s.act[t] = s.act[t] || { l: 0, r: 0, d: 0 };
  const keep = Object.keys(s.act).sort().slice(-14);
  for (const k of Object.keys(s.act)) if (!keep.includes(k)) delete s.act[k];
}
export function streakNow() {
  const st = state.streak; if (!st.last) return 0;
  const t = isoDay();
  return st.last === t || st.last >= prevWorkday(t) ? st.n : 0;
}
export const todayAct = () => state.act[isoDay()] || { l: 0, r: 0, d: 0 };

/* ——— lessons ——— */
export const openLesson = (n, part) => mutate(s => { s.last = n; if (part != null) s.part[n] = part; });
export const setPart = (n, part) => mutate(s => { s.part[n] = part; });
export function finishLesson(n) {
  mutate(s => { if (!s.done[n]) s.done[n] = Date.now(); touch(s); s.act[isoDay()].l++; s.last = n; });
}

/* ——— questions: first-try accuracy for mastery, boxes for spaced revision ——— */
export function recordAnswer(id, correct) {
  mutate(s => {
    const e = s.q[id] || { b: 0, d: 0, n: 0, r: 0, f: null };
    if (e.n === 0) e.f = correct ? 1 : 0;
    e.n++; if (correct) e.r++;
    e.b = correct ? Math.min(e.b + 1, 4) : 0;
    e.d = Date.now() + RULES.intervals[e.b] * dayMs;
    s.q[id] = e; touch(s);
  });
}
/* Points for effort: 20 per lesson, 2 per right answer, 30 per quiz passed. Computed, never stored. */
export const xp = () => Object.keys(state.done).length * 20 + Object.values(state.q).reduce((a, e) => a + (e.r || 0) * 2, 0) + Object.values(state.quiz).filter(q => q.passed).length * 30;
export function mastery() {
  const f = Object.values(state.q).filter(e => e.f !== null && e.f !== undefined);
  return f.length < 5 ? null : pct(f.filter(e => e.f === 1).length, f.length);
}
export const dueIds = () => Object.entries(state.q).filter(([, e]) => e.n > 0 && e.d <= Date.now()).map(([id]) => id);

export function recordQuiz(key, score, passed) {
  mutate(s => {
    const r = s.quiz[key] || { best: 0, n: 0, last: 0, passed: null };
    r.best = Math.max(r.best, score); r.n++; r.last = Date.now();
    if (passed && !r.passed) r.passed = Date.now();
    s.quiz[key] = r; touch(s);
  });
}
export const markDaily = () => mutate(s => { touch(s); s.act[isoDay()].d = 1; });
export const markRevise = () => mutate(s => { touch(s); s.act[isoDay()].r = 1; });
export const recordLab = (id, score) => mutate(s => { const r = s.lab[id] || { score: 0, n: 0, last: 0 }; r.score = Math.max(r.score, score); r.n++; r.last = Date.now(); s.lab[id] = r; touch(s); });

/* ——— profile ——— */
export const setName = name => mutate(s => { s.name = name.trim().slice(0, 60); });
export const setLang = lang => mutate(s => { s.lang = lang; });
export const setStart = lv => mutate(s => { s.start = lv; });

/* ——— credentials ——— */
export const addCredential = c => mutate(s => { s.creds[c.id] = c; });
export const renewCredential = (id, until) => mutate(s => { if (s.creds[id]) { s.creds[id].until = until; s.creds[id].renewed = Date.now(); } });

/* ——— progress numbers ——— */
export function courseProgress(c) {
  const done = c.lessons.filter(n => state.done[n]).length;
  const modules = c.modules.map((m, i) => ({
    done: m.lessons.filter(n => state.done[n]).length, total: m.lessons.length,
    quiz: state.quiz["m:" + c.id + ":" + i] || null
  }));
  const exam = state.quiz["x:" + c.id] || null;
  return { done, total: c.lessons.length, pct: pct(done, c.lessons.length), modules, exam,
    examReady: modules.every(m => m.quiz?.passed) };
}

/* Admin only: every learner's document. Firestore rules refuse everyone else. */
export async function loadAll() {
  const d = db(); if (!d) throw new Error("offline");
  const snap = await d.collection("learners").get();
  return snap.docs.map(x => ({ id: x.id, ...x.data() }));
}
