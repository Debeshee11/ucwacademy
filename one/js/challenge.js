/* Duel a friend. No server: the link itself carries everything.
   1. You pick a topic and play 5 or 10 questions. We time you.
   2. You send a link that holds the question ids, your first name, your score and your time.
   3. Your friend sees your score first, plays the same questions, and sees both results side by side. Higher score wins; a tie goes to the faster player.
   4. Your friend sends a reply link. When you open it you see the same head-to-head, and your duel log updates.
   Everything in a link is checked before use and shown as plain text. */
import { h, icon, toast, pick } from "./dom.js";
import * as Store from "./store.js";
import { course, questionsFor } from "./data.js";
import { orderedCourses } from "./path.js";
import { runQuiz, questionById } from "./quiz.js";
import { page } from "./ui.js";
import { mascot } from "./mascot.js";
import { cheer } from "./cheer.js";

const enc = o => btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const dec = s => { try { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))))); } catch { return null; } };
const base = () => `${location.origin}${location.pathname}`;
const linkFor = o => `${base()}#/challenge/${enc(o)}`;
const nm = s => String(s || "").replace(/[<>"&]/g, "").trim().slice(0, 24);
const myName = () => nm((Store.get().name || "").split(" ")[0]);
const fmtT = t => (t > 0 ? `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}` : "–");
const pc = (s, n) => (n ? Math.round(100 * s / n) : 0);
const html = (cls, str, tag = "span") => { const e = h(tag, { class: cls }); e.innerHTML = str; return e; };

/* A link is only used when it is well formed. Anything else falls back to the hub. */
function clean(o) {
  if (!o || typeof o !== "object" || !Array.isArray(o.q)) return null;
  const q = o.q.filter(x => typeof x === "string" && /^[\w-]{1,24}$/.test(x)).slice(0, 12);
  if (!q.length || !q.every(questionById)) return null;
  const num = (v, mx) => Math.max(0, Math.min(mx, Math.round(+v) || 0));
  const out = { k: o.k === "r" ? "r" : "c", id: String(o.id || "").replace(/[^\w-]/g, "").slice(0, 10) || "x", n: nm(o.n) || "A friend", s: num(o.s, q.length), t: num(o.t, 5999), c: nm(o.c).slice(0, 40) || "Mixed", q };
  if (out.k === "r") { const f = o.f || {}; out.f = { n: nm(f.n) || "A friend", s: num(f.s, q.length), t: num(f.t, 5999) }; }
  return out;
}

/* Higher score wins; with equal scores the faster time wins (if both times are known and differ). */
const verdict = (a, b) => a.s !== b.s ? (a.s > b.s ? 1 : -1) : a.t > 0 && b.t > 0 && a.t !== b.t ? (a.t < b.t ? 1 : -1) : 0;

/* ——— duel log, kept on this device ——— */
const LOG = "uc.duels";
const log = () => { try { const j = JSON.parse(localStorage.getItem(LOG)); return j && Array.isArray(j.d) ? j : { d: [] }; } catch { return { d: [] }; } };
const save = j => { try { j.d = j.d.slice(0, 40); localStorage.setItem(LOG, JSON.stringify(j)); } catch {} };
const upsert = e => { const j = log(), i = j.d.findIndex(x => x.id === e.id && x.side === e.side); if (i >= 0) j.d[i] = { ...j.d[i], ...e }; else j.d.unshift(e); save(j); };
export const duelRecord = () => { const r = { w: 0, l: 0, t: 0 }; for (const d of log().d) if (d.res === "w") r.w++; else if (d.res === "l") r.l++; else if (d.res === "t") r.t++; return r; };

/* ——— sharing ——— */
function shareBox(o, lead) {
  const url = linkFor(o), isR = o.k === "r";
  const text = isR ? `${o.f.n} scored ${o.f.s}/${o.q.length} against your ${o.s}/${o.q.length} in ${o.c} on UpperCrust Academy. See who won: ${url}`
    : `I scored ${o.s}/${o.q.length} (${pc(o.s, o.q.length)}%) in ${o.c} on UpperCrust Academy, in ${fmtT(o.t)}. Think you can beat me? ${url}`;
  return h("div", { class: "du-share stack stack-s" },
    lead ? h("p", { class: "small mute", style: "text-align:center" }, lead) : null,
    h("a", { class: "btn gold big", href: `https://wa.me/?text=${encodeURIComponent(text)}`, target: "_blank", rel: "noopener" }, icon("share", 20), "Send on WhatsApp"),
    h("div", { class: "row-flex", style: "justify-content:center;gap:10px;flex-wrap:wrap" },
      navigator.share ? h("button", { class: "btn ghost", type: "button", on: { click: () => navigator.share({ text, url }).catch(() => {}) } }, icon("share", 18), "More apps") : null,
      h("button", { class: "btn ghost", type: "button", on: { click: async () => { try { await navigator.clipboard.writeText(url); toast("Link copied"); } catch { toast("Could not copy. Use the WhatsApp button."); } } } }, icon("copy", 18), "Copy link")));
}

/* ——— cards ——— */
const who = (name, big) => h("span", { class: "du-av" + (big ? " big" : "") }, (name || "?").slice(0, 1).toUpperCase());

function scoreCard(o) {
  const n = o.q.length;
  return h("section", { class: "du-card" },
    h("div", { class: "du-card-top" }, html("du-m", mascot({ mood: "wow", pose: "cheer", view: "bust", px: 92 })), h("div", { class: "du-ct" }, h("small", {}, "Your challenge"), h("b", {}, o.c), h("span", {}, `${n} questions`))),
    h("div", { class: "du-big" }, h("b", {}, `${o.s}/${n}`), h("span", {}, `${pc(o.s, n)}%`), h("span", {}, `in ${fmtT(o.t)}`)),
    h("p", { class: "du-tag" }, `${o.n} says: beat my score.`));
}

function versus(me, you, n) {
  const v = verdict(me, you), col = (p, win, tie) => h("div", { class: "du-col" + (win ? " win" : "") + (tie ? " tie" : "") },
    win ? h("span", { class: "du-crown" }, icon("trophy", 22)) : null, who(p.n, true), h("b", { class: "du-nm" }, p.n),
    h("div", { class: "du-sc" }, h("b", {}, p.s), h("small", {}, `of ${n}`)),
    h("div", { class: "du-bar" }, h("i", { style: `width:${pc(p.s, n)}%` })), h("small", { class: "du-tm" }, `${pc(p.s, n)}% · ${fmtT(p.t)}`));
  const line = v === 1 ? "You win." : v === -1 ? `${you.n} wins this round.` : "A tie. Rematch?";
  const why = me.s === you.s ? (v === 0 ? "Same score, same time." : "Same score, so the faster time decides.") : "";
  return h("section", { class: "du-vs" + (v === 1 ? " won" : "") },
    h("div", { class: "du-vs-row" }, col(me, v === 1, v === 0), h("span", { class: "du-x" }, "VS"), col(you, v === -1, v === 0)),
    h("h2", { class: "du-res" }, line), why ? h("p", { class: "small mute", style: "text-align:center" }, why) : null);
}

/* ——— the round ——— */
function play(root, o, role, extra = {}) {
  const qs = o.q.map(questionById).filter(Boolean), t0 = Date.now(), n = qs.length;
  runQuiz(root, {
    title: role === "friend" ? `${o.n}'s challenge` : `Duel · ${o.c}`, questions: qs, exit: "#/challenge",
    done: res => {
      const secs = Math.max(1, Math.round((Date.now() - t0) / 1000)), me = { n: extra.name || myName() || "You", s: res.right, t: secs };
      if (role === "friend") {
        const v = verdict(me, o), r = { k: "r", id: o.id, n: o.n, s: o.s, t: o.t, c: o.c, q: o.q, f: { n: me.n, s: me.s, t: me.t } };
        upsert({ id: o.id, side: "rec", with: o.n, topic: o.c, me: me.s, them: o.s, n, res: v === 1 ? "w" : v === -1 ? "l" : "t", at: Date.now() });
        if (v === 1) setTimeout(() => cheer("You win!", 34), 300);
        return { head: v === 1 ? "You beat " + o.n + "." : v === -1 ? o.n + " takes it." : "A tie.", sub: `${me.s} of ${n} in ${fmtT(me.t)}.`,
          body: h("div", { class: "stack" }, versus(me, o, n), shareBox(r, `Send ${o.n} your result so they can see who won.`)),
          actions: [h("button", { class: "btn ghost", type: "button", on: { click: () => hub(root, { topic: o.c, same: o }) } }, icon("shuffle", 18), "Rematch, new questions"), h("a", { class: "btn gold", href: "#/" }, "Start learning")] };
      }
      const mine = { k: "c", id: Math.random().toString(36).slice(2, 8), n: me.n === "You" ? "A friend" : me.n, s: me.s, t: me.t, c: o.c, q: o.q };
      upsert({ id: mine.id, side: "sent", with: "", topic: o.c, me: me.s, n, res: "", at: Date.now(), p: mine });
      return { head: `You scored ${me.s} of ${n}.`, sub: "Now send it. Your friend plays the same questions and sees your score first.",
        body: h("div", { class: "stack" }, scoreCard(mine), shareBox(mine)),
        actions: [h("button", { class: "btn ghost", type: "button", on: { click: () => hub(root) } }, "Back to duels"), h("a", { class: "btn ghost", href: "#/" }, "Back to Learn")] };
    }
  });
}

/* ——— a friend opens your link ——— */
function landing(root, o) {
  const own = log().d.find(x => x.id === o.id && x.side === "sent");
  if (own) return void root.replaceChildren(page(h("a", { class: "linkish", href: "#/challenge" }, "← Duels"), h("div", { class: "stack" },
    h("h1", { class: "h1" }, "This is your own challenge"), h("p", { class: "lead mute" }, "Send the link to a friend. When they reply, open their link to see who won."), scoreCard(o), shareBox(o))));
  const name = h("input", { class: "input", maxlength: "24", placeholder: "Your first name", "aria-label": "Your first name", value: myName() }), n = o.q.length;
  root.replaceChildren(page(h("div", { class: "du-land stack" },
    h("div", { class: "du-hero" }, who(o.n, true), h("h1", { class: "du-h1" }, `${o.n} challenges you`), h("p", { class: "lead" }, `${o.c}. ${n} questions, about ${n <= 5 ? 2 : 4} minutes.`)),
    scoreCard(o),
    h("div", { class: "card stack stack-s" }, h("label", { class: "small", for: "" }, "So ", o.n, " can see who replied"), name,
      h("button", { class: "btn gold big", type: "button", on: { click: () => play(root, o, "friend", { name: nm(name.value) || "A friend" }) } }, "Accept the challenge")),
    h("p", { class: "small mute", style: "text-align:center" }, "No sign-up needed. UpperCrust Academy teaches money basics through short stories and quizzes. For learning, not advice."))));
}

/* ——— the challenger opens a reply ——— */
function reply(root, o) {
  const me = { n: myName() || "You", s: o.s, t: o.t }, you = o.f, v = verdict(me, you);
  upsert({ id: o.id, side: "sent", with: you.n, topic: o.c, me: o.s, them: you.s, n: o.q.length, res: v === 1 ? "w" : v === -1 ? "l" : "t", at: Date.now() });
  if (v === 1) setTimeout(() => cheer("You win!", 30), 300);
  root.replaceChildren(page(h("a", { class: "linkish", href: "#/challenge" }, "← Duels"), h("div", { class: "stack" },
    h("h1", { class: "h1" }, `${you.n} replied`), h("p", { class: "lead mute" }, o.c), versus(me, you, o.q.length),
    h("div", { class: "row-flex", style: "gap:10px;flex-wrap:wrap" }, h("button", { class: "btn gold big", type: "button", on: { click: () => hub(root, { topic: o.c, same: o }) } }, icon("shuffle", 20), `Rematch ${you.n}`), h("a", { class: "btn ghost", href: "#/" }, "Back to Learn")))));
}

/* ——— the hub ——— */
function topics() {
  const s = Store.get(), cs = orderedCourses().slice(0, 14).filter(c => c.lessons && c.lessons.length);
  return [{ id: "mix", t: "Mixed", d: "From what you have learned" }, ...cs.map(c => ({ id: c.id, t: c.title, d: `${c.lessons.filter(n => s.done[n]).length}/${c.lessons.length} lessons done` }))];
}
function poolFor(id) {
  if (id !== "mix") { const c = course(id); return c ? questionsFor(c.lessons) : []; }
  let p = questionsFor(Object.keys(Store.get().done).map(Number));
  if (p.length < 10) p = questionsFor(orderedCourses()[0].lessons);
  return p;
}
export function hub(root, pre) {
  const st = { topic: "mix", n: 5 }, T = topics();
  if (pre && pre.topic) { const f = T.find(x => x.t === pre.topic); if (f) st.topic = f.id; if (pre.same) st.n = pre.same.q.length >= 10 ? 10 : 5; }
  const rec = duelRecord(), d = log().d;
  const chips = h("div", { class: "du-chips", role: "radiogroup", "aria-label": "Topic" }, T.map(x => h("button", { type: "button", class: "du-chip", role: "radio", "aria-checked": String(x.id === st.topic), "data-id": x.id, on: { click: () => { st.topic = x.id; chips.querySelectorAll("button").forEach(b => b.setAttribute("aria-checked", String(b.dataset.id === st.topic))); } } }, h("b", {}, x.t), h("small", {}, x.d))));
  const seg = h("div", { class: "du-seg", role: "radiogroup", "aria-label": "Length" }, [[5, "Quick 5", "about 2 min"], [10, "Full 10", "about 4 min"]].map(([k, a, b]) => h("button", { type: "button", role: "radio", "aria-checked": String(k === st.n), "data-n": k, on: { click: () => { st.n = k; seg.querySelectorAll("button").forEach(x => x.setAttribute("aria-checked", String(+x.dataset.n === st.n))); } } }, h("b", {}, a), h("small", {}, b))));
  const start = () => {
    const p = poolFor(st.topic), q = pick(p, Math.min(st.n, p.length)).map(x => x.id);
    if (q.length < 3) return toast("Not enough questions on that topic yet. Pick another.");
    play(root, { k: "c", id: "x", n: myName() || "You", s: 0, t: 0, c: T.find(x => x.id === st.topic).t, q }, "mine");
  };
  const status = e => e.res === "w" ? ["You won", "ok"] : e.res === "l" ? ["They won", "bad"] : e.res === "t" ? ["Tie", ""] : ["Waiting", "gold"];
  const logList = d.length ? h("div", { class: "du-log" }, d.slice(0, 8).map(e => { const [txt, cl] = status(e);
    return h("div", { class: "du-row" }, who(e.with || (e.side === "sent" ? "?" : "F")), h("div", { class: "grow" }, h("b", {}, e.side === "sent" ? (e.with ? `You vs ${e.with}` : "Sent, waiting for a reply") : `You vs ${e.with}`), h("small", {}, `${e.topic} · ${e.me}${e.them != null ? " to " + e.them : "/" + e.n}`)),
      e.res ? h("span", { class: "pill " + cl }, txt) : e.p ? h("a", { class: "btn ghost sm", href: linkFor(e.p) }, "Open link") : null); })) : h("p", { class: "small mute" }, "No duels yet. Your first one is two minutes away.");
  root.replaceChildren(page(h("a", { class: "linkish", href: "#/" }, "← Back to Learn"), h("div", { class: "stack" },
    h("section", { class: "du-top" }, html("du-m", mascot({ mood: "joy", pose: "cheer", view: "bust", px: 120 })), h("div", { class: "du-ht stack stack-xs" }, h("h1", { class: "du-h1" }, "Duel a friend"), h("p", { class: "lead" }, "Play a round. Send a link. See who knows more about money.")),
      h("div", { class: "du-rec" }, [["w", "Won", rec.w], ["l", "Lost", rec.l], ["t", "Tied", rec.t]].map(([c, a, b]) => h("span", { class: "r-" + c }, h("b", {}, b), h("small", {}, a))))),
    h("section", { class: "stack stack-s" }, h("h2", { class: "h2" }, "1. Pick a topic"), chips),
    h("section", { class: "stack stack-s" }, h("h2", { class: "h2" }, "2. How long?"), seg),
    h("button", { class: "btn gold big du-go", type: "button", on: { click: start } }, "Start my round"),
    h("section", { class: "du-how" }, [["1", "You play", "Answer the questions. We time you."], ["2", "Send the link", "WhatsApp or copy. Your score travels with it."], ["3", "They play", "They see your score, play the same questions, and reply."]].map(([a, b, c]) => h("div", {}, h("i", {}, a), h("b", {}, b), h("small", {}, c)))),
    h("section", { class: "stack stack-s" }, h("h2", { class: "h2" }, "Your duels"), logList))));
}

export function challenge(root, code) {
  const o = code ? clean(dec(code)) : null;
  if (o) return o.k === "r" ? reply(root, o) : landing(root, o);
  if (code) toast("That challenge link is not valid. Start a new one here.");
  hub(root);
}
