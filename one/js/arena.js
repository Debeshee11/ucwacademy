/* The Arena: Practice, redesigned as a place to play.
   Daily five on top, then game modes (Speed round, Right or wrong, Duel a friend, Weak-spot trainer, Revise),
   quiz arenas, and a workshop for calculators and tools. Personal bests are kept on this device. */
import { h, icon, plural, shuffle, pick, toast, clear } from "./dom.js";
import { D, course, localize, questionsFor } from "./data.js";
import * as Store from "./store.js";
import { page } from "./ui.js";
import { isPro } from "./audience.js";
import * as Creds from "./creds.js";
import { orderedCourses } from "./path.js";
import { questionById } from "./quiz.js";
import { mascot } from "./mascot.js";
import { cheer } from "./cheer.js";
import { duelRecord } from "./challenge.js";

const best = k => { try { return +localStorage.getItem("uc.best." + k) || 0; } catch { return 0; } };
const setBest = (k, v) => { try { localStorage.setItem("uc.best." + k, String(v)); } catch {} };
const html = (cls, str, tag = "span") => { const e = h(tag, { class: cls }); e.innerHTML = str; return e; };

/* Questions the learner has met: from lessons they finished, or the first lessons of their path. */
function pool() {
  let p = questionsFor(Object.keys(Store.get().done).map(Number));
  if (p.length < 12) p = questionsFor(orderedCourses().flatMap(c => c.lessons).slice(0, 14));
  return p.filter(q => q.options && q.options.length >= 2);
}
/* A question with its options shuffled, and the answer index following. */
function arrange(q) {
  const l = localize(q, Store.get().lang), order = shuffle(l.options.map((_, i) => i));
  return { ...l, options: order.map(i => l.options[i]), answer: order.indexOf(l.answer), wrong: order.map(i => (l.wrong || [])[i] || null) };
}
const shell = (root, ...kids) => { clear(root); const m = h("main", { class: "wrap page gm" }, ...kids); root.append(m); window.scrollTo(0, 0); return m; };
const exitBtn = () => h("a", { class: "icon-btn", href: "#/practice", "aria-label": "Leave the game" }, icon("x", 22));

/* A question card with Sarthi's face reacting to each answer and a "+10" that floats up. */
function qcard(label) {
  const q = h("h1", { class: "gm-q" }), f = h("span", { class: "gm-face" }), pop = h("span", { class: "gm-pop", "aria-hidden": "true" });
  const set = m => { f.innerHTML = mascot({ mood: m, pose: "stand", view: "head", px: 58 }); }; set("happy");
  return { el: h("div", { class: "gm-card" }, h("div", { class: "gm-ch" }, h("span", { class: "gm-tag" }, label), f), q, pop), q, set, float: s => { pop.textContent = s; pop.classList.remove("go"); void pop.offsetWidth; pop.classList.add("go"); } };
}

/* ——— Speed round: 60 seconds, combo multiplier ——— */
export function speedRound(root) {
  const P = shuffle(pool()), LEN = 60;
  let i = 0, left = LEN, score = 0, combo = 0, bestCombo = 0, right = 0, asked = 0, locked = false, over = false, t;
  const timeBar = h("i", { style: "width:100%" }), timeTxt = h("b", { class: "gm-time" }, LEN), scoreEl = h("b", { class: "gm-score" }, "0"), mult = h("span", { class: "gm-mult" });
  const C = qcard("Speed round"), qEl = C.q, opts = h("div", { class: "gm-opts" }), fb = h("p", { class: "gm-fb", "aria-live": "polite" });
  shell(root, h("div", { class: "gm-top" }, exitBtn(), h("div", { class: "gm-bar" }, timeBar), h("span", { class: "gm-clock" }, "⏱ ", timeTxt)), h("div", { class: "gm-hud" }, h("span", {}, "Score ", scoreEl), mult), C.el, opts, fb);
  const m = () => 1 + Math.min(3, Math.floor(combo / 3));
  function ask() {
    const q = arrange(P[i % P.length]); i++; locked = false; fb.textContent = ""; fb.className = "gm-fb"; qEl.textContent = q.prompt; clear(opts);
    q.options.forEach((o, k) => opts.append(h("button", { class: "gm-opt", type: "button", on: { click: e => choose(q, k, e.currentTarget) } }, h("span", { class: "key" }, k + 1), h("span", {}, o))));
    q._el = opts;
  }
  function choose(q, k, el) {
    if (locked || over) return; locked = true; asked++;
    const ok = k === q.answer; Store.recordAnswer(q.id, ok);
    opts.querySelectorAll(".gm-opt").forEach((b, j) => { b.disabled = true; if (j === q.answer) b.classList.add("right"); else if (j === k) b.classList.add("wrong"); });
    if (ok) { combo++; right++; bestCombo = Math.max(bestCombo, combo); const add = 10 * m(); score += add; scoreEl.textContent = score; fb.textContent = combo >= 3 ? `+${add}  combo x${m()}` : `+${add}`; fb.className = "gm-fb ok"; C.set("joy"); C.float("+" + add); }
    else { combo = 0; C.set("think"); try { navigator.vibrate && navigator.vibrate(40); } catch {} fb.textContent = (q.wrong[k] || q.why || "Not quite.").slice(0, 150); fb.className = "gm-fb bad"; }
    mult.textContent = combo >= 3 ? `x${m()} combo` : combo ? `${combo} in a row` : ""; mult.className = "gm-mult" + (combo >= 3 ? " hot" : "");
    setTimeout(() => { if (!over) ask(); }, ok ? 450 : 1500);
  }
  function end() {
    over = true; clearInterval(t); document.removeEventListener("keydown", keys);
    const prev = best("speed"), nb = score > prev; if (nb) setBest("speed", score);
    if (nb && score > 0) cheer("New best!", 30);
    shell(root, h("div", { class: "gm-end stack" }, html("gm-m", mascot({ mood: nb ? "joy" : "happy", pose: "cheer", view: "bust", px: 110 })),
      h("p", { class: "gm-kick" }, nb ? "New personal best" : "Time"), h("div", { class: "gm-final" }, score), h("p", { class: "mute" }, `points in 60 seconds. Best: ${Math.max(prev, score)}`),
      h("div", { class: "gm-stats" }, h("span", {}, h("b", {}, `${right}/${asked}`), h("small", {}, "right")), h("span", {}, h("b", {}, asked ? Math.round(100 * right / asked) + "%" : "–"), h("small", {}, "accuracy")), h("span", {}, h("b", {}, bestCombo), h("small", {}, "best combo"))),
      h("div", { class: "stack stack-s" }, h("button", { class: "btn gold big", type: "button", on: { click: () => speedRound(root) } }, "Play again"), h("a", { class: "btn ghost", href: "#/challenge" }, "Duel a friend"), h("a", { class: "btn ghost", href: "#/practice" }, "Back to Practice"))));
  }
  function keys(e) { if (!root.isConnected) return document.removeEventListener("keydown", keys); if (/^[1-4]$/.test(e.key)) opts.querySelectorAll(".gm-opt")[+e.key - 1]?.click(); }
  document.addEventListener("keydown", keys);
  t = setInterval(() => { if (!root.isConnected) return clearInterval(t); left--; timeTxt.textContent = left; timeBar.style.width = `${100 * left / LEN}%`; if (left <= 10) timeBar.classList.add("low"); if (left <= 0) end(); }, 1000);
  ask();
}

/* ——— Right or wrong: a statement, a quick call ——— */
export function rightWrong(root) {
  const N = 10, qs = pick(pool(), N).map(arrange).map(q => { const truth = Math.random() < .5, wrongIdx = shuffle(q.options.map((_, i) => i).filter(i => i !== q.answer))[0]; return { q, shown: truth ? q.answer : wrongIdx, truth }; });
  let i = 0, right = 0, streak = 0, bestS = 0, busy = false;
  const face = h("span", { class: "gm-face" }), bar = h("i", { style: "width:0%" }), card = h("div", { class: "rw-card" }), strip = h("div", { class: "gm-fb", "aria-live": "polite" }), stk = h("span", { class: "gm-mult" });
  const yes = h("button", { class: "rw-btn yes", type: "button", on: { click: () => call(true) } }, icon("check", 26), "Right"), no = h("button", { class: "rw-btn no", type: "button", on: { click: () => call(false) } }, icon("x", 26), "Wrong");
  const next = h("button", { class: "btn gold big", type: "button", hidden: true, on: { click: () => { i++; i < N ? paint() : end(); } } }, "Next");
  shell(root, h("div", { class: "gm-top" }, exitBtn(), h("div", { class: "gm-bar" }, bar), h("b", { class: "gm-time" }, `${N}`)), h("div", { class: "gm-hud" }, h("span", {}, "Is this answer right?"), stk), card, strip, h("div", { class: "rw-btns" }, no, yes), next);
  const keys = e => { if (!root.isConnected) return document.removeEventListener("keydown", keys); if (e.key === "ArrowRight") yes.click(); else if (e.key === "ArrowLeft") no.click(); else if (e.key === "Enter" && !next.hidden) next.click(); };
  document.addEventListener("keydown", keys);
  function paint() {
    const { q, shown } = qs[i]; busy = false; bar.style.width = `${100 * i / N}%`; next.hidden = true; yes.disabled = no.disabled = false; strip.textContent = ""; strip.className = "gm-fb";
    card.className = "rw-card in"; face.innerHTML = mascot({ mood: "happy", pose: "stand", view: "head", px: 54 }); card.replaceChildren(h("div", { class: "gm-ch" }, h("small", {}, `Question ${i + 1} of ${N}`), face), h("h1", { class: "gm-q" }, q.prompt), h("div", { class: "rw-ans" }, h("small", {}, "Proposed answer"), h("b", {}, q.options[shown])));
  }
  function call(say) {
    if (busy) return; busy = true; const { q, truth } = qs[i], ok = say === truth; Store.recordAnswer(q.id, ok); yes.disabled = no.disabled = true;
    if (ok) { right++; streak++; bestS = Math.max(bestS, streak); } else streak = 0;
    stk.textContent = streak >= 2 ? `${streak} in a row` : ""; stk.className = "gm-mult" + (streak >= 3 ? " hot" : "");
    card.classList.add(ok ? "ok" : "bad"); face.innerHTML = mascot({ mood: ok ? "joy" : "think", pose: "stand", view: "head", px: 54 }); strip.className = "gm-fb " + (ok ? "ok" : "bad");
    strip.textContent = (ok ? "Correct. " : "Not quite. ") + (truth ? "That answer is right. " : `The right answer: ${q.options[q.answer]}. `) + (q.why || "").slice(0, 160);
    next.hidden = false; next.textContent = i === N - 1 ? "See result" : "Next"; next.focus();
  }
  function end() {
    document.removeEventListener("keydown", keys); const prev = best("rw"), nb = right > prev; if (nb) setBest("rw", right); if (right >= 8) cheer(right === N ? "Perfect!" : "Sharp!", 28);
    shell(root, h("div", { class: "gm-end stack" }, html("gm-m", mascot({ mood: right >= 7 ? "joy" : "think", pose: "cheer", view: "bust", px: 110 })),
      h("p", { class: "gm-kick" }, nb ? "New personal best" : "Round over"), h("div", { class: "gm-final" }, `${right}/${N}`), h("p", { class: "mute" }, `Best run: ${bestS} in a row. Best score: ${Math.max(prev, right)}/${N}`),
      h("div", { class: "stack stack-s" }, h("button", { class: "btn gold big", type: "button", on: { click: () => rightWrong(root) } }, "Play again"), h("a", { class: "btn ghost", href: "#/challenge" }, "Duel a friend"), h("a", { class: "btn ghost", href: "#/practice" }, "Back to Practice"))));
  }
  paint();
}

/* ——— Survival: three hearts, how far can you go? ——— */
export function survival(root) {
  const P = shuffle(pool()); let i = 0, hearts = 3, run = 0, locked = false;
  const hr = h("div", { class: "sv-hearts", "aria-live": "polite" }), cnt = h("b", { class: "gm-score" }, "0"), C = qcard("Survival"), qEl = C.q, opts = h("div", { class: "gm-opts" }), fb = h("p", { class: "gm-fb" });
  const paintH = () => hr.replaceChildren(...[0, 1, 2].map(k => h("span", { class: k < hearts ? "on" : "off" }, "♥")));
  shell(root, h("div", { class: "gm-top" }, exitBtn(), hr), h("div", { class: "gm-hud" }, h("span", {}, "Answered ", cnt), h("span", { class: "gm-mult" }, "Three misses and it is over")), C.el, opts, fb);
  const keys = e => { if (!root.isConnected) return document.removeEventListener("keydown", keys); if (/^[1-4]$/.test(e.key)) opts.querySelectorAll(".gm-opt")[+e.key - 1]?.click(); };
  document.addEventListener("keydown", keys);
  function ask() {
    const q = arrange(P[i % P.length]); i++; locked = false; fb.textContent = ""; fb.className = "gm-fb"; qEl.textContent = q.prompt; clear(opts);
    q.options.forEach((o, k) => opts.append(h("button", { class: "gm-opt", type: "button", on: { click: () => pickA(q, k) } }, h("span", { class: "key" }, k + 1), h("span", {}, o))));
  }
  function pickA(q, k) {
    if (locked) return; locked = true; const ok = k === q.answer; Store.recordAnswer(q.id, ok);
    opts.querySelectorAll(".gm-opt").forEach((b, j) => { b.disabled = true; if (j === q.answer) b.classList.add("right"); else if (j === k) b.classList.add("wrong"); });
    if (ok) { run++; cnt.textContent = run; fb.textContent = run % 5 === 0 ? `${run} in a row. Keep going.` : "Correct"; fb.className = "gm-fb ok"; C.set("joy"); C.float("+1"); }
    else { hearts--; paintH(); C.set("think"); try { navigator.vibrate && navigator.vibrate(40); } catch {} fb.textContent = (q.wrong[k] || q.why || "Not quite.").slice(0, 150); fb.className = "gm-fb bad"; }
    if (hearts <= 0) return setTimeout(end, 1400);
    setTimeout(ask, ok ? 500 : 1500);
  }
  function end() {
    document.removeEventListener("keydown", keys); const prev = best("surv"), nb = run > prev; if (nb) setBest("surv", run); if (nb && run >= 5) cheer("New best!", 28);
    shell(root, h("div", { class: "gm-end stack" }, html("gm-m", mascot({ mood: run >= 10 ? "joy" : "think", pose: "cheer", view: "bust", px: 110 })), h("p", { class: "gm-kick" }, nb ? "New personal best" : "Out of hearts"),
      h("div", { class: "gm-final" }, run), h("p", { class: "mute" }, `questions in a row before the third miss. Best: ${Math.max(prev, run)}`),
      h("div", { class: "stack stack-s" }, h("button", { class: "btn gold big", type: "button", on: { click: () => survival(root) } }, "Go again"), h("a", { class: "btn ghost", href: "#/quiz/weak" }, "Train weak spots"), h("a", { class: "btn ghost", href: "#/practice" }, "Back to Practice"))));
  }
  paintH(); ask();
}

/* ——— Training grounds: practise one module at a time ——— */
const mastery = nums => { const qs = questionsFor(nums); if (!qs.length) return 0; const q = Store.get().q; return Math.round(100 * qs.reduce((a, x) => a + Math.min(4, (q[x.id] && q[x.id].b) || 0) / 4, 0) / qs.length); };
function grounds() {
  const s = Store.get(); let cs = orderedCourses().filter(c => c.lessons.some(n => s.done[n])); if (!cs.length) cs = orderedCourses().slice(0, 1);
  cs = cs.slice(0, 8);
  return h("div", { class: "tg" }, cs.map(c => { const all = mastery(c.lessons);
    return h("article", { class: "tg-c" }, h("div", { class: "tg-h" }, h("b", {}, c.title), h("span", { class: "tg-m" }, `${all}% mastered`)),
      h("div", { class: "tg-rows" }, c.modules.map((m, mi) => { const k = mastery(m.lessons), qn = questionsFor(m.lessons).length;
        return h("a", { class: "tg-r " + (k >= 70 ? "hi" : k >= 35 ? "mid" : "lo"), href: `#/quiz/drill/${c.id}/${mi}`, "aria-label": `Train ${m.title}, ${k}% mastered` },
          h("span", { class: "tg-n" }, String(mi + 1)), h("span", { class: "tg-t" }, h("b", {}, m.title), h("div", { class: "tg-b" }, h("i", { style: `width:${Math.max(4, k)}%` }))), h("span", { class: "tg-k" }, qn ? k + "%" : "–"), h("span", { class: "tg-go" }, "Train")); })));
  }));
}

/* ——— Trophies ——— */
function trophies() {
  const s = Store.get(), r = duelRecord(), a = Store.todayAct(), lessons = Object.keys(s.done).length;
  const T = [["first", "First duel", "Play one duel", r.w + r.l + r.t >= 1, "team"], ["win", "Duel winner", "Win a duel", r.w >= 1, "trophy"], ["win5", "Duel champion", "Win 5 duels", r.w >= 5, "award"],
    ["sp100", "Quick hands", "Score 100 in Speed round", best("speed") >= 100, "bolt"], ["sp250", "Lightning", "Score 250 in Speed round", best("speed") >= 250, "bolt"], ["rw", "Sharp eye", "Ten out of ten in Right or wrong", best("rw") >= 10, "check"],
    ["sv", "Survivor", "Fifteen in a row in Survival", best("surv") >= 15, "shield"], ["st7", "Week warrior", "A 7 day streak", Store.streakNow() >= 7, "flame"], ["l10", "Getting started", "Finish 10 lessons", lessons >= 10, "book"], ["d5", "Daily habit", "Do the Daily five today", !!a.d, "star"]];
  const n = T.filter(x => x[3]).length;
  return h("section", { class: "stack stack-s" }, h("div", { class: "row-flex between" }, h("h2", { class: "h2" }, "Trophies"), h("span", { class: "pill gold" }, `${n} of ${T.length}`)),
    h("div", { class: "tr-grid" }, T.map(([id, t, d, on, ic]) => h("div", { class: "tr-i" + (on ? " on" : ""), title: d }, h("span", {}, icon(on ? ic : "lock", 22)), h("b", {}, t), h("small", {}, d)))));
}

/* ——— Weak-spot trainer: the questions you miss most ——— */
export function weakIds() {
  return Object.entries(Store.get().q).filter(([id, e]) => e.n >= 1 && e.r / e.n < .7 && questionById(id)).sort((a, b) => a[1].r / a[1].n - b[1].r / b[1].n || b[1].n - a[1].n).map(([id]) => id);
}

/* ——— the hub ———
   Practice makes lessons stick. To keep it simple the page shows one "next best step", then six tabs that each answer one question:
   For you, Remember, Play, Compete, Test, Tools. Only one tab is open at a time. */
const mode = (href, cls, ic, title, sub, badge, meta) => h("a", { class: "ar-mode " + cls, href }, h("span", { class: "ar-ic" }, icon(ic, 28)), h("b", {}, title), h("small", {}, sub), meta ? h("span", { class: "ar-meta" }, meta) : null, badge ? h("span", { class: "ar-badge" }, badge) : null);
const tool = (href, ic, title, sub) => h("a", { class: "ar-tool", href }, h("span", {}, icon(ic, 22)), h("div", {}, h("b", {}, title), h("small", {}, sub)), icon("chev", 18));
const TABS = [["you", "For you", "star", "Your best next step, picked for today."], ["remember", "Remember", "flame", "Short rounds that move lessons into long-term memory."], ["play", "Play", "bolt", "Quick games for fun. Points and personal bests."],
  ["compete", "Compete", "trophy", "Challenge friends, earn trophies, climb the board."], ["test", "Test", "check", "Longer quizzes and exams to see where you stand."], ["tools", "Tools", "trend", "Calculators and reading for real-life money questions."]];
const TABKEY = "uc.practice.tab";

export function arena() {
  const a = Store.todayAct(), due = Store.dueIds().length, s = Store.get(), streak = Store.streakNow(), labN = Object.keys(s.lab || {}).length, weak = weakIds().length;
  const renew = Creds.all().filter(c => c.kind === "course" && Creds.standing(c) !== "valid"), rec = duelRecord(), sb = best("speed"), rb = best("rw"), vb = best("surv");
  let tab = "you"; try { tab = sessionStorage.getItem(TABKEY) || "you"; } catch {}
  if (!TABS.some(x => x[0] === tab)) tab = "you";

  /* one clear recommendation */
  const R = due && !a.r ? { href: "#/quiz/revise", ic: "flame", cls: "m-orange", t: "Revise what is due", why: `${plural(due, "question")} ${due === 1 ? "is" : "are"} ready for review. Doing it now keeps them in memory.`, meta: "About 2 min" }
    : weak >= 3 ? { href: "#/quiz/weak", ic: "shuffle", cls: "m-blue", t: "Fix your weak spots", why: `You have ${plural(weak, "question")} you often miss. Eight of them, right now.`, meta: "About 3 min" }
    : !a.d ? { href: "#/quiz/daily", ic: "bolt", cls: "m-gold", t: "Do today's Daily five", why: "Five questions that keep your streak alive.", meta: "About 2 min" }
    : { href: "#/game/speed", ic: "bolt", cls: "m-green", t: sb ? "Beat your Speed round best" : "Try a Speed round", why: sb ? `Your best is ${sb}. 60 seconds to beat it.` : "60 seconds, as many right answers as you can.", meta: "1 min" };

  const hero = h("section", { class: "ar-hero" }, html("ar-m", mascot({ mood: "joy", pose: "cheer", view: "bust", px: 118 })),
    h("div", { class: "ar-ht" }, h("h1", { class: "ar-h1" }, "Practice"), h("p", {}, "Make what you learned stick."),
      h("div", { class: "ar-chips" }, h("span", {}, icon("flame", 16), `${streak} day streak`), a.d ? h("span", {}, icon("check", 16), "Daily five done") : null)));
  const flow = h("div", { class: "ar-flow", "aria-label": "How Learn, Practice and Exams fit together" },
    [["Learn", "Lessons teach", false], ["Practice", "Practice makes it stick", true], ["Exams", "Exams prove it", false]].map(([a1, b1, on], i) => h("span", { class: "ar-step" + (on ? " on" : "") }, h("i", {}, String(i + 1)), h("b", {}, a1), h("small", {}, b1))));
  const next = h("a", { class: "ar-next " + R.cls, href: R.href }, h("span", { class: "ar-nic" }, icon(R.ic, 30)), h("div", { class: "grow" }, h("small", {}, "Your next step"), h("b", {}, R.t), h("span", {}, R.why)), h("span", { class: "ar-go" }, "Go"), h("small", { class: "ar-nm" }, R.meta));

  const tabs = h("div", { class: "ar-tabs", role: "tablist", "aria-label": "Practice sections" }, TABS.map(([id, label, ic]) => h("button", { type: "button", role: "tab", class: "ar-tab", "data-id": id, "aria-selected": String(id === tab), on: { click: () => setTab(id) } }, icon(ic, 18), label)));
  const lead = h("p", { class: "ar-lead" }), body = h("div", { class: "ar-body stack" });

  const dailyCard = () => h("a", { class: "ar-daily" + (a.d ? " done" : ""), href: "#/quiz/daily" }, h("span", { class: "ar-dic" }, icon(a.d ? "check" : "bolt", 30)),
    h("div", { class: "grow" }, h("small", {}, a.d ? "Done for today" : "Every day"), h("b", {}, "Daily five"), h("span", {}, a.d ? "Come back tomorrow to keep the streak." : "Five questions, two minutes. Keeps your streak alive.")), a.d ? null : h("span", { class: "ar-go" }, "Play"));
  const modes = {
    daily: () => dailyCard(),
    revise: () => mode("#/quiz/revise", "m-orange", "flame", "Revise", due ? `${plural(due, "question")} due for review` : "Nothing due right now", a.r ? "Done" : due ? String(due) : "", "Reminds you just in time"),
    weak: () => mode("#/quiz/weak", "m-blue", "shuffle", "Weak-spot trainer", weak ? `${plural(weak, "question")} you often miss` : "Answer more to unlock", weak ? "Train" : "", "8 questions"),
    speed: () => mode("#/game/speed", "m-gold", "bolt", "Speed round", "60 seconds. Build a combo.", sb ? `Best ${sb}` : "New", "1 min"),
    rw: () => mode("#/game/rw", "m-green", "check", "Right or wrong", "Ten quick calls. Spot the trap.", rb ? `Best ${rb}/10` : "New", "2 min"),
    surv: () => mode("#/game/survive", "m-pink", "shield", "Survival", "Three hearts. How far can you go?", vb ? `Best ${vb}` : "New", "Until 3 misses"),
    duel: () => mode("#/challenge", "m-violet", "team", "Duel a friend", "Send a link. See who wins.", rec.w + rec.l + rec.t ? `${rec.w}W ${rec.l}L` : "Share", "3 min")
  };
  const grid = (...ks) => h("div", { class: "ar-modes" }, ks.map(k => modes[k]()));
  const sec = (title, sub, ...kids) => h("section", { class: "stack stack-s" }, h("div", { class: "stack stack-xs" }, h("h2", { class: "h2" }, title), sub ? h("p", { class: "small mute" }, sub) : null), ...kids);
  const renewBox = renew.length ? sec("Renew a certificate", "Your certificate needs a quick refresher.", h("div", { class: "ar-modes" }, renew.map(c => mode(`#/quiz/refresh/${c.key}`, "m-pink", "award", c.title, Creds.standing(c) === "expired" ? "Expired. Renew with 15 questions" : "Expires soon. Renew with 15 questions")))) : null;
  const VIEW = {
    you: () => [renewBox, flow, sec("Play something quick", null, grid("speed", "rw", "duel")), sec("Pick up where it is weak", "Training grounds. Pick a module and ten questions.", grounds())],
    remember: () => [renewBox, dailyCard(), sec("More ways to remember", null, grid("revise", "weak")), sec("Training grounds", "Pick a module. Ten questions. Watch the bar fill as you master it.", grounds())],
    play: () => [sec("Games", "Each takes a few minutes. Every right answer counts toward your points.", grid("speed", "rw", "surv"))],
    compete: () => [sec("Challenge a friend", "Send a link on WhatsApp. They play the same questions. See who wins.", grid("duel")), trophies(), tool("#/board", "trophy", "Leaderboard", "See where you stand")],
    test: () => [sec("Quiz arenas", "Longer quizzes on one topic.", h("div", { class: "ar-modes small" },
      mode("#/quiz/fund", "m-blue", "book", "Fund quiz", "Factsheets, returns, risk, tax", "", "10 questions"), mode("#/quiz/market", "m-violet", "trend", "Market quiz", "Indices, economy, markets", "", "10 questions"),
      D.holdQs.some(q => q.tags.includes("holdings")) ? mode("#/quiz/holdings", "m-green", "trend", "Holdings quiz", "New every month", "", "10 questions") : null, mode("#/quiz/place", "m-gold", "check", "Placement test", "Find your level", "", "24 questions"))),
      sec("Exams", "Ready to prove it? Pass a course exam and earn a certificate.", tool("#/assess", "award", "Course exams", "Pass one to earn a certificate"))],
    tools: () => [sec("Tools", "Real-life money helpers.", h("div", { class: "ar-tools" }, tool("#/tools", "trend", "Money calculators", "SIP, EMI, emergency fund, retirement"), isPro() ? tool("#/lab", "chat", "Client lab", `${D.sims.length} real client questions · ${labN} tried`) : null,
      tool("#/news", "trend", "Market desk", "Today's headlines, explained"), tool("#/quotes", "star", "Quote bank", "Ideas worth sharing, as pictures")))]
  };
  function setTab(id) {
    tab = id; try { sessionStorage.setItem(TABKEY, id); } catch {}
    tabs.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.id === id)));
    lead.textContent = id === "you" ? "" : TABS.find(x => x[0] === id)[3]; lead.hidden = id === "you"; body.replaceChildren(...VIEW[id]().filter(Boolean)); body.classList.remove("swap"); void body.offsetWidth; body.classList.add("swap");
  }
  setTab(tab);
  return page(hero, next, tabs, lead, body);
}
