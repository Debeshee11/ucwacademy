/* The exam runner. Unlike a practice quiz it shows no answers while the exam runs. At the end the chosen options go to the server,
   which marks them against keys the browser never holds, issues or renews the certificate, and sends back the review. */
import { h, icon, shuffle, clear } from "./dom.js";
import { localize } from "./data.js";
import * as Store from "./store.js";
import { fns } from "./fb.js";
import { reportError } from "./monitor.js";

const errText = e => /unauthenticated/.test(e?.code || "") ? "Please sign in again."
  : /resource-exhausted/.test(e?.code || "") ? "Please wait a few seconds and try again."
  : /already-exists|aborted/.test(e?.code || "") ? "This attempt was already used. Start the exam again."
  : /failed-precondition/.test(e?.code || "") ? (e.message || "This exam is not ready yet.")
  : /unavailable|network|deadline/.test(e?.code || e?.message || "") ? "No connection. Check your internet."
  : "Something went wrong. Try again.";

/* Show the options in a random order, remembering which original option each one is. */
function arrange(q) {
  const order = shuffle(q.options.map((_, i) => i));
  return { ...q, shown: order.map(i => q.options[i]), order };
}

/* cfg: { title, courseId, tier: "b"|"i"|"h"|"r", lookup(id) -> question, exit, done(res) -> { head, sub, body, actions } }
   The server opens the attempt and chooses the questions; the browser only shows them. */
export async function runExam(root, cfg) {
  clear(root).append(h("main", { class: "wrap page stack", style: "text-align:center;padding-top:64px" }, h("p", { class: "lead" }, "Preparing your exam…")));
  let start;
  try { const f0 = fns(); if (!f0) throw new Error("The service could not be reached."); start = (await f0.httpsCallable("startExam")({ courseId: cfg.courseId, tier: cfg.tier })).data; }
  catch (e) {
    reportError(e);
    return void clear(root).append(h("main", { class: "wrap page stack" }, h("h1", { class: "h1" }, "Could not start the exam."), h("p", { class: "mute" }, errText(e)),
      h("div", { class: "row-flex" }, h("button", { class: "btn primary", on: { click: () => runExam(root, cfg) } }, "Try again"), h("a", { class: "btn ghost", href: cfg.exit || "#/" }, "Back"))));
  }
  const lang = Store.get().lang, attempt = start.attemptId;
  const found = (start.qids || []).map(cfg.lookup);
  if (!found.length || found.some(q => !q)) return void clear(root).append(h("main", { class: "wrap page stack" }, h("h1", { class: "h1" }, "This exam is not ready."), h("p", { class: "mute" }, "The question set is out of date. Reload the page and try again."), h("a", { class: "btn ghost", href: cfg.exit || "#/" }, "Back")));
  const qs = found.map(q => arrange(localize(q, lang)));
  const total = qs.length, picks = Array(total).fill(null);
  let i = 0, busy = false;

  const barFill = h("i", { style: "width:0%" });
  const count = h("span", { class: "small mute", "aria-live": "polite", style: "min-width:56px;text-align:right" });
  const exit = h("button", { class: "icon-btn", "aria-label": "Leave exam", on: { click: () => { if (confirm("Leave this exam? Your answers so far will not count.")) { document.removeEventListener("keydown", keys); location.hash = cfg.exit || "#/"; } } } }, icon("x", 22));
  const top = h("div", { class: "focus-top" }, h("div", { class: "focus-in" }, exit, h("div", { class: "bar" }, barFill), count));
  const body = h("div", { class: "read" }), dock = h("div", { class: "dock" });
  clear(root).append(top, body, dock);

  function keys(ev) {
    if (!root.isConnected || busy) return document.removeEventListener("keydown", keys);
    if (ev.target.matches("input,textarea,select")) return;
    if (/^[1-4]$/.test(ev.key) && +ev.key <= qs[i].shown.length) choose(+ev.key - 1);
  }
  document.addEventListener("keydown", keys);

  function choose(k) { picks[i] = k; paint(); }

  function paint() {
    const q = qs[i], last = i === total - 1;
    barFill.style.width = `${Math.round(100 * i / total)}%`;
    count.textContent = `${i + 1} / ${total}`;
    clear(body).append(h("div", { class: "stack stack-l" },
      h("div", { class: "stack" }, cfg.title && h("div", { class: "eyebrow" }, cfg.title), h("h1", { style: "font:800 clamp(21px,3.2vw,26px)/1.4 var(--font)" }, q.prompt)),
      h("div", { class: "opts", role: "group", "aria-label": "Choose one answer" }, q.shown.map((o, k) =>
        h("button", { class: "opt", "aria-pressed": String(picks[i] === k), on: { click: () => choose(k) } }, h("span", { class: "key" }, k + 1), h("span", {}, o))))));
    clear(dock).append(h("div", { class: "dock-in" },
      i > 0 ? h("button", { class: "btn quiet", on: { click: () => { i--; paint(); } } }, icon("left", 18), "Back") : h("span"),
      last ? h("button", { class: "btn primary", disabled: busy, on: { click: submit } }, "Submit exam")
        : h("button", { class: "btn primary", on: { click: () => { i++; paint(); } } }, picks[i] == null ? "Skip" : "Next")));
    window.scrollTo(0, 0);
  }

  async function submit() {
    if (busy) return;
    const blank = picks.filter(x => x == null).length;
    if (blank && !confirm(`${blank} question${blank > 1 ? "s are" : " is"} unanswered. Submit anyway?`)) return;
    busy = true; document.removeEventListener("keydown", keys);
    clear(dock); barFill.style.width = "100%"; count.textContent = "";
    clear(body).append(h("div", { class: "stack stack-l", style: "text-align:center;padding-top:48px" }, h("p", { class: "lead" }, "Marking your exam…"), h("p", { class: "mute" }, "Please keep this page open.")));
    try {
      const f = fns(); if (!f) throw new Error("The service could not be reached.");
      const answers = picks.map((k, n) => (k == null ? null : qs[n].order[k]));
      const res = (await f.httpsCallable("submitExam")({ courseId: cfg.courseId, tier: cfg.tier, answers, attemptId: attempt })).data;
      await result(res);
    } catch (e) {
      reportError(e);
      busy = false; document.addEventListener("keydown", keys);
      clear(body).append(h("div", { class: "stack stack-l" }, h("h1", { class: "h1" }, "Could not submit yet."), h("p", { class: "mute" }, errText(e)), h("p", { class: "mute" }, "Your answers are kept on this page. Try again when you are back online."),
        h("div", { class: "row-flex" }, h("button", { class: "btn primary", on: { click: submit } }, "Try again"), h("button", { class: "btn ghost", on: { click: () => { i = total - 1; paint(); } } }, "Back to questions"))));
    }
  }

  async function result(res) {
    const out = (await cfg.done?.(res)) || {};
    const R = 74, C = 2 * Math.PI * R, color = res.passed ? "#1FA45B" : "#E5484D";
    const ring = h("div", { class: "ring" });
    ring.innerHTML = `<svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true"><circle cx="84" cy="84" r="${R}" fill="none" stroke="#E6E5EE" stroke-width="12"/><circle cx="84" cy="84" r="${R}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - res.score / 100)}" style="transition:stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)"/></svg>`;
    ring.append(h("div", { class: "num" }, res.score + "%"));
    const missed = qs.map((q, n) => ({ q, n, r: res.review.find(x => x.id === q.id) })).filter(({ q, n, r }) => r && qs[n].order[picks[n]] !== r.a);
    clear(body).append(h("div", { class: "stack stack-l", style: "text-align:center" },
      ring,
      h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, out.head || (res.passed ? "Passed." : "Not yet.")), h("p", { class: "lead" }, out.sub || `${res.right} of ${res.total} right. Pass mark ${res.pass}%.`)),
      out.body || null,
      missed.length ? h("details", { class: "details card", style: "text-align:left" },
        h("summary", { class: "row-flex between" }, h("span", { class: "h3" }, `Review ${missed.length} you missed`), h("span", { class: "chev-d" }, icon("chev", 18))),
        h("div", { class: "stack", style: "margin-top:20px" }, missed.map(({ q, r }) => h("div", { class: "stack stack-s" },
          h("p", { style: "font-weight:500" }, q.prompt),
          h("p", { class: "small", style: "color:var(--ok)" }, "Right: " + q.options[r.a]),
          h("p", { class: "small mute" }, q.why || r.w))))) : null,
      h("div", { class: "row-flex", style: "justify-content:center" }, out.actions || h("a", { class: "btn primary", href: cfg.exit || "#/" }, "Continue"))));
    window.scrollTo(0, 0);
  }
  paint();
}
