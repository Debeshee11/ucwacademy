/* Sign in (Firebase email and password; accounts are created by the administrator) and the one-time welcome. */
import { ADMIN_EMAIL } from "./config.js";
import { auth } from "./fb.js";
import { h, $ } from "./dom.js";
import { D } from "./data.js";
import * as Store from "./store.js";

const brand = () => h("div", { class: "brand" }, h("img", { src: "assets/logo-uppercrust.png", alt: "UpperCrust, The Wealth Company" }), h("span", { class: "one" }, "One"));

/* Resolves with the signed-in user. Resolves at once when a session is restored. */
export function start() {
  return new Promise(resolve => {
    const a = auth();
    if (!a) return resolve(mount(null, "The sign-in service could not be loaded. Check your connection and reload."));
    const off = a.onAuthStateChanged(user => { off(); user ? resolve(user) : resolve(mount(a)); });
  });
}

function mount(a, startMsg) {
  return new Promise(resolve => {
    const email = h("input", { class: "input", type: "text", inputmode: "email", autocomplete: "username", autocapitalize: "off", spellcheck: "false", id: "em", placeholder: "name@uppercrustwealth.com" });
    const pw = h("input", { class: "input", type: "password", autocomplete: "current-password", id: "pw" });
    const keep = h("input", { type: "checkbox", id: "keep", checked: true });
    const err = h("p", { class: "error", role: "alert" }, startMsg || "");
    const btn = h("button", { class: "btn primary block", type: "submit" }, "Sign in");
    let tries = 0, lockUntil = 0;
    const fail = m => { err.textContent = m; btn.disabled = false; btn.textContent = "Sign in"; };

    const form = h("form", { class: "gate-card stack", novalidate: true, on: { submit: async ev => {
      ev.preventDefault();
      if (!a) return;
      if (Date.now() < lockUntil) return fail("Too many tries. Wait a few seconds and try again.");
      let em = email.value.trim().toLowerCase(); if (em === "admin") em = ADMIN_EMAIL;
      if (!em || !pw.value) return fail("Enter your email and password.");
      btn.disabled = true; btn.textContent = "Signing in…"; err.textContent = "";
      try {
        await a.setPersistence(keep.checked ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
        const cred = await a.signInWithEmailAndPassword(em, pw.value);
        resolve(cred.user); document.querySelector(".gate")?.remove();
      } catch (e) {
        const c = e?.code || "";
        if (/network/.test(c)) fail("No connection. Check your internet and try again.");
        else if (/too-many/.test(c)) fail("Too many tries. Wait a few minutes and try again.");
        else { if (++tries >= 5) { lockUntil = Date.now() + 30e3; tries = 0; } fail("That email or password is not right."); }
      }
    } } },
      brand(),
      h("div", {}, h("h1", { class: "h1" }, "Welcome back."), h("p", { class: "mute", style: "margin-top:8px" }, "Sign in with the work email and password you were given.")),
      h("div", { class: "field" }, h("label", { for: "em" }, "Work email"), email),
      h("div", { class: "field" }, h("label", { for: "pw" }, "Password"), pw),
      h("label", { class: "row-flex small mute", for: "keep", style: "gap:10px" }, keep, "Keep me signed in on this device"),
      err, btn);
    document.body.append(h("div", { class: "gate" }, form));
    email.focus();
  });
}

export async function signOut() {
  try { await Store.flush(); await auth()?.signOut(); } catch {}
  location.hash = "#/"; location.reload();
}

/* First visit: ask what to call the learner and where to start. Resolves with "place" when they want a placement test. */
export function welcome() {
  return new Promise(resolve => {
    let step = 0, choice = null;
    const box = h("div", { class: "gate-card stack stack-l" });
    const scrim = h("div", { class: "scrim", role: "dialog", "aria-modal": "true", "aria-label": "Welcome to UpperCrust One" }, box);
    const name = h("input", { class: "input", type: "text", autocomplete: "given-name", id: "nm", placeholder: "First name" });

    function paint() {
      box.replaceChildren();
      if (step === 0) {
        box.append(brand(),
          h("div", {}, h("h1", { class: "h1" }, "Let's get you started."), h("p", { class: "mute", style: "margin-top:8px" }, "What should we call you?")),
          h("div", { class: "field" }, h("label", { for: "nm" }, "Your name"), name),
          h("button", { class: "btn primary block", on: { click: () => { if (!name.value.trim()) return name.focus(); Store.setName(name.value); step = 1; paint(); } } }, "Continue"));
        name.focus();
      } else {
        const opts = [
          ["foundation", "I'm new to this", "Start with the basics. Best if you joined recently."],
          ["practitioner", "I know the basics", "Go straight to markets, metals and allocation."],
          ["expert", "I advise clients every day", "Jump to fund analysis and hard conversations."],
          ["place", "Not sure", "Take a 24-question placement test. About 10 minutes."]
        ];
        const go = h("button", { class: "btn primary block", disabled: true, on: { click: () => { if (choice !== "place") Store.setStart(choice); scrim.remove(); resolve(choice === "place" ? "place" : null); } } }, "Start learning");
        box.append(h("div", {}, h("h1", { class: "h1" }, `Nice to meet you, ${Store.get().name}.`), h("p", { class: "mute", style: "margin-top:8px" }, "Where would you like to begin? You can change this any time.")),
          h("div", { class: "stack stack-s" }, opts.map(([id, t, d]) => h("button", { class: "choice", "aria-pressed": "false", on: { click: ev => {
            choice = id; box.querySelectorAll(".choice").forEach(b => b.setAttribute("aria-pressed", "false")); ev.currentTarget.setAttribute("aria-pressed", "true"); go.disabled = false; } } },
            h("span", {}, h("b", { style: "display:block;font-weight:600" }, t), h("span", { class: "small mute" }, d))))),
          go);
      }
    }
    paint();
    document.body.append(scrim);
  });
}
