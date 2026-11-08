/* Small celebrations: a burst of gold coins and a floating points tag. Decoration only; nothing here touches progress. */
import { h } from "./dom.js";

export function coinBurst(n = 18) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = h("div", { class: "coins", "aria-hidden": "true" });
  for (let k = 0; k < n; k++) {
    const a = (Math.PI * (0.15 + 0.7 * Math.random())), v = 220 + Math.random() * 280;
    box.append(h("i", { style: `--dx:${(Math.cos(a) * v * (Math.random() < .5 ? -1 : 1)).toFixed(0)}px;--dy:${(-Math.sin(a) * v).toFixed(0)}px;--d:${(Math.random() * .25).toFixed(2)}s;--s:${(.7 + Math.random() * .6).toFixed(2)}` }, "₹"));
  }
  document.body.append(box); setTimeout(() => box.remove(), 2200);
}

export function pointsPop(text) {
  const el = h("div", { class: "pop-pts", role: "status" }, text);
  document.body.append(el); setTimeout(() => el.remove(), 1800);
}

export const cheer = (text, n) => { coinBurst(n); if (text) pointsPop(text); };
