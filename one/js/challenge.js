/* Challenge a friend. Five questions, a score, and a link. No server: the link itself carries the question ids, the challenger's first name and score.
   The friend plays the same five and sees both scores side by side. */
import { h, icon, toast, pick } from "./dom.js";
import * as Store from "./store.js";
import { questionsFor } from "./data.js";
import { orderedCourses } from "./path.js";
import { runQuiz, questionById } from "./quiz.js";
import { page } from "./ui.js";

const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const dec = s => { try { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))))); } catch { return null; } };
const linkFor = o => `${location.origin}${location.pathname}#/challenge/${enc(o)}`;
const firstName = () => (Store.get().name || "").split(" ")[0] || "A friend";

function share(o, my) {
  const url = linkFor(o), text = `${o.n} scored ${o.s} out of ${o.q.length} on a UpperCrust Academy challenge. Can you beat it? ${url}`;
  return h("div", { class: "stack stack-s" },
    h("a", { class: "btn gold big", href: `https://wa.me/?text=${encodeURIComponent(text)}`, target: "_blank", rel: "noopener" }, icon("share", 20), "Send on WhatsApp"),
    h("button", { class: "btn ghost", type: "button", on: { click: async () => { try { await navigator.clipboard.writeText(url); toast("Link copied"); } catch { toast("Copy the link from the address bar of the next page"); } } } }, icon("copy", 18), "Copy the link"));
}

function play(root, ids, from) {
  const qs = ids.map(questionById).filter(Boolean);
  runQuiz(root, {
    title: from ? `${from.n}'s challenge` : "Challenge a friend", questions: qs, exit: "#/challenge",
    done: res => {
      const mine = { n: firstName(), s: res.right, q: ids };
      if (from) {
        const w = res.right > from.s ? "You win." : res.right === from.s ? "A tie." : `${from.n} wins this round.`;
        return { head: w, sub: `You ${res.right}, ${from.n} ${from.s}, out of ${qs.length}.`, actions: [h("a", { class: "btn gold big", href: `#/challenge/${enc({ ...mine })}` }, "Send my score back"), h("a", { class: "btn ghost", href: "#/" }, "Back to Learn")] };
      }
      return { head: `You scored ${res.right} of ${qs.length}.`, sub: "Send the challenge. Your friend plays the same five questions.", actions: [share(mine), h("a", { class: "btn ghost", href: "#/" }, "Back to Learn")] };
    }
  });
}

export function challenge(root, code) {
  const from = code ? dec(code) : null;
  if (from && Array.isArray(from.q) && from.q.length) {
    const body = h("div", { class: "stack" },
      h("div", { class: "card stack stack-s", style: "text-align:center" },
        h("h1", { class: "h1" }, `${from.n} challenged you`),
        h("p", { class: "lead" }, `They scored ${from.s} out of ${from.q.length}. Five questions, about two minutes.`),
        h("button", { class: "btn gold big", type: "button", on: { click: () => play(root, from.q, from) } }, "Accept the challenge")));
    return void root.replaceChildren(page(h("a", { class: "linkish", href: "#/" }, "← Back to Learn"), body));
  }
  const s = Store.get();
  let pool = questionsFor(Object.keys(s.done).map(Number));
  if (pool.length < 5) pool = questionsFor(orderedCourses()[0].lessons.slice(0, 5));
  const body = h("div", { class: "stack" },
    h("h1", { class: "h1" }, "Challenge a friend"),
    h("p", { class: "lead mute" }, "Answer five questions. We make a link with your score. Your friend plays the same five and sees who wins."),
    h("button", { class: "btn gold big", type: "button", on: { click: () => play(root, pick(pool, 5).map(q => q.id), null) } }, "Start my five"));
  root.replaceChildren(page(h("a", { class: "linkish", href: "#/" }, "← Back to Learn"), body));
}
