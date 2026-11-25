/* Home: "Money Yatra". One illustrated world. Each stage is a region with its own scenery.
   Lessons are stepping stones on a winding road, unit checks are stars, the stage exam is a boss gate.
   Sarthi stands on the stone you are on. The right rail holds today's three, the chest, a friend duel and the rank road.
   Navigation lives in the sidebar; this page is for playing. */
import { h, icon, plural, isoDay, dayMs } from "./dom.js";
import { D, course } from "./data.js";
import * as Store from "./store.js";
import { nextUp, hrefFor, labelFor } from "./path.js";
import { widePage, bar } from "./ui.js";
import { realmVars } from "./art.js";
import { stagesFor } from "./curriculum.js";
import { doorOf } from "./audience.js";
import { rankOf, RANKS } from "./academy.js";
import { mascot } from "./mascot.js";

const NS = "http://www.w3.org/2000/svg";
const html = (cls, str, tag = "span") => { const e = h(tag, { class: cls }); e.innerHTML = str; return e; };
const ring = (pct, size, label, inner) => {
  const r = 44, c = 2 * Math.PI * r, s = document.createElementNS(NS, "svg");
  s.setAttribute("viewBox", "0 0 100 100"); s.setAttribute("width", size); s.setAttribute("height", size); s.setAttribute("role", "img"); s.setAttribute("aria-label", label);
  s.innerHTML = `<circle cx="50" cy="50" r="${r}" class="rg-bg"/><circle cx="50" cy="50" r="${r}" class="rg-fg" stroke-dasharray="${c}" stroke-dashoffset="${c}" style="--to:${c * (1 - Math.max(0, Math.min(100, pct)) / 100)}"/>`;
  return h("span", { class: "rg", style: `width:${size}px;height:${size}px` }, s, h("span", { class: "rg-in" }, inner));
};

/* Six regions of scenery, light and warm. sky top, sky bottom, hill near, hill far, accent */
const LAND = [
  ["#FFE9B8", "#FFF8E6", "#9ED8A8", "#C7EBC9", "#F2780C"],
  ["#CFE8FF", "#F2F9FF", "#8FD1C2", "#C2EAE0", "#1F7AC4"],
  ["#FFD9E4", "#FFF4F7", "#C8B5F0", "#E1D6F8", "#D6457A"],
  ["#D8F2D0", "#F6FCF2", "#A6D98B", "#CFEDB9", "#2F8F5B"],
  ["#FFE0C2", "#FFF6EC", "#F0C48B", "#F8DDB8", "#B8860B"],
  ["#DCD6FF", "#F6F4FF", "#9CC0F0", "#C9DCF8", "#6B4FD6"]
];
const skyline = (i, a) => [
  `<g fill="#fff" stroke="${a}" stroke-width="2.5" stroke-linejoin="round"><rect x="610" y="74" width="120" height="58"/><path d="M600 74h140L670 40z"/><path d="M630 132v-34h20v34M670 132v-34h20v34M710 132v-34h-10" fill="${a}" fill-opacity=".25"/></g>`,
  `<g fill="#fff" stroke="${a}" stroke-width="2.5" stroke-linejoin="round"><rect x="600" y="62" width="30" height="70"/><rect x="636" y="42" width="34" height="90"/><rect x="676" y="78" width="28" height="54"/><rect x="710" y="56" width="26" height="76"/></g><path d="M606 80h18M606 96h18M642 62h22M642 80h22M642 98h22M716 74h14M716 92h14" stroke="${a}" stroke-opacity=".5" stroke-width="3"/>`,
  `<g fill="#fff" stroke="${a}" stroke-width="2.5" stroke-linejoin="round"><path d="M610 132V84q60-60 120 0v48z"/></g><path d="M640 132v-30q30-26 60 0v30" fill="${a}" fill-opacity=".25"/><path d="M670 30v22" stroke="${a}" stroke-width="3"/><path d="M670 30l22 6-22 6z" fill="${a}"/>`
][i % 3];
const scene = i => {
  const [t, b, n, f, a] = LAND[i % LAND.length], sv = document.createElementNS(NS, "svg");
  sv.setAttribute("viewBox", "0 0 800 150"); sv.setAttribute("preserveAspectRatio", "xMidYMax slice"); sv.setAttribute("aria-hidden", "true"); sv.setAttribute("class", "rg-scene");
  sv.innerHTML = `<defs><linearGradient id="sk${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <rect width="800" height="150" fill="url(#sk${i})"/>
  <circle class="sun" cx="${90 + (i % 3) * 30}" cy="46" r="26" fill="#FFD25E" stroke="#F2B01E" stroke-width="3"/>
  <g class="cloud c1" fill="#fff" fill-opacity=".9"><ellipse cx="250" cy="40" rx="38" ry="12"/><ellipse cx="274" cy="32" rx="22" ry="12"/></g>
  <g class="cloud c2" fill="#fff" fill-opacity=".8"><ellipse cx="480" cy="62" rx="30" ry="10"/><ellipse cx="500" cy="55" rx="18" ry="10"/></g>
  <path d="M0 118Q120 70 260 106T520 100T800 96V150H0z" fill="${f}"/>
  <path d="M0 136Q160 96 330 128T640 122T800 124V150H0z" fill="${n}"/>
  ${skyline(i, a)}
  <g fill="${a}" fill-opacity=".85"><path d="M330 134l9-24 9 24z"/><path d="M352 136l7-18 7 18z"/><path d="M60 136l9-22 9 22z"/></g>`;
  return sv;
};

/* Everything on one stage's road, in order. */
function nodesOf(cs, s) {
  const out = [];
  for (const c of cs) {
    if (c.soon) { out.push({ k: "soon", t: "Being written", c }); continue; }
    out.push({ k: "flag", t: c.title, c });
    c.modules.forEach((m, mi) => {
      m.lessons.forEach(n => out.push({ k: "lesson", n, t: D.lessons[n]?.title || "Lesson", href: "#/lesson/" + n, done: !!s.done[n], c }));
      out.push({ k: "check", t: `Unit check ${mi + 1}`, href: `#/quiz/module/${c.id}/${mi}`, done: !!s.quiz[`m:${c.id}:${mi}`]?.passed, c });
    });
    out.push({ k: "boss", t: `${c.title} exam`, href: "#/assess/" + c.id, done: !!s.quiz["x:" + c.id]?.passed, c });
  }
  return out;
}

/* The winding road and its stones. Positions are percentages so it scales from phone to wide screen. */
function road(nodes, nowAt) {
  const GAP = 104, TOP = 70; let yy = TOP - GAP;
  const P = nodes.map((n, i) => { const flag = n.k === "flag" || n.k === "soon"; yy += GAP + (i && (nodes[i - 1].k === "flag") ? 22 : 0) + (flag && i ? 8 : 0); return { x: flag ? 50 : 50 + 25 * Math.sin(i * .95), y: yy }; });
  const H = yy + 90;
  let d = `M ${P[0].x * 4} ${P[0].y}`;
  for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], m = (a.y + b.y) / 2; d += ` C ${a.x * 4} ${m}, ${b.x * 4} ${m}, ${b.x * 4} ${b.y}`; }
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 400 ${H}`); svg.setAttribute("class", "yr-road"); svg.setAttribute("aria-hidden", "true"); svg.setAttribute("preserveAspectRatio", "none");
  svg.innerHTML = `<path d="${d}" class="rd-base"/><path d="${d}" class="rd-dash"/>`;
  const els = nodes.map((n, i) => {
    const p = P[i], now = i === nowAt, st = n.done ? "done" : now ? "now" : "next", right = p.x <= 50;
    const ic = n.k === "boss" ? icon(n.done ? "check" : "shield", now ? 30 : 26) : n.k === "check" ? icon(n.done ? "check" : "star", 24) : n.k === "lesson" ? (n.done ? icon("check", 24) : icon("book", 22)) : null;
    if (n.k === "flag" || n.k === "soon") return h("div", { class: "yn flag" + (n.k === "soon" ? " soon" : ""), style: `left:${p.x}%;top:${p.y / H * 100}%` }, h("span", { class: "yf" }, n.k === "soon" ? "Coming" : "Course"), h("b", {}, n.t));
    const a = h("a", { class: `yn ${n.k} ${st} ${right ? "lr" : "rl"}`, href: n.href, style: `left:${p.x}%;top:${p.y / H * 100}%`, "aria-label": `${n.t}${n.done ? ", done" : ""}` },
      now ? html("yme", mascot({ mood: "happy", pose: "stand", view: "head", px: 58 })) : null,
      h("span", { class: "ys" }, ic),
      h("span", { class: "yl" }, h("b", {}, n.t), n.k === "boss" ? h("small", {}, n.done ? "Gate cleared" : "Boss gate") : n.k === "check" ? h("small", {}, n.done ? "Passed" : "10 questions") : null),
      now ? h("span", { class: "ygo" }, n.k === "lesson" ? (Store.get().part[n.n] > 0 ? "CONTINUE" : "START") : "GO") : null);
    return a;
  });
  return h("div", { class: "yr", style: `aspect-ratio:400/${H}` }, svg, els);
}

export function questHome() {
  const s = Store.get(), door = doorOf(s.door), hr = new Date().getHours(), first = (s.name || "").split(" ")[0];
  const a = Store.todayAct(), due = Store.dueIds().length, xp = Store.xp(), rk = rankOf(xp), streak = Store.streakNow();
  const examOk = c => !!s.quiz["x:" + c.id]?.passed;
  const stages = stagesFor(door, door?.track).map(st => ({ ...st, cs: st.c.map(id => { const r = id.replace(/^\+/, ""); return course(r) || { id: r, soon: true, title: r }; }) }));
  const real = stages.flatMap(st => st.cs.filter(c => !c.soon));
  const nextCourse = real.find(c => Store.courseProgress(c).done < c.lessons.length) || real.find(c => !examOk(c)) || real[0];
  const step = nextUp(nextCourse?.id), c = step?.course || nextCourse;
  const title = !step ? "You have finished everything" : step.kind === "lesson" ? D.lessons[step.n]?.title || "" : labelFor(step);
  const resume = step?.kind === "lesson" && s.part[step.n] > 0;

  /* HUD */
  const hud = h("header", { class: "yt-hud" },
    h("div", { class: "yt-hi" }, h("h1", { class: "yt-h1" }, `${hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening"}${first ? ", " + first : ""}`),
      h("p", { class: "small mute" }, door ? h("span", {}, `Path: ${door.name}. `, h("a", { class: "linkish", href: "#/me" }, "Change")) : h("span", {}, "Pick your path in ", h("a", { class: "linkish", href: "#/me" }, "Me"), "."))),
    h("div", { class: "qh-stats", role: "group", "aria-label": "Your numbers" },
      h("a", { class: "qs flame" + (streak ? " lit" : ""), href: "#/me", title: "Study on a weekday to grow your streak" }, icon("flame", 22), h("b", {}, streak), h("small", {}, "day streak")),
      h("a", { class: "qs pts", href: "#/board", title: "20 per lesson, 2 per right answer, 30 per quiz passed" }, icon("star", 22), h("b", {}, xp), h("small", {}, "points")),
      h("a", { class: "qs rank", href: "#/board", title: rk.next ? `${rk.need} points to ${rk.next}` : "Top rank" }, ring(rk.pct, 48, `${rk.pct}% to the next rank`, icon("trophy", 18)), h("span", { class: "qs-t" }, h("b", {}, rk.title), h("small", {}, rk.next ? `${rk.need} to ${rk.next}` : "Top rank")))));

  /* Continue bar */
  const cont = h("a", { class: "yt-cont", href: step ? hrefFor(step) : "#/courses", style: c ? realmVars(c.sec) : "" },
    html("yc-m", mascot({ mood: "happy", pose: "stand", view: "bust", px: 76 })),
    h("span", { class: "yc-t" }, h("small", {}, resume ? "Pick up where you stopped" : step ? "Your next stop" : "All caught up"), h("b", {}, title), c ? h("small", {}, c.title) : null),
    h("span", { class: "yc-go" }, step ? (resume ? "Continue" : "Start") : "Browse", icon("chev", 20)));

  /* Regions */
  const st2 = stages.map(st => { const rc = st.cs.filter(x => !x.soon), exam = rc[rc.length - 1];
    const lessons = rc.reduce((n, x) => n + x.lessons.length, 0), did = rc.reduce((n, x) => n + Store.courseProgress(x).done, 0);
    return { ...st, rc, exam, lessons, did, passed: !!exam && examOk(exam) }; });
  const nowIx = Math.max(0, st2.findIndex(x => !x.passed));
  const region = (st, i) => {
    const state = st.passed ? "done" : i === nowIx ? "now" : i < nowIx ? "done" : "next", pct = st.lessons ? Math.round(100 * st.did / st.lessons) : 0;
    const body = h("div", { class: "yg-body" });
    let full = false;
    const draw = () => {
      const nodes = nodesOf(st.cs, s); let at = nodes.findIndex(n => !n.done && n.k !== "flag" && n.k !== "soon");
      if (st.rc.length === 0) { body.replaceChildren(h("p", { class: "mute yg-empty" }, "This region is being written. Check back soon.")); return; }
      let view = nodes, cur = at;
      if (!full && at >= 0 && nodes.length > 8) { const a = Math.max(0, at - 2), b = Math.min(nodes.length, a + 7); view = nodes.slice(a, b); cur = at - a; }
      const more = view.length < nodes.length;
      body.replaceChildren(road(view, cur), more || full ? h("button", { class: "btn ghost sm yg-more", type: "button", onclick: () => { full = !full; draw(); } }, full ? "Show less" : `Show the whole road (${nodes.length} stops)`) : null);
    };
    const open = draw;
    const head = h("button", { class: "yg-head", type: "button", "aria-expanded": String(i === nowIx) },
      scene(i),
      h("span", { class: "yg-t" }, h("small", {}, `Region ${i + 1}`), h("b", {}, st.t), h("em", {}, st.g)),
      h("span", { class: "yg-r" }, st.lessons ? ring(pct, 56, `${pct}% of this region`, st.passed ? icon("check", 20) : h("b", {}, pct + "%")) : h("span", { class: "pill" }, "Soon"),
        h("span", { class: "yg-st" }, st.passed ? "Cleared" : state === "now" ? "You are here" : st.lessons ? `${st.did}/${st.lessons} lessons` : "")));
    const sec = h("section", { class: `yg ${state}` + (i === nowIx ? " open" : ""), style: `--a:${LAND[i % LAND.length][4]}` }, head, body);
    head.addEventListener("click", () => { const o = sec.classList.toggle("open"); head.setAttribute("aria-expanded", String(o)); if (o && !body.firstChild) open(); });
    if (i === nowIx) open();
    return sec;
  };
  const world = h("div", { class: "yt-world" }, st2.map(region));

  /* Rail: today's three + chest */
  const quests = [
    due ? { t: `Review ${plural(due, "due question")}`, href: "#/quiz/revise", done: !!a.r, ic: "shuffle" } : null,
    { t: step?.kind === "lesson" ? (resume ? "Finish your lesson" : "Do one lesson") : "Learn something new", href: step ? hrefFor(step) : "#/courses", done: a.l > 0, ic: "book" },
    { t: "Answer the daily five", href: "#/quiz/daily", done: !!a.d, ic: "bolt" }
  ].filter(Boolean), did = quests.filter(x => x.done).length, all = did === quests.length;
  const qs = h("section", { class: "yt-card yt-q" },
    h("div", { class: "qq-h" }, h("div", {}, h("h2", { class: "h3" }, "Today's three"), h("p", { class: "small mute" }, all ? "All done. See you tomorrow." : `${did} of ${quests.length} done. Finish all to open the chest.`)),
      h("span", { class: "chest" + (all ? " open" : ""), role: "img", "aria-label": all ? "Chest opened" : "Chest locked" },
        html("", `<svg viewBox="0 0 64 56" width="64" height="56"><rect class="cb" x="6" y="22" width="52" height="30" rx="6"/><path class="cl" d="M6 24q0-16 26-16t26 16z"/><rect class="ck" x="27" y="26" width="10" height="12" rx="3"/><g class="spark"><path d="M32 2v8M20 6l4 6M44 6l-4 6"/></g></svg>`))),
    h("ul", { class: "qq" }, quests.map(x => h("li", { class: x.done ? "on" : "" }, h("a", { href: x.href }, h("span", { class: "qq-ic" }, x.done ? icon("check", 20) : icon(x.ic, 20)), h("span", { class: "qq-t" }, x.t), h("span", { class: "chev" }, icon("chev", 18)))))));

  /* Rail: this week's seven days */
  const now = new Date(), mon = new Date(now.getTime() - ((now.getDay() + 6) % 7) * dayMs), names = ["M", "T", "W", "T", "F", "S", "S"];
  const wk = names.map((nm, k) => { const d = new Date(mon.getTime() + k * dayMs), iso = isoDay(d), act = s.act[iso], on = !!act && (act.l > 0 || act.r || act.d), today = iso === isoDay();
    return h("li", { class: (on ? "on " : "") + (today ? "today" : "") }, h("i", {}, on ? icon("flame", 18) : ""), h("small", {}, nm)); });
  const won = wk.filter(x => x.classList.contains("on")).length;
  const week = h("section", { class: "yt-card yt-week" }, h("div", { class: "qq-h" }, h("h2", { class: "h3" }, "This week"), h("b", { class: "wk-n" }, `${won}/5 days`)),
    h("ol", { class: "wk" }, wk), h("p", { class: "small mute" }, won >= 5 ? "Weekly goal reached. Well played." : `Study on ${5 - won} more ${5 - won === 1 ? "day" : "days"} to hit your weekly goal.`));

  /* Rail: friend duel */
  const duel = h("a", { class: "yt-card yt-duel", href: "#/challenge" },
    html("yd-m", mascot({ mood: "wow", pose: "cheer", view: "bust", px: 84 })),
    h("span", { class: "yd-t" }, h("b", {}, "Duel a friend"), h("small", {}, "Five questions. Send the link on WhatsApp. Whoever scores more wins.")),
    h("span", { class: "yd-go" }, icon("chev", 20)));

  /* Rail: rank road */
  const ri = RANKS.findIndex(r => r[1] === rk.title);
  const ranks = h("section", { class: "yt-card yt-rank" },
    h("div", { class: "qq-h" }, h("h2", { class: "h3" }, "Rank road"), h("a", { class: "linkish small", href: "#/board" }, "Leaderboard")),
    h("ol", { class: "rr" }, RANKS.map(([t, name], k) => h("li", { class: k < ri ? "done" : k === ri ? "now" : "" }, h("i", {}, k < ri ? icon("check", 14) : String(k + 1)), h("span", {}, name), h("small", {}, t + "+")))),
    h("p", { class: "small mute" }, rk.next ? `${rk.need} more points to reach ${rk.next}.` : "You hold the top rank."),
    bar(rk.pct));

  /* Rail: news */
  const news = h("a", { class: "yt-card yt-news", href: "#/news" }, h("span", { class: "yn-ic" }, icon("trend", 22)), h("span", { class: "yd-t" }, h("b", {}, "Market pulse"), h("small", {}, "Today's headlines, explained in plain words.")), h("span", { class: "yd-go" }, icon("chev", 20)));

  if (all && quests.length) { const k = "uc.chest." + isoDay(); try { if (!sessionStorage[k]) { sessionStorage[k] = 1; setTimeout(() => confetti(), 500); } } catch (e) {} }
  return widePage(hud, h("div", { class: "yt" }, h("div", { class: "yt-main" }, cont, world), h("aside", { class: "yt-rail" }, qs, week, duel, ranks, news)));
}

/* A short burst of paper coins and confetti. Skipped for anyone who asks for less motion. */
function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = h("div", { class: "cf", "aria-hidden": "true" }), cols = ["#FFB703", "#2F8F5B", "#D6457A", "#1F7AC4", "#6B4FD6", "#F2780C"];
  for (let i = 0; i < 46; i++) box.append(h("i", { style: `left:${Math.random() * 100}%;background:${cols[i % cols.length]};animation-delay:${Math.random() * .5}s;--dx:${(Math.random() - .5) * 160}px;--r:${Math.random() * 720}deg` }));
  document.body.append(box); setTimeout(() => box.remove(), 3200);
}
