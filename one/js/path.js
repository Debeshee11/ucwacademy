/* Where the learner goes next. Pure functions over progress. */
import { D, course, courseOf, moduleIndexOf } from "./data.js";
import * as Store from "./store.js";

/* Courses in the order this learner should meet them: from their starting level onward, then the rest. */
export function orderedCourses() {
  const core = D.courses.filter(c => !c.optional);
  const s = Store.get().start, i = s ? core.findIndex(c => c.level === s) : 0;
  const k = i < 0 ? 0 : i;
  return [...core.slice(k), ...core.slice(0, k)];
}

/* The single best next step. { kind: "lesson"|"module"|"exam", course, n?, module? } or null when everything is done. */
export function nextUp(prefer) {
  const s = Store.get();
  const list = prefer ? [course(prefer), ...orderedCourses().filter(c => c.id !== prefer)] : orderedCourses();
  /* resume the lesson that was open, if it is unfinished */
  if (!prefer && s.last && !s.done[s.last] && courseOf(s.last)) return { kind: "lesson", n: s.last, course: courseOf(s.last) };
  for (const c of list) {
    for (let m = 0; m < c.modules.length; m++) {
      const mod = c.modules[m];
      const n = mod.lessons.find(x => !s.done[x]);
      if (n) return { kind: "lesson", n, course: c };
      if (!s.quiz[`m:${c.id}:${m}`]?.passed) return { kind: "module", module: m, course: c };
    }
    if (!s.quiz["x:" + c.id]?.passed) return { kind: "exam", course: c };
  }
  return null;
}

export const nextLessonAfter = n => {
  const c = courseOf(n), i = c.lessons.indexOf(n);
  return c.lessons[i + 1] || null;
};
export const hrefFor = step => !step ? "#/courses" : step.kind === "lesson" ? `#/lesson/${step.n}` : step.kind === "module" ? `#/quiz/module/${step.course.id}/${step.module}` : `#/quiz/exam/${step.course.id}`;
export const labelFor = step => {
  if (!step) return "Browse courses";
  const s = Store.get();
  if (step.kind === "lesson") return s.done[step.n] ? "Review lesson" : (s.part[step.n] || 0) > 0 ? "Continue lesson" : "Start lesson";
  return step.kind === "module" ? "Take the module quiz" : "Take the Beginner exam";
};
export const moduleOf = n => { const c = courseOf(n); return { course: c, index: moduleIndexOf(c, n) }; };
