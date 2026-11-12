/* "Share your win": ready captions for WhatsApp, LinkedIn and a short post, plus the share picture. Nothing is posted for you. */
import { h, icon, toast } from "./dom.js";
import { captions, nick, grade } from "./certcopy.js";
import { download } from "./certshare.js";

const copy = async text => { try { await navigator.clipboard.writeText(text); toast("Copied. Paste it in your post."); } catch { prompt("Copy this text", text); } };

export function sharePanel(c, name, url) {
  const cap = captions(c, name, url);
  const row = (label, text, extra) => h("div", { class: "sp-row" }, h("div", { class: "sp-head" }, h("b", {}, label), h("div", { class: "row-flex", style: "gap:8px" }, extra, h("button", { class: "btn ghost sm", type: "button", on: { click: () => copy(text) } }, icon("link", 16), "Copy"))), h("p", { class: "sp-text" }, text));
  return h("section", { class: "card sp stack no-print" },
    h("div", {}, h("div", { class: "lb-eyebrow" }, "Share your win"), h("h2", { class: "h2" }, `You unlocked “${nick(c)}”${grade(c.score) ? " " + grade(c.score) : ""}`), h("p", { class: "small mute" }, "Post it, tag a friend, and show people what you learned. Anyone can verify it with your link.")),
    h("div", { class: "row-flex" },
      h("button", { class: "btn primary", type: "button", on: { click: () => download(c, name || "Learner", nick(c)) } }, icon("award", 18), "Download share picture"),
      h("a", { class: "btn wa", target: "_blank", rel: "noopener", href: "https://wa.me/?text=" + encodeURIComponent(cap.whatsapp) }, "Share on WhatsApp"),
      h("a", { class: "btn ghost", target: "_blank", rel: "noopener", href: "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url) }, "Share on LinkedIn")),
    row("WhatsApp or Instagram story", cap.whatsapp), row("LinkedIn post", cap.linkedin), row("Short post for X", cap.short));
}
