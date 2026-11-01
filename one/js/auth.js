/* Sign in: Google, or email and password. Learners can create their own account; employees use the work-email door. */
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
  if (/account-exists-with-different/.test(c)) return "This email is registered another way. Sign in with email and password.";
  if (/operation-not-allowed|unauthorized-domain/.test(c)) return "This sign-in method is not switched on yet. Contact UpperCrust.";
  if (/popup-closed|cancelled-popup/.test(c)) return "";
  return "That email or password is not right.";
};

const GOOGLE_G = '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
const html = s => { const d = document.createElement("span"); d.innerHTML = s; return d.firstChild; };

function mount(a, startMsg) {
  return new Promise(resolve => {
    let mode = "in"; /* in | up | staff */
    let tries = 0, lockUntil = 0;
    const form = h("div", { class: "lg-form" });
    const finish = u => { resolve(u); document.querySelector(".lg")?.remove(); };

    const field = (id, label, attrs = {}, extra) => {
      const i = h("input", { class: "input", id, ...attrs });
      return [h("div", { class: "field" }, h("label", { for: id }, label), extra ? h("div", { class: "pw" }, i, extra) : i), i];
    };
    const pwField = (id, label, attrs) => {
      let shown = false;
      const eye = h("button", { type: "button", class: "pw-eye", "aria-label": "Show password", on: { click: () => { shown = !shown; inp.type = shown ? "text" : "password"; eye.textContent = shown ? "Hide" : "Show"; eye.setAttribute("aria-label", shown ? "Hide password" : "Show password"); } } }, "Show");
      const [f, inp] = field(id, label, { type: "password", ...attrs }, eye);
      return [f, inp];
    };

    async function google(fail) {
      if (!a) return;
      const p = new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: "select_account" });
      try {
        await a.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        const r = await a.signInWithPopup(p);
        if (r.additionalUserInfo?.isNewUser && r.user.displayName) pending = { name: r.user.displayName };
        finish(r.user);
      } catch (e) {
        if (/popup-blocked|operation-not-supported/.test(e?.code || "")) { try { await a.signInWithRedirect(p); return; } catch (e2) { e = e2; } }
        fail(errMsg(e));
      }
    }

    function paint() {
      form.replaceChildren();
      const err = h("p", { class: "error", role: "alert" }, startMsg || "");
      const label = mode === "up" ? "Create my account" : mode === "staff" ? "Sign in as employee" : "Sign in";
      const btn = h("button", { class: "btn primary block", type: "submit" }, label);
      const fail = m => { err.textContent = m; btn.disabled = false; btn.textContent = label; };
      const keep = h("input", { type: "checkbox", id: "keep", checked: true });
      const keepRow = h("label", { class: "row-flex small mute", for: "keep", style: "gap:10px" }, keep, "Keep me signed in");
      const persist = () => a.setPersistence(keep.checked ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);

      const gBtn = h("button", { type: "button", class: "g-btn", on: { click: async ev => { ev.currentTarget.disabled = true; err.textContent = ""; await google(fail); ev.currentTarget.disabled = false; } } }, html(GOOGLE_G), mode === "up" ? "Sign up with Google" : mode === "staff" ? "Continue with work Google account" : "Continue with Google");
      const or = h("div", { class: "or" }, h("span", {}, "or with email"));

      const forgotFor = email => h("button", { type: "button", class: "link small", on: { click: async () => {
        let em = email.value.trim().toLowerCase(); if (em === "admin") em = ADMIN_EMAIL;
        if (!em) return fail("Type your email first.");
        try { await a.sendPasswordResetEmail(em); err.style.color = "var(--ink)"; err.textContent = "Reset link sent. Check your inbox."; } catch (e) { fail(errMsg(e)); }
      } } }, "Forgot password?");

      let fields;
      if (mode === "up") {
        const [fn, nm] = field("rn", "Full name", { type: "text", autocomplete: "name", placeholder: "Your full name" });
        const [fe, em] = field("re", "Email", { type: "text", inputmode: "email", autocomplete: "email", autocapitalize: "off", spellcheck: "false", placeholder: "you@example.com" });
        const [fm, mo] = field("rm", "Mobile number (optional)", { type: "tel", inputmode: "numeric", autocomplete: "tel-national", placeholder: "10-digit mobile number", maxlength: "18" });
        const [fp, pw] = pwField("rp", "Create a password", { autocomplete: "new-password", placeholder: "At least 6 characters" });
        const fine = h("p", { class: "tiny mute" }, "By creating an account you agree to learn for education only. Nothing here is investment advice.");
        fields = h("form", { class: "stack", novalidate: true, on: { submit: async ev => {
          ev.preventDefault(); if (!a) return;
          const name = nm.value.trim(), raw = mo.value.replace(/[\s-]/g, ""), mob = raw.replace(/^(\+91|91|0)(?=\d{10}$)/, ""), mail = em.value.trim().toLowerCase();
          if (name.length < 2) return fail("Enter your name.");
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return fail("Enter a valid email.");
          if (raw && !/^[6-9]\d{9}$/.test(mob)) return fail("Enter a valid 10-digit mobile number, or leave it empty.");
          if (mail.endsWith(STAFF_DOMAIN)) { mode = "staff"; startMsg = "Employees: sign in with your work email."; return paint(); }
          if (pw.value.length < 6) return fail("Password needs at least 6 characters.");
          btn.disabled = true; btn.textContent = "Creating…"; err.textContent = "";
          try {
            await persist();
            const u = (await a.createUserWithEmailAndPassword(mail, pw.value)).user;
            try { await u.updateProfile({ displayName: name }); u.sendEmailVerification(); } catch {}
            pending = { name, mobile: mob }; finish(u);
          } catch (e) { fail(errMsg(e)); }
        } } }, fn, fe, fm, fp, keepRow, err, btn, fine);
        setTimeout(() => nm.focus());
      } else {
        const staff = mode === "staff";
        const [fe, email] = field("em", staff ? "Work email" : "Email", { type: "text", inputmode: "email", autocomplete: "username", autocapitalize: "off", spellcheck: "false", placeholder: staff ? "name@uppercrustwealth.com" : "you@example.com" });
        const [fp, pw] = pwField("pw", "Password", { autocomplete: "current-password" });
        fields = h("form", { class: "stack", novalidate: true, on: { submit: async ev => {
          ev.preventDefault(); if (!a) return;
          if (Date.now() < lockUntil) return fail("Too many tries. Wait a few seconds and try again.");
          let em = email.value.trim().toLowerCase(); if (em === "admin") em = ADMIN_EMAIL;
          if (!em || !pw.value) return fail("Enter your email and password.");
          btn.disabled = true; btn.textContent = "Signing in…"; err.textContent = "";
          try { await persist(); finish((await a.signInWithEmailAndPassword(em, pw.value)).user); }
          catch (e) { if (!/network|too-many/.test(e?.code || "") && ++tries >= 5) { lockUntil = Date.now() + 30e3; tries = 0; } fail(errMsg(e)); }
        } } }, fe, fp, h("div", { class: "row-flex", style: "justify-content:space-between" }, keepRow, forgotFor(email)), err, btn);
        setTimeout(() => email.focus());
      }

      const heading = mode === "up" ? ["Create your account", "Free to start. Learn at your own pace."] : mode === "staff" ? ["Employee sign in", "Use your UpperCrust work email."] : ["Welcome back", "Sign in to continue learning."];
      const swap = mode === "staff"
        ? h("p", { class: "lg-swap" }, h("button", { type: "button", class: "link", on: { click: () => { mode = "in"; startMsg = ""; paint(); } } }, "Back to learner sign in"))
        : h("p", { class: "lg-swap" }, mode === "up" ? "Already have an account? " : "New here? ", h("button", { type: "button", class: "link", on: { click: () => { mode = mode === "up" ? "in" : "up"; startMsg = ""; paint(); } } }, mode === "up" ? "Sign in" : "Create an account"));
      form.append(
        h("div", { class: "lg-head" }, h("h1", { class: "lg-h" }, heading[0]), h("p", { class: "mute" }, heading[1])),
        gBtn, or, fields, swap,
        ...(mode === "staff" ? [] : [h("p", { class: "lg-staff" }, "UpperCrust employee? ", h("button", { type: "button", class: "link", on: { click: () => { mode = "staff"; startMsg = ""; paint(); } } }, "Sign in with your work email"))]));
    }
    paint();

    const side = h("aside", { class: "lg-side", "aria-hidden": "false" },
      h("div", { class: "lg-mark" }, h("span", { class: "lg-crest" }, "U"), h("span", {}, "UpperCrust ", h("em", {}, "Academy"))),
      h("div", { class: "lg-pitch" },
        h("p", { class: "lg-eyebrow" }, "The Wealth Company"),
        h("h2", { class: "lg-big" }, "Money knowledge,", h("br"), h("em", {}, "for every household.")),
        h("ul", { class: "lg-points" },
          h("li", {}, h("b", {}, "Learn what matters."), " Earn, keep, protect, grow, borrow and pass on."),
          h("li", {}, h("b", {}, "Prove it."), " Exams and certificates anyone can verify."),
          h("li", {}, h("b", {}, "Built for you."), " Students, homemakers, teachers, professionals, retirees."))),
      h("p", { class: "lg-foot" }, "For education only. Not investment advice."));
    document.body.append(h("div", { class: "lg" }, side, h("main", { class: "lg-main" }, h("div", { class: "lg-card" },
      h("div", { class: "lg-top" }, h("img", { src: "assets/logo-uppercrust.png", alt: "UpperCrust, The Wealth Company" })), form))));
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
