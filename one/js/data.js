import { getContent, getOne } from "./content.js";
import { questionFor } from "./audience.js";
/* Course content: courses.json (structure), lessons.json (90 lessons), sims.json (client scenarios), tx-*.json (Hindi and Gujarati questions). */
export const D = { levels: [], courses: [], lessons: {}, sims: [], tx: {}, live: { funds: {}, months: {} }, auto: { groups: [], funds: {}, updated: "" }, holdQs: [], sections: [], exams: { tiers: [], courses: {} }, fundGroups: [], funds: {}, fundSource: "", fundqs: [], indices: [], companies: { en: {}, tx: {} }, indexqs: [] };

export async function loadData() {
  const N = ["courses", "lessons", "sims", "funds", "fundqs", "indices", "companies", "indexqs", "exams"];
  const R = await getContent(N);
  const [c, l, s, f, fq, ix, co, iq, ex] = N.map(n => R[n]);
  D.fundGroups = f.groups; D.funds = f.funds; D.fundSource = f.source; D.fundqs = fq; D.indices = ix; D.companies = co; D.indexqs = iq; D.exams = ex;
  D.levels = c.levels; D.sections = c.sections || []; D.courses = c.courses; D.sims = s;
  for (const x of l) D.lessons[x.n] = x;
  for (const co of D.courses) co.lessons = co.modules.flatMap(m => m.lessons);
}

export async function loadTx(lang) {
  if (lang === "en" || D.tx[lang]) return;
  try { D.tx[lang] = await getOne(`tx-${lang}`); } catch { D.tx[lang] = {}; }
  /* Lesson text (title, key facts, client talk, remember) in this language, by lesson number. Lessons without it stay in English. */
  try {
    const lt = await getOne(`lt-${lang}`);
    for (const [n, v] of Object.entries(lt || {})) { const l = D.lessons[n]; if (!l) continue; if (l._o) Object.assign(l._o, v); Object.assign(l, v); }
  } catch {}
}

/* Text that may be a plain string or {en,hi,gu}. */
export const t3 = (v, lang) => (v && typeof v === "object" ? v[lang] || v.en : v) || "";

export const level = id => D.levels.find(l => l.id === id);
export const course = id => D.courses.find(c => c.id === id);
export const lesson = n => D.lessons[n];
export const courseOf = n => D.courses.find(c => c.lessons.includes(n));
export const moduleIndexOf = (c, n) => c.modules.findIndex(m => m.lessons.includes(n));
export const coursesIn = lv => D.courses.filter(c => c.level === lv && !c.optional);

/* A rewritten lesson keeps its earlier questions, marked "legacy", so exams already set from them still find them by id.
   Learners practise on the new questions; the earlier ones are used only when a lesson has nothing newer. */
export const liveQs = l => { const all = l?.qs || [], fresh = all.filter(q => !q.legacy); return fresh.length ? fresh : all; };
/* Questions for a set of lessons, each tagged with its lesson number. Pass all = true to include legacy questions (exam look-ups by id). */
export const questionsFor = (nums, all) => nums.flatMap(n => (all ? D.lessons[n]?.qs || [] : liveQs(D.lessons[n])).map(q => ({ ...q, n })));

/* Show a question in the learner's language when a translation exists. Option order and the answer index never change. */
export function localize(q, lang) {
  const t = lang !== "en" && D.tx[lang]?.[q.id];
  if (!t) return questionFor(q);
  return { ...q, prompt: t[0], options: t[1], why: t[2] || q.why };
}

/* The ordered parts of a lesson. Lessons 1 to 15 carry all six; the rest carry what they have.
   A lesson written to the new standard may add a worked example (l.example) and a calculator to try (l.tool).
   pro = the learner advises others (adviser, partner or team door): they see the client wording; everyone else sees it as their own money. */
export function partsOf(l, pro = true) {
  const out = [];
  if (l.story) out.push({ k: "story", title: l.story.kicker || "The big story" });
  out.push({ k: "concept", title: l.deep ? "The idea" : "Key facts" });
  if (l.example) out.push({ k: "example", title: "Worked example" });
  if (l.tool) out.push({ k: "tool", title: "Try it" });
  if (l.client) out.push({ k: "client", title: pro ? "Think like a client" : "A common question" });
  out.push({ k: "quiz", title: "Check yourself" });
  if (l.talk) out.push({ k: "talk", title: !pro ? "The short answer" : l.deep ? "In the conversation" : "What to tell a client" });
  if (l.remember?.length) out.push({ k: "remember", title: "Remember" });
  return out;
}

/* The three exams of a course: Beginner, Intermediate, Hard. */
export const TIERS = () => D.exams.tiers;
export const examPool = (c, tier) => tier === "b"
  ? [...questionsFor(c.lessons, true), ...(D.exams.courses[c.id]?.qs?.b || [])]
  : (D.exams.courses[c.id]?.qs?.[tier] || []);
export const examMeta = cid => D.exams.courses[cid] || {};
