/* Contact page: works with or without a sign-in. */
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_TEL, ORG } from "./config.js";
import { h, icon } from "./dom.js";

const way = (ic, title, value, href, ext) => h("a", { class: "cway", href, ...(ext ? { target: "_blank", rel: "noopener" } : {}) },
  h("span", { class: "cway-ic" }, icon(ic, 26)), h("span", { class: "cway-t" }, title), h("span", { class: "cway-v" }, value));

export function contactBody() {
  return [
    h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Contact us"),
      h("p", { class: "lead mute" }, "Questions about a course, your account, your data or a certificate? Reach the " + ORG + " team any of these ways.")),
    h("div", { class: "cways" },
      way("chat", "Email", CONTACT_EMAIL, "mailto:" + CONTACT_EMAIL),
      way("user", "Call", CONTACT_PHONE, "tel:" + CONTACT_TEL),
      way("chat", "WhatsApp", CONTACT_PHONE, "https://wa.me/" + CONTACT_TEL.replace("+", ""), true)),
    h("p", { class: "small mute" }, "When you write, add the email or mobile number you signed in with, so we can find your account. Never send a password or an OTP.")
  ];
}

/* Stand-alone page, for people who are not signed in. */
export function contactPage() {
  return h("main", { class: "wrap page stack stack-l", id: "main" },
    h("a", { class: "brand", href: "./" }, h("img", { src: "assets/mark.svg", alt: "" }), h("span", { class: "bt" }, h("b", {}, "UpperCrust"), h("i", {}, "Academy"))),
    ...contactBody(),
    h("p", { class: "small" }, h("a", { href: "#/privacy" }, "Privacy notice"), "  ·  ", h("a", { href: "#/terms" }, "Terms of use"), "  ·  ", h("a", { href: "./" }, "Back to the Academy")));
}
