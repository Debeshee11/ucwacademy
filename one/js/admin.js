/* Admin dashboard: growth, activity, NISM mock results, hardest questions, and the answer-key upload.
   The numbers come from the backend (adminStats), which only the administrator may call. */
import { h, toast, ago } from "./dom.js";
import { widePage } from "./ui.js";
import { fns } from "./fb.js";
import { DOORS } from "./academy.js";
import { D } from "./data.js";
import { getOne } from "./content.js";
const j = p => getOne(p.replace(/^one\/data\//, "").replace(/\.json$/, ""));
const call = async (name, data) => { const f = fns(); if (!f) throw new Error("Backend not reachable."); return (await f.httpsCallable(name)(data)).data; };
const n0 = x => (x || 0).toLocaleString("en-IN");
const tile = (v, l, sub) => h("div", { class: "ad-tile" }, h("b", {}, v), h("span", {}, l), sub ? h("small", {}, sub) : null);

export function admin() {
  const host = h("div", { class: "stack stack-xl" }, h("p", { class: "mute" }, "Loading the numbers…"));
  Promise.all([call("adminStats"), call("keyStatus"), j("one/data/nism.json"), call("examKeyStatus")]).then(([S, keys, I, ek]) => paint(host, S, keys, I, ek))
    .catch(e => host.replaceChildren(h("p", { class: "error" }, /permission/.test(e?.code || "") ? "Only the administrator can see this." : "Could not load. " + (e.message || "")), h("button", { class: "btn primary", on: { click: () => location.reload() } }, "Reload")));
  return widePage(h("section", { class: "stack" }, h("div", { class: "eyebrow gold" }, "Administrator"), h("h1", { class: "h1" }, "Growth and exams"), h("p", { class: "mute" }, "Who is joining, who is active, how the NISM mocks are going. ", h("a", { href: "#/team" }, "Open the learner list"))), host);
}

function paint(host, S, keys, I, ek) {
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

  /* course exam keys: one file per course plus _meta.json, made by scripts/build_examkeys.py */
  const haveEx = Object.fromEntries(ek.map(k => [k.id, k.updated]));
  const missingEx = [...D.courses.map(c => c.id), "_meta"].filter(id => !haveEx[id]);
  const exStatus = h("div", { class: "row-flex between ad-key" }, h("span", {}, "Course exam keys"), missingEx.length ? h("span", { class: "pill bad" }, `${missingEx.length} missing: ${missingEx.slice(0, 4).join(", ")}${missingEx.length > 4 ? "…" : ""}`) : h("span", { class: "pill ok" }, "All uploaded"));
  const exFile = h("input", { type: "file", accept: ".json,application/json", multiple: true, id: "ef" });
  const exLog = h("p", { class: "small mute", role: "status", style: "white-space:pre-line" });
  const exUp = h("button", { class: "btn primary", on: { click: async () => {
    if (!exFile.files.length) return toast("Choose the exam key files first.");
    exUp.disabled = true; exLog.textContent = "";
    for (const f of exFile.files) {
      try { const d = await call("putExamKeys", { keys: JSON.parse(await f.text()) }); exLog.textContent += `✓ ${d.id}${d.questions ? ": " + d.questions + " questions" : ""}\n`; }
      catch (e) { exLog.textContent += `✗ ${f.name}: ${e.message || "failed"}\n`; }
    }
    exUp.disabled = false;
  } } }, "Upload exam keys");

  const errs = (S.errors || []).length ? h("div", { class: "stack stack-s" }, S.errors.map(x => h("div", { class: "card stack stack-xs" }, h("div", { class: "eyebrow" }, `${ago(x.t)} · ${x.u || ""} · build ${x.v || "?"}`), h("p", { class: "small" }, x.m), x.s ? h("pre", { class: "tiny mute", style: "white-space:pre-wrap;overflow:auto;max-height:120px" }, x.s) : null)))
    : h("p", { class: "mute" }, "No errors reported.");

  /* Traffic and funnel from the first-party counters (see analytics.js). */
  const T = S.traffic || [], tot = k => T.reduce((a, x) => a + (x[k] || 0), 0);
  const cols = [["ev_view", "Visits"], ["ev_login", "Saw sign-in"], ["ev_signup", "Sign-ups"], ["ev_lesson", "Lessons done"], ["examStarts", "Exams started"], ["examPasses", "Exams passed"], ["ev_mock", "Mocks"]];
  const srcs = {}; T.forEach(x => Object.entries(x).forEach(([k, v]) => { if (k.startsWith("src_")) srcs[k.slice(4).replace(/_/g, ".")] = (srcs[k.slice(4).replace(/_/g, ".")] || 0) + v; }));
  const srcRows = Object.entries(srcs).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const cell = "padding:8px;border-bottom:1px solid var(--line);text-align:right";
  const traffic = h("div", { class: "stack" },
    h("p", { class: "mute" }, `Last 14 days: ${n0(tot("ev_view"))} visits, ${n0(tot("ev_signup"))} sign-ups` + (tot("ev_login") ? ` (${Math.round(100 * tot("ev_signup") / tot("ev_login"))}% of those who saw the sign-in screen)` : "") + ". Counted without cookies. Visits are app opens, not unique people."),
    h("div", { style: "overflow-x:auto" }, h("table", { style: "width:100%;border-collapse:collapse;min-width:620px" },
      h("thead", {}, h("tr", {}, h("th", { style: cell + ";text-align:left" }, "Day"), cols.map(c => h("th", { style: cell + ";font-weight:600;color:var(--mute);font-size:13px" }, c[1])))),
      h("tbody", {}, [...T].reverse().map(x => h("tr", {}, h("td", { style: cell + ";text-align:left" }, x.d), cols.map(c => h("td", { style: cell }, n0(x[c[0]] || 0))))),
        h("tr", {}, h("td", { style: cell + ";text-align:left;font-weight:700" }, "Total"), cols.map(c => h("td", { style: cell + ";font-weight:700" }, n0(tot(c[0])))))))),
    srcRows.length ? h("div", { class: "stack stack-s" }, h("h3", { class: "h3" }, "Where visits come from"), h("div", { class: "divide" }, srcRows.map(([k, v]) => h("div", { class: "list-row", style: "min-height:44px" }, h("div", { class: "grow" }, k), h("b", {}, n0(v)))))) : h("p", { class: "mute" }, "Sources appear once people visit. Add ?utm_source=whatsapp to links you share to see which channel works."));

  host.replaceChildren(
    h("section", { class: "ad-tiles" }, tile(n0(S.total), "Learners", n0(S.staff) + " staff"), tile(n0(S.joined.d1), "Joined today"), tile(n0(S.joined.d7), "Joined, 7 days"), tile(n0(S.joined.d30), "Joined, 30 days"), tile(n0(S.active.d1), "Active today"), tile(n0(S.active.d7), "Active, 7 days"), tile(n0(S.active.d30), "Active, 30 days"),
      tile(S.total ? Math.round(100 * S.active.d7 / S.total) + "%" : "–", "Weekly active share")),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "New learners, last 30 days"), spark),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Traffic and sign-up funnel"), traffic),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Who they are"), doors, h("p", { class: "small mute" }, `Sign-in: Google ${n0(S.provs.google)} · Phone ${n0(S.provs.phone)} · Email ${n0(S.provs.email)}`)),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "NISM mocks"), tbl),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Hardest questions"), h("p", { class: "mute" }, "Most often answered wrongly. Rewrite or explain these better."), hardBox),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Staff accounts"), h("p", { class: "mute" }, "Staff access needs a verified company mailbox. The roster lives in Firestore (config/staff). Run this after adding an employee there."), vbtn, vlog),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Course exam answer keys"), h("p", { class: "mute" }, "Course exams and refreshers are marked on the server and cannot be taken until these are uploaded. Upload every file from private-keys/examkeys, including _meta.json. Do this once, and again whenever lessons or exam questions change."), exStatus, h("div", { class: "field" }, h("label", { for: "ef" }, "Exam key files (.json)"), exFile), exUp, exLog),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Recent errors"), h("p", { class: "mute" }, "Reported by learners' browsers, newest first."), errs),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "NISM answer keys"), h("p", { class: "mute" }, "Mocks cannot be marked until the keys are on the server. Upload the files from the private-keys folder. Do this once, and again whenever the questions change."), status, h("div", { class: "field" }, h("label", { for: "kf" }, "Answer-key files (.json)"), file), up, log));
}
