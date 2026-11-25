/* Practice hub, the market desk, and the client lab. */
import { isPro } from "./audience.js";
import { AI_ENDPOINT, NEWS_BASE, RULES } from "./config.js";
import { h, icon, ago, plural, toast } from "./dom.js";
import { D } from "./data.js";
import * as Store from "./store.js";
import * as Creds from "./creds.js";
import { page, checkMark, notFound } from "./ui.js";
import { stories, storyCard } from "./home.js";
import { newsFeed } from "./news.js";
import { pageHero } from "./pagehero.js";
import { ask } from "./ux.js";

const row = (href, title, sub, done) => h("a", { class: "list-row", href },
  checkMark(done ? "done" : ""), h("div", { class: "grow" }, h("div", { class: "list-title" }, title), h("div", { class: "small mute" }, sub)), h("span", { class: "chev" }, icon("chev", 18)));

const tile = (href, ic, title, sub, vars, state) => h("a", { class: "gtile" + (state ? " " + state : ""), href, style: vars },
  h("span", { class: "gtile-ic" }, icon(ic, 26)), h("span", { class: "gtile-t" }, title), h("span", { class: "gtile-s" }, sub), state === "done" ? h("span", { class: "gtile-badge" }, icon("check", 16), "Done") : null);
const C = { gold: "--sc:#B97700;--sb:#FFEFC2", green: "--sc:#0B7F57;--sb:#D6F4E7", blue: "--sc:#3450D1;--sb:#E0E7FF", orange: "--sc:#D2501A;--sb:#FFE3D2", violet: "--sc:#7440CF;--sb:#EBE1FF", pink: "--sc:#C72F69;--sb:#FFE0EC" };

export { arena as practice } from "./arena.js";

/* ——— Market desk ——— */
export function desk() {
  const { seg, list, note } = newsFeed();
  return page(pageHero("news", "News & Markets", isPro() ? "Today's headlines, why they matter, and what to tell clients." : "Today's headlines and why they matter, in plain words.", [], note),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Today's headlines"), seg, list),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, isPro() ? "Teach from the story" : "Learn from the story"), h("div", { class: "divide" }, stories(5).map(storyCard))),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Market tools"), h("div", { class: "divide" },
      row("#/funds", "Fund library", "Every mutual fund: returns, risk, holdings"), row("#/indices", "Index library", "All NSE indices"), row("#/practice", "Practice", "Daily five, revision, fund and market quizzes"))));
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
  const show = h("button", { class: "btn primary", on: { click: async () => {
    if (ans.value.trim().length < 20 && !(await ask("Your answer is very short. Compare anyway?", { ok: "Compare", cancel: "Write more" }))) return;
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
        h("button", { class: "btn primary", on: { click: () => { Store.recordLab(s.id, upd()); toast("Saved"); Store.flush().then(() => Creds.recheck()).then(got => got.length && toast(got[0].title + " earned")); location.hash = "#/lab"; } } }, "Save and finish")));
  }
  return page(
    h("div", { class: "stack" }, h("a", { class: "small mute", href: "#/lab", style: "display:inline-flex;gap:6px;align-items:center" }, icon("left", 16), "Client lab"),
      h("div", { class: "eyebrow" }, "A client asks"), h("p", { class: "quote" }, s.quote), h("p", { class: "mute" }, s.context)),
    h("div", { class: "stack" }, h("div", { class: "field" }, h("label", { for: "lab-ans" }, "Your answer"), ans), show), reveal);
}
