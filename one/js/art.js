/* Cover art: original, generated from the course id so every course has its own look. Navy and gold only. */
const hash = s => { let a = 7; for (const c of s) a = (a * 31 + c.charCodeAt(0)) >>> 0; return a; };
const rnd = seed => () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const G = "#C9A24B", G2 = "#E6CF94";

const MOTIF = {
  basics: r => { let s = ""; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { const on = r() > .45; s += `<rect x="${176 + i * 22}" y="${34 + j * 22}" width="14" height="14" rx="3" fill="${on ? G : "none"}" stroke="${G}" stroke-opacity="${on ? 0 : .35}"/>`; } return s; },
  mf: r => { let s = "", h = 30; for (let i = 0; i < 8; i++) { h += 10 + r() * 14; s += `<rect x="${164 + i * 19}" y="${170 - h}" width="12" height="${h}" rx="2" fill="${i > 5 ? G : G2}" fill-opacity="${i > 5 ? 1 : .55}"/>`; } return s; },
  stocks: r => { let y = 130, pts = []; for (let i = 0; i < 9; i++) { y += (r() - .62) * 30; y = Math.max(34, Math.min(150, y)); pts.push(`${150 + i * 20},${y.toFixed(0)}`); } return `<polyline points="${pts.join(" ")}" fill="none" stroke="${G}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>` + pts.map((p, i) => i % 3 === 0 ? `<circle cx="${p.split(",")[0]}" cy="${p.split(",")[1]}" r="4.5" fill="#0B1F3A" stroke="${G2}" stroke-width="2"/>` : "").join(""); },
  assets: r => { let s = ""; for (let i = 0; i < 5; i++) s += `<circle cx="236" cy="104" r="${18 + i * 17}" fill="none" stroke="${G}" stroke-opacity="${.9 - i * .17}" stroke-width="${i ? 1.5 : 3}"/>`; return s + `<circle cx="236" cy="104" r="7" fill="${G}"/>`; },
  nri: r => `<circle cx="232" cy="98" r="64" fill="none" stroke="${G}" stroke-opacity=".8" stroke-width="2"/><ellipse cx="232" cy="98" rx="26" ry="64" fill="none" stroke="${G}" stroke-opacity=".55"/><ellipse cx="232" cy="98" rx="52" ry="64" fill="none" stroke="${G}" stroke-opacity=".3"/><path d="M168 98h128M178 66h108M178 130h108" stroke="${G}" stroke-opacity=".4"/><circle cx="${200 + r() * 60}" cy="${70 + r() * 50}" r="5" fill="${G2}"/>`,
  teach: r => `<path d="M236 56c-26-14-52-14-72-6v90c20-8 46-8 72 6 26-14 52-14 72-6V50c-20-8-46-8-72 6z" fill="none" stroke="${G}" stroke-width="2.5" stroke-linejoin="round"/><path d="M236 56v90" stroke="${G}" stroke-width="2"/><path d="M176 74h40M176 92h40M256 74h40M256 92h40" stroke="${G2}" stroke-opacity=".6"/>`
};

export function cover(c, wide) {
  const r = rnd(hash(c.id)), m = (MOTIF[c.sec] || MOTIF.basics)(r);
  const el = document.createElement("div");
  el.className = "cover" + (wide ? " wide" : "");
  const rot = (hash(c.id) % 5) * 7;
  el.innerHTML = `<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><linearGradient id="g${rot}${c.id.length}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17335E"/><stop offset="1" stop-color="#0B1F3A"/></linearGradient></defs><rect width="320" height="180" fill="url(#g${rot}${c.id.length})"/><circle cx="${40 + rot * 3}" cy="-10" r="90" fill="none" stroke="${G}" stroke-opacity=".12" stroke-width="22"/>${m}</svg>`;
  return el;
}
