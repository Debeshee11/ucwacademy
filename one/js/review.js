/* Review and rate: a short, playful page. Points and badges reward effort, not praise, and the page says so. */
import { h, icon, toast } from "./dom.js";
import { page } from "./ui.js";
import { cheer } from "./cheer.js";
import { track } from "./analytics.js";
import { AREAS, TAGS, MOODS, points, levelOf, badges, mine, wall, send } from "./reviewdata.js";
import { avatar } from "./boardview.js";

const starRow = (get, set, label, big) => {
  const row = h("div", { class: "rv-stars" + (big ? " big" : ""), role: "radiogroup", "aria-label": label });
  const paint = () => row.replaceChildren(...[1, 2, 3, 4, 5].map(n => h("button", { type: "button", role: "radio", "aria-checked": String(get() === n), "aria-label": n + (n === 1 ? " star" : " stars"),
    class: n <= get() ? "on" : "", on: { click: () => { set(get() === n && !big ? 0 : n); paint(); } } }, icon("star", big ? 40 : 26))));
  paint(); return row;
};

export function review() {
  const R = { stars: 0, areas: {}, tags: [], note: "", recommend: null };
  const meter = h("section", { class: "rv-meter", "aria-live": "polite" }), mood = h("div", { class: "rv-mood" }), wallBox = h("div", { class: "stack" });
  const note = h("textarea", { rows: "4", maxlength: "500", placeholder: "What worked, what did not, what should we build next? Please leave out phone numbers and emails.", "aria-label": "Your note", on: { input: e => { R.note = e.target.value; count.textContent = R.note.length + " / 500"; refresh(); } } });
  const count = h("div", { class: "tiny mute" }, "0 / 500");
  const go = h("button", { class: "btn primary block", type: "button", disabled: true, on: { click: submit } }, "Save my review");
  const done = h("div", { class: "rv-done", hidden: true });

  function refresh() {
    const p = points(R), lv = levelOf(p), bs = badges(R);
    mood.textContent = R.stars ? MOODS[R.stars] : "Tap a star";
    go.disabled = !R.stars;
    meter.replaceChildren(h("div", { class: "rv-lv" }, h("div", { class: "lb-eyebrow" }, "Feedback level"), h("div", { class: "rv-lvn" }, lv.name), h("div", { class: "small" }, `${p} feedback points` + (lv.next ? ` · ${lv.need} to ${lv.next}` : " · top level"))),
      h("div", { class: "lb-prog", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(lv.pct), "aria-label": "Progress to next level" }, h("i", { style: `width:${Math.max(4, lv.pct)}%` })),
      h("ul", { class: "rv-badges" }, bs.map(([t, d, on]) => h("li", { class: on ? "on" : "", title: d }, icon(on ? "award" : "lock", 18), h("span", {}, t)))));
  }
  async function submit() {
    go.disabled = true; go.textContent = "Saving…";
    try {
      const r = await send(R); cheer("+" + points(R) + " feedback points", 28); track("review");
      done.hidden = false; done.replaceChildren(h("b", {}, "Thank you."), h("p", { class: "mute" }, r.pending ? "Your note will show on the wall after a quick check. Your stars count right away." : "Saved. You can change your review any time."));
      go.textContent = "Update my review";
    } catch (e) { toast(e && e.message ? e.message : "Could not save. Try again."); go.textContent = "Save my review"; }
    go.disabled = !R.stars;
  }

  const areas = h("div", { class: "stack stack-s" }, AREAS.map(([id, t]) => h("div", { class: "rv-area" }, h("span", {}, t), starRow(() => R.areas[id] || 0, v => { if (v) R.areas[id] = v; else delete R.areas[id]; refresh(); }, t))));
  const tags = h("div", { class: "chips" }, TAGS.map(([id, t]) => h("button", { type: "button", class: "chip", "aria-pressed": "false", on: { click: e => {
    const on = !R.tags.includes(id); R.tags = on ? [...R.tags, id].slice(0, 6) : R.tags.filter(x => x !== id); e.currentTarget.setAttribute("aria-pressed", String(R.tags.includes(id))); refresh(); } } }, t)));
  const rec = h("div", { class: "rv-rec" }, [[1, "Yes, I would"], [0, "Not yet"]].map(([v, t]) => h("button", { type: "button", class: "chip", "aria-pressed": "false", on: { click: e => {
    R.recommend = R.recommend === v ? null : v; e.currentTarget.parentNode.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-pressed", String(R.recommend === [1, 0][i]))); refresh(); } } }, t)));

  mine().then(m => { if (!m) return; Object.assign(R, { stars: m.stars, areas: { ...m.areas }, tags: [...(m.tags || [])], note: m.note || "", recommend: m.recommend ?? null }); build(); }).catch(() => {});
  wall().then(w => wallBox.replaceChildren(...(w.length ? w.map(r => h("article", { class: "rv-card" }, avatar({ id: r.uid, name: r.name }), h("div", { class: "grow" }, h("b", {}, r.name), h("div", { class: "rv-mini", "aria-label": r.stars + " out of 5 stars" }, "★".repeat(r.stars) + "☆".repeat(5 - r.stars)), h("p", {}, r.note))))
    : [h("p", { class: "mute" }, "No notes on the wall yet. Yours could be the first.")]))).catch(() => wallBox.replaceChildren(h("p", { class: "mute" }, "The wall is not available right now.")));

  const body = h("div", { class: "stack stack-l" });
  function build() {
    body.replaceChildren(
      h("section", { class: "rv-hero card" }, h("div", { class: "lb-eyebrow" }, "Step 1"), h("h2", { class: "h2" }, "How is the Academy for you?"), starRow(() => R.stars, v => { R.stars = v; refresh(); }, "Overall rating", true), mood),
      h("section", { class: "card stack" }, h("div", { class: "lb-eyebrow" }, "Step 2 · +5 points each"), h("h2", { class: "h2" }, "Rate the parts"), areas),
      h("section", { class: "card stack" }, h("div", { class: "lb-eyebrow" }, "Step 3 · up to +9 points"), h("h2", { class: "h2" }, "What describes it?"), tags),
      h("section", { class: "card stack" }, h("div", { class: "lb-eyebrow" }, "Step 4 · +5 points"), h("h2", { class: "h2" }, "Would you tell a friend?"), rec),
      h("section", { class: "card stack" }, h("div", { class: "lb-eyebrow" }, "Step 5 · up to +20 points"), h("h2", { class: "h2" }, "Say it in your words"), note, count),
      go, done);
    note.value = R.note; count.textContent = R.note.length + " / 500"; refresh();
    tags.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-pressed", String(R.tags.includes(TAGS[i][0]))));
    rec.querySelectorAll("button").forEach((b, i) => b.setAttribute("aria-pressed", String(R.recommend === [1, 0][i])));
  }
  build();
  return page(h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Review and rate"), h("p", { class: "lead mute" }, "Two minutes. Honest feedback of any kind earns the same points. Good or bad, it shapes what we build next.")),
    meter, body,
    h("section", { class: "stack stack-s" }, h("h2", { class: "h2" }, "The wall"), h("p", { class: "small mute" }, "Notes appear here after a quick check, with first name and last initial only. We approve honest criticism as readily as praise. Reviews never change your scores, ranks or certificates."), wallBox),
    h("p", { class: "tiny mute" }, "Your review is stored with your account, can be changed or removed by deleting your account, and is covered by the ", h("a", { href: "#/privacy" }, "Privacy notice"), "."));
}
