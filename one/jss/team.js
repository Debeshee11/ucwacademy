/* Administrator view: is learning happening, is it sticking, where do people need help? Firestore rules allow only the admin to read every learner. */
import { h, ago, pct, toast, plural } from "./dom.js";
import { D, level, lesson, courseOf } from "./data.js";
import { page, widePage, bar } from "./ui.js";
import { LABEL } from "./progress.js";
import { questionById } from "./quiz.js";
import * as Store from "./store.js";

const WEEK = 7 * 86400e3;
const firstTry = L => Object.entries(L.q || {}).filter(([, e]) => e.f === 0 || e.f === 1);
const csv = rows => rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");

function levelOf(L) {
  const done = Object.keys(L.done || {}).map(Number);
  for (const lv of [...D.levels].reverse()) if (done.some(n => courseOf(n)?.level === lv.id)) return lv.name;
  return L.start ? level(L.start)?.name || "–" : "Not started";
}
function summarize(L) {
  const ft = firstTry(L), done = Object.keys(L.done || {}).length, certs = Object.values(L.creds || {});
  return { id: L.id, name: L.name || "(no name)", email: L.email || "", lessons: done, progress: pct(done, Object.keys(D.lessons).length), level: levelOf(L),
    mastery: ft.length >= 5 ? pct(ft.filter(([, e]) => e.f === 1).length, ft.length) : null, streak: L.streak?.n || 0, certs: certs.length, updated: L.updated || 0,
    status: certs.length ? "Certified" : done >= 15 ? "Exam ready" : done ? "In progress" : "Not started" };
}

export function team() {
  const host = h("div", { class: "stack stack-xl" }, h("p", { class: "mute" }, "Loading…"));
  Store.loadAll().then(all => {
    const rows = all.map(summarize).sort((a, b) => b.updated - a.updated);
    const active = rows.filter(r => Date.now() - r.updated < WEEK).length;
    const withM = rows.filter(r => r.mastery != null), avgM = withM.length ? Math.round(withM.reduce((a, r) => a + r.mastery, 0) / withM.length) : null;
    const avgP = rows.length ? Math.round(rows.reduce((a, r) => a + r.progress, 0) / rows.length) : 0;
    const certs = rows.reduce((a, r) => a + r.certs, 0);

    /* team-wide first-try results per question, per course and per topic */
    const perQ = {}, perCourse = {}, perTag = {};
    for (const L of all) for (const [id, e] of firstTry(L)) {
      const q = questionById(id); if (!q) continue;
      (perQ[id] ||= { n: 0, ok: 0 }); perQ[id].n++; perQ[id].ok += e.f;
      const c = courseOf(q.n), add = (o, k) => { (o[k] ||= { n: 0, ok: 0 }); o[k].n++; o[k].ok += e.f; };
      if (c) add(perCourse, c.id);
      for (const t of lesson(q.n)?.tags || []) add(perTag, t);
    }
    const rate = o => pct(o.ok, o.n);
    const topics = Object.entries(perTag).filter(([, o]) => o.n >= 5).sort((a, b) => rate(a[1]) - rate(b[1])).slice(0, 5);
    const qs = Object.values(perQ).filter(o => o.n >= 5);
    const easy = qs.filter(o => rate(o) > 95).length, hard = qs.filter(o => rate(o) < 30).length;

    const kpi = (v, t, sub) => h("div", {}, h("div", { class: "kpi-v" }, v), h("div", { class: "small mute" }, t), h("div", { class: "tiny mute" }, sub || " "));
    const th = (t, i) => h("th", { style: `text-align:${i ? "right" : "left"};padding:12px 8px;border-bottom:1px solid var(--line2);font-weight:600;color:var(--mute);font-size:13px;white-space:nowrap` }, t);
    host.replaceChildren(
      h("div", { class: "kpis" }, kpi(h("span", {}, active, h("small", {}, ` / ${rows.length}`)), "Active learners, 7 days"), kpi(avgM == null ? "–" : avgM + "%", "Average mastery", "First-try accuracy"), kpi(avgP + "%", "Average completion", `of ${Object.keys(D.lessons).length} lessons`), kpi(certs, "Credentials earned")),
      h("div", { class: "cols", style: "grid-template-columns:1fr 1fr" },
        h("section", { class: "stack" }, h("h2", { class: "h2" }, "Mastery by course"),
          h("div", { class: "stack" }, D.courses.map(c => { const o = perCourse[c.id]; return h("div", { class: "stack stack-xs" }, h("div", { class: "row-flex between small" }, h("span", {}, c.title), h("b", {}, o && o.n >= 5 ? rate(o) + "%" : "–")), bar(o && o.n >= 5 ? rate(o) : 0)); })),
          h("p", { class: "tiny mute" }, "From every learner's first attempt at each question. Shown once five answers exist.")),
        h("section", { class: "stack" }, h("h2", { class: "h2" }, "Topics to coach"), h("p", { class: "small mute" }, "Lowest team mastery, from first attempts"),
          topics.length ? h("div", { class: "divide" }, topics.map(([t, o]) => h("div", { class: "list-row", style: "min-height:52px;padding:12px 0" }, h("div", { class: "grow" }, LABEL[t] || t), h("b", {}, rate(o) + "%")))) : h("p", { class: "mute" }, "Not enough answers yet."),
          h("h3", { class: "h3", style: "margin-top:12px" }, "Question quality"),
          h("p", { class: "small" }, h("b", {}, plural(easy, "question")), " answered right by over 95%. Retire or make harder."),
          h("p", { class: "small" }, h("b", {}, plural(hard, "question")), " answered right by under 30%. Review the wording."))),
      h("section", { class: "stack" },
        h("div", { class: "row-flex between" }, h("h2", { class: "h2" }, "Learners"), h("button", { class: "btn ghost", style: "height:40px", on: { click: () => {
          const text = csv([["Name", "Email", "Level", "Lessons", "Progress %", "First-try accuracy %", "Streak", "Credentials", "Status", "Last active"], ...rows.map(r => [r.name, r.email, r.level, r.lessons, r.progress, r.mastery ?? "", r.streak, r.certs, r.status, r.updated ? new Date(r.updated).toISOString() : ""])]);
          const a = h("a", { href: URL.createObjectURL(new Blob([text], { type: "text/csv" })), download: "uppercrust-one-team.csv" }); document.body.append(a); a.click(); a.remove(); toast("Exported");
        } } }, "Export CSV")),
        h("div", { style: "overflow-x:auto" }, h("table", { style: "width:100%;border-collapse:collapse;font-size:15px;min-width:760px" },
          h("thead", {}, h("tr", {}, ["Learner", "Level", "Progress", "Mastery", "Streak", "Last active", "Credential"].map(th))),
          h("tbody", {}, rows.map(r => h("tr", {}, [
            h("td", { style: "padding:14px 8px;border-bottom:1px solid var(--line)" }, h("div", { style: "font-weight:500" }, r.name), h("div", { class: "tiny mute" }, r.email)),
            ...[r.level, r.progress + "%", r.mastery == null ? "–" : r.mastery + "%", r.streak ? r.streak + " days" : "0", r.updated ? ago(r.updated) : "–", r.status].map(v => h("td", { style: "padding:14px 8px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap" }, v))])))),
          !rows.length ? h("p", { class: "mute", style: "padding:20px 0" }, "No learner has opened UpperCrust One yet.") : null)));
  }).catch(() => host.replaceChildren(h("p", { class: "error" }, "Could not load the team. Publish the new firestore.rules and check you are signed in as the administrator.")));
  return widePage(h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Team learning"), h("p", { class: "lead mute" }, "Is learning happening, is it sticking, and where do people need help?")), host);
}
