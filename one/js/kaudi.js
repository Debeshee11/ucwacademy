/* Kaudi, the cowrie shell. The cowrie (kaudi, कौड़ी) was money in India for centuries, which makes it the
   oldest honest symbol for "learn to handle money". Pure SVG, no pictures. Moods change eyes, brows, mouth and arms. */
const INK = "#2B2118", SW = 6;
const eye = (x, y, o = {}) => {
  const { look = [0, 0], r = 15, shut = false, happy = false, wink = false } = o;
  if (shut || wink) return `<path d="M${x - 13} ${y + 2}q13 -14 26 0" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/>`;
  if (happy) return `<path d="M${x - 13} ${y + 6}q13 -18 26 0" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/>`;
  return `<g class="kd-eye"><circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="5"/><circle cx="${x + look[0]}" cy="${y + look[1]}" r="${r * 0.5}" fill="${INK}"/><circle cx="${x + look[0] + 3}" cy="${y + look[1] - 3}" r="${r * 0.18}" fill="#fff"/></g>`;
};
const teeth = (x1, x2, y, n = 5, h = 8) => Array.from({ length: n }, (_, i) => { const w = (x2 - x1) / n - 2, x = x1 + (x2 - x1) * i / n + 1; return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#fff" stroke="${INK}" stroke-width="2.5"/>`; }).join("");
const SMILE = (w = 27, d = 36) => `<path d="M${100 - w} 128Q100 ${128 + d} ${100 + w} 128z" fill="#C0392B" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>${teeth(100 - w + 8, 100 + w - 8, 129, 4, 6)}`;
const MOODS = {
  happy:  { eyes: o => eye(76, 100, o) + eye(124, 100, o), mouth: SMILE(), arms: "down" },
  talk:   { eyes: o => eye(76, 100, o) + eye(124, 100, o), mouth: SMILE() + `<ellipse class="kd-open" cx="100" cy="141" rx="17" ry="13" fill="#C0392B" stroke="${INK}" stroke-width="5"/>`, arms: "down" },
  think:  { eyes: o => eye(76, 100, { look: [4, -5] }) + eye(124, 100, { look: [4, -5] }), mouth: `<path d="M84 140q16 -6 32 2" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/>`, extra: `<path d="M112 80l24 -8" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/><circle cx="160" cy="44" r="6" fill="#fff" stroke="${INK}" stroke-width="3.5"/><circle cx="174" cy="26" r="9" fill="#fff" stroke="${INK}" stroke-width="3.5"/>`, arms: "chin" },
  wow:    { eyes: o => eye(76, 98, { r: 17 }) + eye(124, 98, { r: 17 }), mouth: `<ellipse cx="100" cy="142" rx="13" ry="16" fill="#C0392B" stroke="${INK}" stroke-width="5.5"/>`, extra: `<path d="M30 40l10 14M170 40l-10 14M100 8v18" stroke="#E5A800" stroke-width="6" stroke-linecap="round"/>`, arms: "up" },
  oops:   { eyes: o => eye(76, 102, { look: [-3, 3] }) + eye(124, 102, { look: [3, 3] }), mouth: `<path d="M78 144q11 -10 22 0t22 0" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/>`, extra: `<path d="M58 78l32 8M142 78l-32 8" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/><path d="M168 76q9 14 0 22q-9 -8 0 -22z" fill="#8EC5FF" stroke="${INK}" stroke-width="3.5"/>`, arms: "down" },
  cheer:  { eyes: o => eye(76, 100, { happy: true }) + eye(124, 100, { happy: true }), mouth: SMILE(32, 40), extra: `<g stroke-width="5" stroke-linecap="round"><path d="M26 30l8 12" stroke="#E94B6A"/><path d="M174 30l-8 12" stroke="#3CC47A"/><path d="M100 6v16" stroke="#2556B8"/><path d="M52 14l4 12" stroke="#E5A800"/><path d="M148 14l-4 12" stroke="#B26DD8"/></g>`, arms: "up" },
  sleep:  { eyes: o => eye(76, 106, { shut: true }) + eye(124, 106, { shut: true }), mouth: `<path d="M88 142q12 8 24 0" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/>`, extra: `<text x="150" y="52" font-size="26" font-weight="800" fill="${INK}" font-family="sans-serif">z</text><text x="168" y="30" font-size="20" font-weight="800" fill="${INK}" font-family="sans-serif">z</text>`, arms: "down" },
  wink:   { eyes: o => eye(76, 100, o) + eye(124, 100, { wink: true }), mouth: SMILE(), arms: "point" },
};
const arm = (kind, side) => { // side -1 left, 1 right
  const x = 100 + side * 76, s = side;
  const hand = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="12" fill="#FFD76A" stroke="${INK}" stroke-width="5"/>`;
  if (kind === "up") return `<path d="M${x - s * 6} 132Q${x + s * 26} 110 ${x + s * 24} 70" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M${x - s * 6} 132Q${x + s * 26} 110 ${x + s * 24} 70" fill="none" stroke="#FFD76A" stroke-width="6" stroke-linecap="round"/>${hand(x + s * 24, 66)}`;
  if (kind === "chin" && side === 1) return `<path d="M${x - 8} 140Q${x - 28} 150 ${x - 36} 132" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M${x - 8} 140Q${x - 28} 150 ${x - 36} 132" fill="none" stroke="#FFD76A" stroke-width="6" stroke-linecap="round"/>`;
  if (kind === "point" && side === 1) return `<path d="M${x - 6} 138Q${x + 24} 130 ${x + 30} 104" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M${x - 6} 138Q${x + 24} 130 ${x + 30} 104" fill="none" stroke="#FFD76A" stroke-width="6" stroke-linecap="round"/>${hand(x + 30, 100)}`;
  return `<circle cx="${x - s * 4}" cy="146" r="13" fill="#FFD76A" stroke="${INK}" stroke-width="5"/>`;
};
export function kaudi(mood = "happy", px = 120, opt = {}) {
  const m = MOODS[mood] || MOODS.happy, id = "kd" + Math.random().toString(36).slice(2, 7);
  return `<svg class="kd ${opt.cls || ""}" viewBox="-20 0 240 215" width="${Math.round(px * 1.2)}" height="${Math.round(px * 215 / 200)}" role="img" aria-label="Kaudi, the cowrie shell mascot, ${mood}">
<defs><clipPath id="${id}"><path d="M100 18C152 18 178 70 178 118C178 164 142 190 100 190C58 190 22 164 22 118C22 70 48 18 100 18z"/></clipPath></defs>
<ellipse cx="100" cy="205" rx="52" ry="7" fill="#2B211822"/>
<ellipse cx="78" cy="196" rx="17" ry="10" fill="#E5A800" stroke="${INK}" stroke-width="5"/><ellipse cx="122" cy="196" rx="17" ry="10" fill="#E5A800" stroke="${INK}" stroke-width="5"/>
${m.arms === "up" ? "" : arm(m.arms === "chin" ? "down" : m.arms, -1)}${m.arms === "up" ? arm("up", -1) : ""}${arm(m.arms === "up" ? "up" : m.arms, 1)}
<path d="M100 18C152 18 178 70 178 118C178 164 142 190 100 190C58 190 22 164 22 118C22 70 48 18 100 18z" fill="#FFF3D6"/>
<g clip-path="url(#${id})"><path d="M0 0H200V74Q100 100 0 74z" fill="#FFC531"/><path d="M0 74Q100 100 200 74" fill="none" stroke="#E5A800" stroke-width="5"/><g fill="#C9811F"><circle cx="56" cy="40" r="6"/><circle cx="84" cy="30" r="5"/><circle cx="116" cy="30" r="5"/><circle cx="144" cy="40" r="6"/><circle cx="70" cy="58" r="4.5"/><circle cx="100" cy="52" r="5.5"/><circle cx="130" cy="58" r="4.5"/></g><path d="M100 20V70" stroke="#E5A800" stroke-width="3.5" stroke-linecap="round"/><g fill="#fff" opacity=".9"><ellipse cx="62" cy="120" rx="6" ry="22" transform="rotate(18 62 120)" opacity=".55"/></g></g>
<path d="M100 18C152 18 178 70 178 118C178 164 142 190 100 190C58 190 22 164 22 118C22 70 48 18 100 18z" fill="none" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round"/>
<g stroke="#2B2118" stroke-width="3.5" stroke-linecap="round" opacity=".75"><path d="M24 128l9 2M24 140l10 1M25 152l10 0M176 128l-9 2M176 140l-10 1M175 152l-10 0"/></g><ellipse cx="54" cy="130" rx="14" ry="9" fill="#FF9C8A" opacity=".75"/><ellipse cx="146" cy="130" rx="14" ry="9" fill="#FF9C8A" opacity=".75"/>
${m.eyes(opt)}${m.mouth}${m.extra || ""}</svg>`;
}
export const KAUDI_MOODS = Object.keys(MOODS);
