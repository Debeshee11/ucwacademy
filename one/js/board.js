/* Employee leaderboard: XP, this week, streak. Only signed-in employees can read it. */
import { h, ago } from "./dom.js";
import * as Store from "./store.js";
import { page, notFound } from "./ui.js";

export function board() {
  if (!Store.isStaff()) return notFound("The leaderboard is for UpperCrust employees.");
  let rows = [], by = "xp";
  const host = h("div", { class: "stack" }, h("p", { class: "mute" }, "Loading…"));
  const keys = { xp: ["All time", "xp", "XP"], wk: ["This week", "wk", "lessons"], streak: ["Streak", "streak", "days"] };
  function paint() {
    const [, k, unit] = keys[by], me = Store.userId();
    const list = rows.filter(r => r[k] > 0 || r.id === me).sort((a, b) => b[k] - a[k] || b.xp - a.xp);
    host.replaceChildren(
      h("div", { class: "chips" }, Object.entries(keys).map(([id, [t]]) => h("button", { class: "chip", style: by === id ? "background:#1D1B2E;color:#fff;border-color:#1D1B2E" : "", on: { click: () => { by = id; paint(); } } }, t))),
      list.length ? h("div", { class: "divide" }, list.map((r, i) => h("div", { class: "list-row", style: r.id === me ? "background:var(--gold-tint,#FFF6D6);border-radius:14px;padding-inline:12px" : "" },
        h("b", { style: "width:34px;font-size:18px" }, i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1),
        h("div", { class: "grow" }, h("div", { class: "list-title" }, r.name + (r.id === me ? " (you)" : "")), h("div", { class: "tiny mute" }, `${r.lessons} lessons · ${r.streak}-day streak · active ${ago(r.updated)}`)),
        h("b", {}, r[k] + " ", h("span", { class: "tiny mute" }, unit)))))
        : h("p", { class: "mute" }, "No scores yet. Finish a lesson to appear here."));
  }
  Store.flush().catch(() => {}).then(() => Store.loadBoard()).then(r => { rows = r; paint(); })
    .catch(() => host.replaceChildren(h("p", { class: "error" }, "Could not load. The leaderboard rules must be published in Firebase.")));
  return page(h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Leaderboard"), h("p", { class: "lead mute" }, "UpperCrust team. 20 XP a lesson, 2 a right answer, 30 a quiz passed.")), host);
}
