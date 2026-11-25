/* Sarthi, the UpperCrust Academy guide: a calm, mid-age adviser in a navy suit.
   Refined flat-illustration style (no heavy outlines): soft shading, natural proportions, thin glasses, grey temples.
   One drawing, many moods and poses, all inline SVG (no image files). Pure string output, so it works in the app, in
   shadow roots, in scripts and in videos. Add class "talk" to any ancestor to make the mouth move; he blinks by himself.
   Moods: happy, joy, think, wow, warn.  Poses: stand, explain (coin raised), cheer (both arms up).
   Views: full (whole body), bust (head and shoulders), head. */
const SK = "#C98C5E", SKD = "#B07548", SKL = "#DDA478", HAIR = "#2A211C", GREY = "#B4AEA7", INK = "#2A1E18", GOLD = "#E3A91E";
const NAVY = "#1E3461", NAVYL = "#2C4C86", NAVYD = "#162747", SHIRT = "#F6F3EE", FR = "#3A2F2A";
const S2 = (d, extra = "") => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;

const EYES = {
  happy: `<path d="M160 170q14-12 28 0q-14 11-28 0z" fill="#fff"/><path d="M212 170q14-12 28 0q-14 11-28 0z" fill="#fff"/><circle cx="174" cy="170" r="5.2" fill="${INK}"/><circle cx="226" cy="170" r="5.2" fill="${INK}"/><circle cx="176" cy="168" r="1.6" fill="#fff"/><circle cx="228" cy="168" r="1.6" fill="#fff"/>`,
  joy: S2("M160 172q14-13 28 0M212 172q14-13 28 0", 'stroke-width="4"'),
  think: `<path d="M160 170q14-12 28 0q-14 11-28 0z" fill="#fff"/><path d="M212 170q14-12 28 0q-14 11-28 0z" fill="#fff"/><circle cx="170" cy="167" r="5.2" fill="${INK}"/><circle cx="222" cy="167" r="5.2" fill="${INK}"/><circle cx="172" cy="165" r="1.6" fill="#fff"/><circle cx="224" cy="165" r="1.6" fill="#fff"/>`,
  wow: `<path d="M158 170q16-17 32 0q-16 15-32 0z" fill="#fff"/><path d="M210 170q16-17 32 0q-16 15-32 0z" fill="#fff"/><circle cx="174" cy="170" r="6" fill="${INK}"/><circle cx="226" cy="170" r="6" fill="${INK}"/><circle cx="176" cy="168" r="1.8" fill="#fff"/><circle cx="228" cy="168" r="1.8" fill="#fff"/>`,
  warn: `<path d="M160 172q14-10 28 0q-14 9-28 0z" fill="#fff"/><path d="M212 172q14-10 28 0q-14 9-28 0z" fill="#fff"/><circle cx="174" cy="172" r="4.8" fill="${INK}"/><circle cx="226" cy="172" r="4.8" fill="${INK}"/><path d="M158 170q16-9 32 0v-3q-16-8-32 0zM210 170q16-9 32 0v-3q-16-8-32 0z" fill="${SK}"/>`,
};
const MOUTH = {
  happy: `<path d="M184 227q16 10 32 0" fill="none" stroke="#6A3028" stroke-width="3.6" stroke-linecap="round"/>`,
  joy: `<path d="M182 224q18 20 36 0z" fill="#7A2E2A"/><path d="M185 224h30q-3 5-15 6-12-1-15-6z" fill="#fff"/>`,
  think: `<path d="M187 230q13 3 26-3" fill="none" stroke="#6A3028" stroke-width="3.6" stroke-linecap="round"/>`,
  wow: `<ellipse cx="200" cy="232" rx="7" ry="9" fill="#5A2420"/>`,
  warn: `<path d="M186 233q14-8 28 0" fill="none" stroke="#6A3028" stroke-width="3.6" stroke-linecap="round"/>`,
};
const BROWS = {
  happy: "M156 150q18-9 36-3M208 147q18-6 36 3",
  joy: "M156 147q18-11 36-4M208 143q18-7 36 4",
  think: "M156 152q18-7 36-5M208 138q18-12 36-1",
  wow: "M156 142q18-12 36-4M208 138q18-8 36 4",
  warn: "M156 152q18-3 36-13M208 139q18 10 36 13",
};
const coinAt = (x, y, r) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${GOLD}"/><circle r="${r * 0.72}" fill="none" stroke="#B8860F" stroke-width="2.4"/><circle r="${r}" fill="none" stroke="#B8860F" stroke-width="2"/><text y="${r * 0.34}" text-anchor="middle" font-size="${r}" font-weight="800" fill="#7A5608" font-family="Figtree,Arial,sans-serif">₹</text></g>`;
const hand = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="16" ry="20" fill="${SK}"/><path d="M${x - 14} ${y - 2}q-8 8-3 18" fill="none" stroke="${SK}" stroke-width="9" stroke-linecap="round"/><path d="M${x - 5} ${y + 6}v12M${x + 4} ${y + 6}v12" stroke="${SKD}" stroke-width="2" opacity=".5"/>`;
const limb = (d, cuffFrom, cuffTo) => `<path d="${d}" fill="none" stroke="${NAVY}" stroke-width="42" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${NAVYL}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity=".45" transform="translate(-9 0)"/><path d="M${cuffFrom}L${cuffTo}" stroke="${SHIRT}" stroke-width="34" stroke-linecap="butt"/>`;
const armDown = (mirror) => {
  const g = `${limb("M120 322Q98 410 104 500", "104 498", "104 512")}${hand(105, 534)}`;
  return mirror ? `<g transform="translate(400 0) scale(-1 1)">${g}</g>` : g;
};
const armUp = (withCoin) => `${limb("M280 322L340 392L338 346", "338 350", "338 338")}${hand(338, 318)}${withCoin ? coinAt(338, 262, 32) : ""}`;

export function mascot({ mood = "happy", pose = "stand", view = "full", px = 120, label = "Sarthi, the UpperCrust Academy guide" } = {}) {
  if (!EYES[mood]) mood = "happy";
  let left = armDown(false), right = armDown(true);
  if (pose === "explain") { right = armUp(true); }
  if (pose === "cheer") { right = armUp(true); left = `<g transform="translate(400 0) scale(-1 1)">${armUp(false)}</g>`; }
  const sweat = mood === "warn" ? `<path d="M270 120q9 16 0 26q-9-10 0-26z" fill="#9CCBFF"/>` : "";
  const body = view === "full" ? `
<path d="M138 530H198L194 732H146z" fill="#22304F"/><path d="M202 530H262L254 732H206z" fill="#22304F"/><path d="M168 540l-2 188M232 540l2 188" stroke="#0F1A30" stroke-width="3" opacity=".25"/>
<path d="M138 728h58c8 0 12 14 2 20-16 6-52 6-68 0-8-4-4-18 8-20z" fill="#3A2A20"/><path d="M262 728h-58c-8 0-12 14-2 20 16 6 52 6 68 0 8-4 4-18-8-20z" fill="#3A2A20"/>` : "";
  const torso = `
<path d="M108 318C108 298 132 290 166 284L200 312 234 284C268 290 292 298 292 318L290 500C290 522 280 542 262 546H138C120 542 110 522 110 500Z" fill="${NAVY}"/>
<path d="M108 318C108 302 122 294 140 288L134 540C120 534 110 520 110 500Z" fill="${NAVYD}" opacity=".5"/>
<path d="M170 284 200 432 230 284z" fill="${SHIRT}"/>
<path d="M166 282 132 316 142 462 194 432 174 326z" fill="${NAVYL}"/><path d="M234 282 268 316 258 462 206 432 226 326z" fill="${NAVYL}"/>
<path d="M170 282l16 20 14-12 14 12 16-20-16-6-14 10-14-10z" fill="#fff"/><path d="M170 282l16 20M230 282l-16 20" stroke="#D9D4CB" stroke-width="2"/>
<path d="M189 298h22l-3 16h-16z" fill="#C98F12"/><path d="M193 314h14l9 104-16 22-16-22z" fill="${GOLD}"/><path d="M195 340l10-5M194 366l14-7M193 392l16-8" stroke="#B8860F" stroke-width="3" stroke-linecap="round"/>
<path d="M142 398l28-5 3 14-30 4z" fill="#fff"/><path d="M146 398l16-3 1 5z" fill="${GOLD}"/>
<circle cx="200" cy="504" r="4" fill="${NAVYD}"/>`;
  const arms = view === "head" ? "" : left + right;
  const head = `
<path d="M178 238h44v56h-44z" fill="${SK}"/><path d="M178 238h44v22q-22 14-44 0z" fill="${SKD}" opacity=".55"/>
<ellipse cx="137" cy="178" rx="9" ry="15" fill="${SK}"/><ellipse cx="263" cy="178" rx="9" ry="15" fill="${SK}"/><path d="M135 172q-3 6 0 12" fill="none" stroke="${SKD}" stroke-width="3" stroke-linecap="round"/><path d="M265 172q3 6 0 12" fill="none" stroke="${SKD}" stroke-width="3" stroke-linecap="round"/>
<path d="M138 168C138 118 164 92 200 92s62 26 62 76c0 38-12 70-36 86-12 8-40 8-52 0-24-16-36-48-36-86z" fill="${SK}"/>
<path d="M138 176C138 210 150 240 174 254 160 246 148 226 144 200z" fill="${SKD}" opacity=".4"/><path d="M262 176C262 210 250 240 226 254 240 246 252 226 256 200z" fill="${SKD}" opacity=".25"/>
<ellipse cx="200" cy="120" rx="34" ry="12" fill="${SKL}" opacity=".35"/>
<path d="M164 204q-8 16-3 32M236 204q8 16 3 32" fill="none" stroke="${SKD}" stroke-width="3" stroke-linecap="round" opacity=".55"/><path d="M168 120q32-7 64 0M172 128q28-5 56 0" fill="none" stroke="${SKD}" stroke-width="2.6" stroke-linecap="round" opacity=".35"/><path d="M146 186l10 3M147 194l9 1M254 186l-10 3M253 194l-9 1" stroke="${SKD}" stroke-width="2.4" stroke-linecap="round" opacity=".5"/>
<g class="ey">${EYES[mood]}</g>
<path d="M156 182q18 8 36 0M208 182q18 8 36 0" fill="none" stroke="${SKD}" stroke-width="2.6" stroke-linecap="round" opacity=".45"/>
<path d="M200 174q-1 18-8 26 8 7 16 0" fill="none" stroke="${SKD}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>
<g class="mo">${MOUTH[mood]}</g>
<path d="M174 215C182 205 195 205 200 210 205 205 218 205 226 215 216 221 205 217 200 217 195 217 184 221 174 215z" fill="${HAIR}"/>
<path d="M136 166C128 100 160 70 202 70c44 0 72 30 62 96-2-24-8-42-20-52-24 12-74 12-90-2-10 12-16 32-18 54z" fill="${HAIR}"/>
<path d="M136 166C132 142 138 124 150 112l8 14C148 134 144 148 144 168zM264 166C268 142 262 124 250 112l-8 14C252 134 256 148 256 168z" fill="${GREY}"/>
<path d="M168 82q30-10 62-2" fill="none" stroke="#5B4A3F" stroke-width="5" stroke-linecap="round" opacity=".7"/>
<path d="${BROWS[mood]}" fill="none" stroke="${HAIR}" stroke-width="6" stroke-linecap="round"/>
<rect x="154" y="154" width="42" height="32" rx="10" fill="#fff" opacity=".1"/><rect x="204" y="154" width="42" height="32" rx="10" fill="#fff" opacity=".1"/>
<rect x="154" y="154" width="42" height="32" rx="10" fill="none" stroke="${FR}" stroke-width="3"/><rect x="204" y="154" width="42" height="32" rx="10" fill="none" stroke="${FR}" stroke-width="3"/><path d="M196 166h8M154 164L140 162M246 164l14-2" stroke="${FR}" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M160 160l10-3" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>${sweat}`;
  const vb = view === "head" ? "104 56 192 214" : view === "bust" ? "70 56 260 300" : "0 40 400 730";
  const [, , w, h] = vb.split(" ").map(Number);
  const width = px, height = Math.round((px * h) / w);
  return `<svg class="sarthi" xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${width}" height="${height}" role="img" aria-label="${label}">${view === "full" ? body : ""}${view === "head" ? "" : torso}${arms}${head}</svg>`;
}
export const MOODS = Object.keys(EYES);
