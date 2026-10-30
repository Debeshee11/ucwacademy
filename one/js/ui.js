/* The frame around every page: top bar, bottom tabs on phones, and the account menu. */
import { ADMIN_EMAIL } from "./config.js";
import { h, icon, clear } from "./dom.js";
import { D, loadTx } from "./data.js";
import * as Store from "./store.js";
import { signOut } from "./auth.js";

export const NAV = [
  ["#/", "Learn", "home", "home"],
  ["#/courses", "Explore", "search", "courses"],
  ["#/practice", "Practice", "bolt", "practice"],
  ["#/funds", "Library", "book", "library"],
  ["#/me", "Awards", "award", "me"]
];
export const isAdmin = () => Store.userEmail() === ADMIN_EMAIL;

export function frame(onLang) {
  const nav = h("nav", { class: "nav", "aria-label": "Main" });
  const tabs = h("nav", { class: "tabs", "aria-label": "Main" });
  const menuHost = h("div", { class: "me" });
  const brand = () => h("a", { class: "brand", href: "#/", "aria-label": "UpperCrust One home" }, h("img", { src: "assets/logo-uppercrust.png", alt: "UpperCrust" }), h("span", { class: "one" }, "One"));
  const side = h("aside", { class: "side" }, brand(), nav);
  const top = h("header", { class: "bar-top" }, brand(), menuHost);
  let open = false, active = "";

  function close() { open = false; paintMenu(); }
  function paintMenu() {
    clear(menuHost);
    const s = Store.get(), n = Store.streakNow();
    const initial = (s.name || Store.userEmail() || "?").trim()[0].toUpperCase();
    const btn = h("button", { class: "avatar", "aria-haspopup": "menu", "aria-expanded": String(open), "aria-label": "Account", on: { click: ev => { ev.stopPropagation(); open = !open; paintMenu(); } } }, initial);
    menuHost.append(
      h("span", { class: "pillstat fire", title: "Weekday streak", "aria-label": `${n} day streak` }, icon("flame"), n),
      h("span", { class: "pillstat xp", title: "Points: 20 per lesson, 2 per right answer, 30 per quiz passed", "aria-label": `${Store.xp()} points` }, icon("star"), Store.xp()),
      btn);
    if (open) {
      const lang = h("select", { "aria-label": "Quiz language", on: { change: async ev => { Store.setLang(ev.target.value); await loadTx(ev.target.value); close(); onLang && onLang(); } } },
        [["en", "English"], ["hi", "हिन्दी"], ["gu", "ગુજરાતી"]].map(([v, t]) => h("option", { value: v, selected: s.lang === v }, t)));
      menuHost.append(h("div", { class: "menu", role: "menu", on: { click: ev => ev.stopPropagation() } },
        h("div", { class: "who" }, h("div", { style: "font-weight:800" }, s.name || "Learner"), h("div", { class: "tiny mute" }, Store.userEmail())),
        h("label", { class: "tiny mute", style: "display:block;padding:0 12px 10px;font-weight:800" }, "Quiz language", lang),
        Store.isStaff() && h("a", { href: "classic/", role: "menuitem" }, icon("book", 20), "Classic tools"),
        Store.isStaff() && h("a", { href: "#/board", role: "menuitem", on: { click: close } }, icon("trophy", 20), "Leaderboard"),
        isAdmin() && h("a", { href: "#/team", role: "menuitem", on: { click: close } }, icon("team", 20), "Team"),
        h("button", { role: "menuitem", on: { click: signOut } }, icon("out", 20), "Sign out")));
    }
  }
  document.addEventListener("click", () => { if (open) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && open) close(); });

  function paintNav() {
    clear(nav); clear(tabs);
    for (const [href, label, ic, id] of NAV) {
      const cur = id === active ? { "aria-current": "page" } : {};
      nav.append(h("a", { href, ...cur }, icon(ic), label));
      tabs.append(h("a", { href, "aria-label": label, ...cur }, icon(ic), h("span", {}, label)));
    }
  }
  Store.subscribe(() => { if (!open) paintMenu(); });
  paintNav(); paintMenu();
  const shell = document.querySelector(".shell");
  document.body.prepend(side); shell.insertBefore(top, shell.firstChild); document.body.append(tabs); document.body.classList.remove("pre");
  return {
    show(on) { document.body.classList.toggle("focus", !on); },
    active(id) { active = id; paintNav(); paintMenu(); }
  };
}

/* Page containers */
export const page = (...kids) => h("main", { class: "wrap page stack stack-xl", id: "main" }, kids);
export const widePage = (...kids) => h("main", { class: "wrap wide page stack stack-xl", id: "main" }, kids);

/* Common small parts */
export const levelTag = lv => h("span", { class: "level" }, h("span", { class: `dot ${lv.id}` }), lv.name);
export const bar = (p, ok) => h("div", { class: "bar" + (ok ? " ok" : ""), role: "progressbar", "aria-valuenow": p, "aria-valuemin": 0, "aria-valuemax": 100 }, h("i", { style: `width:${p}%` }));
export const checkMark = state => h("span", { class: "check " + (state === "done" ? "on" : state === "now" ? "now" : "") }, state === "done" ? icon("check") : null);
export const notFound = msg => page(h("div", { class: "stack" }, h("h1", { class: "h1" }, "Not found"), h("p", { class: "mute" }, msg || "That page does not exist."), h("a", { class: "btn primary", href: "#/" }, "Back home")));
