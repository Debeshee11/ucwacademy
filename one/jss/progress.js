/* Numbers that summarise progress, shared by Home, Courses, Course, Credentials and Team. */
import { D, lesson } from "./data.js";
import * as Store from "./store.js";
import * as Creds from "./creds.js";
import { isoDay, dayMs } from "./dom.js";

export const LABEL = { "mf-industry": "MF industry", flows: "Fund flows", returns: "Reading returns", sip: "SIP and systematic investing", behaviour: "Investor behaviour", costs: "Costs and plans", regulation: "SEBI and regulation", products: "Products", risk: "Risk and suitability", communication: "Client communication", equity: "Equity", debt: "Debt", tax: "Taxation", silver: "Silver", gold: "Gold" };
export const skillsOf = c => { const n = {}; for (const x of c.lessons) for (const t of lesson(x)?.tags || []) n[t] = (n[t] || 0) + 1; return Object.keys(n).sort((a, b) => n[b] - n[a]).map(t => LABEL[t] || t); };
export const questionCount = c => c.lessons.reduce((a, n) => a + (lesson(n)?.qs.length || 0), 0);

/* One level: lessons, module quizzes, exams across its courses, and whether the level credential is earned. */
export function levelStats(lv) {
  const s = Store.get(), cs = D.courses.filter(c => c.level === lv.id);
  let lessons = 0, doneL = 0, mods = 0, doneM = 0, exams = 0, doneE = 0;
  for (const c of cs) {
    lessons += c.lessons.length; doneL += c.lessons.filter(n => s.done[n]).length;
    c.modules.forEach((m, i) => { mods++; if (s.quiz[`m:${c.id}:${i}`]?.passed) doneM++; });
    exams++; if (Creds.find("course", c.id)) doneE++;
  }
  const earned = cs.length > 0 && doneE === cs.length;
  return { courses: cs, lessons, doneL, mods, doneM, exams, doneE, earned, started: doneL > 0, pct: lessons ? Math.round(100 * doneL / lessons) : 0 };
}
export const weekLessons = () => { let n = 0; for (let i = 0; i < 7; i++) n += (s => s.act[isoDay(new Date(Date.now() - i * dayMs))]?.l || 0)(Store.get()); return n; };
export const currentLevel = () => D.levels.find(l => !levelStats(l).earned) || D.levels[D.levels.length - 1];
