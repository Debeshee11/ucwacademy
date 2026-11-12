/* The leaderboard: standings for every learner who has not opted out, plus the UpperCrust team board for employees. */
import { h } from "./dom.js";
import * as Store from "./store.js";
import { page } from "./ui.js";
import { standing, podium, row } from "./boardview.js";
import { rebuildButton } from "./boardadmin.js";

const METRICS = { wk: ["This week", "lessons"], xp: ["All time", "points"], seals: ["Seals", "seals"] };

/* A weekly count is only valid for 7 days after it was saved. Add up the saved days again so old weeks do not linger. */
const fresh = r => {
  if (!r.wkd) return { ...r, wk: Date.now() - (r.updated || 0) > 7 * 864e5 ? 0 : r.wk || 0 };
  const from = new Date(Date.now() + 5.5 * 3600e3 - 6 * 864e5).toISOString().slice(0, 10);
  return { ...r, wk: Object.entries(r.wkd).reduce((a, [d, n]) => a + (d >= from ? Number(n) || 0 : 0), 0) };
};

export function board() {
  const staff = Store.isStaff(), me = Store.userId();
  let rows = [], team = [], scope = "all", by = "wk";
  let load;
  const host = h("div", { class: "stack stack-l" }, h("p", { class: "mute" }, "Loading…"));
  const scopes = [["all", "Everyone"], ["door", "People like me"], ...(staff ? [["team", "UpperCrust team"]] : [])];

  const tabs = (items, cur, set, cls) => h("div", { class: cls, role: "tablist" }, items.map(([id, t]) =>
    h("button", { type: "button", role: "tab", "aria-selected": String(cur === id), on: { click: () => { set(id); paint(); } } }, t)));

  function paint() {
    const [, unit] = METRICS[by], k = by, mine = Store.get().door, s = Store.get();
    const src = scope === "team" ? team : scope === "door" ? rows.filter(r => r.door && r.door === mine) : rows;
    const list = src.filter(r => (r[k] || 0) > 0 || r.id === me).sort((a, b) => (b[k] || 0) - (a[k] || 0) || (b.xp || 0) - (a.xp || 0));
    const pos = list.findIndex(r => r.id === me), top = list[0] ? list[0][k] || 0 : 0;
    const ranked = list.filter(r => (r[k] || 0) > 0), rest = ranked.slice(3);
    host.replaceChildren(...[
      standing({ id: me, name: s.name || "You" }, pos, list.length, list, k, unit, s.show === 0, Store.xp()),
      h("div", { class: "lb-filters" }, tabs(scopes, scope, v => { scope = v; }, "lb-seg scope"), tabs(Object.entries(METRICS).map(([id, [t]]) => [id, t]), by, v => { by = v; }, "lb-seg metric")),
      scope === "door" && !mine ? h("p", { class: "mute" }, "Tell us who you are in Progress to see people like you.") :
      ranked.length ? [
        ranked.length >= 2 ? podium(ranked.slice(0, 3), k, unit, me) : null,
        rest.length ? h("ol", { class: "lb-list" }, rest.map((r, i) => row(r, i + 3, k, unit, top, me, scope !== "team"))) : null,
        pos >= 0 ? h("button", { class: "btn ghost block", type: "button", on: { click: () => document.getElementById("lb-me-row")?.scrollIntoView({ behavior: "smooth", block: "center" }) } }, "Jump to my row") : null]
      : h("div", { class: "lb-empty" }, h("b", {}, "Nobody here yet"), h("p", { class: "mute" }, "Finish a lesson and take the first place."))].flat(Infinity).filter(Boolean));
  }
  load = () => Store.flush().catch(() => {}).then(() => Store.syncBoard(true)).catch(() => {}).then(() => Promise.all([Store.loadRoll(), staff ? Store.loadBoard().catch(() => []) : []]))
    .then(([r, t]) => { rows = r.map(fresh); team = t; paint(); })
    .catch(() => host.replaceChildren(h("p", { class: "error" }, "Could not load the leaderboard. Check your connection and try again.")));
  load();
  return page(h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Leaderboard"), h("p", { class: "lead mute" }, "Climb from Observer to Partner. 20 points a lesson, 2 a right answer, 30 a quiz or exam passed.")), host, rebuildButton(() => load()));
}
