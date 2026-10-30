/* The quiz runner. One question at a time, answer, see why, move on. Used by every kind of quiz. */
import { h, icon, shuffle, clear } from "./dom.js";
import { D, localize } from "./data.js";
import * as Store from "./store.js";

/* Every question in the course by id, so revision can find the ones that are due. */
let byId = null;
export function questionById(id) {
  if (!byId) { byId = {}; for (const l of Object.values(D.lessons)) for (const q of l.qs) byId[q.id] = { ...q, n: l.n }; for (const q of [...D.fundqs, ...D.indexqs]) byId[q.id] = q; }
  return byId[id] || null;
}

/* Put the options in a random order and carry the answer and the reasons along. */
function arrange(q) {
  const order = shuffle(q.options.map((_, i) => i));
  return { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer), wrong: order.map(i => (q.wrong || [])[i] || null) };
}

function confetti() {
  const box = h("div", { class: "confetti", "aria-hidden": "true" }), cols = ["#F6B800", "#1FA45B", "#2F7CF6", "#F08A12", "#E5484D"];
  for (let k = 0; k < 40; k++) box.append(h("i", { style: `left:${Math.random() * 100}%;background:${cols[k % 5]};animation-delay:${Math.random() * .8}s;animation-duration:${2 + Math.random() * 1.6}s` }));
  document.body.append(box); setTimeout(() => box.remove(), 4500);
}

/* cfg: { title, questions, pass, record, exit, done(result) -> { head, body, actions } } */
export function runQuiz(root, cfg) {
  const lang = Store.get().lang;
  const qs = cfg.questions.map(q => arrange(localize(q, lang)));
  const answers = [];
  let i = 0, picked = null, checked = false;
  const total = qs.length;

  const barFill = h("i", { style: "width:0%" });
  const exit = h("button", { class: "icon-btn", "aria-label": "Leave quiz", on: { click: () => { if (!answers.length || confirm("Leave this quiz? Your answers so far will not count.")) location.hash = cfg.exit || "#/"; } } }, icon("x", 22));
  const count = h("span", { class: "small mute", "aria-live": "polite", style: "min-width:56px;text-align:right" });
  const top = h("div", { class: "focus-top" }, h("div", { class: "focus-in" }, exit, h("div", { class: "bar" }, barFill), count));
  const body = h("div", { class: "read" });
  const dock = h("div", { class: "dock" });
  clear(root).append(top, body, dock);

  function keys(ev) {
    if (!root.isConnected) return document.removeEventListener("keydown", keys);
    if (ev.target.matches("input,textarea,select")) return;
    if (/^[1-4]$/.test(ev.key) && !checked) { pick(+ev.key - 1); }
    else if (ev.key === "Enter" && !ev.target.closest("button,a")) { const b = dock.querySelector("button:not([disabled])"); b && b.click(); }
  }
  document.addEventListener("keydown", keys);

  function pick(k) {
    if (checked || k >= qs[i].options.length) return;
    picked = k; body.querySelectorAll(".opt").forEach((o, j) => o.setAttribute("aria-pressed", String(j === k)));
    paintDock();
  }

  let verdict = null;
  function paintDock() {
    clear(dock); dock.className = "dock" + (checked ? (verdict.ok ? " ok" : " bad") : "");
    const last = i === total - 1;
    if (!checked) return void dock.append(h("div", { class: "dock-in" }, h("span"), h("button", { class: "btn primary", disabled: picked == null, on: { click: check } }, "Check")));
    dock.append(h("div", { class: "dock-in has-fb" },
      h("div", { class: "fb", role: "status" }, h("span", { class: "badge" }, icon(verdict.ok ? "check" : "x", 24)), h("div", {}, h("b", {}, verdict.ok ? "Correct!" : "Not quite"), h("p", {}, verdict.why))),
      h("button", { class: "btn " + (verdict.ok ? "green" : "red"), on: { click: next } }, last ? "See result" : "Continue")));
  }

  function paint() {
    const q = qs[i];
    barFill.style.width = `${Math.round(100 * i / total)}%`;
    count.textContent = `${i + 1} / ${total}`;
    clear(body);
    body.append(h("div", { class: "stack stack-l" },
      h("div", { class: "stack" },
        cfg.title && h("div", { class: "eyebrow" }, cfg.title),
        h("h1", { style: "font:800 clamp(21px,3.2vw,26px)/1.4 var(--font)" }, q.prompt)),
      h("div", { class: "opts", role: "group", "aria-label": "Choose one answer" }, q.options.map((o, k) =>
        h("button", { class: "opt", "aria-pressed": "false", on: { click: () => pick(k) } }, h("span", { class: "key" }, k + 1), h("span", {}, o))))));
    picked = null; checked = false; paintDock();
    window.scrollTo(0, 0);
  }

  function check() {
    const q = qs[i], ok = picked === q.answer;
    checked = true;
    answers.push({ q, picked, ok });
    if (cfg.record !== false) Store.recordAnswer(q.id, ok);
    body.querySelectorAll(".opt").forEach((o, k) => {
      o.disabled = true;
      if (k === q.answer) o.classList.add("right");
      else if (k === picked) { o.classList.add("wrong"); }
    });
    verdict = { ok, why: ok ? q.why : (q.wrong[picked] || q.why) };
    paintDock();
  }

  function next() {
    if (i < total - 1) { i++; paint(); } else finish();
  }

  async function finish() {
    document.removeEventListener("keydown", keys);
    const right = answers.filter(a => a.ok).length, score = Math.round(100 * right / total);
    const passed = cfg.pass == null ? null : score >= cfg.pass;
    const res = { right, total, score, passed, answers };
    const out = (await cfg.done?.(res)) || {};
    barFill.style.width = "100%"; count.textContent = "";
    clear(body); dock.remove();
    const R = 74, C = 2 * Math.PI * R;
    const ring = h("div", { class: "ring" });
    ring.innerHTML = `<svg width="168" height="168" viewBox="0 0 168 168" aria-hidden="true"><circle cx="84" cy="84" r="${R}" fill="none" stroke="#E6E5EE" stroke-width="12"/><circle cx="84" cy="84" r="${R}" fill="none" stroke="${passed === false ? "#E5484D" : "#1FA45B"}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - score / 100)}" style="transition:stroke-dashoffset .8s cubic-bezier(.2,.7,.2,1)"/></svg>`;
    ring.append(h("div", { class: "num" }, score + "%"));
    const miss = answers.filter(a => !a.ok);
    const earned = right * 2 + (passed ? 30 : 0);
    if (passed || (passed === null && score >= 80)) confetti();
    body.append(h("div", { class: "stack stack-l", style: "text-align:center" },
      ring,
      h("div", { class: "stack stack-s" },
        h("h1", { class: "h1" }, out.head || (passed === true ? "Passed." : passed === false ? "Not yet." : "Done.")),
        h("p", { class: "lead" }, out.sub || `${right} of ${total} right.` + (cfg.pass != null ? ` Pass mark ${cfg.pass}%.` : ""))),
      cfg.record !== false ? h("div", {}, h("span", { class: "xp-chip" }, icon("star", 22), `+${earned} points`)) : null,
      out.body || null,
      miss.length ? h("details", { class: "details card", style: "text-align:left" },
        h("summary", { class: "row-flex between" }, h("span", { class: "h3" }, `Review ${miss.length} you missed`), h("span", { class: "chev-d" }, icon("chev", 18))),
        h("div", { class: "stack", style: "margin-top:20px" }, miss.map(a => h("div", { class: "stack stack-s" },
          h("p", { style: "font-weight:500" }, a.q.prompt),
          h("p", { class: "small", style: "color:var(--ok)" }, "Right: " + a.q.options[a.q.answer]),
          h("p", { class: "small mute" }, a.q.why))))) : null,
      h("div", { class: "row-flex", style: "justify-content:center" }, out.actions || h("a", { class: "btn primary", href: cfg.exit || "#/" }, "Continue"))));
    window.scrollTo(0, 0);
  }
  paint();
}
