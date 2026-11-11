/* Leaderboard pieces. Pure rendering: every function takes plain data and returns elements. Nothing here can print "null". */
import { h, icon, ago } from "./dom.js";
import { rankOf, doorOf } from "./academy.js";

const HUES = [18, 38, 150, 200, 262, 330, 8, 175];
export const hue = id => HUES[[...String(id || "x")].reduce((a, c) => a + c.charCodeAt(0), 0) % HUES.length];
export const initial = n => (String(n || "").trim()[0] || "?").toUpperCase();
export const avatar = (r, size = "") => h("div", { class: "lb-av " + size, style: `--hu:${hue(r.id)}`, "aria-hidden": "true" }, initial(r.name));

export function standing(me, pos, total, list, k, unit, hidden, xp) {
  const rk = rankOf(xp), ahead = pos > 0 ? list[pos - 1] : null;
  const gap = ahead ? Math.max(1, (ahead[k] || 0) - (list[pos][k] || 0) + 1) : 0;
  let spot;
  if (hidden) spot = h("div", { class: "lb-spot off" }, icon("lock", 18), h("span", {}, "You are hidden. Turn the leaderboard on in Progress to appear."));
  else if (pos < 0) spot = h("div", { class: "lb-spot off" }, icon("bolt", 18), h("span", {}, "Finish one lesson to join the board."));
  else spot = h("div", { class: "lb-spot" }, h("div", { class: "lb-num" }, "#" + (pos + 1)), h("div", {}, h("b", {}, `of ${total} learners`), h("div", { class: "small" }, ahead ? `${gap} ${unit} to pass ${ahead.name}` : "You are on top. Keep your streak alive.")));
  return h("section", { class: "lb-me", "aria-label": "Your standing" },
    h("div", { class: "lb-me-top" }, h("div", { class: "lb-av lg", style: `--hu:${hue(me.id)}`, "aria-hidden": "true" }, initial(me.name)),
      h("div", { class: "grow" }, h("div", { class: "lb-eyebrow" }, "Your rank"), h("div", { class: "lb-title" }, rk.title), h("div", { class: "small" }, `${xp} points`))),
    spot,
    h("div", { class: "lb-prog", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(rk.pct), "aria-label": "Progress to next rank" }, h("i", { style: `width:${Math.max(4, rk.pct)}%` })),
    h("div", { class: "small" }, rk.next ? `${rk.need} points to ${rk.next}` : "Top rank reached"));
}

/* Gold, silver and bronze. The middle step is the winner. */
export function podium(top, k, unit, me) {
  const order = [1, 0, 2].filter(i => top[i]);
  return h("ol", { class: "lb-pod", "aria-label": "Top three" }, order.map(i => { const r = top[i];
    return h("li", { class: `lb-step p${i + 1}` + (r.id === me ? " me" : "") },
      i === 0 ? h("span", { class: "lb-crown", "aria-hidden": "true" }, icon("trophy", 22)) : null,
      avatar(r, "xl"), h("b", { class: "lb-pn" }, r.name + (r.id === me ? " (you)" : "")), h("span", { class: "small" }, rankOf(r.xp || 0).title),
      h("div", { class: "lb-block" }, h("em", {}, i + 1), h("b", {}, String(r[k] || 0)), h("span", {}, unit))); }));
}

export function row(r, i, k, unit, top, me, showTeam) {
  const v = r[k] || 0, w = top ? Math.round(100 * v / top) : 0;
  return h("li", { class: "lb-row" + (r.id === me ? " me" : ""), id: r.id === me ? "lb-me-row" : null },
    h("span", { class: "lb-rk" }, String(i + 1)), avatar(r),
    h("div", { class: "grow" },
      h("div", { class: "lb-name" }, r.name + (r.id === me ? " (you)" : ""), r.kind === "staff" && showTeam ? h("span", { class: "pill gold" }, "UpperCrust team") : null),
      h("div", { class: "tiny mute" }, [rankOf(r.xp || 0).title, doorOf(r.door)?.name, r.streak ? `${r.streak}-day streak` : "", r.updated ? "active " + ago(r.updated) : ""].filter(Boolean).join(" · ")),
      h("div", { class: "lb-bar", "aria-hidden": "true" }, h("i", { style: `width:${w}%` }))),
    h("div", { class: "lb-val" }, h("b", {}, String(v)), h("span", {}, unit)));
}
