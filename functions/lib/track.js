/* First-party analytics: anonymous daily counters, no cookies, no personal data. The admin reads them in adminStats. */
const { db, FV, makeR, fail, day } = require("./common");

const EVENTS = new Set(["view", "login", "signup", "lesson", "mock"]);
const SRC = /^[a-z0-9][a-z0-9.-]{0,29}$/;

exports.track = makeR().https.onCall(async (data) => {
  const e = String(data?.e || ""), src = String(data?.src || "direct").toLowerCase();
  if (!EVENTS.has(e)) fail("invalid-argument", "Unknown event.");
  const patch = { ["ev_" + e]: FV.increment(1) };
  if (e === "view" && SRC.test(src)) patch["src_" + src.replace(/\./g, "_")] = FV.increment(1);
  await db.doc("stats/day_" + day()).set(patch, { merge: true });
  return { ok: true };
});

/* The last `n` days of counters, oldest first. */
exports.trafficDays = async (n = 14) => {
  const ids = []; for (let i = n - 1; i >= 0; i--) ids.push(day(Date.now() - i * 864e5));
  const snaps = await db.getAll(...ids.map(d => db.doc("stats/day_" + d)));
  return snaps.map((s, i) => ({ d: ids[i], ...(s.exists ? s.data() : {}) }));
};
