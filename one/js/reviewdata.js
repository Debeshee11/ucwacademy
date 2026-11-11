/* Review data: what to ask, how points are earned, and the calls to the backend. No screen code here. */
import { db, fns } from "./fb.js";
import * as Store from "./store.js";

export const AREAS = [["content", "Lessons and content"], ["exams", "Quizzes and exams"], ["design", "Look and feel"], ["speed", "Speed and reliability"], ["guidance", "Guidance for me"]];
export const TAGS = [["clear", "Clear explanations"], ["practical", "Practical"], ["beginner-friendly", "Beginner friendly"], ["good-exams", "Good exams"], ["fun", "Fun to use"],
  ["needs-more-content", "Needs more content"], ["too-hard", "Too hard"], ["too-easy", "Too easy"], ["bug", "Found a bug"], ["idea", "I have an idea"]];
export const MOODS = ["", "Not for me", "Needs work", "It is okay", "Really good", "Love it"];
export const LEVELS = [[0, "Spark"], [20, "Contributor"], [45, "Insider"], [65, "Champion"]];

/* Feedback points: for effort, never for a particular opinion. A one-star honest review earns the same as five stars. */
export function points(r) {
  const areas = Object.keys(r.areas || {}).length, tags = (r.tags || []).length, note = (r.note || "").trim().length;
  return (r.stars ? 10 : 0) + areas * 5 + Math.min(tags, 3) * 3 + (note >= 40 ? 20 : note > 0 ? 8 : 0) + (r.recommend === 0 || r.recommend === 1 ? 5 : 0);
}
export const levelOf = p => { let i = 0; LEVELS.forEach(([t], k) => { if (p >= t) i = k; }); const n = LEVELS[i + 1]; return { name: LEVELS[i][1], next: n ? n[1] : "", need: n ? n[0] - p : 0, pct: n ? Math.round(100 * (p - LEVELS[i][0]) / (n[0] - LEVELS[i][0])) : 100 }; };

export function badges(r) {
  const t = r.tags || [], n = (r.note || "").trim().length;
  return [["First review", "Shared your view", !!r.stars], ["All five", "Rated every area", Object.keys(r.areas || {}).length === AREAS.length],
    ["Storyteller", "Wrote 40+ characters", n >= 40], ["Idea spark", "Shared an idea", t.includes("idea")], ["Bug hunter", "Reported a bug", t.includes("bug")], ["Advocate", "Said whether you would recommend", r.recommend === 0 || r.recommend === 1]];
}

export async function mine() {
  const d = db(), u = Store.userId(); if (!d || !u) return null;
  const s = await d.doc("reviews/" + u).get(); return s.exists ? s.data() : null;
}
export async function wall() {
  const d = db(); if (!d) return [];
  const s = await d.collection("reviews").where("ok", "==", true).limit(30).get();
  return s.docs.map(x => ({ id: x.id, ...x.data() })).sort((a, b) => (b.at || 0) - (a.at || 0));
}
export async function send(r) {
  const f = fns(); if (!f) throw new Error("Could not reach the server.");
  return (await f.httpsCallable("submitReview")({ stars: r.stars, areas: r.areas, tags: r.tags, note: r.note, recommend: r.recommend })).data;
}
