/* Reviews and ratings. Written only here, so stars and notes cannot be forged from the browser.
   Rated areas and tags come from fixed lists. A note is public only after the admin approves it. */
const { db, makeR, fail, needAuth, needAdmin } = require("./common");

const R = makeR();
const AREAS = ["content", "exams", "design", "speed", "guidance"];
const TAGS = ["clear", "practical", "beginner-friendly", "good-exams", "fun", "needs-more-content", "too-hard", "too-easy", "bug", "idea"];
const WAIT_MS = 30000;
const star = v => { const n = Number(v); return Number.isInteger(n) && n >= 1 && n <= 5 ? n : 0; };

exports.submitReview = R.https.onCall(async (data, ctx) => {
  const uid = needAuth(ctx), now = Date.now();
  const stars = star(data && data.stars);
  if (!stars) fail("invalid-argument", "Pick 1 to 5 stars.");
  const areas = {};
  for (const a of AREAS) { const v = star(data.areas && data.areas[a]); if (v) areas[a] = v; }
  const tags = [...new Set((Array.isArray(data.tags) ? data.tags : []).map(String).filter(t => TAGS.includes(t)))].slice(0, 6);
  const note = String(data.note || "").replace(/\s+/g, " ").trim().slice(0, 500);
  const recommend = data.recommend === true ? 1 : data.recommend === false ? 0 : null;
  const ref = db.doc("reviews/" + uid), prev = (await ref.get()).data();
  if (prev && now - (prev.at || 0) < WAIT_MS) fail("resource-exhausted", "Please wait a few seconds before saving again.");
  const l = (await db.doc("learners/" + uid).get()).data() || {};
  const parts = String(l.name || "").trim().split(/\s+/);
  const name = (parts.length > 1 ? parts[0] + " " + parts[parts.length - 1][0].toUpperCase() + "." : parts[0] || "Learner").slice(0, 40);
  /* A note needs approval before others see it. Unchanged notes keep their earlier decision. */
  const same = prev && prev.note === note;
  const ok = note ? (same ? !!prev.ok : false) : false;
  await ref.set({ uid, name, stars, areas, tags, note, recommend, ok, door: String(l.door || "").slice(0, 20), first: (prev && prev.first) || now, at: now, n: ((prev && prev.n) || 0) + 1 });
  return { ok: true, pending: !!note && !ok };
});

/* Admin: approve, hide or delete a review. */
exports.moderateReview = R.https.onCall(async (data, ctx) => {
  needAdmin(ctx);
  const id = String(data && data.id || "");
  if (!/^[A-Za-z0-9]{10,40}$/.test(id)) fail("invalid-argument", "Bad id.");
  const ref = db.doc("reviews/" + id);
  if (data.act === "delete") await ref.delete();
  else if (data.act === "approve" || data.act === "hide") await ref.update({ ok: data.act === "approve" });
  else fail("invalid-argument", "Unknown action.");
  return { ok: true };
});

exports.AREAS = AREAS; exports.TAGS = TAGS;
