/* UpperCrust Academy backend. Marks NISM mocks on the server so scores cannot be edited in the browser,
   keeps the answer keys private, and gives the admin their numbers. Region: Mumbai. */
const { functions, admin, db, FV, makeR, fail, needAuth, needAdmin, day } = require("./lib/common");
const { validAnswers, score, foldRecord } = require("./lib/score");
const { STAFF, ADMIN_EMAILS } = require("./lib/staff");

const R = makeR();
const EXAM_ID = /^nism-[a-z]+(?:-[a-z]+)?$/;
const COOLDOWN_MS = 15000;

/* Exams, credentials and account deletion live in lib/. */
Object.assign(exports, require("./lib/exam"), require("./lib/account"), require("./lib/content"));

/* Answer keys live in Firestore (nmkeys/<exam>), not in the public repository. Cached while the instance is warm. */
const cache = new Map();
async function loadKeys(examId) {
  if (!EXAM_ID.test(examId)) fail("invalid-argument", "Unknown exam.");
  const hit = cache.get(examId);
  if (hit && Date.now() - hit.t < 10 * 60e3) return hit.k;
  const snap = await db.doc("nmkeys/" + examId).get();
  if (!snap.exists) fail("failed-precondition", "This mock is being prepared. Try again soon.");
  const k = snap.data(); cache.set(examId, { k, t: Date.now() });
  return k;
}
const mockKey = (keys, n) => { n = Number(n); if (!Number.isInteger(n) || n < 1 || n > keys.mocks.length) fail("invalid-argument", "Unknown mock."); return keys.mocks[n - 1]; };

/* Marks a mock, saves the attempt, returns the result with the answers and explanations for review. */
exports.submitMock = R.https.onCall(async (data, ctx) => {
  const uid = needAuth(ctx);
  const examId = String(data?.examId || ""), n = Number(data?.mock);
  const keys = await loadKeys(examId), key = mockKey(keys, n);
  if (!validAnswers(data?.answers, key.a.length)) fail("invalid-argument", "Answers are not valid.");

  const ref = db.doc("nmres/" + uid), prevSnap = await ref.get(), all = prevSnap.exists ? prevSnap.data() : {};
  const lastAt = all.lastAt || 0;
  if (Date.now() - lastAt < COOLDOWN_MS) fail("resource-exhausted", "Please wait a few seconds before submitting again.");

  const r = score(key, data.answers, keys.negf || 0);
  const secs = Math.max(0, Math.min(86400, Math.round(Number(data?.secs) || 0)));
  const rec = { s: r.s, c: r.c, w: r.w, u: r.u, t: secs, d: Date.now(), un: r.un, a: data.answers };
  const pass = r.s >= keys.passMarks;

  const ex = all[examId] && typeof all[examId] === "object" ? all[examId] : {};
  const mine = foldRecord(ex[n], rec);
  await ref.set({ lastAt: Date.now(), [examId]: { [n]: mine } }, { merge: true });

  /* aggregate numbers for the admin dashboard */
  const pct = keys.marks ? (r.s / keys.marks) * 100 : 0;
  const batch = db.batch();
  batch.set(db.doc("stats/nism_" + examId), { attempts: FV.increment(1), passes: FV.increment(pass ? 1 : 0), pctSum: FV.increment(pct), byMock: { [n]: { attempts: FV.increment(1), passes: FV.increment(pass ? 1 : 0), pctSum: FV.increment(pct) } } }, { merge: true });
  const t = {}, w = {}, s = {};
  r.res.forEach((x, i) => { if (x === 1) t[i] = FV.increment(1); else if (x === 0) { t[i] = FV.increment(1); w[i] = FV.increment(1); } else s[i] = FV.increment(1); });
  batch.set(db.doc(`qstats/${examId}_${n}`), { t, w, s }, { merge: true });
  batch.set(db.doc("stats/day_" + day()), { mocks: FV.increment(1) }, { merge: true });
  await batch.commit();

  return { s: r.s, c: r.c, w: r.w, u: r.u, un: r.un, total: keys.marks, pass, best: mine.best, att: mine.att, key: key.a, why: key.w };
});

/* Review of an attempt already made. Answers are shown only for mocks the learner has submitted. */
exports.getReview = R.https.onCall(async (data, ctx) => {
  const uid = needAuth(ctx);
  const examId = String(data?.examId || ""), n = Number(data?.mock);
  const keys = await loadKeys(examId), key = mockKey(keys, n);
  const snap = await db.doc("nmres/" + uid).get();
  const rec = snap.exists && snap.data()[examId] && snap.data()[examId][n];
  if (!rec || !rec.att) fail("failed-precondition", "Take this mock first.");
  return { key: key.a, why: key.w };
});

/* Admin only: store the answer keys for one exam. The admin page uploads the file made by the build. */
exports.putKeys = R.https.onCall(async (data, ctx) => {
  needAdmin(ctx);
  const k = data?.keys;
  const id = String(k?.id || "");
  if (!EXAM_ID.test(id) || !Array.isArray(k?.mocks) || k.mocks.length < 1 || k.mocks.length > 5) fail("invalid-argument", "That file is not an answer-key file.");
  for (const m of k.mocks) if (!Array.isArray(m.a) || !Array.isArray(m.w) || !Array.isArray(m.u) || !Array.isArray(m.m) || m.a.length !== m.w.length || m.a.length !== m.u.length || m.a.length !== m.m.length) fail("invalid-argument", "Answer-key file is malformed.");
  const size = JSON.stringify(k).length;
  if (size > 900000) fail("invalid-argument", "File is too large.");
  await db.doc("nmkeys/" + id).set({ id, negf: Number(k.negf) || 0, marks: Number(k.marks) || 0, passMarks: Number(k.passMarks) || 0, mocks: k.mocks, updated: Date.now() });
  cache.delete(id);
  return { id, mocks: k.mocks.length, questions: k.mocks[0].a.length };
});

/* Admin only: which exams have keys uploaded. */
exports.keyStatus = R.https.onCall(async (data, ctx) => {
  needAdmin(ctx);
  const snap = await db.collection("nmkeys").select("updated", "id").get();
  return snap.docs.map(d => ({ id: d.id, updated: d.get("updated") || 0 }));
});

/* Admin only: the numbers behind the dashboard. Uses count queries, so it stays cheap with thousands of learners. */
const DOORS = ["student", "homemaker", "teacher", "salaried", "business", "retiree", "partner", "team", "global"];
exports.adminStats = makeR({ timeoutSeconds: 60, memory: "512MB" }).https.onCall(async (data, ctx) => {
  needAdmin(ctx);
  const col = db.collection("learners"), now = Date.now(), D = 86400e3;
  const cnt = async q => (await q.count().get()).data().count;
  const since = (field, ms) => cnt(col.where(field, ">", ms));
  const [total, staff, j1, j7, j30, a1, a7, a30] = await Promise.all([
    cnt(col), cnt(col.where("kind", "==", "staff")),
    since("created", now - D), since("created", now - 7 * D), since("created", now - 30 * D),
    since("updated", now - D), since("updated", now - 7 * D), since("updated", now - 30 * D)
  ]);
  const doors = {}; await Promise.all(DOORS.map(async d => { doors[d] = await cnt(col.where("door", "==", d)); }));
  const provs = {}; await Promise.all(["google", "phone", "email"].map(async p => { provs[p] = await cnt(col.where("prov", "==", p)); }));
  /* new learners per day, last 30 days (IST) */
  const startIST = Date.parse(day() + "T00:00:00+05:30");
  const days = []; for (let i = 29; i >= 0; i--) days.push(startIST - i * D);
  const perDay = await Promise.all(days.map(t => cnt(col.where("created", ">=", t).where("created", "<", t + D))));
  const signups = days.map((t, i) => ({ d: day(t + 1), n: perDay[i] }));

  const nism = {}; (await db.collection("stats").where(admin.firestore.FieldPath.documentId(), ">=", "nism_").where(admin.firestore.FieldPath.documentId(), "<", "nism`").get()).forEach(d => { nism[d.id.replace("nism_", "")] = d.data(); });
  /* hardest questions: most often wrong, with at least 20 answers */
  const hard = [];
  const qs = await db.collection("qstats").get();
  qs.forEach(d => {
    const m = d.id.match(/^(.+)_(\d)$/); if (!m) return;
    const { t = {}, w = {}, s = {} } = d.data();
    for (const i of Object.keys(t)) { const n = t[i], wr = w[i] || 0; if (n >= 20) hard.push({ examId: m[1], mock: +m[2], i: +i, n, wrong: wr, skipped: s[i] || 0, rate: wr / n }); }
  });
  hard.sort((a, b) => b.rate - a.rate);
  const errs = (await db.collection("errors").orderBy("t", "desc").limit(20).get()).docs.map(d => d.data());
  return { total, staff, joined: { d1: j1, d7: j7, d30: j30 }, active: { d1: a1, d7: a7, d30: a30 }, doors, provs, signups, nism, hard: hard.slice(0, 25), errors: errs, at: now };
});

/* ——— staff identity ——— */
/* Admin only: marks the listed employees' accounts as email-verified, which the security rules now require.
   Anyone who registers a staff address without owning the mailbox stays unverified and gets no staff access. */
exports.verifyStaff = R.https.onCall(async (data, ctx) => {
  needAdmin(ctx);
  const out = { verified: 0, already: 0, missing: [] };
  for (const email of STAFF) {
    try {
      const u = await admin.auth().getUserByEmail(email);
      if (u.emailVerified) out.already++; else { await admin.auth().updateUser(u.uid, { emailVerified: true }); out.verified++; }
    } catch (e) { out.missing.push(email); }
  }
  return out;
});

/* ——— leaderboard ——— */
/* The Roll and the staff board are written here, never from the browser. Points are recomputed from the learner's record
   and the growth is capped per day, so an edited record cannot jump to the top. */
const LESSON_MAX = 400, DAILY_XP_CAP = 800, FIRST_SYNC_CAP = 3000, WEEK_LESSON_CAP = 60;
exports.syncBoard = R.https.onCall(async (data, ctx) => {
  const uid = needAuth(ctx);
  const email = String(ctx.auth.token.email || "").toLowerCase();
  const snap = await db.doc("learners/" + uid).get();
  if (!snap.exists) return { ok: false };
  const L = snap.data(), now = Date.now();
  const rollRef = db.doc("roll/" + uid), prev = (await rollRef.get()).data() || {};
  if (now - (prev.syncAt || 0) < 20000) return { ok: true, skipped: true };

  if (L.show === 0) { await rollRef.delete().catch(() => {}); await db.doc("board/" + uid).delete().catch(() => {}); return { ok: true, hidden: true }; }

  const done = Object.entries(L.done || {}).filter(([k, t]) => /^\d+$/.test(k) && +k >= 1 && +k <= LESSON_MAX && Number(t) <= now + 60000).length;
  const qpts = Object.values(L.q || {}).reduce((a, e) => a + Math.min(Number(e && e.r) || 0, 50) * 2, 0);
  const quiz = Object.entries(L.quiz || {}).filter(([, q]) => q && q.passed);
  const seals = quiz.filter(([k]) => /^x[23]?:/.test(k)).length;
  let xp = done * 20 + qpts + quiz.length * 30;
  const days = Math.max(1, (now - (prev.syncAt || now - 864e5)) / 864e5);
  const ceil = prev.xp != null ? prev.xp + Math.ceil(days) * DAILY_XP_CAP : FIRST_SYNC_CAP;
  xp = Math.max(prev.xp || 0, Math.min(xp, ceil));

  let wk = 0; for (let i = 0; i < 7; i++) { const k = new Date(now + 5.5 * 3600e3 - i * 864e5).toISOString().slice(0, 10); wk += Math.min(Number(L.act && L.act[k] && L.act[k].l) || 0, 40); }
  wk = Math.min(wk, WEEK_LESSON_CAP);
  const streak = Math.min(Number(L.streak && L.streak.n) || 0, Math.ceil((now - (L.created || now)) / 864e5) + 1);
  const parts = String(L.name || "").trim().split(/\s+/), name = (parts.length > 1 ? parts[0] + " " + parts[parts.length - 1][0].toUpperCase() + "." : parts[0] || "Learner").slice(0, 40);
  const staff = ctx.auth.token.email_verified === true && STAFF.includes(email);

  await rollRef.set({ name, door: String(L.door || "").slice(0, 20), kind: staff ? "staff" : "public", xp, wk, streak, lessons: done, seals, updated: now, syncAt: now });
  if (staff) await db.doc("board/" + uid).set({ name: String(L.name || name).slice(0, 60), email, xp, wk, streak, lessons: done, updated: now });
  return { ok: true, xp };
});
