/* Practice hub, the market desk, and the client lab. */
import { AI_ENDPOINT, NEWS_BASE, RULES } from "./config.js";
import { h, icon, ago, plural, toast } from "./dom.js";
import { D } from "./data.js";
import * as Store from "./store.js";
import * as Creds from "./creds.js";
import { page, checkMark, notFound } from "./ui.js";
import { stories, storyCard } from "./home.js";

const row = (href, title, sub, done) => h("a", { class: "list-row", href },
  checkMark(done ? "done" : ""), h("div", { class: "grow" }, h("div", { class: "list-title" }, title), h("div", { class: "small mute" }, sub)), h("span", { class: "chev" }, icon("chev", 18)));

export function practice() {
  const a = Store.todayAct(), due = Store.dueIds().length, labN = Object.keys(Store.get().lab).length;
  const renew = Creds.all().filter(c => c.kind === "course" && Creds.standing(c) !== "valid");
  return page(
    h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Practice"), h("p", { class: "lead mute" }, "Short, regular practice beats long cramming.")),
    h("div", { class: "divide" },
      row("#/quiz/daily", "Daily five", a.d ? "Done today" : "Five questions, about two minutes", a.d),
      row("#/quiz/revise", "Revise", due ? plural(due, "question") + " due for review" : "Nothing due right now", a.r),
      row("#/lab", "Client lab", `${D.sims.length} real client questions · ${labN} tried`),
      row("#/quiz/place", "Placement test", "24 questions to find your level")),
    renew.length ? h("section", { class: "stack" }, h("h2", { class: "h2" }, "Refreshers"),
      h("div", { class: "divide" }, renew.map(c => row(`#/quiz/refresh/${c.key}`, c.title, Creds.standing(c) === "expired" ? "Expired. Renew with 15 questions" : "Expires soon. Renew with 15 questions")))) : null,
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "More tools"),
      h("p", { class: "mute" }, "Fund library, Index Lab, Rapid Fire and the client profiler live in the classic app."),
      h("a", { class: "btn ghost", href: "classic/", style: "align-self:flex-start" }, "Open classic tools")));
}

/* ——— Market desk ——— */
const TOPICS = [["all", "All"], ["markets", "Markets"], ["mf", "Funds"], ["rbi", "RBI"], ["sebi", "SEBI"]];
export function desk() {
  let items = null, topic = "all", err = "";
  const list = h("div", { class: "divide" });
  const seg = h("div", { class: "seg", role: "group", "aria-label": "Topic" });
  const note = h("p", { class: "tiny mute" });
  function paint() {
    seg.replaceChildren(...TOPICS.map(([id, t]) => h("button", { "aria-pressed": String(topic === id), on: { click: () => { topic = id; paint(); } } }, t)));
    list.replaceChildren();
    if (err) return list.append(h("p", { class: "mute", style: "padding:24px 0" }, err));
    if (!items) return list.append(h("p", { class: "mute", style: "padding:24px 0" }, "Loading headlines…"));
    const shown = items.filter(i => topic === "all" || (i.topics || []).includes(topic)).slice(0, 25);
    if (!shown.length) return list.append(h("p", { class: "mute", style: "padding:24px 0" }, "No headlines on this topic yet."));
    for (const i of shown) list.append(h("a", { class: "list-row", href: i.link, target: "_blank", rel: "noopener noreferrer", style: "align-items:flex-start" },
      h("div", { class: "grow stack stack-xxs" }, h("div", { class: "list-title" }, i.title), i.summary ? h("div", { class: "small mute" }, i.summary) : null, h("div", { class: "tiny mute" }, `${i.source} · ${ago(new Date(i.date).getTime())}`))));
  }
  paint();
  fetch(NEWS_BASE + "news.json", { cache: "no-cache" }).then(r => { if (!r.ok) throw 0; return r.json(); })
    .then(d => { items = (d.items || []).sort((a, b) => new Date(b.date) - new Date(a.date)); note.textContent = d.updated ? "Updated " + ago(new Date(d.updated).getTime()) + ". Opens the publisher's site." : ""; paint(); })
    .catch(() => { err = "Headlines could not be loaded. Check your connection, or that the headlines workflow has run at least once."; paint(); });
  return page(h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Market Desk"), h("p", { class: "lead mute" }, "What matters. Why it matters. What to tell clients."), note),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Teach from the story"), h("div", { class: "divide" }, stories(5).map(storyCard))),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Today's headlines"), seg, list));
}

/* ——— Client lab ——— */
export function lab() {
  const L = Store.get().lab;
  return page(
    h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Client lab"), h("p", { class: "lead mute" }, "Real questions clients ask. Write your own answer first, then compare. Trying five earns you a step toward the Professional credential.")),
    h("div", { class: "divide" }, D.sims.map(s => h("a", { class: "list-row", href: `#/lab/${s.id}` }, checkMark(L[s.id] ? "done" : ""),
      h("div", { class: "grow" }, h("div", { class: "list-title" }, s.quote.replace(/^"|"$/g, "")), L[s.id] ? h("div", { class: "small mute" }, `Best self-check ${L[s.id].score}%`) : null), h("span", { class: "chev" }, icon("chev", 18))))));
}

export function labScenario(id) {
  const s = D.sims.find(x => x.id === id);
  if (!s) return notFound("That scenario does not exist.");
  const ans = h("textarea", { class: "input", rows: 6, placeholder: "Write what you would say to the client…", "aria-label": "Your answer", id: "lab-ans" });
  const reveal = h("div", { class: "stack stack-l", hidden: true });
  const show = h("button", { class: "btn primary", on: { click: () => {
    if (ans.value.trim().length < 20 && !confirm("Your answer is very short. Compare anyway?")) return;
    show.hidden = true; reveal.hidden = false; build(); reveal.scrollIntoView({ behavior: "smooth", block: "start" });
  } } }, "Compare with a model answer");

  function build() {
    const boxes = s.mustCover.map(t => h("input", { type: "checkbox" }));
    const score = h("span", { class: "h3" });
    const upd = () => { const n = boxes.filter(b => b.checked).length; score.textContent = `${n} of ${boxes.length} covered`; return Math.round(100 * n / boxes.length); };
    boxes.forEach(b => b.addEventListener("change", upd)); upd();
    const ai = h("div", { class: "stack stack-s" });
    reveal.replaceChildren(
      h("section", { class: "card tint stack stack-s" }, h("div", { class: "eyebrow" }, "A model answer"), h("p", {}, s.model)),
      h("section", { class: "stack stack-s" }, h("h2", { class: "h2" }, "Why it works"), h("ul", { class: "facts" }, s.why.map(w => h("li", {}, w)))),
      h("section", { class: "stack stack-s" }, h("h2", { class: "h2" }, "Common mistakes"), h("ul", { class: "facts" }, s.mistakes.map(w => h("li", {}, w)))),
      h("section", { class: "stack" }, h("h2", { class: "h2" }, "Check your own answer"), h("p", { class: "small mute" }, "Tick what your answer covered. Be honest."),
        h("div", { class: "stack stack-s" }, s.mustCover.map((t, i) => h("label", { class: "row-flex", style: "gap:12px;align-items:flex-start" }, boxes[i], h("span", {}, t)))), score),
      ...(AI_ENDPOINT ? [ai] : []),
      h("div", { class: "row-flex" },
        AI_ENDPOINT ? h("button", { class: "btn ghost", on: { click: async ev => {
          ev.currentTarget.disabled = true; ai.replaceChildren(h("p", { class: "mute" }, "Reading your answer…"));
          try {
            const r = await fetch(AI_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quote: s.quote, context: s.context, answer: ans.value, mustCover: s.mustCover }) });
            const d = await r.json(); ai.replaceChildren(h("div", { class: "card stack stack-s" }, h("div", { class: "eyebrow" }, "Written feedback"), h("p", {}, String(d.feedback || "No feedback returned."))));
          } catch { ai.replaceChildren(h("p", { class: "error" }, "Feedback is unavailable right now.")); }
          ev.currentTarget.disabled = false;
        } } }, "Get written feedback") : null,
        h("button", { class: "btn primary", on: { click: () => { Store.recordLab(s.id, upd()); const got = Creds.recheck(); toast(got.length ? got[0].title + " earned" : "Saved"); location.hash = "#/lab"; } } }, "Save and finish")));
  }
  return page(
    h("div", { class: "stack" }, h("a", { class: "small mute", href: "#/lab", style: "display:inline-flex;gap:6px;align-items:center" }, icon("left", 16), "Client lab"),
      h("div", { class: "eyebrow" }, "A client asks"), h("p", { class: "quote" }, s.quote), h("p", { class: "mute" }, s.context)),
    h("div", { class: "stack" }, h("div", { class: "field" }, h("label", { for: "lab-ans" }, "Your answer"), ans), show), reveal);
}
