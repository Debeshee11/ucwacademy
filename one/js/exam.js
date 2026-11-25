/* The exam runner. Unlike a practice quiz it shows no answers while the exam runs. At the end the chosen options go to the server,
   which marks them against keys the browser never holds, issues or renews the certificate, and sends back the review. */
import { h, icon, shuffle, clear } from "./dom.js";
import { rateCard } from "./rate.js";
import { localize } from "./data.js";
import * as Store from "./store.js";
import { fns } from "./fb.js";
import { reportError } from "./monitor.js";
import { ask } from "./ux.js";
import { RULES } from "./config.js";
import { mascot } from "./mascot.js";
import { siteUrl } from "./rate.js";
import { shareButton } from "./share.js";

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

const KEY = { b: "x:", i: "x2:", h: "x3:" };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const calm = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const html = (cls, s, tag = "span") => { const e = h(tag, { class: cls }); e.innerHTML = s; return e; };
const fmt = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
const FLAG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>';
const CLOCK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 3h6"/></svg>';
const COACH = ["Take your time. Read every option.", "Good pace. Keep going.", "Halfway there. Steady hands.", "Cross out the options that are clearly wrong.", "Nearly there. Stay sharp.", "Last one. You have got this."];

/* The briefing: what to expect, before anything is started. */
function briefing(root, cfg) {
  return new Promise(res => {
    const pass = RULES.tierPass[cfg.tier], n = cfg.tier === "r" ? 15 : 20, prev = Store.get().quiz[(KEY[cfg.tier] || "") + cfg.courseId]?.best;
    const tile = (a, b) => h("div", { class: "xb-t" }, h("b", {}, String(a)), h("small", {}, b));
    clear(root).append(h("main", { class: "xb" },
      h("a", { class: "xb-x", href: cfg.exit || "#/", "aria-label": "Back" }, icon("x", 22)),
      html("xb-m", mascot({ mood: "happy", pose: "explain", view: "bust", px: 112 })),
      h("p", { class: "xb-k" }, "Exam briefing"), h("h1", { class: "xb-h" }, cfg.title || "Exam"),
      h("div", { class: "xb-stats" }, tile(n, "questions"), pass ? tile(pass + "%", "to pass") : null, tile(prev != null ? prev + "%" : "–", "your best")),
      h("ul", { class: "xb-rules" }, [["lock", "Answers stay hidden until you submit."], ["check", "Go back, change answers, or flag a question to revisit."], ["shield", "A fresh set of questions every attempt."], ["bolt", "A clock runs for you. There is no cut-off."]].map(([ic, tx]) => h("li", {}, h("span", {}, icon(ic, 20)), tx))),
      h("button", { class: "btn primary xb-go", type: "button", on: { click: () => res(true) } }, "I am ready. Start"),
      h("a", { class: "xb-later", href: cfg.exit || "#/" }, "Not now")));
  });
}
async function countdown(root) {
  const box = h("div", { class: "xc", role: "status", "aria-live": "assertive" }); clear(root).append(box);
  for (const s of calm() ? ["Go"] : ["3", "2", "1", "Go"]) { box.replaceChildren(h("span", { class: "xc-n" + (s === "Go" ? " go" : "") }, s)); await sleep(s === "Go" ? 450 : 780); }
}
function confetti(host) {
  if (calm()) return; const cols = ["#FFB703", "#2F8F5B", "#D6457A", "#1F7AC4", "#6B4FD6", "#F2780C"];
  const box = h("div", { class: "xr-cf", "aria-hidden": "true" }); for (let i = 0; i < 60; i++) box.append(h("i", { style: `left:${Math.random() * 100}%;background:${cols[i % 6]};animation-delay:${Math.random() * .7}s;--dx:${(Math.random() - .5) * 220}px;--r:${Math.random() * 720}deg` }));
  host.append(box); setTimeout(() => box.remove(), 3600);
}

/* cfg: { title, courseId, tier: "b"|"i"|"h"|"r", lookup(id) -> question, exit, done(res) -> { head, sub, body, actions } }
   The server opens the attempt and chooses the questions; the browser only shows them. */
export async function runExam(root, cfg) {
  await briefing(root, cfg);
  let start, failed = null;
  const cd = countdown(root);
  try { const f0 = fns(); if (!f0) throw new Error("The service could not be reached."); start = (await f0.httpsCallable("startExam")({ courseId: cfg.courseId, tier: cfg.tier })).data; }
  catch (e) { failed = e; }
  await cd;
  if (failed) {
    reportError(failed);
    return void clear(root).append(h("main", { class: "wrap page stack" }, h("h1", { class: "h1" }, "Could not start the exam."), h("p", { class: "mute" }, errText(failed)),
      h("div", { class: "row-flex" }, h("button", { class: "btn primary", on: { click: () => runExam(root, cfg) } }, "Try again"), h("a", { class: "btn ghost", href: cfg.exit || "#/" }, "Back"))));
  }
  const lang = Store.get().lang, attempt = start.attemptId;
  const found = (start.qids || []).map(cfg.lookup);
  if (!found.length || found.some(q => !q)) return void clear(root).append(h("main", { class: "wrap page stack" }, h("h1", { class: "h1" }, "This exam is not ready."), h("p", { class: "mute" }, "The question set is out of date. Reload the page and try again."), h("a", { class: "btn ghost", href: cfg.exit || "#/" }, "Back")));
  const qs = found.map(q => arrange(localize(q, lang)));
  const total = qs.length, picks = Array(total).fill(null), flags = new Set(), t0 = Date.now();
  let i = 0, busy = false, tick = null;

  const clock = h("span", { class: "xt-clock" }), count = h("span", { class: "xt-count", "aria-live": "polite" });
  const pips = h("div", { class: "xt-pips", role: "group", "aria-label": "Questions" });
  const stopClock = () => { clearInterval(tick); document.removeEventListener("keydown", keys); };
  const exit = h("button", { class: "icon-btn", "aria-label": "Leave exam", on: { click: async () => { if (await ask("Leave this exam? Your answers so far will not count.", { ok: "Leave", cancel: "Keep going" })) { stopClock(); location.hash = cfg.exit || "#/"; } } } }, icon("x", 22));
  const top = h("div", { class: "focus-top xt" }, h("div", { class: "focus-in" }, exit, pips, html("xt-cl", CLOCK), clock, count));
  const body = h("div", { class: "read" }), dock = h("div", { class: "dock" });
  clear(root).append(top, body, dock);
  const tickFn = () => { if (!body.isConnected) return stopClock(); clock.textContent = fmt(Date.now() - t0); };
  tickFn(); tick = setInterval(tickFn, 1000);

  function keys(ev) {
    if (!body.isConnected || busy) return stopClock();
    if (ev.target.matches("input,textarea,select")) return;
    if (/^[1-4]$/.test(ev.key) && +ev.key <= qs[i].shown.length) choose(+ev.key - 1);
    else if (ev.key === "ArrowRight" && i < total - 1) go(i + 1); else if (ev.key === "ArrowLeft" && i > 0) go(i - 1);
  }
  document.addEventListener("keydown", keys);

  function paintPips() {
    pips.replaceChildren(...qs.map((_, n) => h("button", { type: "button", class: "xt-p" + (picks[n] != null ? " on" : "") + (flags.has(n) ? " fl" : "") + (n === i ? " cur" : ""), "aria-label": `Question ${n + 1}${picks[n] != null ? ", answered" : ""}${flags.has(n) ? ", flagged" : ""}`, on: { click: () => go(n) } })));
    count.textContent = `${i + 1}/${total}`;
  }
  const go = n => { if (busy) return; const dir = n >= i ? "r" : "l"; i = n; paint(dir); };
  function choose(k) { picks[i] = k; body.querySelectorAll(".opt").forEach((b, n) => b.setAttribute("aria-pressed", String(n === k))); paintPips(); dockPaint(); }
  function dockPaint() {
    const last = i === total - 1;
    clear(dock).append(h("div", { class: "dock-in" },
      i > 0 ? h("button", { class: "btn quiet", on: { click: () => go(i - 1) } }, icon("left", 18), "Back") : h("span"),
      html("xd-flag-w", "", "span"),
      h("button", { class: "btn ghost xd-flag" + (flags.has(i) ? " on" : ""), type: "button", "aria-pressed": String(flags.has(i)), on: { click: () => { flags.has(i) ? flags.delete(i) : flags.add(i); paintPips(); dockPaint(); } } }, html("", FLAG), flags.has(i) ? "Flagged" : "Flag"),
      last ? h("button", { class: "btn primary", on: { click: review } }, "Review and submit")
        : h("button", { class: "btn primary", on: { click: () => go(i + 1) } }, picks[i] == null ? "Skip" : "Next")));
  }
  function paint(dir) {
    const q = qs[i], f = i / total, ci = i === 0 ? 0 : i === total - 1 ? 5 : i === Math.floor(total / 2) ? 2 : f < .4 ? 1 : f < .7 ? 3 : 4;
    clear(body).append(h("div", { class: "stack stack-l xq" + (dir && !calm() ? " xq-" + dir : "") },
      h("div", { class: "stack" }, cfg.title && h("div", { class: "eyebrow" }, cfg.title), h("h1", { class: "xq-h" }, q.prompt)),
      h("div", { class: "opts", role: "group", "aria-label": "Choose one answer" }, q.shown.map((o, k) =>
        h("button", { class: "opt", "aria-pressed": String(picks[i] === k), on: { click: () => choose(k) } }, h("span", { class: "key" }, k + 1), h("span", {}, o)))),
      h("div", { class: "xq-coach" }, html("xq-cm", mascot({ mood: "happy", pose: "stand", view: "head", px: 40 })), h("p", {}, COACH[ci]))));
    paintPips(); dockPaint(); window.scrollTo(0, 0);
  }

  /* Before submitting: every question at a glance. */
  function review() {
    const un = picks.filter(x => x == null).length, fl = flags.size;
    clear(body).append(h("div", { class: "stack stack-l xr-rv" }, h("div", { class: "stack stack-s" }, h("p", { class: "xb-k" }, "Almost done"), h("h1", { class: "xq-h" }, "Review your answers")),
      h("div", { class: "xr-sum" }, h("span", { class: "a" }, `${total - un} answered`), un ? h("span", { class: "u" }, `${un} blank`) : null, fl ? h("span", { class: "f" }, `${fl} flagged`) : null),
      h("div", { class: "xr-grid", role: "group", "aria-label": "All questions" }, qs.map((_, n) => h("button", { type: "button", class: "xr-t" + (picks[n] != null ? " a" : " u") + (flags.has(n) ? " f" : ""), on: { click: () => { i = n; paint("l"); } } }, String(n + 1), flags.has(n) ? html("xr-fl", FLAG) : null))),
      h("p", { class: "small mute" }, un ? "Tap a number to go back to it. Blank answers count as wrong." : "Everything is answered. Tap a number to double-check any answer."),
      h("div", { class: "row-flex", style: "justify-content:center;gap:12px;flex-wrap:wrap" }, h("button", { class: "btn ghost", on: { click: () => paint("l") } }, "Back to questions"), h("button", { class: "btn primary xr-submit", on: { click: submit } }, "Submit exam"))));
    clear(dock); window.scrollTo(0, 0);
  }

  async function submit() {
    if (busy) return;
    busy = true; stopClock(); clear(dock); const took = Date.now() - t0, tm = Date.now(); pips.querySelectorAll("button").forEach(b => b.disabled = true);
    const lines = ["Checking your answers…", "Counting the marks…", "Preparing your review…"]; const msg = h("p", { class: "lead xm-l" }, lines[0]); let li = 0; const rot = setInterval(() => { msg.textContent = lines[++li % lines.length]; }, 750);
    clear(body).append(h("div", { class: "xm" }, html("xm-m", mascot({ mood: "think", pose: "explain", view: "bust", px: 120 })), msg, h("div", { class: "xm-bar" }, h("i", {})), h("p", { class: "mute" }, "Please keep this page open.")));
    try {
      const f = fns(); if (!f) throw new Error("The service could not be reached.");
      const answers = picks.map((k, n) => (k == null ? null : qs[n].order[k]));
      const res = (await f.httpsCallable("submitExam")({ courseId: cfg.courseId, tier: cfg.tier, answers, attemptId: attempt })).data;
      await sleep(Math.max(0, 1900 - (Date.now() - tm))); clearInterval(rot);
      await result(res, took);
    } catch (e) {
      clearInterval(rot); reportError(e);
      busy = false; document.addEventListener("keydown", keys);
      clear(body).append(h("div", { class: "stack stack-l" }, h("h1", { class: "h1" }, "Could not submit yet."), h("p", { class: "mute" }, errText(e)), h("p", { class: "mute" }, "Your answers are kept on this page. Try again when you are back online."),
        h("div", { class: "row-flex" }, h("button", { class: "btn primary", on: { click: submit } }, "Try again"), h("button", { class: "btn ghost", on: { click: () => { i = total - 1; paint(); } } }, "Back to questions"))));
    }
  }

  async function result(res, took) {
    const prev = Store.get().quiz[(KEY[cfg.tier] || "") + cfg.courseId]?.best;      /* read before the result is saved */
    const out = (await cfg.done?.(res)) || {};
    const R = 74, C = 2 * Math.PI * R, color = res.passed ? "#1FA45B" : "#E5484D";
    const ring = h("div", { class: "ring xr-ring" });
    ring.innerHTML = `<svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true"><circle cx="84" cy="84" r="${R}" fill="none" stroke="#E6E5EE" stroke-width="12"/><circle class="xr-arc" cx="84" cy="84" r="${R}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90 84 84)" style="transition:stroke-dashoffset 1.3s cubic-bezier(.2,.7,.2,1)"/></svg>`;
    const num = h("div", { class: "num" }, "0%"); ring.append(num);
    const skipped = picks.filter(x => x == null).length, wrong = Math.max(0, res.total - res.right - skipped);
    const st = (n, l, c) => h("div", { class: "xr-st " + c }, h("b", {}, String(n)), h("small", {}, l));
    const missed = qs.map((q, n) => ({ q, n, r: res.review.find(x => x.id === q.id) })).filter(({ q, n, r }) => r && qs[n].order[picks[n]] !== r.a);
    const best = prev == null ? null : res.score > prev ? `New personal best. Up ${res.score - prev} points.` : res.score === prev ? "Equal to your best." : `Your best is ${prev}%.`;
    const wa = `https://wa.me/?text=${encodeURIComponent(`I scored ${res.score}% on the ${cfg.title || "exam"} at UpperCrust Academy. ${siteUrl()}`)}`;
    const view = h("div", { class: "stack stack-l xr", style: "text-align:center" },
      h("div", { class: "xr-top" }, html("xr-m", mascot({ mood: res.passed ? "joy" : "think", pose: res.passed ? "cheer" : "explain", view: "bust", px: 96 })), ring, res.passed ? h("span", { class: "xr-stamp" }, "Passed") : null),
      h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, out.head || (res.passed ? "Passed." : "Not yet.")), h("p", { class: "lead" }, out.sub || `${res.right} of ${res.total} right. Pass mark ${res.pass}%.`),
        best ? h("p", { class: "xr-best" + (res.score > (prev ?? 101) ? " up" : "") }, best) : null),
      h("div", { class: "xr-sts" }, st(res.right, "right", "g"), st(wrong, "wrong", "r"), st(skipped, "blank", "y"), st(fmt(took), "time", "b")),
      out.body || null,
      res.passed ? shareButton({ kicker: "Exam passed", big: res.score + "%", title: cfg.title || "Exam", sub: `${res.right} of ${res.total} right. Pass mark ${res.pass}%.`, tone: "gold" }, `I passed ${cfg.title || "an exam"} with ${res.score}% on UpperCrust Academy.`, "Share a picture of your result", "btn primary xr-share") : null,
      res.passed ? h("a", { class: "btn ghost xr-share", href: wa, target: "_blank", rel: "noopener noreferrer" }, "Share the news on WhatsApp") : null,
      cfg.rate && res.passed ? rateCard("exam", cfg.rate) : null,
      missed.length ? h("details", { class: "details card", style: "text-align:left" },
        h("summary", { class: "row-flex between" }, h("span", { class: "h3" }, `Review ${missed.length} you missed`), h("span", { class: "chev-d" }, icon("chev", 18))),
        h("div", { class: "stack", style: "margin-top:20px" }, missed.map(({ q, r }) => h("div", { class: "stack stack-s" },
          h("p", { style: "font-weight:500" }, q.prompt),
          h("p", { class: "small", style: "color:var(--ok)" }, "Right: " + q.options[r.a]),
          h("p", { class: "small mute" }, q.why || r.w))))) : null,
      h("div", { class: "row-flex", style: "justify-content:center" }, out.actions || h("a", { class: "btn primary", href: cfg.exit || "#/" }, "Continue")));
    clear(body).append(view); clear(dock); pips.replaceChildren(); count.textContent = ""; clock.textContent = ""; top.querySelector(".xt-cl")?.remove();
    window.scrollTo(0, 0);
    requestAnimationFrame(() => requestAnimationFrame(() => { ring.querySelector(".xr-arc").style.strokeDashoffset = String(C * (1 - res.score / 100)); }));
    const T = calm() ? 0 : 1300, s0 = performance.now(); const step = now => { const k = T ? Math.min(1, (now - s0) / T) : 1; num.textContent = Math.round(res.score * (1 - Math.pow(1 - k, 3))) + "%"; if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step);
    if (res.passed) setTimeout(() => confetti(view.parentElement || document.body), 500);
  }
  paint();
}
