/* Course content: courses.json (structure), lessons.json (90 lessons), sims.json (client scenarios), tx-*.json (Hindi and Gujarati questions). */
export const D = { levels: [], courses: [], soon: [], lessons: {}, sims: [], tx: {} };

const j = async path => { const r = await fetch(path); if (!r.ok) throw new Error(path + " " + r.status); return r.json(); };

export async function loadData() {
  const [c, l, s] = await Promise.all([j("one/data/courses.json"), j("one/data/lessons.json"), j("one/data/sims.json")]);
  D.levels = c.levels; D.courses = c.courses; D.soon = c.soon; D.sims = s;
  for (const x of l) D.lessons[x.n] = x;
  for (const co of D.courses) co.lessons = co.modules.flatMap(m => m.lessons);
}

export async function loadTx(lang) {
  if (lang === "en" || D.tx[lang]) return;
  try { D.tx[lang] = await j(`one/data/tx-${lang}.json`); } catch { D.tx[lang] = {}; }
}

export const level = id => D.levels.find(l => l.id === id);
export const course = id => D.courses.find(c => c.id === id);
export const lesson = n => D.lessons[n];
export const courseOf = n => D.courses.find(c => c.lessons.includes(n));
export const moduleIndexOf = (c, n) => c.modules.findIndex(m => m.lessons.includes(n));
export const coursesIn = lv => D.courses.filter(c => c.level === lv);

/* Questions for a set of lessons, each tagged with its lesson number. */
export const questionsFor = nums => nums.flatMap(n => (D.lessons[n]?.qs || []).map(q => ({ ...q, n })));

/* Show a question in the learner's language when a translation exists. Option order and the answer index never change. */
export function localize(q, lang) {
  const t = lang !== "en" && D.tx[lang]?.[q.id];
  if (!t) return q;
  return { ...q, prompt: t[0], options: t[1], why: t[2] || q.why };
}

/* The ordered parts of a lesson. Lessons 1 to 15 carry all six; the rest carry what they have. */
export function partsOf(l) {
  const out = [];
  if (l.story) out.push({ k: "story", title: "The big story" });
  out.push({ k: "concept", title: l.deep ? "The idea" : "Key facts" });
  if (l.client) out.push({ k: "client", title: "Think like a client" });
  out.push({ k: "quiz", title: "Check yourself" });
  if (l.talk) out.push({ k: "talk", title: l.deep ? "In the conversation" : "What to tell a client" });
  if (l.remember?.length) out.push({ k: "remember", title: "Remember" });
  return out;
}
