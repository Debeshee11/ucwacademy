/* Sign in (Firebase email and password; accounts are created by the administrator) and the one-time welcome. */
import { ADMIN_EMAIL, STAFF_DOMAIN } from "./config.js";
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

let pending = null;
export const takeProfile = () => { const p = pending; pending = null; return p; };

const errMsg = e => {
  const c = e?.code || "";
  if (/network/.test(c)) return "No connection. Check your internet and try again.";
  if (/too-many/.test(c)) return "Too many tries. Wait a few minutes and try again.";
  if (/email-already/.test(c)) return "This email already has an account. Use Sign in.";
  if (/weak-password/.test(c)) return "Password is too short. Use at least 6 characters.";
  if (/invalid-email/.test(c)) return "That email does not look right.";
  if (/operation-not-allowed/.test(c)) return "Sign-up is not switched on yet. Contact UpperCrust.";
  return "That email or password is not right.";
};

function mount(a, startMsg) {
  return new Promise(resolve => {
    let tab = "staff", tries = 0, lockUntil = 0;
    const box = h("div", { class: "gate-card stack" });
    const field = (id, label, attrs = {}) => { const i = h("input", { class: "input", id, ...attrs }); return [h("div", { class: "field" }, h("label", { for: id }, label), i), i]; };
    const finish = u => { resolve(u); document.querySelector(".gate")?.remove(); };
    const tabs = () => h("div", { class: "ltabs", role: "tablist" }, [["staff", "UpperCrust employee"], ["public", "New learner"]].map(([id, t]) =>
      h("button", { type: "button", role: "tab", class: "ltab", "aria-selected": String(tab === id), on: { click: () => { tab = id; paint(); } } }, t)));

    function paint() {
      box.replaceChildren();
      const err = h("p", { class: "error", role: "alert" }, startMsg || "");
      const btn = h("button", { class: "btn primary block", type: "submit" }, tab === "staff" ? "Sign in" : "Create my account");
      const fail = m => { err.textContent = m; btn.disabled = false; btn.textContent = tab === "staff" ? "Sign in" : "Create my account"; };
      const keep = h("input", { type: "checkbox", id: "keep", checked: true });
      const keepRow = h("label", { class: "row-flex small mute", for: "keep", style: "gap:10px" }, keep, "Keep me signed in on this device");
      const persist = () => a.setPersistence(keep.checked ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
      let form;
      if (tab === "staff") {
        const [fe, email] = field("em", "Work email", { type: "text", inputmode: "email", autocomplete: "username", autocapitalize: "off", spellcheck: "false", placeholder: "name@uppercrustwealth.com" });
        const [fp, pw] = field("pw", "Password", { type: "password", autocomplete: "current-password" });
        const forgot = h("button", { type: "button", class: "link small", on: { click: async () => {
          let em = email.value.trim().toLowerCase(); if (em === "admin") em = ADMIN_EMAIL;
          if (!em) return fail("Type your work email first.");
          try { await a.sendPasswordResetEmail(em); err.style.color = "var(--ink)"; err.textContent = "Reset link sent. Check your inbox."; } catch (e) { fail(errMsg(e)); }
        } } }, "Forgot password?");
        form = h("form", { class: "stack", novalidate: true, on: { submit: async ev => {
          ev.preventDefault(); if (!a) return;
          if (Date.now() < lockUntil) return fail("Too many tries. Wait a few seconds and try again.");
          let em = email.value.trim().toLowerCase(); if (em === "admin") em = ADMIN_EMAIL;
          if (!em || !pw.value) return fail("Enter your email and password.");
          btn.disabled = true; btn.textContent = "Signing in…"; err.textContent = "";
          try { await persist(); finish((await a.signInWithEmailAndPassword(em, pw.value)).user); }
          catch (e) { if (!/network|too-many/.test(e?.code || "") && ++tries >= 5) { lockUntil = Date.now() + 30e3; tries = 0; } fail(errMsg(e)); }
        } } }, fe, fp, keepRow, err, btn, forgot);
        setTimeout(() => email.focus());
      } else {
        const [fn, nm] = field("rn", "Full name", { type: "text", autocomplete: "name", placeholder: "Your full name" });
        const [fm, mo] = field("rm", "Mobile number", { type: "tel", inputmode: "numeric", autocomplete: "tel-national", placeholder: "10-digit mobile number", maxlength: "18" });
        const [fe, em] = field("re", "Email", { type: "text", inputmode: "email", autocomplete: "email", autocapitalize: "off", spellcheck: "false", placeholder: "you@example.com" });
        const [fp, pw] = field("rp", "Create a password", { type: "password", autocomplete: "new-password", placeholder: "At least 6 characters" });
        form = h("form", { class: "stack", novalidate: true, on: { submit: async ev => {
          ev.preventDefault(); if (!a) return;
          const name = nm.value.trim(), mob = mo.value.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""), mail = em.value.trim().toLowerCase();
          if (name.length < 2) return fail("Enter your name.");
          if (!/^[6-9]\d{9}$/.test(mob)) return fail("Enter a valid 10-digit Indian mobile number.");
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return fail("Enter a valid email.");
          if (mail.endsWith(STAFF_DOMAIN)) return fail("Employees: use the UpperCrust employee tab.");
          if (pw.value.length < 6) return fail("Password needs at least 6 characters.");
          btn.disabled = true; btn.textContent = "Creating…"; err.textContent = "";
          try {
            await persist();
            const u = (await a.createUserWithEmailAndPassword(mail, pw.value)).user;
            try { await u.updateProfile({ displayName: name }); u.sendEmailVerification(); } catch {}
            pending = { name, mobile: mob }; finish(u);
          } catch (e) { fail(errMsg(e)); }
        } } }, fn, fm, fe, fp, keepRow, err, btn);
        setTimeout(() => nm.focus());
      }
      box.append(brand(),
        h("div", {}, h("h1", { class: "h1" }, tab === "staff" ? "Welcome back." : "Become a master of mutual funds."),
          h("p", { class: "mute", style: "margin-top:8px" }, tab === "staff" ? "Sign in with your UpperCrust work email." : "Free lessons, fund factsheets, quizzes and certificates.")),
        tabs(), form);
    }
    paint();
    document.body.append(h("div", { class: "gate" }, box));
  });
}

export async function signOut() {
  try { await Store.flush(); await auth()?.signOut(); } catch {}
  location.hash = "#/"; location.reload();
}

/* First visit: ask what to call the learner and where to start. Resolves with "place" when they want a placement test. */
export function welcome() {
  return new Promise(resolve => {
    let step = Store.get().name ? 1 : 0, choice = null;
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
