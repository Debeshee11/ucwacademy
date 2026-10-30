/* The syllabus for one exam: a study guide built from the course's lessons, with the extras that make it worth reading. */
import { RULES } from "./config.js";
import { h, icon } from "./dom.js";
import { D, course, lesson, level, TIERS, examMeta, examPool } from "./data.js";
import * as Store from "./store.js";
import { widePage, notFound, levelTag } from "./ui.js";

const STYLE = {
  b: { emoji: "🌱", verb: "Know it", intro: "Words, ideas and rules. If you can say each line below in your own words, you are ready.", pts: l => l.remember || [], ptsTitle: "Remember" },
  i: { emoji: "🔧", verb: "Use it", intro: "Now you apply it. Expect numbers, comparisons and “which is right here?” questions. Read the ideas, then try them on a client you know.", pts: l => l.concept || [], ptsTitle: "Ideas to master" },
  h: { emoji: "🎯", verb: "Advise with it", intro: "Real clients, grey areas, traps. Hard questions reward judgement, not memory. Read the situations and say the answer aloud before you look.", pts: () => [], ptsTitle: "" }
};

export function syllabus(cid, tier) {
  const c = course(cid), T = TIERS().find(t => t.id === tier);
  if (!c || !T) return notFound("That syllabus does not exist.");
  const S = STYLE[tier], meta = examMeta(cid), s = Store.get(), P = Store.courseProgress(c);
  const open = tier === "b" ? P.examReady : !!P.exams[tier === "i" ? "b" : "i"]?.passed, mine = P.exams[tier], pass = RULES.tierPass[tier];
  const lessonCard = n => {
    const l = lesson(n), pts = S.pts(l);
    return h("div", { class: "card stack stack-s syl-l" },
      h("div", { class: "row-flex between" }, h("h3", { class: "h3" }, l.title), s.done[n] ? h("span", { class: "pill ok" }, "Read") : h("a", { class: "small", href: `#/lesson/${n}` }, "Read lesson")),
      tier === "h" && l.client ? h("div", { class: "stack stack-xs" },
        h("div", { class: "eyebrow" }, "The client says"), h("p", { class: "syl-q" }, l.client.quote), l.client.context ? h("p", { class: "small mute" }, l.client.context) : null,
        l.talk ? h("div", { class: "eyebrow", style: "margin-top:6px" }, "A strong answer sounds like") : null, l.talk ? h("p", {}, l.talk) : null) : null,
      pts.length ? h("div", { class: "stack stack-xs" }, h("div", { class: "eyebrow" }, S.ptsTitle), h("ul", { class: "facts" }, pts.map(t => h("li", {}, t)))) : null,
      tier === "h" && !l.client ? h("ul", { class: "facts" }, (l.concept || []).slice(0, 3).map(t => h("li", {}, t))) : null);
  };
  const cheat = [...new Set(c.lessons.flatMap(n => lesson(n).remember || []))];
  const tabs = h("div", { class: "utabs", role: "tablist" }, TIERS().map(t => h("a", { role: "tab", class: "syl-tab", "aria-selected": String(t.id === tier), href: `#/syllabus/${cid}/${t.id}`, style: "text-decoration:none" }, t.name)));
  return widePage(
    h("section", { class: "hero stack" },
      h("a", { class: "small", href: `#/course/${cid}` }, icon("left", 16), c.title),
      h("div", { class: "row-flex", style: "gap:10px" }, levelTag(level(c.level)), h("span", { class: "pill gold" }, `${S.emoji} ${T.name} exam`), mine?.passed ? h("span", { class: "pill ok" }, `Passed · best ${mine.best}%`) : null),
      h("h1", { class: "h1", style: "font-size:clamp(30px,5vw,44px)" }, `${T.name} syllabus: ${S.verb}`),
      h("p", { class: "lead" }, meta.hook || c.blurb),
      h("div", { class: "stats" }, h("span", {}, h("b", {}, RULES.examQuestions), " questions"), h("span", {}, h("b", {}, pass + "%"), " to pass"), h("span", {}, h("b", {}, c.lessons.length), " lessons covered"), h("span", {}, h("b", {}, Math.min(examPool(c, tier).length, 99)), " in the question bank")),
      h("div", { class: "row-flex" }, open ? h("a", { class: "btn primary", href: `#/quiz/exam/${cid}/${tier}` }, mine ? "Retake the exam" : "Start the exam") : h("span", { class: "pill" }, tier === "b" ? "Opens after every module quiz" : `Opens after the ${tier === "i" ? "Beginner" : "Intermediate"} exam`))),
    h("div", { class: "cols" },
      h("div", { class: "stack stack-l" }, tabs,
        h("section", { class: "stack" }, h("h2", { class: "h2" }, `${S.emoji} What this exam is about`), h("p", { class: "lead" }, T.blurb), h("p", {}, S.intro)),
        h("section", { class: "stack" }, h("h2", { class: "h2" }, "🗺️ The study map"), ...c.modules.map((m, mi) => h("div", { class: "stack" },
          h("div", { class: "eyebrow" }, `Module ${mi + 1}`), h("h3", { class: "h2" }, m.title), ...m.lessons.map(lessonCard)))),
        meta.fun?.length ? h("section", { class: "stack" }, h("h2", { class: "h2" }, "💡 Did you know?"), ...meta.fun.map(t => h("div", { class: "card tint" }, h("p", {}, t)))) : null,
        meta.traps?.length ? h("section", { class: "stack" }, h("h2", { class: "h2" }, "🪤 Traps the exam loves"), h("ul", { class: "facts" }, meta.traps.map(t => h("li", {}, t)))) : null,
        tier !== "b" && cheat.length ? h("section", { class: "stack" }, h("h2", { class: "h2" }, "🧾 One-page cheat sheet"), h("ul", { class: "facts" }, cheat.map(t => h("li", {}, t)))) : null),
      h("aside", {}, h("div", { class: "card stack" }, h("h3", { class: "h3" }, "How to prepare"),
        h("div", { class: "stack stack-s small" }, ["Read the study map once, slowly.", "Close it and say each “Remember” line from memory.", "Check the traps list. Most wrong answers are traps.", "Take the exam. A new set of questions is drawn each time."].map((t, i) => h("div", { class: "row-flex", style: "gap:10px;align-items:flex-start;flex-wrap:nowrap" }, h("b", {}, i + 1 + "."), h("span", {}, t)))),
        open ? h("a", { class: "btn primary", href: `#/quiz/exam/${cid}/${tier}` }, "Start the exam") : null))));
}
