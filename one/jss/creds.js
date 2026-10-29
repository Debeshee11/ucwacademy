/* Credentials. A course certificate comes from passing the course exam. A level credential (Practitioner, which spans several courses)
   and the Professional credential are awarded automatically when their courses are done. Each is published to credentials/<id>
   so anyone with the link can verify it. Valid for RULES.validMonths; a refresher renews it. */
import { RULES } from "./config.js";
import { db } from "./fb.js";
import { dayMs } from "./dom.js";
import { D, course, level, coursesIn } from "./data.js";
import * as Store from "./store.js";

const ALPHA = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
function newId() {
  const a = new Uint32Array(10); crypto.getRandomValues(a);
  const s = [...a].map(x => ALPHA[x % ALPHA.length]).join("");
  return `UCO-${s.slice(0, 5)}-${s.slice(5)}`;
}
const untilFrom = ts => { const d = new Date(ts); d.setMonth(d.getMonth() + RULES.validMonths); return d.getTime(); };

export const all = () => Object.values(Store.get().creds).sort((a, b) => b.issued - a.issued);
export const find = (kind, key) => all().find(c => c.kind === kind && c.key === key) || null;
export function standing(c) {
  const left = c.until - Date.now();
  return left < 0 ? "expired" : left < 30 * dayMs ? "soon" : "valid";
}

function publish(c) {
  const d = db(); if (!d) return;
  d.doc("credentials/" + c.id).set({ ...c, uid: Store.userId(), name: Store.get().name }).catch(e => console.warn("Could not publish credential", e));
}

function issue(kind, key, title, lv, score) {
  const now = Date.now();
  const c = { id: newId(), kind, key, title, level: lv, score, issued: now, until: untilFrom(now) };
  Store.addCredential(c); publish(c);
  return c;
}

/* Called when a course exam or refresher is passed. Returns { cred, renewed, extra: [credentials awarded as a result] }. */
export function awardCourse(courseId, score) {
  const co = course(courseId), existing = find("course", courseId), extra = [];
  if (existing) {
    const until = untilFrom(Date.now());
    Store.renewCredential(existing.id, until); publish({ ...existing, until, renewed: Date.now() });
    return { cred: { ...existing, until }, renewed: true, extra };
  }
  const cred = issue("course", courseId, co.title, co.level, score);
  extra.push(...checkLevels());
  return { cred, renewed: false, extra };
}

function checkLevels() {
  const out = [];
  for (const lv of D.levels) {
    const cs = coursesIn(lv.id);
    if (cs.length < 2 || find("level", lv.id)) continue;
    const certs = cs.map(c => find("course", c.id));
    if (certs.every(Boolean)) out.push(issue("level", lv.id, lv.name + " credential", lv.id, Math.round(certs.reduce((a, c) => a + c.score, 0) / certs.length)));
  }
  const labDone = Object.keys(Store.get().lab).length >= 5;
  if (!find("pro", "pro") && D.courses.every(c => find("course", c.id)) && labDone) {
    const certs = D.courses.map(c => find("course", c.id));
    out.push(issue("pro", "pro", "UpperCrust Certified Professional", "expert", Math.round(certs.reduce((a, c) => a + c.score, 0) / certs.length)));
  }
  return out;
}
/* Also called when Client Lab practice may have completed the Professional requirements. */
export const recheck = () => checkLevels();

export async function fetchPublic(id) {
  const d = db(); if (!d) throw new Error("offline");
  const snap = await d.doc("credentials/" + id).get();
  return snap.exists ? snap.data() : null;
}

export const kindLabel = c => c.kind === "pro" ? "Professional credential" : c.kind === "level" ? "Level credential" : "Course certificate";
export const levelLabel = c => { const l = level(c.level); return l ? `${l.name} · ${l.alias}` : ""; };
export const verifyUrl = id => `${location.origin}${location.pathname}#/verify/${id}`;
