/* Admin-only button on the leaderboard: puts every learner on the Roll, even those who have not opened the app lately. */
import { h } from "./dom.js";
import { ADMIN_EMAIL } from "./config.js";
import { auth, fns } from "./fb.js";

export function rebuildButton(done) {
  const u = auth()?.currentUser;
  if (!u || String(u.email || "").toLowerCase() !== ADMIN_EMAIL) return null;
  const note = h("span", { class: "tiny mute" }, "");
  const btn = h("button", { type: "button", class: "btn ghost", on: { click: async () => {
    btn.disabled = true; note.textContent = "Rebuilding…";
    try { const r = (await fns().httpsCallable("rebuildRoll")()).data; note.textContent = `Done. ${r.added} on the board, ${r.hidden} hidden, ${r.noName} without a name, ${r.total} learners in total.`; done?.(); }
    catch (e) { note.textContent = "Could not rebuild: " + (e?.message || "error"); }
    btn.disabled = false; } } }, "Rebuild board (admin)");
  return h("div", { class: "row" }, btn, note);
}
