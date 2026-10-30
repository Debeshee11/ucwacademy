/* The headlines feed, shared by the Courses page (News tab) and the Market desk. */
import { NEWS_BASE } from "./config.js";
import { h, ago } from "./dom.js";

const TOPICS = [["all", "All"], ["markets", "Markets"], ["mf", "Funds"], ["rbi", "RBI"], ["sebi", "SEBI"]];

export function newsFeed() {
  let items = null, topic = "all", err = "";
  const list = h("div", { class: "divide" }), seg = h("div", { class: "seg", role: "group", "aria-label": "Topic" }), note = h("p", { class: "tiny mute" });
  function paint() {
    seg.replaceChildren(...TOPICS.map(([id, t]) => h("button", { "aria-pressed": String(topic === id), on: { click: () => { topic = id; paint(); } } }, t)));
    list.replaceChildren();
    if (err) return list.append(h("p", { class: "mute", style: "padding:24px 0" }, err));
    if (!items) return list.append(h("p", { class: "mute", style: "padding:24px 0" }, "Loading headlines…"));
    const shown = items.filter(i => topic === "all" || (i.topics || []).includes(topic)).slice(0, 30);
    if (!shown.length) return list.append(h("p", { class: "mute", style: "padding:24px 0" }, "No headlines on this topic yet."));
    for (const i of shown) list.append(h("a", { class: "list-row", href: i.link, target: "_blank", rel: "noopener noreferrer", style: "align-items:flex-start" },
      h("div", { class: "grow stack stack-xxs" }, h("div", { class: "list-title" }, i.title), i.summary ? h("div", { class: "small mute" }, i.summary) : null, h("div", { class: "tiny mute" }, `${i.source} · ${ago(new Date(i.date).getTime())}`))));
  }
  paint();
  fetch(NEWS_BASE + "news.json", { cache: "no-cache" }).then(r => { if (!r.ok) throw 0; return r.json(); })
    .then(d => { items = (d.items || []).sort((a, b) => new Date(b.date) - new Date(a.date)); note.textContent = d.updated ? "Updated " + ago(new Date(d.updated).getTime()) + ". Opens the publisher's site." : ""; paint(); })
    .catch(() => { err = "Headlines could not be loaded. Check your connection, or that the headlines workflow has run at least once."; paint(); });
  return { seg, list, note };
}
