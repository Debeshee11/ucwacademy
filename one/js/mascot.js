/* Arjun, the UpperCrust Academy mascot: a friendly adviser in a blue suit.
   One drawing, many moods and poses, all inline SVG (no image files). Pure string output, so it works in the app, in
   shadow roots, in scripts and in videos. Add class "talk" to any ancestor to make the mouth move; he blinks by himself.
   Moods: happy, joy, think, wow, warn.  Poses: stand, explain (coin raised), cheer (both arms up).
   Views: full (whole body), bust (head and shoulders), head. */
const K = 'stroke="#2B2118" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"';
const SK = "#E2A774", HAIR = "#3A2A22", J = "#4A8DF0", JD = "#2F6FDE", PT = "#3C7BE8", GOLD = "#FFC531";

const EYES = {
  happy: '<ellipse cx="170" cy="176" rx="10" ry="12" fill="#2B2118"/><ellipse cx="230" cy="176" rx="10" ry="12" fill="#2B2118"/><circle cx="174" cy="171" r="3.5" fill="#fff"/><circle cx="234" cy="171" r="3.5" fill="#fff"/>',
  joy: `<path d="M158 182q12-16 24 0M218 182q12-16 24 0" fill="none" ${K}/>`,
  think: '<ellipse cx="170" cy="176" rx="10" ry="12" fill="#2B2118"/><ellipse cx="230" cy="176" rx="10" ry="12" fill="#2B2118"/><circle cx="176" cy="171" r="3.5" fill="#fff"/><circle cx="236" cy="171" r="3.5" fill="#fff"/>',
  wow: `<ellipse cx="170" cy="176" rx="12" ry="14" fill="#fff" ${K} stroke-width="4"/><ellipse cx="230" cy="176" rx="12" ry="14" fill="#fff" ${K} stroke-width="4"/><circle cx="170" cy="177" r="5" fill="#2B2118"/><circle cx="230" cy="177" r="5" fill="#2B2118"/>`,
  warn: '<ellipse cx="170" cy="178" rx="10" ry="12" fill="#2B2118"/><ellipse cx="230" cy="178" rx="10" ry="12" fill="#2B2118"/><circle cx="173" cy="173" r="3.5" fill="#fff"/><circle cx="233" cy="173" r="3.5" fill="#fff"/>',
};
const MOUTH = {
  happy: `<path d="M176 218q24 26 48 0z" fill="#fff" ${K} stroke-width="4"/>`,
  joy: `<path d="M170 214q30 40 60 0z" fill="#fff" ${K} stroke-width="4"/>`,
  think: `<path d="M184 224q16 6 32-4" fill="none" ${K} stroke-width="4"/>`,
  wow: `<ellipse cx="200" cy="228" rx="11" ry="14" fill="#fff" ${K} stroke-width="4"/>`,
  warn: `<path d="M182 230q18-10 36 0" fill="none" ${K} stroke-width="4"/>`,
};
const BROWS = {
  happy: "M146 148q24-12 46-2M208 146q22-10 46 2",
  joy: "M146 144q24-14 46-4M208 140q22-10 46 4",
  think: "M146 150q24-8 46-6M208 138q22-14 46-2",
  wow: "M146 138q24-14 46-4M208 134q22-10 46 4",
  warn: "M146 152q24-4 46-16M208 136q22 8 46 16",
};
const coinAt = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${GOLD}" ${K}/><circle r="${r * 0.63}" fill="none" stroke="#C99A12" stroke-width="3"/><text y="${r * 0.34}" text-anchor="middle" font-size="${r}" font-weight="800" fill="#2B2118" font-family="Figtree,Arial,sans-serif">₹</text></g>`;
const armDown = (mirror) => {
  const g = `<path d="M122 322C96 334 88 392 94 436L128 440C126 404 130 366 142 338Z" fill="${J}" ${K}/><rect x="90" y="426" width="42" height="16" rx="6" fill="#fff" ${K} stroke-width="4" transform="rotate(4 111 434)"/><circle cx="110" cy="460" r="20" fill="${SK}" ${K}/>`;
  return mirror ? `<g transform="translate(400 0) scale(-1 1)">${g}</g>` : g;
};
const armUp = (withCoin) => `<path d="M272 318C322 314 360 346 356 400L320 410C320 380 302 360 266 352Z" fill="${J}" ${K}/><path d="M338 404L348 356" stroke="#2B2118" stroke-width="46" stroke-linecap="round"/><path d="M338 404L348 356" stroke="${J}" stroke-width="36" stroke-linecap="round"/><rect x="326" y="336" width="44" height="16" rx="6" fill="#fff" ${K} stroke-width="4" transform="rotate(10 348 344)"/>${withCoin ? coinAt(352, 284, 30) : ""}<circle cx="350" cy="326" r="20" fill="${SK}" ${K}/>`;

export function mascot({ mood = "happy", pose = "stand", view = "full", px = 120, label = "Arjun, the UpperCrust Academy guide" } = {}) {
  if (!EYES[mood]) mood = "happy";
  let left = armDown(false), right = armDown(true);
  if (pose === "explain") { right = armUp(true); }
  if (pose === "cheer") { right = armUp(true); left = `<g transform="translate(400 0) scale(-1 1)">${armUp(false)}</g>`; }
  const sweat = mood === "warn" ? `<path d="M286 120q10 18 0 28q-10-10 0-28z" fill="#8EC5FF" ${K} stroke-width="3"/>` : "";
  const body = view === "full" ? `
<path d="M146 478h52l-2 72h-46z" fill="${PT}" ${K}/><path d="M254 478h-52l2 72h46z" fill="${PT}" ${K}/><path d="M172 484l-2 62M228 484l2 62" stroke="#2B2118" stroke-width="3" opacity=".22"/>
<path d="M140 548h58c8 0 10 16 2 22-14 8-52 8-70 0-6-4-4-18 10-22z" fill="#C98A4B" ${K}/><path d="M260 548h-58c-8 0-10 16-2 22 14 8 52 8 70 0 6-4 4-18-10-22z" fill="#C98A4B" ${K}/>` : "";
  const torso = `
<path d="M112 322C112 298 140 288 168 284L200 318 232 284C260 288 288 298 288 322L282 442C282 466 268 482 248 484H152C132 482 118 466 118 442Z" fill="${J}" ${K}/>
<path d="M168 284 200 396 232 284z" fill="#fff" ${K}/>
<path d="M168 284 140 306 134 404 178 412 200 396z" fill="${JD}" ${K}/><path d="M232 284 260 306 266 404 222 412 200 396z" fill="${JD}" ${K}/>
<path d="M186 292l14 16 14-16z" fill="#fff" ${K} stroke-width="4"/>
<path d="M189 300h22l-3 16h-16z" fill="#E8A810" ${K} stroke-width="4"/><path d="M192 316h16l10 84-18 20-18-20z" fill="${GOLD}" ${K}/><path d="M194 336l12-6M192 356l16-8M192 376l18-8" stroke="#E8A810" stroke-width="4" stroke-linecap="round"/>
<path d="M146 372l26-6 3 16-30 4z" fill="#fff" ${K}/><path d="M152 372l16-4" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>
<circle cx="200" cy="452" r="5" fill="#fff" ${K} stroke-width="3"/>`;
  const arms = view === "head" ? "" : left + right;
  const head = `
<rect x="180" y="238" width="40" height="52" rx="14" fill="${SK}" ${K}/>
<circle cx="122" cy="182" r="17" fill="${SK}" ${K}/><circle cx="278" cy="182" r="17" fill="${SK}" ${K}/>
<path d="M122 170C122 112 158 86 200 86s78 26 78 84c0 44-20 80-78 86-58-6-78-42-78-86z" fill="${SK}" ${K}/>
<ellipse cx="148" cy="214" rx="15" ry="11" fill="#FF8A7A" opacity=".45"/><ellipse cx="252" cy="214" rx="15" ry="11" fill="#FF8A7A" opacity=".45"/>
<g class="ey">${EYES[mood]}</g><path d="M198 192q4 14 12 12" fill="none" stroke="#2B2118" stroke-width="4" stroke-linecap="round" opacity=".7"/><g class="mo">${MOUTH[mood]}</g>
<path d="M114 176C102 98 150 60 206 64c58 4 96 44 80 114-6-30-20-48-44-54-26 18-72 18-100 4-12 14-20 30-28 48z" fill="${HAIR}" ${K}/><path d="M156 86q34-16 70-8" fill="none" stroke="#6A5648" stroke-width="7" stroke-linecap="round"/>
<path d="${BROWS[mood]}" fill="none" ${K}/>
<rect x="140" y="156" width="56" height="42" rx="14" fill="none" stroke="#8A5A2B" stroke-width="5"/><rect x="206" y="156" width="56" height="42" rx="14" fill="none" stroke="#8A5A2B" stroke-width="5"/><path d="M196 172h10" stroke="#8A5A2B" stroke-width="5"/><path d="M148 164l10-4" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>${sweat}`;
  const vb = view === "head" ? "104 56 192 214" : view === "bust" ? "70 56 260 300" : "0 40 440 560";
  const [, , w, h] = vb.split(" ").map(Number);
  const width = px, height = Math.round((px * h) / w);
  return `<svg class="arjun" xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${width}" height="${height}" role="img" aria-label="${label}">${view === "full" ? body : ""}${view === "head" ? "" : torso}${arms}${head}</svg>`;
}
export const MOODS = Object.keys(EYES);
