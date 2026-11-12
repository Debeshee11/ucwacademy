/* Sign in: Google, or email and password. Learners can create their own account; employees use the work-email door. */
import { ADMIN_EMAIL, STAFF_DOMAIN } from "./config.js";
import { auth } from "./fb.js";
import { h, $, add } from "./dom.js";
const ap = (el, ...kids) => add(el, kids);
import { D } from "./data.js";
import * as Store from "./store.js";
import { doorPicker } from "./academy.js";
import { loginSide } from "./loginart.js";
import { LANGS, getLang, setLanguage } from "./i18n.js";
import { legalLinks } from "./legal.js";
import { CONTACT_EMAIL } from "./config.js";
import { countryPicker, joinNumber } from "./countries.js";
import { aboutYou } from "./guide.js";
import { reportError } from "./monitor.js";
import { gisReady, preloadGis, gisCredential } from "./googlesignin.js";
import { needsVerify, sendCode, confirmCode, verifyError } from "./mobileverify.js";

const brand = () => h("div", { class: "brand" }, h("img", { src: "assets/mark.svg", alt: "" }), h("span", { class: "bt" }, h("b", {}, "UpperCrust"), h("i", {}, "Academy")));

/* Resolves with the signed-in user. Resolves at once when a session is restored. */
export function start() {
  preloadGis();
  return new Promise(resolve => {
    const a = auth();
    if (!a) return resolve(mount(null, "The sign-in service could not be loaded. Check your connection and reload."));
    /* After a redirect sign-in (used when a popup is blocked) pick up the name and any error before deciding what to show. */
    Promise.resolve().then(() => a.getRedirectResult?.()).catch(e => ({ e })).then(r => {
      let note = "";
      if (r?.e) note = errMsg(r.e); else if (r?.additionalUserInfo?.isNewUser && r.user?.displayName) pending = { name: r.user.displayName };
      const off = a.onAuthStateChanged(user => { off(); user ? resolve(user) : resolve(mount(a, note)); });
    });
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
  if (/unauthorized-domain/.test(c)) return "Google sign-in is not available on this web address yet. Please use your mobile number or email instead. We are fixing it.";
  if (/operation-not-allowed/.test(c)) return "This sign-in method is switched off right now. Please use another way to sign in, or write to " + CONTACT_EMAIL + ".";
  if (/web-storage|missing-initial-state|storage-unavailable/.test(c)) return "Your browser is blocking sign-in. Turn off private mode, or open this page in Chrome or Safari, then try again.";
  if (/popup-closed|cancelled-popup/.test(c)) return "";
  if (/invalid-phone-number|missing-phone-number/.test(c)) return "That mobile number does not look right.";
  if (/invalid-verification-code|missing-verification-code/.test(c)) return "That code is not right. Check the SMS and try again.";
  if (/code-expired|session-expired/.test(c)) return "That code has expired. Send a new one.";
  if (/captcha/.test(c)) return "Security check failed. Reload the page and try again.";
  if (/quota-exceeded/.test(c)) return "Too many codes sent today. Try tomorrow, or use Google.";
  if (/wrong-password|user-not-found|invalid-credential|invalid-login/.test(c)) return "That email or password is not right.";
  if (/user-disabled/.test(c)) return `This account is switched off. Write to ${CONTACT_EMAIL}.`;
  return `Could not sign in just now. Try again, or write to ${CONTACT_EMAIL}.` + (c ? ` (${c.replace("auth/", "")})` : "");
};

/* Shown at the top of the sign-in form when the page is opened inside another app (WhatsApp, Instagram, LinkedIn...).
   Google refuses to sign in there, so we say so first and offer a way out. */
function inAppBar() {
  const android = /Android/i.test(navigator.userAgent || "");
  const url = location.origin + location.pathname;
  const copy = h("button", { type: "button", class: "btn ghost", on: { click: async () => {
    try { await navigator.clipboard.writeText(url); copy.textContent = "Link copied. Paste it in Chrome or Safari"; } catch { copy.textContent = url; }
  } } }, "Copy link");
  return h("div", { class: "card stack stack-s", role: "note", style: "border:2px solid var(--ink);padding:14px" },
    h("b", {}, "Open this page in your browser"),
    h("p", { class: "small" }, "You are inside another app. Google sign-in does not work here. Open in Chrome or Safari, or sign in with your mobile number or email below."),
    h("div", { class: "row-flex" }, copy, android ? h("a", { class: "btn primary", href: "intent://" + location.host + location.pathname + "#Intent;scheme=https;package=com.android.chrome;end" }, "Open in Chrome") : null));
}

/* Google refuses sign-in inside the browsers built into WhatsApp, Instagram, Facebook and similar apps. */
const inApp = () => /FBAN|FBAV|Instagram|Line\/|WhatsApp|Snapchat|Twitter|LinkedInApp|MicroMessenger|GSA\//i.test(navigator.userAgent || "");
const GOOGLE_G = '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 0 1 0-9.4l-7.9-6.1a24 24 0 0 0 0 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
/* Indian numbers: 10 digits starting 6-9. Abroad: + then 8 to 15 digits. Returns the number to store, or "". */
export function cleanMobile(v) {
  const t = String(v || "").replace(/[\s().-]/g, "");
  if (/^\+\d{8,15}$/.test(t) && !/^\+91\d{10}$/.test(t)) return t;
  const d = t.replace(/^(\+91|91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(d) ? d : "";
}
/* on a phone, focusing a field on load scrolls past the picture and opens the keyboard at once */
const wide = () => matchMedia("(min-width: 861px)").matches;
const html = s => { const d = document.createElement("span"); d.innerHTML = s; return d.firstChild; };

function mount(a, startMsg) {
  return new Promise(resolve => {
    let mode = "phone"; /* phone | mail | staff */
    let signup = false; /* in mail mode: create a new email account */
    let persist = async () => {};
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
      preloadGis();
      if (inApp()) return fail("Google sign-in does not work inside this app. Use the buttons at the top to open in your browser, or sign in with mobile number or email.");
      const p = new firebase.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: "select_account" });
      try {
        await a.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        let r;
        if (gisReady() && window.google?.accounts?.oauth2) {
          try { r = await a.signInWithCredential(await gisCredential()); }
          catch (e) {
            if (/popup_closed|popup_failed_to_open|access_denied|gis\/(popup|access)/i.test(e?.code || "")) return fail(/closed|denied/i.test(e.code) ? "" : "Your browser blocked the Google window. Allow pop-ups for this site and try again, or sign in with mobile number or email.");
            throw e;
          }
        } else r = await a.signInWithPopup(p);
        if (r.additionalUserInfo?.isNewUser && r.user.displayName) pending = { name: r.user.displayName };
        finish(r.user);
      } catch (e) {
        if (/popup-blocked|operation-not-supported|missing initial state/i.test((e?.code || "") + (e?.message || ""))) return fail("Your browser blocked the Google window. Allow pop-ups for this site and try again, or sign in with mobile number or email.");
        reportError(new Error("google-signin: " + (e?.code || e?.message || "unknown")));
        fail(errMsg(e));
      }
    }

    /* ——— mobile one-time code ——— */
    let confirmation = null, verifier = null, sentTo = "", resendAt = 0, resendTimer = null;
    const toE164 = v => { const m = cleanMobile(v); return m ? (m.startsWith("+") ? m : "+91" + m) : ""; };
    const clearVerifier = () => { try { verifier?.clear(); } catch {} verifier = null; };

    function phoneForm(err, setBusy) {
      const wrap = h("div", { class: "stack" });
      const recap = h("div", { id: "recap" });
      const show = () => {
        wrap.replaceChildren();
        if (!confirmation) {
          const cc = countryPicker();
          const [fm, mo] = field("ph", "Mobile number", { type: "tel", inputmode: "tel", autocomplete: "tel-national", placeholder: "Mobile number (no country code)", maxlength: "20" });
          const send = h("button", { class: "btn primary block", type: "submit" }, "Send OTP");
          wrap.append(h("form", { class: "stack", novalidate: true, on: { submit: async ev => {
            ev.preventDefault(); if (!a) return;
            if (Date.now() < lockUntil) return setBusy(false, "Too many tries. Wait a few seconds and try again.");
            const num = toE164(joinNumber(cc, mo.value));
            if (!num) return setBusy(false, "Enter a valid mobile number for the country you picked.");
            send.disabled = true; send.textContent = "Sending…"; err.textContent = "";
            try {
              await persist();
              clearVerifier(); verifier = new firebase.auth.RecaptchaVerifier("recap", { size: "invisible" });
              confirmation = await a.signInWithPhoneNumber(num, verifier);
              sentTo = num; resendAt = Date.now() + 30e3; show();
            } catch (e) { clearVerifier(); confirmation = null; send.disabled = false; send.textContent = "Send OTP"; if (!/network/.test(e?.code || "") && ++tries >= 5) { lockUntil = Date.now() + 30e3; tries = 0; } err.textContent = errMsg(e); }
          } } }, h("div", { class: "field" }, h("label", { for: "cc" }, "Country"), cc), fm, h("p", { class: "tiny mute" }, "We will text a 6-digit code to this number. Standard SMS charges may apply. Abroad, you can also use Google or email."), err, recap, send));
          setTimeout(() => wide() && mo.focus());
        } else {
          const [fc, code] = field("otp", "Enter the 6-digit code", { type: "text", inputmode: "numeric", autocomplete: "one-time-code", maxlength: "6", placeholder: "••••••" }); code.classList.add("otp");
          const ok = h("button", { class: "btn primary block", type: "submit" }, "Verify and continue");
          const resend = h("button", { type: "button", class: "link small", disabled: true }, "");
          const tickR = () => { const sec = Math.ceil((resendAt - Date.now()) / 1000); resend.disabled = sec > 0; resend.textContent = sec > 0 ? `Resend code in ${sec}s` : "Send a new code"; if (sec <= 0) clearInterval(resendTimer); };
          clearInterval(resendTimer); resendTimer = setInterval(() => { if (!resend.isConnected) return clearInterval(resendTimer); tickR(); }, 1000); tickR();
          resend.onclick = () => { confirmation = null; err.textContent = ""; show(); };
          wrap.append(h("form", { class: "stack", novalidate: true, on: { submit: async ev => {
            ev.preventDefault();
            const c = code.value.replace(/\D/g, "");
            if (c.length !== 6) { err.textContent = "Enter the 6-digit code."; return; }
            ok.disabled = true; ok.textContent = "Checking…"; err.textContent = "";
            try {
              const r = await confirmation.confirm(c);
              const m = cleanMobile(sentTo);
              pending = { mobile: m, mv: 1, fresh: !!r.additionalUserInfo?.isNewUser };
              finish(r.user);
            } catch (e) { ok.disabled = false; ok.textContent = "Verify and continue"; if (/code-expired|session-expired/.test(e?.code || "")) { confirmation = null; } err.textContent = errMsg(e); if (!confirmation) show(); }
          } } }, h("p", { class: "mute" }, `Code sent to ${sentTo.replace(/^\+91/, "+91 ")}.`), fc, err, ok,
          h("div", { class: "lg-alt" }, resend, h("button", { type: "button", class: "link small", on: { click: () => { confirmation = null; err.textContent = ""; show(); } } }, "Change number"))));
          setTimeout(() => code.focus());
        }
      };
      show();
      return wrap;
    }

    function paint() {
      form.replaceChildren(); document.querySelector(".lg")?.setAttribute("data-mode", mode);
      const err = h("p", { class: "error", role: "alert" }, startMsg || "");
      const keep = h("input", { type: "checkbox", id: "keep", checked: true });
      const keepRow = h("label", { class: "row-flex small mute", for: "keep", style: "gap:10px" }, keep, "Keep me signed in");
      const persistFn = () => a.setPersistence(keep.checked ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
      persist = persistFn;
      const fail = m => { err.textContent = m; };
      const setBusy = (_, m) => fail(m || "");
      const label = mode === "staff" ? "Sign in as employee" : signup ? "Create account" : "Sign in";
      const btn = h("button", { class: "btn primary block", type: "submit" }, label);

      const gBtn = h("button", { type: "button", class: "g-btn", on: { click: async ev => { ev.currentTarget.disabled = true; err.textContent = ""; await google(fail); ev.currentTarget.disabled = false; } } }, html(GOOGLE_G), mode === "staff" ? "Continue with work Google account" : "Continue with Google");
      const or = h("div", { class: "or" }, h("span", {}, mode === "phone" ? "or" : "or with email"));

      const forgotFor = email => h("button", { type: "button", class: "link small", on: { click: async () => {
        let em = email.value.trim().toLowerCase(); if (em === "admin") em = ADMIN_EMAIL;
        if (!em) return fail("Type your email first.");
        try { await a.sendPasswordResetEmail(em); err.style.color = "var(--ink)"; err.textContent = "Reset link sent. Check your inbox."; } catch (e) { fail(errMsg(e)); }
      } } }, "Forgot password?");

      let fields;
      if (mode === "phone") {
        fields = phoneForm(err, setBusy);
      } else {
        const staff = mode === "staff";
        const [fe, email] = field("em", staff ? "Work email" : "Email", { type: "text", inputmode: "email", autocomplete: "username", autocapitalize: "off", spellcheck: "false", placeholder: staff ? "name@uppercrustwealth.com" : "you@example.com" });
        const [fp, pw] = pwField("pw", "Password", { autocomplete: signup ? "new-password" : "current-password" });
        const fb2 = m => { err.textContent = m; btn.disabled = false; btn.textContent = label; };
        fields = h("form", { class: "stack", novalidate: true, on: { submit: async ev => {
          ev.preventDefault(); if (!a) return;
          if (Date.now() < lockUntil) return fb2("Too many tries. Wait a few seconds and try again.");
          let em = email.value.trim().toLowerCase(); if (em === "admin") em = ADMIN_EMAIL;
          if (!em || !pw.value) return fb2("Enter your email and password.");
          if (signup && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) return fb2("That email does not look right.");
          if (signup && pw.value.length < 6) return fb2("Password is too short. Use at least 6 characters.");
          btn.disabled = true; btn.textContent = signup ? "Creating…" : "Signing in…"; err.textContent = "";
          try { await persist(); finish((signup ? await a.createUserWithEmailAndPassword(em, pw.value) : await a.signInWithEmailAndPassword(em, pw.value)).user); }
          catch (e) { if (!/network|too-many/.test(e?.code || "") && ++tries >= 5) { lockUntil = Date.now() + 30e3; tries = 0; } fb2(errMsg(e)); }
        } } }, fe, fp, h("div", { class: "row-flex", style: "justify-content:space-between" }, keepRow, forgotFor(email)), err, btn);
        setTimeout(() => wide() && email.focus());
      }

      const heading = mode === "staff" ? ["Employee sign in", "Use your UpperCrust work email."] : mode === "mail" ? (signup ? ["Create an email account", "Pick a password. You will verify your mobile number next."] : ["Sign in with email", "Use the email and password you signed up with."]) : ["Welcome", "New or returning, the steps are the same. Enter your mobile number and we will text you a code. If you are new, we create your account on the spot. No password to remember."];
      const go = (m, msg = "") => h("button", { type: "button", class: "link", on: { click: () => { clearVerifier(); confirmation = null; mode = m; signup = false; startMsg = msg; paint(); } } });
      const links = [];
      if (mode !== "phone") links.push(h("p", { class: "lg-swap" }, "Back to ", Object.assign(go("phone"), { textContent: "mobile sign in" })));
      if (mode === "mail") links.push(h("p", { class: "lg-swap" }, signup ? "Already have an account? " : "New here? ", Object.assign(h("button", { type: "button", class: "link", on: { click: () => { signup = !signup; startMsg = ""; paint(); } } }), { textContent: signup ? "Sign in" : "Create an email account" })));
      if (mode === "phone") links.push(h("p", { class: "lg-swap" }, "Prefer email and password? ", Object.assign(go("mail"), { textContent: "Sign in or create an account with email" })));
      if (mode !== "staff") links.push(h("p", { class: "lg-staff" }, "UpperCrust employee? ", Object.assign(go("staff"), { textContent: "Sign in with your work email" })));
      ap(form, h("div", { class: "lg-head" }, h("h1", { class: "lg-h" }, heading[0]), h("p", { class: "mute" }, heading[1])),
        ...(inApp() ? [inAppBar()] : []),
        ...(mode === "mail" ? [h("div", { class: "chips", role: "group", "aria-label": "Sign in or create account" },
          h("button", { type: "button", class: "chip", "aria-pressed": String(!signup), on: { click: () => { signup = false; startMsg = ""; paint(); } } }, "I have an account"),
          h("button", { type: "button", class: "chip", "aria-pressed": String(signup), on: { click: () => { signup = true; startMsg = ""; paint(); } } }, "I am new"))] : []),
        ...(mode === "phone" ? [fields, or, gBtn] : [gBtn, or, fields]), ...links,
        h("p", { class: "tiny mute" }, mode === "phone" ? "Google works the same way: new or returning, one tap." : ""),
        h("p", { class: "tiny mute" }, "We store your name, mobile number, door and learning progress to run your account. Learning content is for education only, not investment advice. By continuing you accept the ", legalLinks(), "."),
        h("p", { class: "tiny mute" }, "Need help? ", h("a", { href: "#/contact" }, "Contact us"), " or write to ", h("a", { href: "mailto:" + CONTACT_EMAIL }, CONTACT_EMAIL), "."));
    }
    paint();

    const side = loginSide();
    const langRow = h("div", { class: "lg-lang", role: "group", "aria-label": "Language" },
      LANGS.map(([v, t]) => h("button", { type: "button", class: "lg-lbtn", lang: v, "aria-pressed": String(getLang() === v), on: { click: () => v !== getLang() && setLanguage(v) } }, t)));
    document.body.append(h("div", { class: "lg", "data-mode": mode }, side, h("main", { class: "lg-main" }, h("div", { class: "lg-card" }, langRow,
      h("div", { class: "lg-top" }, h("div", { class: "brand" }, h("img", { src: "assets/mark.svg", alt: "" }), h("span", { class: "bt" }, h("b", {}, "UpperCrust"), h("i", {}, "Academy")))), form))));
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
    let step = Store.get().name && Store.get().mobile && Store.contactEmail() ? (needsVerify() ? "v" : 1) : 0, choice = null, door = Store.get().door || null;
    const box = h("div", { class: "gate-card stack stack-l wide" });
    const scrim = h("div", { class: "scrim", role: "dialog", "aria-modal": "true", "aria-label": "Welcome to UpperCrust Academy" }, box);
    const name = h("input", { class: "input", type: "text", autocomplete: "name", id: "nm", placeholder: "Your full name" });
    const logo = h("img", { src: "assets/mark.svg", alt: "UpperCrust Academy", style: "height:36px;margin:0 auto" });

    const mcc = countryPicker();
    const mobile = h("input", { class: "input", id: "mb", type: "tel", inputmode: "tel", autocomplete: "tel-national", placeholder: "Mobile number (no country code)", value: Store.get().mobile || "", readonly: !!Store.get().mv });
    const perr = h("p", { class: "error", role: "alert" });
    const needEmail = !Store.contactEmail();
    const emailIn = h("input", { class: "input", id: "ce", type: "email", inputmode: "email", autocomplete: "email", autocapitalize: "off", placeholder: "you@example.com" });
    /* Prove the number: a code is texted when this step opens. */
    let conf = null, resendAt = 0, tick = null;
    function verifyPaint() {
      const num = Store.get().mobile, e164 = num.startsWith("+") ? num : "+91" + num;
      const holder = h("div", { id: "recap2" }), err = h("p", { class: "error", role: "alert" });
      const code = h("input", { class: "input otp", id: "vc", type: "text", inputmode: "numeric", autocomplete: "one-time-code", maxlength: "6", placeholder: "••••••" });
      const ok = h("button", { class: "btn primary block", type: "submit", disabled: true }, "Verify and continue");
      const resend = h("button", { type: "button", class: "link small", disabled: true }, "");
      const change = h("button", { type: "button", class: "link small", on: { click: () => { clearInterval(tick); step = 0; paint(); } } }, "Change number");
      const lap = () => { const sec = Math.ceil((resendAt - Date.now()) / 1000); resend.disabled = sec > 0; resend.textContent = sec > 0 ? `Resend code in ${sec}s` : "Send a new code"; if (sec <= 0) clearInterval(tick); };
      const send = async () => {
        err.textContent = ""; ok.disabled = true; resend.disabled = true;
        try { conf = await sendCode(e164, holder); resendAt = Date.now() + 30e3; clearInterval(tick); tick = setInterval(() => { if (!resend.isConnected) return clearInterval(tick); lap(); }, 1000); lap(); ok.disabled = false; code.focus(); }
        catch (e) { err.textContent = verifyError(e); resend.disabled = false; resend.textContent = "Send a new code"; }
      };
      resend.onclick = send;
      const form = h("form", { class: "stack", novalidate: true, on: { submit: async ev => {
        ev.preventDefault();
        const c = code.value.replace(/\D/g, "");
        if (!conf) return send();
        if (c.length !== 6) { err.textContent = "Enter the 6-digit code."; return; }
        ok.disabled = true; ok.textContent = "Checking…"; err.textContent = "";
        try { await confirmCode(conf, c, num); clearInterval(tick); if (Store.get().door) { scrim.remove(); resolve(null); } else { step = 1; paint(); } }
        catch (e) { ok.disabled = false; ok.textContent = "Verify and continue"; err.textContent = verifyError(e); if (/expired/.test(e?.code || "")) conf = null; }
      } } }, h("div", { class: "field" }, h("label", { for: "vc" }, `Enter the 6-digit code sent to ${e164.replace(/^\+91/, "+91 ")}`), code), err, ok, h("div", { class: "lg-alt" }, resend, change), holder);
      ap(box, logo, h("div", {}, h("h1", { class: "h1" }, "Verify your mobile"), h("p", { class: "mute", style: "margin-top:8px" }, "One quick check that this number is yours. It keeps your certificates and account safe.")), form);
      send();
    }
    function paint() {
      box.replaceChildren();
      if (step === 0) {
        name.value = name.value || Store.get().name || "";
        const need = true;
        ap(box, logo,
          h("div", {}, h("h1", { class: "h1" }, need ? "Complete your profile" : "Let's get you started."), h("p", { class: "mute", style: "margin-top:8px" }, need ? "Three quick details so we can set up your account and send your certificates." : "What should we call you?")),
          h("div", { class: "field" }, h("label", { for: "nm" }, "Full name"), name),
          need ? h("div", { class: "field" }, h("label", { for: "mb" }, "Mobile number"), Store.get().mv ? null : mcc, mobile) : null,
          needEmail ? h("div", { class: "field" }, h("label", { for: "ce" }, "Email"), emailIn) : null,
          perr,
          h("button", { class: "btn primary block", on: { click: () => {
            if (name.value.trim().length < 2) { perr.textContent = "Enter your name."; return name.focus(); }
            let m = "";
            if (need) { m = cleanMobile(joinNumber(mcc, mobile.value)); if (!m) { perr.textContent = "Enter a valid mobile number for the country you picked."; return mobile.focus(); } }
            if (needEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailIn.value.trim())) { perr.textContent = "Enter a valid email."; return emailIn.focus(); }
            Store.setProfile({ name: name.value, mobile: m, email: emailIn.value }); Store.flush(); step = needsVerify() ? "v" : 1; paint(); } } }, "Continue"));
        name.focus();
      } else if (step === "v") {
        verifyPaint();
      } else {
        const go = h("button", { class: "btn primary block", disabled: !door, on: { click: () => { Store.setDoor(door); Store.flush(); scrim.remove(); resolve(null); } } }, "Open my academy");
        ap(box, logo, h("div", {}, h("h1", { class: "h1" }, `Welcome, ${Store.get().name || "friend"}.`), h("p", { class: "mute", style: "margin-top:8px" }, "Which describes you best? Add your age group and interests too. They set the courses we show first. You can change all of it any time.")),
          doorPicker(door, id => { door = id; go.disabled = false; }), aboutYou(), go);
      }
    }
    paint();
    document.body.append(scrim);
  });
}
