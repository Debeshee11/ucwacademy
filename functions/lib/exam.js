/* Course exams and refreshers, marked on the server. The browser sends the question ids and the chosen option for each;
   the answer keys live in Firestore (examkeys/<course>), uploaded from the admin page, and never reach the public site.
   A passed Beginner exam or refresher issues or renews the credential here. */
const { db, FV, makeR, fail, needAuth, needAdmin, day } = require("./common");
const { awardCourse, mine, findIn, checkLevels } = require("./creds");
const { COUNT, mark, draw } = require("./mark");
const crypto = require("crypto");
const rnd = () => crypto.randomInt(0, 2 ** 31) / 2 ** 31;

const R = makeR();
const COOLDOWN_MS = 8000;
const ID = /^[a-z0-9-]{2,40}$/;

const cache = new Map();
async function loadCourse(id) {
  if (!ID.test(id) || id === "_meta") fail("invalid-argument", "Unknown course.");
  const hit = cache.get(id);
  if (hit && Date.now() - hit.t < 10 * 60e3) return hit.k;
  const snap = await db.doc("examkeys/" + id).get();
  if (!snap.exists) fail("failed-precondition", "This exam is being prepared. Try again soon.");
  const k = snap.data(); cache.set(id, { k, t: Date.now() });
  return k;
}

const MIN_MS = 20000, MAX_MS = 3 * 3600e3;
exports.startExam = R.https.onCall(async (data, ctx) => {
  const uid = needAuth(ctx);
  const courseId = String(data?.courseId || ""), tier = String(data?.tier || "");
  if (!COUNT[tier]) fail("invalid-argument", "Unknown exam.");
  const course = await loadCourse(courseId), pool = course.pools[tier];
  if (!Array.isArray(pool) || !pool.length) fail("failed-precondition", "That exam is not available.");
  /* Tier order is checked up front too, so nobody is handed questions they may not sit. */
  const prior = (await db.doc("examres/" + uid).get()).data() || {};
  const qids = draw(pool, tier, prior[`${courseId}:${tier}`]?.lastQ || [], rnd);
  const ref = db.collection("attempts").doc();
  await ref.set({ uid, courseId, tier, qids, started: Date.now(), used: false });
  db.doc("stats/day_" + day()).set({ examStarts: FV.increment(1) }, { merge: true }).catch(() => {});
  db.doc("stats/pop").set({ ["exam__" + courseId]: FV.increment(1) }, { merge: true }).catch(() => {});
  return { attemptId: ref.id, qids };
});

exports.submitExam = R.https.onCall(async (data, ctx) => {
  const uid = needAuth(ctx);
  const courseId = String(data?.courseId || ""), tier = String(data?.tier || "");
  if (!COUNT[tier]) fail("invalid-argument", "Unknown exam.");
  const course = await loadCourse(courseId);

  /* One attempt, one marking: no replays, no instant submissions, no using another learner's attempt. */
  const aid = String(data?.attemptId || ""), now = Date.now();
  if (!/^[A-Za-z0-9]{10,40}$/.test(aid)) fail("failed-precondition", "Please start the exam again.");
  let qids = null;
  await db.runTransaction(async t => {
    const ref = db.doc("attempts/" + aid), a = await t.get(ref);
    if (!a.exists || a.get("uid") !== uid || a.get("courseId") !== courseId || a.get("tier") !== tier) fail("failed-precondition", "Please start the exam again.");
    if (a.get("used")) fail("already-exists", "This attempt was already used.");
    const age = now - a.get("started");
    if (age < MIN_MS) fail("resource-exhausted", "Please wait a few seconds and try again.");
    if (age > MAX_MS) fail("failed-precondition", "This attempt expired. Start the exam again.");
    if (!Array.isArray(a.get("qids"))) fail("failed-precondition", "Please start the exam again.");
    qids = a.get("qids");
    t.update(ref, { used: true, at: now });
  });

  const rate = db.doc("rate/" + uid);
  await db.runTransaction(async t => {
    const s = await t.get(rate);
    if (now - (s.get("examAt") || 0) < COOLDOWN_MS) fail("resource-exhausted", "Please wait a few seconds before submitting again.");
    t.set(rate, { examAt: now }, { merge: true });
  });

  /* Tier order is enforced here, from results the server recorded itself. */
  const prior = (await db.doc("examres/" + uid).get()).data() || {};
  const passedTier = (t) => !!prior[`${courseId}:${t}`]?.passed;
  if (tier === "i" && !passedTier("b") && !findIn(await mine(uid), "course", courseId)) fail("failed-precondition", "Pass the Beginner exam first.");
  if (tier === "h" && !passedTier("i")) fail("failed-precondition", "Pass the Intermediate exam first.");

  let res;
  try { res = mark(course, tier, qids, data?.answers); } catch { fail("invalid-argument", "The answers are not valid."); }
  if (res.error) fail("invalid-argument", res.error);

  const key = `${courseId}:${tier}`, old = prior[key] || {};
  await db.doc("examres/" + uid).set({ [key]: { best: Math.max(old.best || 0, res.score), n: (old.n || 0) + 1, last: now, lastQ: qids, passed: old.passed || (res.passed ? now : null) } }, { merge: true });

  let out = { ...res, cred: null, renewed: false, extra: [] };
  if (res.passed && tier === "b") out = { ...out, ...(await awardCourse(uid, { id: courseId, title: course.title, level: course.level }, res.score)) };
  if (res.passed && tier === "r") {
    if (!findIn(await mine(uid), "course", courseId)) fail("failed-precondition", "Pass the Beginner exam first.");
    out = { ...out, ...(await awardCourse(uid, { id: courseId, title: course.title, level: course.level }, res.score)) };
  }
  db.doc("stats/day_" + day()).set({ exams: FV.increment(1), examPasses: FV.increment(res.passed ? 1 : 0) }, { merge: true }).catch(() => {});
  return out;
});

/* Called after Client Lab practice: the Professional credential may now be due. */
exports.checkCredentials = R.https.onCall(async (data, ctx) => {
  const uid = needAuth(ctx);
  const L = (await db.doc("learners/" + uid).get()).data() || {};
  const list = await mine(uid);
  return { extra: await checkLevels(uid, String(L.name || "Learner").slice(0, 60), list) };
});

/* Admin only: store one answer-key file made by scripts/build_examkeys.py (a course file, or _meta.json). */
exports.putExamKeys = R.https.onCall(async (data, ctx) => {
  needAdmin(ctx);
  const k = data?.keys;
  if (JSON.stringify(k || {}).length > 900000) fail("invalid-argument", "File is too large.");
  if (Array.isArray(k?.levels) && Array.isArray(k?.courses)) {
    await db.doc("examkeys/_meta").set({ levels: k.levels, courses: k.courses, updated: Date.now() });
    cache.clear();
    return { id: "_meta", questions: 0 };
  }
  const id = String(k?.id || "");
  const p = k?.pools;
  if (!ID.test(id) || !p || typeof k.keys !== "object" || !k.title || !k.level) fail("invalid-argument", "That is not an exam answer-key file.");
  for (const t of ["b", "i", "h", "r"]) {
    if (!Array.isArray(p[t])) fail("invalid-argument", "Answer-key file is malformed.");
    for (const q of p[t]) if (!Array.isArray(k.keys[q]) || !Number.isInteger(k.keys[q][0])) fail("invalid-argument", "Answer-key file is missing an answer for " + q);
  }
  await db.doc("examkeys/" + id).set({ id, title: String(k.title), level: String(k.level), pools: p, keys: k.keys, updated: Date.now() });
  cache.delete(id);
  return { id, questions: Object.keys(k.keys).length };
});

/* Admin only: which course exams have keys uploaded. */
exports.examKeyStatus = R.https.onCall(async (data, ctx) => {
  needAdmin(ctx);
  const snap = await db.collection("examkeys").select("updated").get();
  return snap.docs.map(d => ({ id: d.id, updated: d.get("updated") || 0 }));
});

