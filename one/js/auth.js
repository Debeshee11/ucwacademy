/* Sign in: Google, or email and password. Learners can create their own account; employees use the work-email door. */
import { ADMIN_EMAIL, STAFF_DOMAIN } from "./config.js";
import { auth } from "./fb.js";
import { h, $ } from "./dom.js";
import { D } from "./data.js";
import * as Store from "./store.js";
import { doorPicker } from "./academy.js";

const brand = () => h("div", { class: "brand" }, h("img", { src: "assets/logo-gold.svg", alt: "UpperCrust, The Wealth Company" }), h("span", { class: "acad" }, "Academy"));

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
/* Indian numbers: 10 digits starting 6-9. Abroad: + then 8 to 15 digits. Returns the number to store, or "". */
export function cleanMobile(v) {
  const t = String(v || "").replace(/[\s().-]/g, "");
  if (/^\+\d{8,15}$/.test(t) && !/^\+91\d{10}$/.test(t)) return t;
  const d = t.replace(/^(\+91|91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(d) ? d : "";
}
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
        const [fm, mo] = field("rm", "Mobile number", { type: "tel", inputmode: "tel", autocomplete: "tel", placeholder: "10-digit mobile, or +country code", maxlength: "20" });
        const [fp, pw] = pwField("rp", "Create a password", { autocomplete: "new-password", placeholder: "At least 6 characters" });
        const fine = h("p", { class: "tiny mute" }, "We store your name, email, optional mobile number, your door and your learning progress to run your account. Learning content is for education only, not investment advice.");
        fields = h("form", { class: "stack", novalidate: true, on: { submit: async ev => {
          ev.preventDefault(); if (!a) return;
          const name = nm.value.trim(), mob = cleanMobile(mo.value), mail = em.value.trim().toLowerCase();
          if (name.length < 2) return fail("Enter your name.");
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return fail("Enter a valid email.");
          if (!mob) return fail("Enter a valid mobile number. Indian numbers are 10 digits; abroad, start with + and the country code.");
          if (mail.endsWith(STAFF_DOMAIN)) { mode = "staff"; startMsg = "Employees: sign in with your work email."; return paint(); }
          if (pw.value.length < 6) return fail("Password needs at least 6 characters.");
          btn.disabled = true; btn.textContent = "Creating…"; err.textContent = "";
          try {
            await persist();
            const u = (await a.createUserWithEmailAndPassword(mail, pw.value)).user;
            try { await u.updateProfile({ displayName: name }); u.sendEmailVerification(); } catch {}
            pending = { name, mobile: mob, fresh: true }; finish(u);
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

    const artEl = document.createElement("div"); artEl.className = "lg-art";
    artEl.innerHTML = '<svg viewBox="0 0 420 300" aria-hidden="true">' + [0,1,2,3,4,5,6,7].map(i => { const ht = 30 + i * i * 3.2 + i * 14; return `<rect x="${40 + i * 44}" y="${250 - ht}" width="22" height="${ht}" rx="3" fill="#C9A24B" fill-opacity="${i > 5 ? 0.95 : 0.25 + i * 0.07}"/>`; }).join("") + '<path d="M30 230 C120 200 200 170 390 40" fill="none" stroke="#E6CF94" stroke-width="2" stroke-dasharray="2 7"/></svg>';
    const side = h("aside", { class: "lg-side", "aria-hidden": "false" },
      artEl,
      h("div", { class: "lg-mark" }, h("img", { src: "assets/logo-gold.svg", alt: "UpperCrust, The Wealth Company" }), h("span", { class: "lg-acad" }, "Academy")),
      h("div", { class: "lg-pitch" },
        h("p", { class: "lg-eyebrow" }, "The Wealth Company"),
        h("h2", { class: "lg-big" }, "Money knowledge,", h("br"), h("em", {}, "for every household.")),
        h("ul", { class: "lg-points" },
          h("li", {}, h("b", {}, "Learn what matters."), " Money basics, mutual funds, the stock market, NRI and more."),
          h("li", {}, h("b", {}, "Prove it."), " Exams and certificates anyone can verify."),
          h("li", {}, h("b", {}, "Built for you."), " Students, homemakers, teachers, professionals, retirees."))),
      h("p", { class: "lg-foot" }, "For education only. Not investment advice."));
    document.body.append(h("div", { class: "lg" }, side, h("main", { class: "lg-main" }, h("div", { class: "lg-card" },
      h("div", { class: "lg-top" }, h("img", { src: "assets/logo-gold.svg", alt: "UpperCrust, The Wealth Company" })), form))));
  });
}

export async function signOut() {
  try { await Store.flush(); await auth()?.signOut(); } catch {}
  location.hash = "#/"; location.reload();
}

/* First visit: ask what to call the learner and where to start. Resolves with "place" when they want a placement test. */
export function welcome() {
  return new Promise(resolve => {
    const staff = Store.isStaff();
    let step = Store.get().name && Store.get().mobile ? 1 : 0, choice = null, door = Store.get().door || null;
    const box = h("div", { class: "gate-card stack stack-l wide" });
    const scrim = h("div", { class: "scrim", role: "dialog", "aria-modal": "true", "aria-label": "Welcome to UpperCrust Academy" }, box);
    const name = h("input", { class: "input", type: "text", autocomplete: "name", id: "nm", placeholder: "Your full name" });
    const logo = h("img", { src: "assets/logo-gold.svg", alt: "UpperCrust", style: "height:34px;margin:0 auto" });

    const mobile = h("input", { class: "input", id: "mb", type: "tel", inputmode: "tel", autocomplete: "tel", placeholder: "10-digit mobile, or +country code", value: Store.get().mobile || "" });
    const perr = h("p", { class: "error", role: "alert" });
    function paint() {
      box.replaceChildren();
      if (step === 0) {
        name.value = name.value || Store.get().name || "";
        const need = true;
        box.append(logo,
          h("div", {}, h("h1", { class: "h1" }, need ? "Complete your profile" : "Let's get you started."), h("p", { class: "mute", style: "margin-top:8px" }, need ? "Two quick details so we can set up your account and send your certificates." : "What should we call you?")),
          h("div", { class: "field" }, h("label", { for: "nm" }, "Full name"), name),
          need ? h("div", { class: "field" }, h("label", { for: "mb" }, "Mobile number"), mobile) : null,
          perr,
          h("button", { class: "btn primary block", on: { click: () => {
            if (name.value.trim().length < 2) { perr.textContent = "Enter your name."; return name.focus(); }
            let m = "";
            if (need) { m = cleanMobile(mobile.value); if (!m) { perr.textContent = "Enter a valid mobile number. Indian numbers are 10 digits; abroad, start with + and the country code."; return mobile.focus(); } }
            Store.setProfile({ name: name.value, mobile: m }); step = 1; paint(); } } }, "Continue"));
        name.focus();
      } else {
        const go = h("button", { class: "btn primary block", disabled: !door, on: { click: () => { Store.setDoor(door); scrim.remove(); resolve(null); } } }, "Open my academy");
        box.append(logo, h("div", {}, h("h1", { class: "h1" }, `Welcome, ${Store.get().name || "friend"}.`), h("p", { class: "mute", style: "margin-top:8px" }, "Which describes you best? It sets the courses we recommend first and the examples you see. You can change it any time.")),
          doorPicker(door, id => { door = id; go.disabled = false; }), go);
      }
    }
    paint();
    document.body.append(scrim);
  });
}
