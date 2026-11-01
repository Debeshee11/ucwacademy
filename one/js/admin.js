/* Admin dashboard: growth, activity, NISM mock results, hardest questions, and the answer-key upload.
   The numbers come from the backend (adminStats), which only the administrator may call. */
import { h, toast, ago } from "./dom.js";
import { widePage } from "./ui.js";
import { fns } from "./fb.js";
import { DOORS } from "./academy.js";

const j = async p => { const r = await fetch(p); if (!r.ok) throw new Error(p); return r.json(); };
const call = async (name, data) => { const f = fns(); if (!f) throw new Error("Backend not reachable."); return (await f.httpsCallable(name)(data)).data; };
const n0 = x => (x || 0).toLocaleString("en-IN");
const tile = (v, l, sub) => h("div", { class: "ad-tile" }, h("b", {}, v), h("span", {}, l), sub ? h("small", {}, sub) : null);

export function admin() {
  const host = h("div", { class: "stack stack-xl" }, h("p", { class: "mute" }, "Loading the numbers…"));
  Promise.all([call("adminStats"), call("keyStatus"), j("one/data/nism.json")]).then(([S, keys, I]) => paint(host, S, keys, I))
    .catch(e => host.replaceChildren(h("p", { class: "error" }, /permission/.test(e?.code || "") ? "Only the administrator can see this." : "Could not load. " + (e.message || "")), h("button", { class: "btn primary", on: { click: () => location.reload() } }, "Reload")));
  return widePage(h("section", { class: "stack" }, h("div", { class: "eyebrow gold" }, "Administrator"), h("h1", { class: "h1" }, "Growth and exams"), h("p", { class: "mute" }, "Who is joining, who is active, how the NISM mocks are going. ", h("a", { href: "#/team" }, "Open the learner list"))), host);
}

function paint(host, S, keys, I) {
  const title = id => I.exams.find(e => e.id === id)?.short || id;
  const max = Math.max(1, ...S.signups.map(x => x.n));
  const spark = h("div", { class: "ad-spark", role: "img", "aria-label": "New learners per day, last 30 days" }, S.signups.map(x => h("i", { title: `${x.d}: ${x.n}`, style: `height:${Math.max(4, x.n / max * 100)}%` })));

  const doorMax = Math.max(1, ...Object.values(S.doors));
  const doors = h("div", { class: "nm-w" }, DOORS.map(d => h("div", { class: "nm-wr" }, h("span", { class: "nm-wl" }, d.name), h("span", { class: "nm-wb" }, h("i", { style: `width:${(S.doors[d.id] || 0) / doorMax * 100}%` })), h("b", {}, n0(S.doors[d.id])))));

  const rows = I.exams.map(e => { const s = S.nism[e.id] || {}, a = s.attempts || 0; return { e, a, pass: a ? Math.round(100 * (s.passes || 0) / a) : null, avg: a ? Math.round((s.pctSum || 0) / a) : null }; });
  const tbl = h("div", { class: "ad-tbl" }, h("table", {}, h("thead", {}, h("tr", {}, ["Exam", "Attempts", "Pass rate", "Avg score"].map(t => h("th", {}, t)))),
    h("tbody", {}, rows.map(r => h("tr", {}, h("td", {}, r.e.code + " · " + r.e.short), h("td", {}, n0(r.a)), h("td", {}, r.pass == null ? "–" : r.pass + "%"), h("td", {}, r.avg == null ? "–" : r.avg + "%"))))));

  const hardBox = h("div", { class: "stack" }, S.hard.length ? h("p", { class: "mute" }, "Loading questions…") : h("p", { class: "mute" }, "Needs at least 20 answers per question before it shows here."));
  if (S.hard.length) {
    const ids = [...new Set(S.hard.map(x => x.examId))];
    Promise.all(ids.map(id => j(`one/data/nism/${id}.json`).catch(() => null))).then(all => {
      const by = Object.fromEntries(ids.map((id, i) => [id, all[i]]));
      hardBox.replaceChildren(...S.hard.slice(0, 15).map(x => { const q = by[x.examId]?.mocks?.[x.mock - 1]?.[x.i]; return h("div", { class: "card stack stack-s" },
        h("div", { class: "eyebrow" }, `${title(x.examId)} · Mock ${x.mock} · Q${x.i + 1}`), h("p", {}, q ? q.p : "(question not found)"),
        h("p", { class: "small mute" }, `${Math.round(x.rate * 100)}% got it wrong · ${n0(x.n)} answered · ${n0(x.skipped)} skipped`)); }));
    });
  }

  const have = Object.fromEntries(keys.map(k => [k.id, k.updated]));
  const status = h("div", { class: "stack stack-s" }, I.exams.map(e => h("div", { class: "row-flex between ad-key" }, h("span", {}, e.code + " · " + e.short), have[e.id] ? h("span", { class: "pill ok" }, "Keys uploaded " + ago(have[e.id])) : h("span", { class: "pill bad" }, "Keys missing"))));
  const file = h("input", { type: "file", accept: ".json,application/json", multiple: true, id: "kf" });
  const log = h("p", { class: "small mute", role: "status" });
  const up = h("button", { class: "btn primary", on: { click: async () => {
    if (!file.files.length) return toast("Choose the answer-key files first.");
    up.disabled = true; log.textContent = "";
    for (const f of file.files) {
      try { const d = await call("putKeys", { keys: JSON.parse(await f.text()) }); log.textContent += `✓ ${d.id}: ${d.mocks} mocks, ${d.questions} questions\n`; }
      catch (e) { log.textContent += `✗ ${f.name}: ${e.message || "failed"}\n`; }
    }
    up.disabled = false;
  } } }, "Upload answer keys");

  const vlog = h("p", { class: "small mute", role: "status" });
  const vbtn = h("button", { class: "btn ghost", on: { click: async () => {
    vbtn.disabled = true; vlog.textContent = "Working…";
    try { const d = await call("verifyStaff"); vlog.textContent = `Verified ${d.verified}, already verified ${d.already}.` + (d.missing.length ? ` No account yet: ${d.missing.join(", ")}.` : "") + " Staff must sign out and in once."; }
    catch (e) { vlog.textContent = "Failed. " + (e.message || ""); }
    vbtn.disabled = false;
  } } }, "Verify staff accounts");

  host.replaceChildren(
    h("section", { class: "ad-tiles" }, tile(n0(S.total), "Learners", n0(S.staff) + " staff"), tile(n0(S.joined.d1), "Joined today"), tile(n0(S.joined.d7), "Joined, 7 days"), tile(n0(S.joined.d30), "Joined, 30 days"), tile(n0(S.active.d1), "Active today"), tile(n0(S.active.d7), "Active, 7 days"), tile(n0(S.active.d30), "Active, 30 days"),
      tile(S.total ? Math.round(100 * S.active.d7 / S.total) + "%" : "–", "Weekly active share")),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "New learners, last 30 days"), spark),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Who they are"), doors, h("p", { class: "small mute" }, `Sign-in: Google ${n0(S.provs.google)} · Phone ${n0(S.provs.phone)} · Email ${n0(S.provs.email)}`)),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "NISM mocks"), tbl),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Hardest questions"), h("p", { class: "mute" }, "Most often answered wrongly. Rewrite or explain these better."), hardBox),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Staff accounts"), h("p", { class: "mute" }, "Staff access now needs a verified email. Run this once after deploying, and again when you add an employee."), vbtn, vlog),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "NISM answer keys"), h("p", { class: "mute" }, "Mocks cannot be marked until the keys are on the server. Upload the files from the private-keys folder. Do this once, and again whenever the questions change."), status, h("div", { class: "field" }, h("label", { for: "kf" }, "Answer-key files (.json)"), file), up, log));
}
