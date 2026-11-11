/* Privacy notice, terms of use, and the consent step shown once after first sign-in.
   The wording is a working draft: have your lawyer or compliance officer read it before launch. */
import { ORG, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_TEL } from "./config.js";
import { h } from "./dom.js";
import * as Store from "./store.js";
import { PRIVACY, TERMS, DISCLOSURES, UPDATED } from "./legaltext.js";

const mail = h("a", { href: "mailto:" + CONTACT_EMAIL }, CONTACT_EMAIL);
const sec = (title, ...kids) => h("section", { class: "stack stack-s" }, h("h2", { class: "h3" }, title), ...kids);
const ul = items => h("ul", { class: "facts" }, items.map(t => h("li", {}, t)));

const body = items => items.map(it => Array.isArray(it) ? ul(it.slice(1)) : h("p", {}, it));
const doc = (title, lead, data, tail) => [
  h("h1", { class: "h1" }, title), h("p", { class: "mute" }, `${lead} Last updated ${UPDATED}.`),
  ...data.map(([t, kids]) => sec(t, ...body(kids))),
  sec("Contact", h("p", {}, "Write to ", mail, ", call ", h("a", { href: "tel:" + CONTACT_TEL }, CONTACT_PHONE), " or open the ", h("a", { href: "#/contact" }, "contact page"), ".")), tail];
const privacy = () => doc("Privacy notice", `How ${ORG} Academy handles your information.`, PRIVACY);
const terms = () => doc("Terms of use", `Rules for using ${ORG} Academy.`, TERMS);
const disclosures = () => doc("Important disclosures", `What you should know before using ${ORG} Academy.`, DISCLOSURES);

/* A page that needs no sign-in (also used inside the app). */
export function legalPage(kind) {
  return h("main", { class: "wrap page stack stack-l", id: "main" },
    h("a", { class: "brand", href: "./" }, h("img", { src: "assets/mark.svg", alt: "" }), h("span", { class: "bt" }, h("b", {}, "UpperCrust"), h("i", {}, "Academy"))),
    ...(kind === "terms" ? terms() : kind === "disclosures" ? disclosures() : privacy()),
    h("p", { class: "small" }, h("a", { href: "#/privacy" }, "Privacy notice"), "  ·  ", h("a", { href: "#/terms" }, "Terms of use"), "  ·  ", h("a", { href: "#/disclosures" }, "Disclosures"), "  ·  ", h("a", { href: "#/contact" }, "Contact us"), "  ·  ", h("a", { href: "./" }, "Back to the Academy")));
}

/* Links for forms and menus. They open in a new tab so a half-finished sign-in is not lost. */
export const legalLinks = () => h("span", {}, h("a", { href: "#/privacy", target: "_blank", rel: "noopener" }, "Privacy notice"), ", ", h("a", { href: "#/terms", target: "_blank", rel: "noopener" }, "Terms of use"), " and ", h("a", { href: "#/disclosures", target: "_blank", rel: "noopener" }, "Disclosures"));

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
