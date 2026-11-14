/* Growth loop: a share popup after a pass, challenge-a-friend links, and the banner a challenged friend sees. Nothing here touches progress. */
import { h, toast } from "./dom.js";
import * as Store from "./store.js";
import { coinBurst } from "./cheer.js";
import { pop } from "./analytics.js";

const ORIGIN = "https://ucwacademy.in/";
const SEEN = "ucw.share.t";
const first = () => String(Store.get().name || "").trim().split(/\s+/)[0].replace(/[^A-Za-z]/g, "").slice(0, 20);
const ls = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

export function challengeLink({ ex, n, sc, of }) {
  const q = new URLSearchParams({ cb: first() || "A friend", sc: String(Math.round(sc)), of: String(Math.round(of)), ex, n: String(n) });
  return `${ORIGIN}?${q}#/nism/${ex}/mock/${n}`;
}
export const tier = (sc, of) => { const p = sc / of * 100; return p >= 90 ? ["Dalal Street Legend", "👑"] : p >= 75 ? ["Bull Rider", "🐂"] : p >= 60 ? ["Chart Reader", "📈"] : p >= 40 ? ["Market Apprentice", "📘"] : ["Rookie Investor", "🌱"]; };
const wa = (text, url) => "https://wa.me/?text=" + encodeURIComponent(`${text} ${url}`);
const li = url => "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url);

async function shareCard({ sc, of, name, url }) {
  const [t, e] = tier(sc, of), c = document.createElement("canvas"); c.width = 1080; c.height = 1350; const g = c.getContext("2d");
  const bg = g.createLinearGradient(0, 0, 0, 1350); bg.addColorStop(0, "#1b1340"); bg.addColorStop(1, "#0b0b1c"); g.fillStyle = bg; g.fillRect(0, 0, 1080, 1350);
  g.textAlign = "center"; g.fillStyle = "#E8B84A"; g.font = "700 44px system-ui,sans-serif"; g.fillText("UPPERCRUST ACADEMY", 540, 130);
  g.font = "220px system-ui,sans-serif"; g.fillText(e, 540, 420);
  g.fillStyle = "#fff"; g.font = "800 200px system-ui,sans-serif"; g.fillText(`${Math.round(sc)}/${Math.round(of)}`, 540, 700);
  g.fillStyle = "#E8B84A"; g.font = "700 72px system-ui,sans-serif"; g.fillText(t, 540, 810);
  g.fillStyle = "#cfcfe6"; g.font = "500 44px system-ui,sans-serif"; g.fillText(name.slice(0, 34), 540, 900);
  g.fillStyle = "#fff"; g.font = "700 56px system-ui,sans-serif"; g.fillText("Can you beat me?", 540, 1100);
  g.fillStyle = "#E8B84A"; g.font = "600 44px system-ui,sans-serif"; g.fillText("ucwacademy.in", 540, 1190);
  const blob = await new Promise(r => c.toBlob(r, "image/png")); const file = new File([blob], "my-score.png", { type: "image/png" });
  pop("page:share-img");
  if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], text: `Beat my score 👉 ${url}` }); return; } catch (err) { if (err?.name === "AbortError") return; } }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "my-score.png"; a.click(); toast("Score card saved. Post it!");
}

/* Count-up for the big number. */
function countUp(el, to, ms = 900) { const t0 = performance.now(); const f = now => { const k = Math.min(1, (now - t0) / ms); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; requestAnimationFrame(f); }

function sheet({ title, sub, text, url, sc, of, name }) {
  if (document.querySelector(".gw")) return;
  const close = () => { box.classList.remove("in"); setTimeout(() => box.remove(), 250); };
  const copy = async () => { try { await navigator.clipboard.writeText(`${text} ${url}`); toast("Link copied"); } catch { toast(url); } pop("page:share-copy"); };
  const box = h("div", { class: "gw", role: "dialog", "aria-label": title, on: { click: e => { if (e.target === box) close(); } } },
    h("div", { class: "gw-card" },
      h("button", { class: "gw-x", "aria-label": "Close", on: { click: close } }, "×"),
      h("div", { class: "gw-emoji", "aria-hidden": "true" }, tier(sc, of)[1]),
      h("div", { class: "gw-tier" }, tier(sc, of)[0]),
      h("h2", { class: "gw-t" }, title), h("p", { class: "gw-s" }, sub),
      h("a", { class: "btn primary gw-b", href: wa(text, url), target: "_blank", rel: "noopener", on: { click: () => pop("page:share-wa") } }, "Challenge on WhatsApp"),
      h("button", { class: "btn ghost gw-b", on: { click: () => shareCard({ sc, of, name, url }) } }, "Share score card (image)"),
      h("div", { class: "gw-r" },
        h("button", { class: "btn ghost", on: { click: copy } }, "Copy link"),
        h("a", { class: "btn ghost", href: li(url), target: "_blank", rel: "noopener", on: { click: () => pop("page:share-li") } }, "LinkedIn"))));
  document.body.append(box); requestAnimationFrame(() => box.classList.add("in")); coinBurst(26); pop("page:share-open");
}

/* Shown after a pass. At most once per 20 hours so it stays a treat, not a nag. */
export function shareNudge({ ex, n, sc, of, name }) {
  if (Date.now() - (+ls.get(SEEN) || 0) < 72e6) return;
  ls.set(SEEN, String(Date.now()));
  setTimeout(() => sheet({
    title: `You scored ${Math.round(sc)}/${Math.round(of)}!`, sub: "Think your friends can beat it? Send a challenge.",
    text: `I scored ${Math.round(sc)}/${Math.round(of)} on ${name}. Beat me 👉`, url: challengeLink({ ex, n, sc, of }), sc, of, name
  }), 900);
}

/* Always-visible button for the result page. */
export function challengeButton({ ex, n, sc, of, name }) {
  return h("button", { class: "btn ghost light", on: { click: () => sheet({
    title: "Challenge a friend", sub: `Dare them to beat ${Math.round(sc)}/${Math.round(of)}.`,
    text: `I scored ${Math.round(sc)}/${Math.round(of)} on ${name}. Beat me 👉`, url: challengeLink({ ex, n, sc, of }), sc, of, name }) } }, "Challenge a friend");
}

/* Friend side: read ?cb=&sc=&of=&ex=&n=, validate hard, show a banner that works over the login screen. */
export function incoming() {
  let p; try { p = new URLSearchParams(location.search); } catch { return; }
  let raw = p.get("cb") ? p : null;
  if (!raw) { try { const s = sessionStorage.getItem("ucw.ch"); if (s) raw = new URLSearchParams(s); } catch {} }
  if (!raw) return;
  const cb = (raw.get("cb") || "").replace(/[^A-Za-z ]/g, "").slice(0, 20), sc = +raw.get("sc"), of = +raw.get("of"), ex = raw.get("ex") || "", n = +raw.get("n");
  if (!cb || !Number.isFinite(sc) || !Number.isFinite(of) || of < 1 || of > 500 || sc < 0 || sc > of || !/^nism-[a-z0-9-]+$/.test(ex) || !(n >= 1 && n <= 5)) return;
  try { sessionStorage.setItem("ucw.ch", location.search.slice(1) || sessionStorage.getItem("ucw.ch") || ""); history.replaceState(null, "", location.pathname + location.hash); } catch {}
  if (document.querySelector(".gc")) return;
  const bar = h("div", { class: "gc", role: "status" },
    h("span", {}, h("b", {}, cb), ` scored ${sc}/${of}. Can you beat it?`),
    h("a", { class: "btn primary", href: `#/nism/${ex}/mock/${n}`, on: { click: () => { pop("page:challenge-accept"); try { sessionStorage.setItem("ucw.vs", JSON.stringify({ cb, sc, of, ex, n })); } catch {} bar.remove(); } } }, "Accept"),
    h("button", { class: "gw-x", "aria-label": "Dismiss", on: { click: () => bar.remove() } }, "×"));
  document.body.append(bar); pop("page:challenge-view");
}

/* Friend side, result page: head-to-head against the challenger, with a rematch link. */
export function versus({ ex, n, sc, of, name }) {
  let v; try { v = JSON.parse(sessionStorage.getItem("ucw.vs") || "null"); } catch {}
  if (!v || v.ex !== ex || v.n !== n || !(v.of > 0)) return null;
  const mine = sc / of * 100, theirs = v.sc / v.of * 100, win = mine > theirs, tie = mine === theirs;
  const head = win ? `You beat ${v.cb}! 🎉` : tie ? `Dead heat with ${v.cb} 🤝` : `${v.cb} wins this round 😤`;
  const num = h("b", {}, "0"); countUp(num, Math.round(sc));
  if (win) coinBurst(40);
  pop(win ? "page:vs-win" : tie ? "page:vs-tie" : "page:vs-lose");
  return h("div", { class: "vs " + (win ? "w" : "l") },
    h("div", { class: "vs-h" }, head),
    h("div", { class: "vs-r" }, h("span", {}, "You ", num, `/${Math.round(of)}`), h("i", {}, "vs"), h("span", {}, `${v.cb} ${v.sc}/${v.of}`)),
    h("div", { class: "row-flex", style: "justify-content:center" },
      h("a", { class: "btn primary", href: wa(win ? `I beat your ${v.sc}/${v.of}! Rematch? 😎` : `Rematch? I'll get you next time 😤`, challengeLink({ ex, n, sc, of })), target: "_blank", rel: "noopener", on: { click: () => pop("page:vs-rematch") } }, win ? "Send them my score" : "Ask for a rematch"),
      h("a", { class: "btn ghost light", href: `#/nism/${ex}/mock/${n}` }, "Retake")));
}
