/* Privacy notice, terms of use, and the consent step shown once after first sign-in.
   The wording is a working draft: have your lawyer or compliance officer read it before launch. */
import { ORG, CONTACT_EMAIL } from "./config.js";
import { h } from "./dom.js";
import * as Store from "./store.js";

const mail = h("a", { href: "mailto:" + CONTACT_EMAIL }, CONTACT_EMAIL);
const sec = (title, ...kids) => h("section", { class: "stack stack-s" }, h("h2", { class: "h3" }, title), ...kids);
const ul = items => h("ul", { class: "facts" }, items.map(t => h("li", {}, t)));

function privacy() {
  return [
    h("h1", { class: "h1" }, "Privacy notice"),
    h("p", { class: "mute" }, `How ${ORG} Academy handles your information. Last updated 7 November 2026.`),
    sec("What we collect", ul([
      "Your name and mobile number, and your email if you sign in with Google or email.",
      "How you signed in, and which description fits you best (for example student or salaried).",
      "Your learning record: lessons finished, quiz and exam scores, points, streak, certificates, Client Lab practice, language choice.",
      "Short technical error reports from your browser when something breaks (the message, the page, the app version and your account id)."
    ])),
    sec("Why we collect it", ul([
      "To run your account, save your progress across devices and issue certificates you can share.",
      "To send you the one-time code when you sign in with your mobile number.",
      "To show the leaderboard, only if you keep it switched on, with your first name and last initial.",
      "To understand how the Academy is used and to fix faults. We do not sell your information."
    ])),
    sec("Who sees it", ul([
      `${ORG} staff who run the Academy can see learner records.`,
      "Anyone with the link to one of your certificates can see your name, the certificate title, your score and its dates. Nothing else.",
      "Our service providers: Google Firebase (sign-in, database, hosting of the backend) and, for mobile sign-in, its SMS partners. Fonts load from Google Fonts. News headlines link out to publishers.",
    ])),
    sec("How long we keep it", h("p", {}, "Until you delete your account. Deleting it (Progress, Delete my account) removes your record, your leaderboard entry, your mock results and your certificates, and closes your sign-in. A certificate that was already shared will then show as not found.")),
    sec("Your choices and rights", ul([
      "Access or correct your information: write to us, or change your name and details in the app.",
      "Erase it: use Delete my account in the app, or write to us.",
      "Withdraw consent at any time by deleting your account.",
      "Complaints: write to us first. You may also approach the Data Protection Board of India."
    ])),
    sec("Your device", h("p", {}, "The app keeps a copy of your progress in your browser so it works with a weak connection. Signing out on a shared computer is a good idea.")),
    sec("Who this is for", h("p", {}, "The Academy is meant for adults. If you are under 18, please use it with a parent or guardian.")),
    sec("Contact", h("p", {}, "Questions, requests or complaints: ", mail, ".")),
  ];
}

function terms() {
  return [
    h("h1", { class: "h1" }, "Terms of use"),
    h("p", { class: "mute" }, `Rules for using ${ORG} Academy. Last updated 7 November 2026.`),
    sec("Learning only, not advice", h("p", {}, "Everything here is for education. Nothing is investment, tax, legal or insurance advice, or an offer or recommendation to buy, sell or hold any product. Mutual fund investments are subject to market risks. Read all scheme related documents carefully. Past performance may or may not be sustained in the future. Fund and market data comes from public sources and may be out of date.")),
    sec("Certificates", h("p", {}, `Certificates and credentials are issued by ${ORG} Academy for completing its courses. They are not a regulatory licence, and they are not issued by NISM, SEBI, AMFI or IRDAI. NISM exam preparation material here is independent and is not NISM's own workbook; always read the latest official workbook before an official exam.`)),
    sec("Your account", ul(["Give true details and keep your sign-in safe.", "Do not share answers to exams, copy the content to sell or republish it, or try to break or overload the service.", "Do not try to change your scores or certificates. We may remove accounts that do."])),
    sec("Our content", h("p", {}, `The lessons, questions and design belong to ${ORG} or its licensors. You may use them for your own learning.`)),
    sec("Availability and liability", h("p", {}, "We work to keep the Academy running but cannot promise it will always be available or error free. To the extent the law allows, we are not liable for losses from using the Academy or relying on its content.")),
    sec("Changes and law", h("p", {}, "We may update the Academy and these terms. Continuing to use it means you accept the update. Indian law applies.")),
    sec("Contact", h("p", {}, "Write to ", mail, ".")),
  ];
}

/* A page that needs no sign-in (also used inside the app). */
export function legalPage(kind) {
  return h("main", { class: "wrap page stack stack-l", id: "main" },
    h("a", { class: "brand", href: "./" }, h("img", { src: "assets/mark.svg", alt: "" }), h("span", { class: "bt" }, h("b", {}, "UpperCrust"), h("i", {}, "Academy"))),
    ...(kind === "terms" ? terms() : privacy()),
    h("p", { class: "small" }, h("a", { href: "#/privacy" }, "Privacy notice"), "  ·  ", h("a", { href: "#/terms" }, "Terms of use"), "  ·  ", h("a", { href: "./" }, "Back to the Academy")));
}

/* Links for forms and menus. They open in a new tab so a half-finished sign-in is not lost. */
export const legalLinks = () => h("span", {}, h("a", { href: "#/privacy", target: "_blank", rel: "noopener" }, "Privacy notice"), " and ", h("a", { href: "#/terms", target: "_blank", rel: "noopener" }, "Terms of use"));

/* Shown once after first sign-in. Nothing is stored as consent until the learner presses the button. */
export function consentGate() {
  return new Promise(resolve => {
    const ok = h("input", { type: "checkbox", id: "cg" });
    const go = h("button", { class: "btn primary block", disabled: true, on: { click: () => { Store.setConsent(); scrim.remove(); resolve(); } } }, "Agree and continue");
    ok.addEventListener("change", () => { go.disabled = !ok.checked; });
    const scrim = h("div", { class: "scrim", role: "dialog", "aria-modal": "true", "aria-label": "Privacy and terms" },
      h("div", { class: "gate-card stack stack-l wide" },
        h("img", { src: "assets/mark.svg", alt: "UpperCrust Academy", style: "height:36px;margin:0 auto" }),
        h("div", {}, h("h1", { class: "h1" }, "Before you start"), h("p", { class: "mute", style: "margin-top:8px" }, "We keep your name, mobile number and learning progress to run your account. Lessons are for education, not investment advice.")),
        h("label", { class: "row-flex small", for: "cg", style: "gap:10px;align-items:flex-start;flex-wrap:nowrap" }, ok, h("span", {}, "I have read the ", legalLinks(), " and I agree.")),
        go));
    document.body.append(scrim);
  });
}
