/* A 1200 x 630 picture of the credential for WhatsApp, LinkedIn and Instagram. Drawn on a canvas in the browser; nothing is uploaded. */
import { ORG } from "./config.js";
import { grade } from "./certcopy.js";

const THEME = { foundation: ["#0F766E", "#5EEAD4"], practitioner: ["#92400E", "#FCD34D"], expert: ["#3B1D6B", "#C4B5FD"], pro: ["#111827", "#E5C76B"] };
const wrap = (g, text, x, y, w, lh, max) => { const words = String(text).split(" "); let line = "", n = 0;
  for (const wd of words) { const t = line ? line + " " + wd : wd; if (g.measureText(t).width > w && line) { g.fillText(line, x, y + n * lh); line = wd; if (++n >= max) return; } else line = t; }
  g.fillText(line, x, y + n * lh); };

export function sharePng(c, name, tag) {
  const cv = document.createElement("canvas"); cv.width = 1200; cv.height = 630; const g = cv.getContext("2d");
  const [a, b] = THEME[c.level] || THEME.practitioner;
  const bg = g.createLinearGradient(0, 0, 1200, 630); bg.addColorStop(0, "#14100A"); bg.addColorStop(1, a); g.fillStyle = bg; g.fillRect(0, 0, 1200, 630);
  g.strokeStyle = b; g.globalAlpha = .55; g.lineWidth = 3; g.strokeRect(28, 28, 1144, 574); g.globalAlpha = 1;
  g.fillStyle = b; g.font = "800 22px system-ui, sans-serif"; g.fillText((ORG + " ACADEMY").toUpperCase().split("").join(" "), 70, 90);
  g.fillStyle = "#fff"; g.font = "600 28px system-ui, sans-serif"; g.fillText("Achievement unlocked", 70, 160);
  g.fillStyle = b; g.font = "800 54px system-ui, sans-serif"; g.fillText(tag + (grade(c.score) ? "  ·  " + grade(c.score) : ""), 70, 225); g.fillStyle = "#fff"; g.font = "600 26px system-ui, sans-serif"; g.fillText("Course completed", 70, 275);
  g.font = "800 52px Georgia, serif"; wrap(g, c.title, 70, 345, 760, 64, 2);
  g.fillStyle = b; g.font = "italic 40px Georgia, serif"; g.fillText(name, 70, 500);
  g.fillStyle = "#E8DCC4"; g.font = "500 24px system-ui, sans-serif"; g.fillText(`Score ${c.score}%  ·  Verify at ucwacademy.in  ·  ${c.id}`, 70, 555);
  g.beginPath(); g.arc(990, 300, 140, 0, 7); g.fillStyle = b; g.fill(); g.beginPath(); g.arc(990, 300, 118, 0, 7); g.strokeStyle = "#14100A"; g.lineWidth = 4; g.stroke();
  g.fillStyle = "#14100A"; g.textAlign = "center"; g.font = "800 84px Georgia, serif"; g.fillText("UC", 990, 300); g.font = "800 24px system-ui, sans-serif"; g.fillText(String(c.level || "").toUpperCase(), 990, 350); g.fillText(c.score + "%", 990, 388);
  return cv;
}
export function download(c, name, tag) {
  const cv = sharePng(c, name, tag); cv.toBlob(bl => { const u = URL.createObjectURL(bl), a = document.createElement("a"); a.href = u; a.download = "UpperCrust-Academy-" + c.id + ".png"; a.click(); setTimeout(() => URL.revokeObjectURL(u), 4000); }, "image/png");
}
