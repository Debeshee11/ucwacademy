/* The frame around every page: top bar, bottom tabs on phones, and the account menu. */
import { ADMIN_EMAIL } from "./config.js";
import { h, icon, clear, toast } from "./dom.js";
import { D } from "./data.js";
import { LANGS, setLanguage } from "./i18n.js";
import * as Store from "./store.js";
import { signOut, signIn } from "./auth.js";
import { isPro, doorOf } from "./audience.js";

export const NAV = [
  ["#/", "Learn", "book", "home", "Your path, stage by stage"],
  ["#/practice", "Practice", "trophy", "practice", "Daily five, revision, calculators"],
  ["#/assess", "Exams", "award", "assess", "Stage exams and NISM prep"],
  ["#/cases", "Cases", "play", "cases", "Short films on money and business"],
  ["#/news", "News", "trend", "desk", "Headlines, funds, indices"],
  ["#/me", "Me", "star", "me", "Progress, certificates, leaderboard"]
];
export const isAdmin = () => Store.userEmail() === ADMIN_EMAIL;

export function frame(onLang) {
  const nav = h("nav", { class: "nav", "aria-label": "Main" });
  const tabs = h("nav", { class: "tabs", "aria-label": "Main" });
  const menuHost = h("div", { class: "me" });
  const brand = () => h("a", { class: "brand", href: "#/", "aria-label": "UpperCrust Academy home" }, h("img", { src: "assets/mark.svg", alt: "" }), h("span", { class: "bt" }, h("b", {}, "UpperCrust"), h("i", {}, "Academy")));
  const side = h("aside", { class: "side" }, brand(), nav);
  const top = h("header", { class: "bar-top" }, brand(), menuHost);
  let open = false, active = "";

  function close() { open = false; paintMenu(); }
  function paintMenu() {
    clear(menuHost);
    const s = Store.get(), n = Store.streakNow(), guest = Store.isGuest();
    const initial = (s.name || Store.userEmail() || "?").trim()[0].toUpperCase();
    const btn = h("button", { class: "avatar", "aria-haspopup": "menu", "aria-expanded": String(open), "aria-label": "Account", on: { click: ev => { ev.stopPropagation(); open = !open; paintMenu(); } } }, initial);
    menuHost.append(...[
      h("button", { type: "button", class: "pillstat fire", title: "Weekday streak", "aria-label": `${n} day streak`, on: { click: () => toast("Do one lesson or quiz on a weekday to grow your streak.") } }, icon("flame"), n),
      h("button", { type: "button", class: "pillstat xp", title: "Points: 20 per lesson, 2 per right answer, 30 per quiz passed", "aria-label": `${Store.xp()} points`, on: { click: () => toast("Points: 20 per lesson, 2 per right answer, 30 per quiz passed.") } }, icon("star"), Store.xp()),
      guest ? h("button", { type: "button", class: "guest-in", on: { click: () => signIn() } }, "Sign in") : null,
      btn].filter(Boolean));
    if (open) {
      const lang = h("select", { "aria-label": "Language", on: { change: async ev => { const v = ev.target.value; Store.setLang(v); try { await Store.flush(); } catch {} setLanguage(v); } } },
        LANGS.map(([v, t]) => h("option", { value: v, selected: s.lang === v }, t)));
      const door = doorOf(s.door), link = (href, ic, label) => h("a", { href, role: "menuitem", on: { click: close } }, icon(ic, 20), label);
      const admin = isAdmin() ? h("details", { class: "mdet" }, h("summary", { class: "mh" }, "Admin"),
        link("#/admin", "trend", "Growth and exams"), link("#/team", "team", "Team"), link("#/funddata", "book", "Fund data")) : null;
      menuHost.append(h("div", { class: "menu", role: "menu", on: { click: ev => ev.stopPropagation() } },
        h("div", { class: "who" }, h("div", { style: "font-weight:800" }, guest ? "Guest" : s.name || "Learner"),
          h("div", { class: "tiny mute" }, guest ? "Progress is saved on this device" : Store.userEmail()),
          h("a", { class: "tiny linkish", href: "#/me", on: { click: close } }, door ? `Learning as ${door.name}. Change` : "Tell us who you are")),
        guest && h("button", { role: "menuitem", class: "btn primary block", style: "margin:8px 0 2px;width:100%", on: { click: () => { close(); signIn(); } } }, icon("user", 20), "Sign in or create an account"),
        h("div", { class: "mh" }, "Explore"),
        h("div", { class: "mrow" }, link("#/quotes", "quote", "Quote bank"), link("#/tools", "trend", "Calculators"),
          !guest && link("#/board", "trophy", "Leaderboard"), !guest && link("#/review", "star", "Rate us")),
        h("div", { class: "mh" }, "Settings"),
        h("label", { class: "tiny mute", style: "display:block;padding:0 12px 6px;font-weight:800" }, "Language", lang),
        h("button", { role: "menuitem", on: { click: () => { close(); document.dispatchEvent(new CustomEvent("one:tour")); } } }, icon("help", 20), "Take the tour"),
        admin,
        h("hr"),
        h("div", { class: "mfoot" }, h("a", { href: "#/contact", on: { click: close } }, "Contact"), h("a", { href: "#/privacy", on: { click: close } }, "Privacy"), h("a", { href: "#/terms", on: { click: close } }, "Terms"), h("a", { href: "#/disclosures", on: { click: close } }, "Disclosures")),
        !guest && h("button", { role: "menuitem", on: { click: signOut } }, icon("out", 20), "Sign out")));
    }
  }
  document.addEventListener("click", () => { if (open) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && open) close(); });

  function paintNav() {
    clear(nav); clear(tabs);
    for (const [href, label, ic, id, sub0] of NAV) {
      const sub = !isPro() && id === "practice" ? "Daily five, revision, calculators" : sub0;
      const cur = id === active ? { "aria-current": "page" } : {};
      nav.append(h("a", { href, title: sub, ...cur }, icon(ic), h("span", { class: "nav-t" }, h("b", {}, label), h("small", {}, sub))));
      tabs.append(h("a", { href, "aria-label": label, ...cur }, icon(ic), h("span", {}, label === "News & Markets" ? "News" : label)));
    }
  }
  Store.subscribe(() => { if (!open) paintMenu(); });
  paintNav(); paintMenu();
  const shell = document.querySelector(".shell");
  document.body.prepend(side); shell.insertBefore(top, shell.firstChild); document.body.append(tabs); document.body.classList.remove("pre");
  return {
    show(on) { document.body.classList.toggle("focus", !on); },
    active(id) { active = id; try { document.body.dataset.sec = id || ""; } catch {} paintNav(); paintMenu(); }
  };
}

/* Page containers */
export const page = (...kids) => h("main", { class: "wrap page stack stack-xl", id: "main" }, kids);
export const widePage = (...kids) => h("main", { class: "wrap wide page stack stack-xl", id: "main" }, kids);

/* Common small parts */
export const levelTag = lv => h("span", { class: "level" }, h("span", { class: `dot ${lv.id}` }), lv.name);
export const bar = (p, ok, label = "Progress") => h("div", { class: "bar" + (ok ? " ok" : ""), role: "progressbar", "aria-label": label, "aria-valuenow": Math.round(p), "aria-valuemin": 0, "aria-valuemax": 100 }, h("i", { style: `width:${p}%` }));
export const checkMark = state => h("span", { class: "check " + (state === "done" ? "on" : state === "now" ? "now" : "") }, state === "done" ? icon("check") : null);
export const notFound = msg => page(h("div", { class: "stack" }, h("h1", { class: "h1" }, "Not found"), h("p", { class: "mute" }, msg || "That page does not exist."), h("a", { class: "btn primary", href: "#/" }, "Back home")));
