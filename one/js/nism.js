/* NISM certification prep: exam hub, unit-by-unit syllabus with PDF guide, and five graded mocks per exam. */
import { h, icon, toast, fmtDate } from "./dom.js";
import * as Store from "./store.js";
import { widePage, bar } from "./ui.js";

const j = async p => { const r = await fetch(p); if (!r.ok) throw new Error(p + " " + r.status); return r.json(); };
let IDX = null; const EX = {};
const idx = async () => IDX || (IDX = await j("one/data/nism.json"));
const exam = async id => EX[id] || (EX[id] = await j(`one/data/nism/${id}.json`));
const pdfHref = e => `assets/nism/${e.id}-study-guide.pdf`;
const LEVELS = ["Foundation", "Core", "Applied", "Exam level", "Beyond exam"];
const mine = id => (Store.get().nm || {})[id] || {};
const fx = x => (Math.round(x * 100) / 100).toString();
const dlBtn = (e, cls = "btn primary") => h("a", { class: cls, href: pdfHref(e), download: `UpperCrust-Academy-${e.code.replace(/\s+/g, "-")}-Study-Guide.pdf` }, icon("print", 18), `Study guide PDF${e.pages ? " · " + e.pages + " pages" : ""}`);
const fail = box => box.replaceChildren(h("h1", { class: "h1" }, "Could not load."), h("p", { class: "lead" }, "Check your connection and try again."), h("a", { class: "btn primary", href: "#/nism" }, "NISM home"));

/* ——— hub ——— */
export function hub() {
  const box = h("div", { class: "stack stack-xl" }, h("p", { class: "mute" }, "Loading…"));
  idx().then(I => {
    const card = e => {
      const m = mine(e.id), done = Object.keys(m).filter(k => /^\d$/.test(k)).length, best = Math.max(-1, ...Object.values(m).filter(x => x && x.best != null).map(x => x.best));
      return h("div", { class: "nmc stack stack-s" },
        h("div", { class: "row-flex between" }, h("span", { class: "nm-tag" }, e.code.replace("NISM Series ", "Series ")), done ? h("span", { class: "pill ok" }, `${done}/5 mocks`) : h("span", { class: "pill" }, "5 mocks")),
        h("h3", { class: "nmc-t" }, e.title), h("p", { class: "small mute" }, e.blurb),
        h("div", { class: "nmc-s" }, h("span", {}, h("b", {}, e.qs), " questions"), h("span", {}, h("b", {}, e.mins), " min"), h("span", {}, h("b", {}, e.pass + "%"), " to pass"), h("span", {}, h("b", {}, e.units), " units")),
        best > -1 ? h("p", { class: "tiny" }, `Best mock score: ${fx(best)} / ${e.marks || e.qs}`) : null,
        h("div", { class: "row-flex" }, h("a", { class: "btn primary small", href: `#/nism/${e.id}` }, "Open"), dlBtn(e, "btn ghost small")));
    };
    box.replaceChildren(
      h("section", { class: "hero stack" }, h("div", { class: "eyebrow gold" }, "NISM certification prep"),
        h("h1", { class: "h1", style: "font-size:clamp(32px,5vw,50px)" }, "Pass your NISM exam with a syllabus you can actually use."),
        h("p", { class: "lead" }, "A deep study guide for every exam, free to download with the UpperCrust Academy branding, and five full-length mocks that get harder one by one."),
        h("div", { class: "stats" }, h("span", {}, h("b", {}, I.exams.length), " exams"), h("span", {}, h("b", {}, I.exams.length * 5), " full mocks"), h("span", {}, h("b", {}, I.exams.reduce((a, e) => a + (e.pages || 0), 0)), " pages of notes"), h("span", {}, h("b", {}, "Free"), " PDFs"))),
      ...I.tracks.map(t => h("section", { class: "stack" }, h("div", {}, h("h2", { class: "h2" }, t.name), h("p", { class: "mute" }, t.blurb)), h("div", { class: "cgrid" }, t.exams.map(id => I.exams.find(e => e.id === id)).filter(Boolean).map(card)))),
      h("p", { class: "small mute" }, "UpperCrust Academy material is independent exam-preparation content written against the published NISM syllabus outline. It is not NISM’s own workbook and is not endorsed by NISM or SEBI. Always read the latest official workbook."));
  }).catch(() => fail(box));
  return widePage(box);
}

/* ——— exam page ——— */
const vis = (v, uid) => {
  if (v[0] === "table") return h("div", { class: "nm-tbl" }, h("div", { class: "eyebrow" }, v[1]), h("table", {}, v[2].map((r, i) => h("tr", {}, r.map(c => h(i ? "td" : "th", {}, c))))));
  if (v[0] === "flow") return h("div", {}, h("div", { class: "eyebrow" }, v[1]), h("div", { class: "nm-flow" }, v[2].map((s, i) => h("span", {}, h("i", {}, i + 1), s))));
  if (v[0] === "formula") return h("div", { class: "nm-formula" }, h("b", {}, v[1]), v[2]);
  if (v[0] === "keynums") return h("div", { class: "nm-kn" }, v[1].map(([a, b]) => h("span", {}, h("b", {}, a), b)));
  if (v[0] === "note") return h("div", { class: "nm-note" }, h("b", {}, v[1]), v[2]);
  return null;
};
export function examPage(id) {
  const box = h("div", { class: "stack stack-xl" }, h("p", { class: "mute" }, "Loading…"));
  Promise.all([idx(), exam(id)]).then(([I, E]) => {
    const meta = I.exams.find(x => x.id === id), m = mine(id), study = Store.get().study || {};
    const studied = E.units.filter(u => study[`nism:${id}:${u.n}`]).length;
    const nextMock = [1, 2, 3, 4, 5].find(n => !m[n]) || 1;
    const unit = u => {
      const k = `nism:${id}:${u.n}`, on = !!study[k];
      return h("details", { class: "syl-d nm-u" + (on ? " is-done" : ""), id: `u${u.n}` },
        h("summary", {}, h("span", { class: "syl-n" }, String(u.n).padStart(2, "0")), h("span", { class: "syl-st" }, u.title), h("span", { class: "nm-wt" }, u.w + "%"), on ? h("span", { class: "pill ok" }, "Studied") : null),
        h("div", { class: "syl-body stack stack-s" },
          h("p", { class: "lead" }, u.overview),
          u.focus?.length ? h("div", { class: "stack stack-xs" }, h("div", { class: "eyebrow" }, "What the exam looks for"), h("ul", { class: "facts" }, u.focus.map(t => h("li", {}, t)))) : null,
          ...(u.visuals || []).map(v => vis(v)),
          h("div", { class: "eyebrow" }, `Concept cards · ${u.facts.length}`),
          h("div", { class: "nm-cards" }, u.facts.map((f, i) => h("div", { class: "nm-card" }, h("span", { class: "nm-cn" }, String(i + 1).padStart(2, "0")), h("div", {}, h("h4", {}, f[0]), h("p", {}, f[1]), h("p", { class: "nm-ex" }, h("b", {}, "Example "), f[2]), h("p", { class: "nm-wo" }, h("b", {}, "Watch out "), "Not true: " + f[3].charAt(0).toLowerCase() + f[3].slice(1)))))),
          h("div", { class: "row-flex between syl-act" }, h("label", { class: "syl-chk" }, h("input", { type: "checkbox", checked: on, on: { change: () => Store.toggleStudy(k) } }), " I've studied this unit"), h("a", { class: "small", href: pdfHref(meta), download: "" }, "Full PDF guide"))));
    };
    const mocks = [1, 2, 3, 4, 5].map(n => {
      const r = m[n];
      return h("div", { class: "nm-mock" + (r ? " done" : "") },
        h("div", { class: "nm-mn" }, n), h("div", { class: "nm-mi" }, h("b", {}, `Mock ${n} · ${LEVELS[n - 1]}`), h("span", { class: "small mute" }, r ? `Best ${fx(r.best)} / ${E.marks || E.qs} · ${r.att} attempt${r.att > 1 ? "s" : ""} · ${r.best >= E.passMarks ? "Passed" : "Below pass mark"}` : `${E.qs} questions · ${E.mins} minutes`),
          h("div", { class: "nm-dots", "aria-label": "Difficulty" }, [1, 2, 3, 4, 5].map(i => h("i", { class: i <= n ? "on" : "" })))),
        h("div", { class: "row-flex" }, h("a", { class: "btn small " + (r ? "ghost" : "primary"), href: `#/nism/${id}/mock/${n}` }, r ? "Retake" : "Start"), r?.last ? h("a", { class: "btn ghost small", href: `#/nism/${id}/mock/${n}?review=1` }, "Review") : null));
    });
    box.replaceChildren(
      h("section", { class: "hero stack" },
        h("a", { class: "small", href: "#/nism" }, icon("left", 16), "All NISM exams"),
        h("div", { class: "row-flex", style: "gap:10px" }, h("span", { class: "pill gold" }, E.code), h("span", { class: "pill" }, `${E.units.length} units`)),
        h("h1", { class: "h1", style: "font-size:clamp(30px,5vw,46px)" }, E.title), h("p", { class: "lead" }, E.blurb),
        h("div", { class: "stats" }, h("span", {}, h("b", {}, E.qs), " questions"), h("span", {}, h("b", {}, E.mins), " minutes"), h("span", {}, h("b", {}, E.pass + "%"), " to pass"), h("span", {}, h("b", {}, E.neg), " negative marking")),
        h("div", { class: "row-flex" }, dlBtn(meta), h("a", { class: "btn ghost light", href: `#/nism/${id}/mock/${nextMock}` }, `Take Mock ${nextMock}`))),
      h("div", { class: "cols" },
        h("div", { class: "stack stack-l" },
          h("section", { class: "stack" }, h("h2", { class: "h2" }, "Where the marks are"), h("div", { class: "nm-w" }, E.units.map(u => h("a", { class: "nm-wr", href: `#/nism/${id}`, on: { click: ev => { ev.preventDefault(); const d = document.getElementById("u" + u.n); d.open = true; d.scrollIntoView({ behavior: "smooth", block: "start" }); } } }, h("span", { class: "nm-wl" }, `${u.n}. ${u.title}`), h("span", { class: "nm-wb" }, h("i", { style: `width:${u.w / Math.max(...E.units.map(x => x.w)) * 100}%` })), h("b", {}, u.w + "%"))))),
          h("section", { class: "stack" }, h("div", { class: "row-flex between" }, h("h2", { class: "h2" }, "Five mocks, rising difficulty"), h("span", { class: "small mute" }, "Negative marking: " + E.neg)), ...mocks),
          h("section", { class: "stack" }, h("div", { class: "row-flex between" }, h("h2", { class: "h2" }, "Study map"), h("button", { class: "btn ghost small", on: { click: ev => { const d = [...document.querySelectorAll(".nm-u")], o = d.some(x => !x.open); d.forEach(x => x.open = o); ev.currentTarget.textContent = o ? "Collapse all" : "Expand all"; } } }, "Expand all")),
            h("div", { class: "syl-meter" }, h("div", { class: "syl-meter-t" }, h("b", {}, `${studied} of ${E.units.length} units studied`), h("span", {}, studied === E.units.length ? "Syllabus complete. Go for Mock 3 and above." : "Tick each unit once you can explain it aloud.")), bar(studied / E.units.length * 100)),
            ...E.units.map(unit))),
        h("aside", {}, h("div", { class: "card stack" }, h("h3", { class: "h3" }, "How to prepare"),
          h("div", { class: "stack stack-s small" }, ["Download the PDF and read the first three pages.", "Study the biggest units first.", "Take Mock 1 after one pass through the guide.", "Move up a mock only when you clear the pass mark by 15 marks.", "Redo every wrong answer. Each one names its unit."].map((t, i) => h("div", { class: "row-flex", style: "gap:10px;align-items:flex-start;flex-wrap:nowrap" }, h("b", {}, i + 1 + "."), h("span", {}, t)))),
          dlBtn(meta, "btn primary block")))));
  }).catch(e => { console.error(e); fail(box); });
  return widePage(box);
}

/* ——— mock runner (full screen) ——— */
const key = (id, n) => `nm:${id}:${n}`;
const ss = { get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } }, set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { } }, del(k) { try { sessionStorage.removeItem(k); } catch { } } };
let tick = null;
export function mock(root, id, n, review) {
  clearInterval(tick);
  root.replaceChildren(h("main", { class: "wrap page" }, h("p", { class: "mute" }, "Loading your mock…")));
  exam(id).then(E => {
    const M = E.mocks[n - 1] && { qs: E.mocks[n - 1] };
    if (!M) return void (location.hash = `#/nism/${id}`);
    if (review) { const r = (mine(id)[n] || {}).last; if (r && r.a) return result(root, E, M, n, r, true); }
    const total = M.qs.length, saved = ss.get(key(id, n));
    const S = saved && saved.end > Date.now() ? saved : { a: Array(total).fill(null), f: [], cur: 0, end: Date.now() + E.mins * 60000, start: Date.now() };
    const save = () => ss.set(key(id, n), S);
    const left = () => Math.max(0, Math.round((S.end - Date.now()) / 1000));
    const clock = h("span", { class: "nm-clock" });
    const body = h("div", { class: "nm-q" }), pal = h("div", { class: "nm-pal" }), prog = h("span", { class: "nm-prog" });
    const fmtT = s => `${String(Math.floor(s / 3600)).padStart(1, "0")}:${String(Math.floor(s % 3600 / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
    function finish(auto) {
      const answered = S.a.filter(x => x != null).length;
      if (!auto && answered < total && !confirm(`${total - answered} question${total - answered > 1 ? "s are" : " is"} unanswered. Submit anyway?`)) return;
      clearInterval(tick); ss.del(key(id, n));
      const un = {}; let c = 0, w = 0, sc = 0, sw = 0;
      M.qs.forEach((q, i) => { const u = (un[q.u] = un[q.u] || [0, 0]); u[1]++; if (S.a[i] == null) return; const mk = q.m || 1; if (S.a[i] === q.a) { c++; sc += mk; u[0]++; } else { w++; sw += mk; } });
      const s = sc - sw * E.negf, rec = { s: Math.round(s * 100) / 100, c, w, u: total - c - w, t: Math.round((Date.now() - S.start) / 1000), d: Date.now(), un, a: S.a, f: S.f };
      Store.saveMock(id, n, rec); result(root, E, M, n, rec, false);
    }
    function paint() {
      const q = M.qs[S.cur], flagged = S.f.includes(S.cur);
      prog.textContent = `Question ${S.cur + 1} of ${total}${q.m > 1 ? " · " + q.m + " marks" : ""}`;
      body.replaceChildren(
        h("div", { class: "eyebrow" }, `Unit ${q.u} · ${E.units.find(u => u.n === q.u)?.title || ""}`),
        h("h2", { class: "nm-qt" }, q.p),
        h("div", { class: "nm-opts", role: "radiogroup" }, q.o.map((t, i) => h("button", { class: "nm-opt" + (S.a[S.cur] === i ? " on" : ""), role: "radio", "aria-checked": String(S.a[S.cur] === i), on: { click: () => { S.a[S.cur] = S.a[S.cur] === i ? null : i; save(); paint(); } } }, h("span", { class: "nm-l" }, "ABCD"[i]), h("span", {}, t)))),
        h("div", { class: "row-flex between nm-nav" },
          h("div", { class: "row-flex" }, h("button", { class: "btn ghost", disabled: S.cur === 0, on: { click: () => { S.cur--; save(); paint(); } } }, "Previous"), h("button", { class: "btn ghost", on: { click: () => { flagged ? S.f.splice(S.f.indexOf(S.cur), 1) : S.f.push(S.cur); save(); paint(); } } }, flagged ? "Unflag" : "Flag for review")),
          S.cur < total - 1 ? h("button", { class: "btn primary", on: { click: () => { S.cur++; save(); paint(); } } }, "Next") : h("button", { class: "btn primary", on: { click: () => finish(false) } }, "Submit mock")));
      pal.replaceChildren(...M.qs.map((_, i) => h("button", { class: "nm-pb" + (S.a[i] != null ? " a" : "") + (S.f.includes(i) ? " f" : "") + (i === S.cur ? " c" : ""), "aria-label": `Question ${i + 1}`, on: { click: () => { S.cur = i; save(); paint(); } } }, i + 1)));
    }
    const upd = () => { const s = left(); clock.textContent = fmtT(s); clock.classList.toggle("low", s < 600); if (s <= 0) finish(true); };
    root.replaceChildren(h("div", { class: "nm-run" },
      h("header", { class: "nm-top" }, h("a", { class: "nm-x", href: `#/nism/${id}`, "aria-label": "Leave mock", on: { click: ev => { if (!confirm("Leave this mock? Your answers are kept while this tab stays open.")) ev.preventDefault(); } } }, icon("x", 20)), h("div", { class: "nm-title" }, h("b", {}, `${E.code} · Mock ${n}`), h("span", {}, LEVELS[n - 1])), prog, clock, h("button", { class: "btn primary small", on: { click: () => finish(false) } }, "Submit")),
      h("div", { class: "nm-body" }, body, h("aside", { class: "nm-side" }, h("div", { class: "eyebrow" }, "Question palette"), pal, h("div", { class: "nm-key" }, h("span", { class: "a" }, "Answered"), h("span", { class: "f" }, "Flagged"), h("span", {}, "Not answered")), h("p", { class: "tiny mute" }, `Pass mark ${E.passMarks}. ${E.neg === "None" ? "No negative marking: attempt everything." : "Negative marking: " + E.neg + ". Skip when unsure."}`)))));
    paint(); upd(); tick = setInterval(() => { if (!document.querySelector(".nm-run")) return clearInterval(tick); upd(); }, 1000);
    window.onkeydown = ev => { if (!document.querySelector(".nm-run") || /input|textarea/i.test(ev.target.tagName)) return; const k = ev.key; if ("1234".includes(k) && k.length === 1) { S.a[S.cur] = +k - 1; save(); paint(); } else if (k === "ArrowRight" && S.cur < total - 1) { S.cur++; save(); paint(); } else if (k === "ArrowLeft" && S.cur > 0) { S.cur--; save(); paint(); } };
  }).catch(e => { console.error(e); root.replaceChildren(h("main", { class: "wrap page stack" }, h("h1", { class: "h1" }, "Could not load this mock."), h("a", { class: "btn primary", href: `#/nism/${id}` }, "Back"))); });
}

function result(root, E, M, n, r, isReview) {
  const total = M.qs.length, pass = r.s >= E.passMarks, mins = Math.round(r.t / 60);
  const units = Object.entries(r.un).map(([u, [c, t]]) => ({ u: +u, c, t, p: t ? c / t : 0, title: E.units.find(x => x.n === +u)?.title })).sort((a, b) => a.p - b.p);
  let filter = "all"; const list = h("div", { class: "stack" });
  const paintList = () => list.replaceChildren(...M.qs.map((q, i) => ({ q, i, a: r.a ? r.a[i] : null })).filter(({ q, i, a }) => filter === "all" || (filter === "wrong" && a != null && a !== q.a) || (filter === "skipped" && a == null) || (filter === "flag" && (r.f || []).includes(i))).map(({ q, i, a }) =>
    h("div", { class: "card stack stack-s nm-rv " + (a == null ? "sk" : a === q.a ? "ok" : "bad") }, h("div", { class: "eyebrow" }, `Q${i + 1} · Unit ${q.u} · ${a == null ? "Skipped" : a === q.a ? "Correct" : "Wrong"}`), h("p", { class: "nm-qt2" }, q.p),
      h("div", { class: "stack stack-xs" }, q.o.map((t, k) => h("div", { class: "nm-ro" + (k === q.a ? " right" : k === a ? " wrong" : "") }, h("b", {}, "ABCD"[k]), h("span", {}, t)))), h("p", { class: "small" }, h("b", {}, "Why: "), q.w))));
  const tabs = h("div", { class: "chips" }, [["all", "All"], ["wrong", "Wrong"], ["skipped", "Skipped"], ["flag", "Flagged"]].map(([k, l]) => h("button", { class: "chip" + (k === filter ? " on" : ""), on: { click: ev => { filter = k; tabs.querySelectorAll(".chip").forEach(b => b.classList.remove("on")); ev.currentTarget.classList.add("on"); paintList(); } } }, l)));
  paintList();
  root.replaceChildren(widePage(
    h("section", { class: "hero stack" }, h("a", { class: "small", href: `#/nism/${E.id}` }, icon("left", 16), E.title), h("div", { class: "eyebrow gold" }, `Mock ${n} · ${LEVELS[n - 1]}${isReview ? " · review" : ""}`),
      h("h1", { class: "h1", style: "font-size:clamp(34px,6vw,56px)" }, pass ? "You cleared it." : "Not there yet."),
      h("p", { class: "lead" }, `${fx(r.s)} / ${E.marks || total} marks. Pass mark ${E.passMarks}. ${pass ? (n < 5 ? `Move on to Mock ${n + 1}.` : "You are exam-ready. Book the real one.") : "Study the weak units below, then retake. Questions repeat across mocks, so read each explanation."}`),
      h("div", { class: "stats" }, h("span", {}, h("b", {}, r.c), " correct"), h("span", {}, h("b", {}, r.w), " wrong"), h("span", {}, h("b", {}, r.u), " skipped"), h("span", {}, h("b", {}, mins), " min used")),
      h("div", { class: "row-flex" }, h("a", { class: "btn primary", href: `#/nism/${E.id}/mock/${n}` }, "Retake"), n < 5 ? h("a", { class: "btn ghost light", href: `#/nism/${E.id}/mock/${n + 1}` }, `Mock ${n + 1}`) : null, h("a", { class: "btn ghost light", href: `#/nism/${E.id}` }, "Exam page"))),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Unit-wise accuracy"), h("p", { class: "mute" }, "Weakest first. Revise these units before the next mock."),
      h("div", { class: "nm-w" }, units.map(x => h("a", { class: "nm-wr", href: `#/nism/${E.id}` }, h("span", { class: "nm-wl" }, `${x.u}. ${x.title}`), h("span", { class: "nm-wb " + (x.p < .5 ? "bad" : x.p < .7 ? "mid" : "") }, h("i", { style: `width:${x.p * 100}%` })), h("b", {}, `${x.c}/${x.t}`))))),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Review every question"), tabs, list)));
  window.scrollTo(0, 0);
}
