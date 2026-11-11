/* Admin: ratings summary and the review queue. Approve honest notes whatever their tone; hide only abuse, personal data or spam. */
import { h, toast, ago } from "./dom.js";
import { db, fns } from "./fb.js";

const act = async (id, a) => { const f = fns(); if (!f) throw new Error("Backend not reachable."); await f.httpsCallable("moderateReview")({ id, act: a }); };

export function adminReviews() {
  const box = h("section", { class: "stack" }, h("h2", { class: "h2" }, "Reviews and ratings"), h("p", { class: "mute" }, "Loading…"));
  const load = () => db().collection("reviews").limit(300).get().then(s => paint(s.docs.map(d => ({ id: d.id, ...d.data() })))).catch(() => box.replaceChildren(h("h2", { class: "h2" }, "Reviews and ratings"), h("p", { class: "error" }, "Could not load. Publish the latest firestore.rules.")));
  function paint(all) {
    const n = all.length, avg = n ? all.reduce((a, r) => a + r.stars, 0) / n : 0, dist = [5, 4, 3, 2, 1].map(s => [s, all.filter(r => r.stars === s).length]);
    const rec = all.filter(r => r.recommend === 1).length, recN = all.filter(r => r.recommend === 0 || r.recommend === 1).length;
    const pending = all.filter(r => r.note && !r.ok).sort((a, b) => b.at - a.at), live = all.filter(r => r.ok).sort((a, b) => b.at - a.at);
    const card = (r, on) => h("div", { class: "card stack stack-s" }, h("div", {}, h("b", {}, `${r.name} · ${"★".repeat(r.stars)}${"☆".repeat(5 - r.stars)}`), h("span", { class: "tiny mute" }, " · " + ago(r.at) + (r.tags?.length ? " · " + r.tags.join(", ") : ""))), h("p", {}, r.note),
      h("div", { class: "row-flex", style: "gap:8px" }, on ? h("button", { class: "btn ghost", on: { click: () => run(r.id, "hide") } }, "Hide") : h("button", { class: "btn primary", on: { click: () => run(r.id, "approve") } }, "Approve"), h("button", { class: "btn ghost", on: { click: () => run(r.id, "delete") } }, "Delete")));
    const run = (id, a) => act(id, a).then(load).catch(e => toast(e.message || "Failed"));
    box.replaceChildren(h("h2", { class: "h2" }, "Reviews and ratings"),
      h("div", { class: "ad-tiles" }, [[n ? avg.toFixed(2) : "–", "Average stars"], [String(n), "Reviews"], [recN ? Math.round(100 * rec / recN) + "%" : "–", "Would recommend"], [String(pending.length), "Notes waiting"]].map(([v, l]) => h("div", { class: "ad-tile" }, h("b", {}, v), h("span", {}, l)))),
      h("div", { class: "nm-w" }, dist.map(([s, c]) => h("div", { class: "nm-wr" }, h("span", { class: "nm-wl" }, s + " stars"), h("span", { class: "nm-wb" }, h("i", { style: `width:${n ? 100 * c / n : 0}%` })), h("span", { class: "nm-wn" }, String(c))))),
      h("h3", { class: "h3" }, "Waiting for approval"), pending.length ? pending.map(r => card(r, false)) : h("p", { class: "mute" }, "Nothing waiting."),
      h("h3", { class: "h3" }, "On the wall"), live.length ? live.slice(0, 20).map(r => card(r, true)) : h("p", { class: "mute" }, "Nothing on the wall."));
  }
  load(); return box;
}
