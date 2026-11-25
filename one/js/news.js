/* The headlines feed, shared by the Courses page (News tab) and the Market desk. */
import { NEWS_BASE } from "./config.js";
import { h, ago, icon, plural } from "./dom.js";
import { D } from "./data.js";
import { skeleton, errorCard } from "./ux.js";
import { pop } from "./analytics.js";

const TNAME = { markets: "Markets", mf: "Funds", ipo: "IPO", rbi: "RBI", sebi: "SEBI", tax: "Tax", insurance: "Insurance", gold: "Gold", economy: "Economy", global: "Global" };
const TOPICS = [["all", "All"], ["markets", "Markets"], ["mf", "Funds"], ["ipo", "IPO"], ["economy", "Economy"], ["rbi", "RBI"], ["sebi", "SEBI"], ["tax", "Tax"], ["insurance", "Insurance"], ["gold", "Gold"], ["global", "Global"]];

const STOP = new Set("the a an and or of to in on for at by with from as is are was were be been it its this that these those how why what when who will would could should can may might more most less than then now new says say said after before over under about into out up down off amid per vs not no yes you your we our they their his her has have had do does did get gets one two three four five six seven eight nine ten first last year years month week day today also still just only much many very can't cant rs crore lakh lakhs crores per cent percent india indian market markets stock stocks share shares news latest check key big top here there which while where whom".split(" "));
const RELATED = { rbi: ["repo", "rbi", "interest rate"], sebi: ["sebi", "regulat"], mf: ["mutual fund", "sip", "nav"], ipo: ["ipo", "listing"], tax: ["tax", "capital gain"], gold: ["gold"], insurance: ["insurance"], economy: ["inflation", "gdp", "budget"], markets: ["sensex", "nifty", "index", "market"], global: ["global", "dollar"] };
const SUGGEST = ["RBI", "gold", "SIP", "IPO", "Nifty", "tax", "SEBI", "inflation"];
const SAVED = "uc.news.saved";
const getSaved = () => { try { return JSON.parse(localStorage.getItem(SAVED) || "[]"); } catch { return []; } };
const putSaved = a => { try { localStorage.setItem(SAVED, JSON.stringify(a.slice(0, 60))); } catch {} };
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const lessonFor = topic => { const keys = RELATED[topic] || []; for (const n of Object.keys(D.lessons || {})) { const ti = (D.lessons[n].title || "").toLowerCase(); if (keys.some(k => ti.includes(k))) return { n, title: D.lessons[n].title }; } return null; };
/* text with the searched words marked */
const marked = (text, q) => { if (!q) return text; const words = q.split(/\s+/).filter(w => w.length > 1); if (!words.length) return text; const re = new RegExp("(" + words.map(esc).join("|") + ")", "ig"); return text.split(re).map((p, i) => i % 2 ? h("mark", {}, p) : p); };
const hot = items => { const c = new Map(); items.forEach(i => new Set((i.title || "").toLowerCase().replace(/[^a-z0-9 %]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP.has(w) && !/^\d/.test(w))).forEach(w => c.set(w, (c.get(w) || 0) + 1))); return [...c].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, 8).map(x => x[0]); };

export function newsFeed() {
  let items = null, topic = "all", err = "", q = "", range = "all", saved = getSaved();
  const list = h("div", { class: "nwlist" }), note = h("p", { class: "tiny mute" }), seg = h("div", { class: "nw-bar" });
  const input = h("input", { class: "nw-in", type: "search", placeholder: "Search news: RBI, gold, SIP, IPO…", "aria-label": "Search headlines", autocomplete: "off", enterkeyhint: "search", on: { input: ev => { q = ev.target.value.trim().toLowerCase(); paintList(); clearBtn.hidden = !q; } } });
  const clearBtn = h("button", { class: "nw-x", type: "button", hidden: true, "aria-label": "Clear search", on: { click: () => { input.value = ""; q = ""; clearBtn.hidden = true; paintList(); input.focus(); } } }, icon("x", 16));
  const setQ = w => { input.value = w; q = w.toLowerCase(); clearBtn.hidden = !q; paintList(); window.scrollTo({ top: Math.max(0, input.getBoundingClientRect().top + scrollY - 90), behavior: "smooth" }); };
  const chips = h("div", { class: "seg news-seg", role: "group", "aria-label": "Topic" }), hots = h("div", { class: "nw-hot" }), info = h("p", { class: "nw-info", "aria-live": "polite" });
  const isSaved = l => saved.some(s => s.link === l);
  const toggle = i => { saved = isSaved(i.link) ? saved.filter(s => s.link !== i.link) : [{ link: i.link, title: i.title, summary: i.summary, source: i.source, date: i.date, topics: i.topics }, ...saved]; putSaved(saved); pop("news:save"); paintTopics(); paintList(); };
  document.addEventListener("keydown", ev => { if (ev.key === "/" && !/input|textarea|select/i.test(ev.target.tagName) && input.isConnected) { ev.preventDefault(); input.focus(); } });
  seg.append(h("div", { class: "nw-search" }, icon("search", 20), input, clearBtn), chips, hots, info);

  function paintTopics() {
    chips.replaceChildren(...TOPICS.map(([id, t]) => h("button", { "data-t": id, "aria-pressed": String(topic === id), on: { click: () => { topic = id; pop("news:" + id); paintTopics(); paintList(); } } }, t)),
      h("button", { class: "nw-sv", "aria-pressed": String(topic === "saved"), on: { click: () => { topic = "saved"; paintTopics(); paintList(); } } }, `★ Saved${saved.length ? " (" + saved.length + ")" : ""}`));
    const todayBtn = (id, l) => h("button", { class: "nw-rg", "aria-pressed": String(range === id), on: { click: () => { range = id; paintTopics(); paintList(); } } }, l);
    chips.append(h("span", { class: "nw-sep" }), todayBtn("all", "Any time"), todayBtn("day", "Today"), todayBtn("week", "This week"));
  }
  function paintList() {
    list.replaceChildren(); info.textContent = "";
    if (err) return list.append(errorCard(() => { err = ""; items = null; load(); paintList(); }));
    if (!items) return list.append(skeleton(3));
    const src = topic === "saved" ? saved : items, now = Date.now(), lim = range === "day" ? 864e5 : range === "week" ? 6048e5 : Infinity;
    const words = q.split(/\s+/).filter(Boolean);
    const shown = src.filter(i => (topic === "all" || topic === "saved" || (i.topics || []).includes(topic)) && (now - new Date(i.date).getTime() <= lim || topic === "saved")
      && words.every(w => ((i.title || "") + " " + (i.summary || "") + " " + (i.source || "")).toLowerCase().includes(w))).slice(0, 40);
    info.replaceChildren(...(q ? [h("b", {}, plural(shown.length, "headline")), ` for "${q}"`] : topic === "saved" ? [h("b", {}, plural(saved.length, "saved story"))] : []));
    if (!shown.length) return list.append(h("div", { class: "nw-empty" }, h("b", {}, q ? `No headlines match "${q}".` : topic === "saved" ? "Nothing saved yet." : "No headlines here yet."), h("p", { class: "small mute" }, q ? "Try one of these:" : topic === "saved" ? "Tap the star on a story to keep it here." : "Try another topic or time range."),
      q ? h("div", { class: "nw-sug" }, SUGGEST.map(w => h("button", { type: "button", on: { click: () => setQ(w) } }, w))) : null));
    shown.forEach((i, k) => { const tp = (i.topics || []).find(x => TNAME[x]) || "markets", fresh = Date.now() - new Date(i.date).getTime() < 3 * 36e5, rel = lessonFor(tp);
      list.append(h("article", { class: "nwc t-" + tp + (k === 0 && !q && topic === "all" ? " top" : ""), style: `animation-delay:${Math.min(k, 8) * 40}ms` },
        h("div", { class: "nwc-row" }, h("span", { class: "nwc-tag" }, TNAME[tp]), fresh ? h("span", { class: "nwc-new" }, "New") : null, h("span", { class: "nwc-time" }, ago(new Date(i.date).getTime()))),
        h("a", { class: "nwc-l", href: i.link, target: "_blank", rel: "noopener noreferrer" }, h("h3", { class: "nwc-t" }, marked(i.title, q)), i.summary ? h("p", { class: "nwc-s" }, marked(i.summary, q)) : null),
        h("div", { class: "nwc-row nwc-act" }, h("span", { class: "nwc-src" }, i.source),
          h("span", { class: "nwc-btns" }, rel ? h("a", { class: "nwc-learn", href: `#/lesson/${rel.n}`, title: rel.title }, icon("book", 15), "Learn the basics") : null,
            h("button", { type: "button", class: "nwc-save" + (isSaved(i.link) ? " on" : ""), "aria-pressed": String(isSaved(i.link)), "aria-label": isSaved(i.link) ? "Remove from saved" : "Save story", on: { click: () => toggle(i) } }, icon("star", 18)),
            h("a", { class: "nwc-go", href: i.link, target: "_blank", rel: "noopener noreferrer" }, "Read story", " →"))))); });
  }
  paintTopics(); paintList();
  function load() { fetch(NEWS_BASE + "news.json", { cache: "no-cache" }).then(r => { if (!r.ok) throw 0; return r.json(); })
    .then(d => { items = (d.items || []).sort((a, b) => new Date(b.date) - new Date(a.date)); note.replaceChildren(...(d.updated ? [h("span", {}, "Updated"), " ", h("span", {}, ago(new Date(d.updated).getTime())), " · ", h("span", {}, "Opens the publisher's site.")] : []));
      const hw = hot(items); hots.replaceChildren(...(hw.length ? [h("small", {}, "Trending"), ...hw.map(w => h("button", { type: "button", on: { click: () => setQ(w) } }, "#" + w))] : [])); paintList(); })
    .catch(() => { err = "x"; paintList(); }); }
  load();
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
