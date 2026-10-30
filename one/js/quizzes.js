/* The kinds of quiz: module, exam, refresher, daily, revision and placement. Each picks questions and decides what happens after. */
import { RULES } from "./config.js";
import { D, course, level, questionsFor } from "./data.js";
import { h, pick, shuffle } from "./dom.js";
import * as Store from "./store.js";
import * as Creds from "./creds.js";
import { runQuiz, questionById } from "./quiz.js";
import { orderedCourses } from "./path.js";

const back = c => `#/course/${c.id}`;

export function moduleQuiz(root, cid, mi) {
  const c = course(cid), m = c?.modules[mi];
  if (!m) return void (location.hash = "#/courses");
  const key = `m:${cid}:${mi}`;
  runQuiz(root, {
    title: `${c.title} · Module ${mi + 1}`, questions: pick(questionsFor(m.lessons), RULES.moduleQuestions), pass: RULES.modulePass, exit: back(c),
    done: res => {
      Store.recordQuiz(key, res.score, res.passed);
      const all = Store.courseProgress(c).examReady;
      const nextModule = mi + 1 < c.modules.length;
      return res.passed ? {
        head: "Module passed.", sub: `${res.score}%. ` + (all ? "Every module is done. The course exam is open." : nextModule ? "Next module is ready." : ""),
        actions: [all ? h("a", { class: "btn primary", href: `#/quiz/exam/${cid}` }, "Take the course exam") : nextModule ? h("a", { class: "btn primary", href: `#/lesson/${c.modules[mi + 1].lessons[0]}` }, "Start next module") : null,
          h("a", { class: "btn ghost", href: back(c) }, "Back to course")]
      } : {
        head: "Not yet.", sub: `${res.score}%. You need ${RULES.modulePass}%. Read the lessons again, then try once more.`,
        actions: [h("button", { class: "btn primary", on: { click: () => moduleQuiz(root, cid, mi) } }, "Try again"), h("a", { class: "btn ghost", href: back(c) }, "Back to course")]
      };
    }
  });
}

export function exam(root, cid) {
  const c = course(cid);
  if (!c) return void (location.hash = "#/courses");
  if (!Store.courseProgress(c).examReady) {
    root.replaceChildren(h("main", { class: "wrap page stack" }, h("h1", { class: "h1" }, "Finish the modules first."), h("p", { class: "lead" }, "The exam opens when you have passed every module quiz."), h("a", { class: "btn primary", href: back(c) }, "Back to course")));
    return;
  }
  runQuiz(root, {
    title: `${c.title} · Exam`, questions: pick(questionsFor(c.lessons), RULES.examQuestions), pass: RULES.examPass, exit: back(c),
    done: res => {
      Store.recordQuiz("x:" + cid, res.score, res.passed);
      if (!res.passed) return { head: "Not yet.", sub: `${res.score}%. You need ${RULES.examPass}%. Revise, then try again. A new set of questions is drawn each time.`, actions: [h("a", { class: "btn primary", href: back(c) }, "Back to course")] };
      const r = Creds.awardCourse(cid, res.score);
      const extra = r.extra.map(x => h("p", { class: "pill gold" }, x.title + " earned"));
      return { head: "You passed.", sub: `${res.score}%. Your certificate is ready.`, body: extra.length ? h("div", { class: "row-flex", style: "justify-content:center" }, extra) : null,
        actions: [h("a", { class: "btn primary", href: `#/cert/${r.cred.id}` }, "View certificate"), h("a", { class: "btn ghost", href: back(c) }, "Back to course")] };
    }
  });
}

export function refresher(root, cid) {
  const c = course(cid), cred = Creds.find("course", cid);
  if (!c || !cred) return void (location.hash = "#/me");
  runQuiz(root, {
    title: `${c.title} · Refresher`, questions: pick(questionsFor(c.lessons), RULES.refreshQuestions), pass: RULES.examPass, exit: "#/me",
    done: res => {
      Store.recordQuiz("r:" + cid, res.score, res.passed);
      if (!res.passed) return { head: "Not yet.", sub: `${res.score}%. You need ${RULES.examPass}%. Your certificate stays as it is until you pass.`, actions: [h("a", { class: "btn primary", href: "#/me" }, "Back")] };
      const r = Creds.awardCourse(cid, res.score);
      return { head: "Renewed.", sub: "Your certificate is valid for another 12 months.", actions: [h("a", { class: "btn primary", href: `#/cert/${r.cred.id}` }, "View certificate")] };
    }
  });
}

/* Five questions from what the learner has already studied. Nothing is graded. */
export function daily(root) {
  const s = Store.get();
  let pool = questionsFor(Object.keys(s.done).map(Number));
  if (pool.length < RULES.dailyQuestions) pool = questionsFor(orderedCourses()[0].lessons.slice(0, 5));
  const unseen = pool.filter(q => !s.q[q.id]);
  const qs = [...pick(unseen, 3), ...pick(pool.filter(q => s.q[q.id]), 5)].slice(0, RULES.dailyQuestions);
  runQuiz(root, {
    title: "Daily five", questions: qs.length >= RULES.dailyQuestions ? qs : pick(pool, RULES.dailyQuestions), exit: "#/practice",
    done: res => { Store.markDaily(); return { head: res.right === res.total ? "Perfect." : "Done for today.", sub: `${res.right} of ${res.total} right. Come back tomorrow.`, actions: [h("a", { class: "btn primary", href: "#/" }, "Back home")] }; }
  });
}

/* Questions whose review time has come. */
export function revise(root) {
  const qs = Store.dueIds().map(questionById).filter(Boolean).slice(0, RULES.reviseMax);
  if (!qs.length) {
    root.replaceChildren(h("main", { class: "wrap page stack" }, h("h1", { class: "h1" }, "Nothing to revise."), h("p", { class: "lead" }, "You are up to date. Questions come back when it is time to see them again."), h("a", { class: "btn primary", href: "#/practice" }, "Back")));
    return;
  }
  runQuiz(root, {
    title: "Revise", questions: shuffle(qs), exit: "#/practice",
    done: res => { Store.markRevise(); return { head: "Revision done.", sub: `${res.right} of ${res.total} right. Missed ones return sooner.`, actions: [h("a", { class: "btn primary", href: "#/practice" }, "Back")] }; }
  });
}

/* 24 questions, 8 per level. Where the learner stops getting most right is where they should start. */
export function placement(root) {
  const per = (ids, n) => pick(questionsFor(ids.flatMap(id => course(id).lessons)), n);
  const f = per(["mf-foundations"], 8), p = per(D.courses.filter(c => c.level === "practitioner" && !c.optional).map(c => c.id), 8), x = per(["fund-analysis"], 8);
  const tag = (qs, lv) => qs.map(q => ({ ...q, lv }));
  runQuiz(root, {
    title: "Placement test", questions: [...tag(f, "foundation"), ...tag(p, "practitioner"), ...tag(x, "expert")], record: false, exit: "#/",
    done: res => {
      const sc = lv => { const a = res.answers.filter(z => z.q.lv === lv); return a.length ? a.filter(z => z.ok).length / a.length : 0; };
      const start = sc("foundation") < .6 ? "foundation" : sc("practitioner") < .6 ? "practitioner" : "expert";
      Store.setStart(start);
      const lv = level(start);
      return { head: `Start at ${lv.name}.`, sub: `That is the ${lv.alias.toLowerCase()} level. You can still open any course.`, actions: [h("a", { class: "btn primary", href: "#/" }, "See my path")] };
    }
  });
}

/* ——— Mutual fund and market quizzes ——— */
const finish = (title, again, exit) => res => ({
  head: res.right / res.total >= .8 ? "Sharp." : "Keep going.", sub: `${res.right} of ${res.total} right. Missed ones return in Revise.`,
  actions: [h("a", { class: "btn primary", href: again }, "Another round"), h("a", { class: "btn ghost", href: exit }, "Back")]
});
export function fundQuiz(root, group) {
  const qs = D.fundqs.filter(q => !group || q.group === group);
  runQuiz(root, { title: "Fund quiz", questions: pick(qs, 10), record: true, exit: "#/funds", done: finish("Fund quiz", "#/quiz/fund" + (group ? "/" + group : ""), "#/funds") });
}
export function marketQuiz(root) {
  const econ = questionsFor(course("economy-markets")?.lessons || []);
  runQuiz(root, { title: "Market quiz", questions: pick([...econ, ...D.indexqs], 12), record: true, exit: "#/practice", done: finish("Market quiz", "#/quiz/market", "#/practice") });
}
export function indexQuiz(root, id) {
  const ix = D.indices.find(x => x.id === id);
  const own = D.indexqs.filter(q => q.scope === id), gen = D.indexqs.filter(q => q.scope === "general");
  runQuiz(root, { title: ix ? ix.name + " quiz" : "Index quiz", questions: pick([...own, ...gen], 6), record: true, exit: ix ? "#/index/" + id : "#/indices", done: finish("Index quiz", "#/quiz/index/" + id, ix ? "#/index/" + id : "#/indices") });
}
