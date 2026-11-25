/* Share cards: a picture the learner can post. Drawn on a canvas, no server, no tracking.
   Claims are only facts the learner earned: a score, a key, a streak. Never a tip or a return. */
import { h, icon } from "./dom.js";
import { mascot } from "./mascot.js";
import { siteUrl } from "./rate.js";

const TONES = { gold: ["#FFE9A8", "#FFB703", "#2B2118"], green: ["#D9F5E3", "#2F8F5B", "#10331F"], violet: ["#E7E0FF", "#6B4FD6", "#241A55"] };

function wrap(ctx, text, x, y, w, lh, max = 3) {
  const words = String(text).split(/\s+/); let line = "", n = 0;
  for (const wd of words) {
    const t = line ? line + " " + wd : wd;
    if (ctx.measureText(t).width > w && line) { ctx.fillText(line, x, y); y += lh; line = wd; if (++n >= max) return y; } else line = t;
  }
  if (line) { ctx.fillText(line, x, y); y += lh; }
  return y;
}
const img = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });

/* spec: { kicker, big, title, sub, tone } */
export async function makeCard(spec) {
  const [bg, ac, ink] = TONES[spec.tone] || TONES.gold, W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d"), ff = getComputedStyle(document.body).fontFamily || "sans-serif";
  const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, bg); g.addColorStop(1, "#FFFFFF"); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.fillStyle = ac; x.globalAlpha = .18; x.beginPath(); x.arc(W - 80, 140, 320, 0, 7); x.fill(); x.beginPath(); x.arc(60, H - 260, 240, 0, 7); x.fill(); x.globalAlpha = 1;
  x.fillStyle = ink; x.textAlign = "left"; x.font = `800 40px ${ff}`; x.fillText("UpperCrust Academy", 70, 110);
  x.fillStyle = ac; x.fillRect(70, 132, 120, 8);
  x.fillStyle = ink; x.font = `800 38px ${ff}`; x.textAlign = "center"; x.fillText(String(spec.kicker || "").toUpperCase(), W / 2, 270);
  x.font = `900 ${spec.big && spec.big.length > 5 ? 190 : 260}px ${ff}`; x.fillStyle = ac; x.fillText(spec.big || "", W / 2, 520);
  x.fillStyle = ink; x.font = `800 64px ${ff}`; const y = wrap(x, spec.title || "", W / 2, 640, 900, 76, 3);
  x.font = `600 40px ${ff}`; x.globalAlpha = .8; wrap(x, spec.sub || "", W / 2, y + 20, 860, 54, 3); x.globalAlpha = 1;
  try {
    /* the mascot markup is HTML-lenient; make it strict XML for the canvas by dropping repeated attributes */
    const svg = mascot({ mood: "joy", pose: "stand", view: "bust", px: 300 }).replace(/<[a-z][^<>]*>/gi, t => { const seen = new Set(); return t.replace(/\s([a-z-]+)="[^"]*"/gi, (m, n) => seen.has(n) ? "" : (seen.add(n), m)); });
    const m = await img("data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)); if (m) x.drawImage(m, W / 2 - 156, 880, 312, 360);
  } catch {}
  x.fillStyle = ink; x.fillRect(0, 1240, W, 110);
  x.fillStyle = "#FFFFFF"; x.font = `700 36px ${ff}`; x.textAlign = "center"; x.fillText(siteUrl().replace(/^https?:\/\//, "").replace(/\?.*$/, ""), W / 2, 1306);
  return new Promise(res => c.toBlob(res, "image/png"));
}

export async function shareCard(spec, text) {
  const blob = await makeCard(spec); if (!blob) return "failed";
  const file = new File([blob], "uppercrust-academy.png", { type: "image/png" });
  try {
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: `${text} ${siteUrl()}` }); return "shared"; }
  } catch (e) { if (e && e.name === "AbortError") return "cancelled"; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "uppercrust-academy.png"; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return "saved";
}

export function shareButton(spec, text, label = "Share a picture", cls = "btn ghost") {
  const b = h("button", { class: cls, type: "button" }, icon("share", 18), label);
  b.addEventListener("click", async () => {
    b.disabled = true; const r = await shareCard(spec, text); b.disabled = false;
    if (r === "saved") { b.lastChild.textContent = "Picture saved. Post it anywhere."; setTimeout(() => (b.lastChild.textContent = label), 3500); }
  });
  return b;
}
