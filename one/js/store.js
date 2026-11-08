/* Each learner's progress: one document, learners/<uid>, mirrored in localStorage so the app still works offline. */
import { RULES, STAFF_DOMAIN } from "./config.js";
import { db, fns } from "./fb.js";
import { isoDay, dayMs, pct } from "./dom.js";
import { mergeStates } from "./merge.js";

const blank = () => ({
  v: 1, name: "", mobile: "", mv: 0, kind: "", door: "", prov: "", consent: 0, show: 1, study: {}, nm: {}, onb: 0, lang: "en", start: null,
  done: {},            /* lesson number -> time completed */
  part: {},            /* lesson number -> part last reached */
  q: {},               /* question id -> { b: box 0-4, d: due time, n: tries, r: right, f: first try right 1/0 } */
  quiz: {},            /* "m:course:0" module quiz, "x:course" Beginner exam, "x2:course" Intermediate, "x3:course" Hard, "r:course" refresher -> { best, n, last, passed } */
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
      if (snap.exists) { const remote = clean(JSON.parse(JSON.stringify(snap.data()))); state = local ? mergeStates(remote, state) : remote; }
    } catch (e) { console.warn("Could not read progress", e); }
  }
  /* Credentials are issued by the backend and read back here; the browser never writes them. */
  const keepLocal = state.creds;
  state.creds = {};
  if (d) { try { (await d.collection("credentials").where("uid", "==", uid).get()).forEach(x => { state.creds[x.id] = x.data(); }); } catch (e) { console.warn("Could not read credentials", e); state.creds = keepLocal && typeof keepLocal === "object" ? keepLocal : {}; } }
  state.nm = {};
  if (d) { try { const r = await d.doc("nmres/" + uid).get(); if (r.exists) { const { lastAt, ...rest } = r.data(); state.nm = rest; } } catch (e) { console.warn("Could not read mock results", e); } }
  /* Course exam results recorded by the backend win over anything held locally. */
  if (d) { try { const r = await d.doc("examres/" + uid).get(); if (r.exists) for (const [k, v] of Object.entries(r.data())) { const [cid, t] = k.split(":"), key = ({ b: "x:", i: "x2:", h: "x3:" })[t]; if (!key || !v) continue;
    const o = state.quiz[key + cid] || { best: 0, n: 0, last: 0, passed: null }; state.quiz[key + cid] = { best: Math.max(o.best || 0, v.best || 0), n: Math.max(o.n || 0, v.n || 0), last: Math.max(o.last || 0, v.last || 0), passed: v.passed || o.passed }; } } catch (e) { console.warn("Could not read exam results", e); } }
  if (!state.kind) state.kind = email.endsWith(STAFF_DOMAIN) ? "staff" : "public";
  const pid = user.providerData?.[0]?.providerId || "";
  state.prov = pid === "google.com" ? "google" : pid === "password" ? "email" : (pid || state.prov || "");
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
  try {
    const ref = d.doc("learners/" + uid), strip = o => { const { nm, creds, ...r } = JSON.parse(JSON.stringify(o)); return r; };   /* mock results and credentials are written by the backend, never from here */
    let merged = null;
    await d.runTransaction(async tx => {
      const snap = await tx.get(ref), mine = strip(state);
      merged = snap.exists ? mergeStates(clean(snap.data()), clean(mine)) : mine;
      merged.updated = Math.max(merged.updated || 0, Date.now());
      tx.set(ref, { ...merged, email: email || merged.email || "" });
    });
    if (merged) { const { nm, creds } = state; state = { ...clean(merged), nm, creds }; try { localStorage.setItem(KEY(uid), JSON.stringify(state)); } catch {} emit(); }
    warned = false; syncBoard(false); }
  catch (e) { console.warn("Could not save progress", e); if (!warned) { warned = true; document.dispatchEvent(new CustomEvent("one:syncerror")); } }
}
/* The Roll and the staff board are computed by the backend from this record. */
let lastSync = 0;
export async function syncBoard(force) {
  if (!uid || !state.name || (!force && Date.now() - lastSync < 120000)) return;
  lastSync = Date.now();
  try { const f = fns(); if (f) await f.httpsCallable("syncBoard")(); } catch (e) { console.warn("board", e); }
}
export async function loadRoll() {
  const d = db(); if (!d) throw new Error("offline");
  const snap = await d.collection("roll").orderBy("xp", "desc").limit(200).get();
  return snap.docs.map(x => ({ id: x.id, ...x.data() }));
}
export async function loadBoard() {
  const d = db(); if (!d) throw new Error("offline");
  const snap = await d.collection("board").get();
  return snap.docs.map(x => ({ id: x.id, ...x.data() }));
}
addEventListener("pagehide", () => { if (timer) flush(); });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && timer) flush(); });

function mutate(fn) { fn(state); state.updated = Date.now(); persist(); emit(); }

export const get = () => state;
export const subscribe = fn => { subs.add(fn); return () => subs.delete(fn); };
export const userId = () => uid;
export const userEmail = () => email;
/* The email we hold for this learner: the sign-in email, or the one they typed for phone sign-in. */
export const contactEmail = () => email || state.email || "";

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
export const setProfile = p => mutate(s => { if (p.name) s.name = p.name.trim().slice(0, 60); if (p.mobile) s.mobile = String(p.mobile).startsWith("+") ? String(p.mobile).slice(0, 16) : String(p.mobile).replace(/\D/g, "").slice(-10); if (p.mv) s.mv = 1; if (p.email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email.trim())) s.email = p.email.trim().toLowerCase().slice(0, 120); });
export const setOnboarded = () => mutate(s => { s.onb = 1; });
export const isStaff = () => email.endsWith(STAFF_DOMAIN);
export const setLang = lang => mutate(s => { s.lang = lang; });
export const setDoor = id => mutate(s => { s.door = id; });
export const toggleStudy = k => mutate(s => { s.study = s.study || {}; if (s.study[k]) delete s.study[k]; else s.study[k] = 1; });
/* Mock results come from the backend. This only updates the copy shown on screen; it is never written back from the browser. */
export const setMockResult = (id, n, rec) => { state.nm = state.nm || {}; (state.nm[id] = state.nm[id] || {})[n] = rec; emit(); };
export const setShow = on => { mutate(s => { s.show = on ? 1 : 0; }); flush().then(() => syncBoard(true)); };
export const setStart = lv => mutate(s => { s.start = lv; });

/* ——— consent ——— */
export const hasConsent = () => !!state.consent;
export const uidNow = () => uid;
export const setConsent = () => mutate(s => { s.consent = Date.now(); });

/* ——— account deletion: the backend removes every record, then the sign-in itself ——— */
export async function deleteAccount() {
  const f = fns(); if (!f) throw new Error("offline");
  clearTimeout(timer); timer = null;
  await f.httpsCallable("deleteAccount")();
  try { localStorage.removeItem(KEY(uid)); } catch {}
}

export async function exportData() {
  const f = fns(); if (!f) throw new Error("offline");
  await flush();
  return (await f.httpsCallable("exportMyData")()).data;
}

/* ——— credentials (copies of what the backend issued) ——— */
export const addCredential = c => mutate(s => { s.creds[c.id] = c; });
export const renewCredential = (id, until) => mutate(s => { if (s.creds[id]) { s.creds[id].until = until; s.creds[id].renewed = Date.now(); } });

/* ——— progress numbers ——— */
export function courseProgress(c) {
  const done = c.lessons.filter(n => state.done[n]).length;
  const modules = c.modules.map((m, i) => ({
    done: m.lessons.filter(n => state.done[n]).length, total: m.lessons.length,
    quiz: state.quiz["m:" + c.id + ":" + i] || null
  }));
  const exam = state.quiz["x:" + c.id] || null, exams = { b: exam, i: state.quiz["x2:" + c.id] || null, h: state.quiz["x3:" + c.id] || null };
  return { done, total: c.lessons.length, pct: pct(done, c.lessons.length), modules, exam, exams,
    examReady: modules.every(m => m.quiz?.passed) };
}

/* Admin only: every learner's document. Firestore rules refuse everyone else. */
export async function loadAll() {
  const d = db(); if (!d) throw new Error("offline");
  const snap = await d.collection("learners").get();
  return snap.docs.map(x => ({ id: x.id, ...x.data() }));
}
