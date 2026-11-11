/* First-party analytics: anonymous daily counters, no cookies, no personal data. The admin reads them in adminStats. */
const { db, FV, makeR, fail, day } = require("./common");

const EVENTS = new Set(["view", "login", "signup", "lesson", "mock", "review"]);
const SRC = /^[a-z0-9][a-z0-9.-]{0,29}$/;

/* "What people like": counts per page, course, lesson, news topic. Keys look like course:sip-planning. */
const POP = /^(page|course|lesson|nism|fund|index|news|exam):[A-Za-z0-9_-]{1,50}$/;

exports.track = makeR().https.onCall(async (data) => {
  if (data?.e === "pop") {
    const k = String(data.k || "");
    if (!POP.test(k)) fail("invalid-argument", "Unknown key.");
    await db.doc("stats/pop").set({ [k.replace(":", "__")]: FV.increment(1) }, { merge: true });
    return { ok: true };
  }
  const e = String(data?.e || ""), src = String(data?.src || "direct").toLowerCase();
  if (!EVENTS.has(e)) fail("invalid-argument", "Unknown event.");
  const patch = { ["ev_" + e]: FV.increment(1) };
  if (e === "view" && SRC.test(src)) patch["src_" + src.replace(/\./g, "_")] = FV.increment(1);
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
