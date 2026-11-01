/* The Roll: standings for every learner who has not opted out, plus the UpperCrust team board for employees. */
import { h, ago } from "./dom.js";
import * as Store from "./store.js";
import { page } from "./ui.js";
import { rankOf, doorOf, DOORS } from "./academy.js";

export function board() {
  const staff = Store.isStaff(), me = Store.userId();
  let rows = [], team = [], scope = "all", by = "wk";
  const host = h("div", { class: "stack" }, h("p", { class: "mute" }, "Loading…"));
  const METRICS = { wk: ["This week", "wk", "lessons"], xp: ["All time", "xp", "points"], seals: ["Seals", "seals", "seals"] };
  const scopes = [["all", "Everyone"], ["door", "My door"], ...(staff ? [["team", "UpperCrust team"]] : [])];

  function paint() {
    const [, k, unit] = METRICS[by], mine = Store.get().door;
    const src = scope === "team" ? team : scope === "door" ? rows.filter(r => r.door && r.door === mine) : rows;
    const list = src.filter(r => r[k] > 0 || r.id === me).sort((a, b) => b[k] - a[k] || b.xp - a.xp);
    const pos = list.findIndex(r => r.id === me), xp = Store.xp(), rk = rankOf(xp), hidden = Store.get().show === 0;
    host.replaceChildren(
      h("section", { class: "card roll-me" },
        h("div", {}, h("div", { class: "eyebrow" }, "Your standing"), h("div", { class: "roll-rank" }, rk.title), h("div", { class: "small mute" }, rk.next ? `${rk.need} points to ${rk.next}` : "Highest rank reached")),
        h("div", { class: "roll-pos" }, hidden ? h("span", { class: "small mute" }, "You are hidden from The Roll") : pos >= 0 ? h("span", {}, h("b", {}, "#" + (pos + 1)), ` of ${list.length}`) : h("span", { class: "small mute" }, "Finish a lesson to appear")),
        h("div", { class: "roll-ladder" }, ["Observer", "Analyst", "Associate", "Principal", "Director", "Partner"].map(t => h("span", { class: t === rk.title ? "on" : "" }, t)))),
      h("div", { class: "row-flex", style: "gap:10px;flex-wrap:wrap" },
        h("div", { class: "chips" }, scopes.map(([id, t]) => h("button", { class: "chip", "aria-pressed": String(scope === id), on: { click: () => { scope = id; paint(); } } }, t))),
        h("div", { class: "chips" }, Object.entries(METRICS).map(([id, [t]]) => h("button", { class: "chip", "aria-pressed": String(by === id), on: { click: () => { by = id; paint(); } } }, t)))),
      scope === "door" && !mine ? h("p", { class: "mute" }, "Choose your door in Ledger to see people on the same path.") :
      list.length ? h("div", { class: "divide" }, list.map((r, i) => h("div", { class: "list-row roll-row" + (r.id === me ? " me" : "") },
        h("b", { class: "roll-n" }, i < 3 ? ["1", "2", "3"][i] : i + 1),
        h("div", { class: "avatar sm", "aria-hidden": "true" }, (r.name || "?")[0].toUpperCase()),
        h("div", { class: "grow" }, h("div", { class: "list-title" }, r.name + (r.id === me ? " (you)" : ""), r.kind === "staff" && scope !== "team" ? h("span", { class: "pill gold", style: "margin-left:8px" }, "UpperCrust team") : null),
          h("div", { class: "tiny mute" }, [rankOf(r.xp || 0).title, doorOf(r.door)?.name, `${r.lessons || 0} lessons`, r.streak ? `${r.streak}-day streak` : null, "active " + ago(r.updated)].filter(Boolean).join(" · "))),
        h("b", {}, r[k] + " ", h("span", { class: "tiny mute" }, unit)))))
        : h("p", { class: "mute" }, "Nobody here yet. Finish a lesson and be the first."));
  }
  Store.flush().catch(() => {}).then(() => Promise.all([Store.loadRoll(), staff ? Store.loadBoard().catch(() => []) : []]))
    .then(([r, t]) => { rows = r; team = t; paint(); })
    .catch(() => host.replaceChildren(h("p", { class: "error" }, "Could not load The Roll. Publish the latest firestore.rules in Firebase.")));
  return page(h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "The Roll"), h("p", { class: "lead mute" }, "Standings across the Academy. Ranks run Observer to Partner. 20 points a lesson, 2 a right answer, 30 a quiz or exam passed.")), host);
}
