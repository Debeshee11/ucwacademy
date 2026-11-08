/* The headlines feed, shared by the Courses page (News tab) and the Market desk. */
import { NEWS_BASE } from "./config.js";
import { h, ago } from "./dom.js";

const TNAME = { markets: "Markets", mf: "Funds", rbi: "RBI", sebi: "SEBI" };
const TOPICS = [["all", "All"], ["markets", "Markets"], ["mf", "Funds"], ["rbi", "RBI"], ["sebi", "SEBI"]];

export function newsFeed() {
  let items = null, topic = "all", err = "";
  const list = h("div", { class: "nwlist" }), seg = h("div", { class: "seg", role: "group", "aria-label": "Topic" }), note = h("p", { class: "tiny mute" });
  function paint() {
    seg.replaceChildren(...TOPICS.map(([id, t]) => h("button", { "data-t": id, "aria-pressed": String(topic === id), on: { click: () => { topic = id; paint(); } } }, t)));
    list.replaceChildren();
    if (err) return list.append(h("p", { class: "mute", style: "padding:24px 0" }, err));
    if (!items) return list.append(h("p", { class: "mute", style: "padding:24px 0" }, "Loading headlines…"));
    const shown = items.filter(i => topic === "all" || (i.topics || []).includes(topic)).slice(0, 30);
    if (!shown.length) return list.append(h("p", { class: "mute", style: "padding:24px 0" }, "No headlines on this topic yet."));
    shown.forEach((i, k) => { const tp = (i.topics || []).find(x => TNAME[x]) || "markets";
      list.append(h("a", { class: "nwc t-" + tp + (k === 0 ? " top" : ""), href: i.link, target: "_blank", rel: "noopener noreferrer" },
        h("div", { class: "nwc-row" }, h("span", { class: "nwc-tag" }, TNAME[tp]), h("span", { class: "nwc-time" }, ago(new Date(i.date).getTime()))),
        h("h3", { class: "nwc-t" }, i.title), i.summary ? h("p", { class: "nwc-s" }, i.summary) : null,
        h("div", { class: "nwc-row" }, h("span", { class: "nwc-src" }, i.source), h("span", { class: "nwc-go" }, "Read story", " →")))); });
  }
  paint();
  fetch(NEWS_BASE + "news.json", { cache: "no-cache" }).then(r => { if (!r.ok) throw 0; return r.json(); })
    .then(d => { items = (d.items || []).sort((a, b) => new Date(b.date) - new Date(a.date)); note.replaceChildren(...(d.updated ? [h("span", {}, "Updated"), " ", h("span", {}, ago(new Date(d.updated).getTime())), " · ", h("span", {}, "Opens the publisher's site.")] : [])); paint(); })
    .catch(() => { err = "Headlines could not be loaded. Check your connection, or that the headlines workflow has run at least once."; paint(); });
  return { seg, list, note };
}

/* Small preview for Home: top headlines, link to the full page. */
export function newsPreview(n = 3) {
  const box = h("div", { class: "divide" }, h("p", { class: "small mute" }, "Loading headlines…"));
  fetch(NEWS_BASE + "news.json", { cache: "no-cache" }).then(r => { if (!r.ok) throw 0; return r.json(); }).then(d => {
    const items = (d.items || []).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, n);
    box.replaceChildren(...(items.length ? items.map(i => h("a", { class: "list-row", href: i.link, target: "_blank", rel: "noopener noreferrer" },
      h("div", { class: "grow" }, h("div", { class: "list-title" }, i.title), h("div", { class: "tiny mute" }, `${i.source} · ${ago(new Date(i.date).getTime())}`)))) : [h("p", { class: "small mute" }, "No headlines yet.")]));
  }).catch(() => box.replaceChildren(h("p", { class: "small mute" }, "Headlines are unavailable right now.")));
  return box;
}
