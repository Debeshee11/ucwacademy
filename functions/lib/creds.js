/* Credentials are issued here and nowhere else. The browser can read them but never write them.
   Course certificate: from passing a Beginner exam. Level credential and Professional credential: awarded automatically. */
const crypto = require("crypto");
const { db } = require("./common");

const ALPHA = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const VALID_MONTHS = 12;
const newId = () => {
  const s = Array.from({ length: 10 }, () => ALPHA[crypto.randomInt(ALPHA.length)]).join("");
  return `UCO-${s.slice(0, 5)}-${s.slice(5)}`;
};
const untilFrom = ts => { const d = new Date(ts); d.setUTCMonth(d.getUTCMonth() + VALID_MONTHS); return d.getTime(); };

async function mine(uid) {
  const snap = await db.collection("credentials").where("uid", "==", uid).get();
  return snap.docs.map(d => d.data());
}
const findIn = (list, kind, key) => list.find(c => c.kind === kind && c.key === key) || null;

async function issue(uid, name, list, kind, key, title, level, score) {
  const now = Date.now();
  for (let tries = 0; tries < 4; tries++) {
    const c = { id: newId(), uid, name, kind, key, title, level, score, issued: now, until: untilFrom(now) };
    try { await db.doc("credentials/" + c.id).create(c); list.push(c); return c; }
    catch (e) { if (e.code !== 6 && !/already exists/i.test(e.message || "")) throw e; }
  }
  throw new Error("Could not allocate a credential id.");
}

async function renew(c) {
  const until = untilFrom(Date.now()), renewed = Date.now();
  await db.doc("credentials/" + c.id).update({ until, renewed });
  return { ...c, until, renewed };
}

/* Level and Professional credentials, from the course certificates the learner now holds. Returns the ones newly awarded. */
async function checkLevels(uid, name, list) {
  const metaSnap = await db.doc("examkeys/_meta").get();
  if (!metaSnap.exists) return [];
  const meta = metaSnap.data(), out = [];
  for (const lv of meta.levels) {
    const cs = meta.courses.filter(c => c.level === lv.id && !c.optional);
    if (cs.length < 2 || findIn(list, "level", lv.id)) continue;
    const certs = cs.map(c => findIn(list, "course", c.id));
    if (certs.every(Boolean)) out.push(await issue(uid, name, list, "level", lv.id, lv.name + " credential", lv.id, Math.round(certs.reduce((a, c) => a + c.score, 0) / certs.length)));
  }
  if (!findIn(list, "pro", "pro")) {
    const L = (await db.doc("learners/" + uid).get()).data() || {};
    const labs = Object.keys(L.lab && typeof L.lab === "object" ? L.lab : {}).length;
    const certs = meta.courses.map(c => findIn(list, "course", c.id));
    if (labs >= 5 && certs.every(Boolean)) out.push(await issue(uid, name, list, "pro", "pro", "UpperCrust Certified Professional", "expert", Math.round(certs.reduce((a, c) => a + c.score, 0) / certs.length)));
  }
  return out;
}

/* A passed Beginner exam or refresher for one course. Issues the certificate the first time, renews it after. */
async function awardCourse(uid, courseKey, score) {
  const L = (await db.doc("learners/" + uid).get()).data() || {};
  const name = String(L.name || "Learner").slice(0, 60);
  const list = await mine(uid), existing = findIn(list, "course", courseKey.id);
  if (existing) return { cred: await renew(existing), renewed: true, extra: [] };
  const cred = await issue(uid, name, list, "course", courseKey.id, courseKey.title, courseKey.level, score);
  return { cred, renewed: false, extra: await checkLevels(uid, name, list) };
}

module.exports = { mine, findIn, awardCourse, checkLevels, untilFrom, newId };
