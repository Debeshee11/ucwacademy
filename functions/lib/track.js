/* First-party analytics: anonymous daily counters, no cookies, no personal data. The admin reads them in adminStats. */
const { db, FV, makeR, fail, day } = require("./common");

const EVENTS = new Set(["view", "login", "signup", "lesson", "mock", "review"]);
const SRC = /^[a-z0-9][a-z0-9.-]{0,29}$/;

/* "What people like": counts per page, course, lesson, news topic. Keys look like course:sip-planning. */
const POP = /^(page|course|lesson|nism|fund|index|news|exam):[A-Za-z0-9_-]{1,40}$/;

/* Abuse guards. The endpoint works before sign-in, so it is limited per address, and the popularity list can only hold a fixed number of keys. */
const MAX_POP_KEYS = 600, LIMIT_PER_MIN = 40;
const hits = new Map();
const tooMany = ctx => {
  const h = ctx?.rawRequest?.headers || {}, ip = String(h["x-forwarded-for"] || ctx?.rawRequest?.ip || "?").split(",")[0].trim(), t = Math.floor(Date.now() / 60000);
  const rec = hits.get(ip); if (!rec || rec.t !== t) { hits.set(ip, { t, n: 1 }); if (hits.size > 5000) hits.clear(); return false; }
  return ++rec.n > LIMIT_PER_MIN;
};
let srcDay = "", srcSeen = new Set();
const srcKey = src => {
  const d = day(); if (d !== srcDay) { srcDay = d; srcSeen = new Set(); }
  if (!SRC.test(src)) return "other";
  if (!srcSeen.has(src) && srcSeen.size >= 150) return "other";
  srcSeen.add(src); return src;
};
let known = null, knownAt = 0;
async function popAllowed(key) {
  if (!known || Date.now() - knownAt > 5 * 60e3) { known = new Set(Object.keys((await db.doc("stats/pop").get()).data() || {})); knownAt = Date.now(); }
  if (known.has(key)) return true;
  if (known.size >= MAX_POP_KEYS) return false;
  known.add(key); return true;
}

exports.track = makeR().https.onCall(async (data, ctx) => {
  if (tooMany(ctx)) fail("resource-exhausted", "Slow down.");
  if (data?.e === "pop") {
    const k = String(data.k || "");
    if (!POP.test(k)) fail("invalid-argument", "Unknown key.");
    const field = k.replace(":", "__");
    if (!(await popAllowed(field))) return { ok: true, skipped: true };
    await db.doc("stats/pop").set({ [field]: FV.increment(1) }, { merge: true });
    return { ok: true };
  }
  const e = String(data?.e || ""), src = String(data?.src || "direct").toLowerCase();
  if (!EVENTS.has(e)) fail("invalid-argument", "Unknown event.");
  const patch = { ["ev_" + e]: FV.increment(1) };
  if (e === "view") patch["src_" + srcKey(src).replace(/\./g, "_")] = FV.increment(1);
  await db.doc("stats/day_" + day()).set(patch, { merge: true });
  return { ok: true };
});

/* Top counts per kind, e.g. { course: [["sip-planning", 40], ...] }. */
exports.popular = async (top = 10) => {
  const d = (await db.doc("stats/pop").get()).data() || {}, by = {};
  for (const [k, v] of Object.entries(d)) { const [kind, ...rest] = k.split("__"); (by[kind] = by[kind] || []).push([rest.join("__"), v]); }
  for (const k of Object.keys(by)) by[k] = by[k].sort((a, b) => b[1] - a[1]).slice(0, top);
  return by;
};

/* The last `n` days of counters, oldest first. */
exports.trafficDays = async (n = 14) => {
  const ids = []; for (let i = n - 1; i >= 0; i--) ids.push(day(Date.now() - i * 864e5));
  const snaps = await db.getAll(...ids.map(d => db.doc("stats/day_" + d)));
  return snaps.map((s, i) => ({ d: ids[i], ...(s.exists ? s.data() : {}) }));
};
