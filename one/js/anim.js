/* Animated explainers for story cards. Each one is a small film drawn in SVG and driven by a clock: you watch the idea happen, with your own numbers, and a caption says what you are seeing.
   An "anim" card is { k: "anim", type, ...numbers, caps: [[seconds, "caption"], ...] }. Types are listed in KINDS. They never download anything. */
const K = "#2B2118", Y = "#FFC531", G = "#3CC47A", B = "#8EC5FF", R = "#E8573D", P = "#D8B4FE", C = "#FFF8E7";
const ease = x => x < 0 ? 0 : x > 1 ? 1 : x * x * (3 - 2 * x);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => ease((t - a) / (b - a));
const f1 = n => (Math.round(n * 10) / 10).toLocaleString("en-IN");
const inr = n => "₹" + Math.round(n).toLocaleString("en-IN");
const coin = (x, y, r, label = "₹", op = 1) => `<g opacity="${op}"><circle cx="${x}" cy="${y}" r="${r}" fill="${Y}" stroke="${K}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="${r * 0.68}" fill="none" stroke="#C99A12" stroke-width="2"/><text x="${x}" y="${y + r * 0.32}" text-anchor="middle" font-size="${r * 0.95}" font-weight="800" fill="${K}">${label}</text></g>`;
const txt = (x, y, s, size = 12, anchor = "middle", w = 800, fill = K, op = 1) => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-weight="${w}" fill="${fill}" opacity="${op}">${s}</text>`;

/* ---- SIP: the same rupees meet a moving price ---- */
const sipbuy = {
  dur: c => c.navs.length * 1.7 + 3.2,
  draw(c, t) {
    const N = c.navs, n = N.length, amt = c.amt || 5000, per = 1.7, W = 340, colW = Math.min(52, 300 / n), x0 = (W - colW * n) / 2;
    const lo = Math.min(...N), hi = Math.max(...N), ny = v => 100 - ((v - lo) / Math.max(1, hi - lo)) * 44, nx = i => x0 + colW * i + colW / 2;
    let s = `<rect x="6" y="8" width="328" height="118" rx="16" fill="#fff" stroke="${K}" stroke-width="3"/>` + txt(20, 28, "FUND PRICE (NAV)", 10, "start", 800, "#7A6A55");
    // price line
    const upto = clamp(t / per, 0, n - 1 + 0.001); let pts = "";
    for (let i = 0; i < n; i++) { if (i <= Math.floor(upto)) pts += `${nx(i)},${ny(N[i])} `; }
    const fi = Math.floor(upto); if (fi < n - 1) { const f = (upto - fi); pts += `${nx(fi) + (nx(fi + 1) - nx(fi)) * ease(f)},${ny(N[fi]) + (ny(N[fi + 1]) - ny(N[fi])) * ease(f)}`; }
    s += `<polyline points="${pts}" fill="none" stroke="${R}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
    let tot = 0, spent = 0; const rows = [];
    for (let i = 0; i < n; i++) {
      const t0 = i * per + 0.35, u = amt / N[i], cx = nx(i), base = 322, hgt = u * (c.scale || 1.6), low = N[i] < N[0];
      const fall = seg(t, t0, t0 + 0.45), grow = seg(t, t0 + 0.45, t0 + 1.05);
      if (t >= i * per) s += `<circle cx="${cx}" cy="${ny(N[i])}" r="5" fill="#fff" stroke="${K}" stroke-width="2.5"/>` + txt(cx, ny(N[i]) - 10, "₹" + N[i], 10.5, "middle", 800);
      // coin drops into the column
      if (t >= t0 && t < t0 + 0.9) s += coin(cx, 150 + 120 * fall, 14, "₹", 1 - seg(t, t0 + 0.45, t0 + 0.9));
      // units pour: a stack that grows
      if (grow > 0) {
        const hh = hgt * grow; s += `<rect x="${cx - colW / 2 + 5}" y="${base - hh}" width="${colW - 10}" height="${hh}" rx="6" fill="${low ? G : B}" stroke="${K}" stroke-width="2.5"/>`;
        for (let k = 1; k < hh / 12; k++) s += `<path d="M${cx - colW / 2 + 9} ${base - k * 12}h${colW - 18}" stroke="#ffffff88" stroke-width="2"/>`;
        s += txt(cx, base - hh - 6, f1(u * grow), 11, "middle", 800) + txt(cx, base + 14, "M" + (i + 1), 10, "middle", 700, "#7A6A55");
        tot += u * grow; spent += amt * grow;
      }
    }
    s += `<rect x="6" y="326" width="328" height="3" rx="1.5" fill="${K}"/>`;
    const tEnd = n * per + 0.5, show = seg(t, tEnd, tEnd + 0.6);
    if (show > 0) {
      const avg = (amt * n) / (N.reduce((a, v) => a + amt / v, 0)), plain = N.reduce((a, v) => a + v, 0) / n;
      s += `<g opacity="${show}"><rect x="40" y="136" width="260" height="62" rx="14" fill="${Y}" stroke="${K}" stroke-width="3"/>` + txt(170, 158, `${inr(amt * n)} bought ${f1(N.reduce((a, v) => a + amt / v, 0))} units`, 13.5, "middle", 800) + txt(170, 178, `You paid ₹${f1(avg)} a unit on average`, 12.5, "middle", 700) + txt(170, 192, `The average price was ₹${f1(plain)}`, 11, "middle", 600, "#5b4a2e") + `</g>`;
    }
    return s;
  }
};

/* ---- A pile that grows: compounding, one year at a time ---- */
const growbars = {
  dur: c => c.vals.length * 0.9 + 2.2,
  draw(c, t) {
    const V = c.vals, n = V.length, hi = Math.max(...V), W = 340, colW = Math.min(40, 300 / n), x0 = (W - colW * n) / 2, per = 0.9;
    let s = "";
    V.forEach((v, i) => {
      const a = seg(t, i * per, i * per + 0.7), h = (v / hi) * 220 * a, x = x0 + i * colW + 3, last = i === n - 1;
      if (a > 0) { s += `<rect x="${x}" y="${300 - h}" width="${colW - 6}" height="${h}" rx="6" fill="${last ? G : B}" stroke="${K}" stroke-width="2.5"/>`;
        if (a > 0.9) s += txt(x + (colW - 6) / 2, 300 - h - 6, c.fmt === "inr" ? inr(v) : f1(v), n > 8 ? 8.5 : 10.5, "middle", 800);
        s += txt(x + (colW - 6) / 2, 316, c.labels ? c.labels[i] : "Y" + (i + 1), 9.5, "middle", 700, "#7A6A55"); }
    });
    s += `<rect x="6" y="302" width="328" height="3" rx="1.5" fill="${K}"/>`;
    const fin = seg(t, n * per, n * per + 0.8); if (fin > 0) s += `<g opacity="${fin}"><rect x="40" y="18" width="260" height="46" rx="12" fill="${Y}" stroke="${K}" stroke-width="3"/>` + txt(170, 38, c.big || "", 14, "middle", 800) + txt(170, 54, c.small || "", 11, "middle", 600, "#5b4a2e") + `</g>`;
    return s;
  }
};

/* ---- Two paths side by side, drawn bar by bar (stop vs carry on, lump sum vs SIP, fund A vs fund B) ---- */
const duel = {
  dur: c => 5.5 + c.rows.length * 0.9,
  draw(c, t) {
    const R2 = c.rows; let s = `<g>` + txt(100, 22, c.a, 12, "middle", 800, c.ca || B === 0 ? K : K) + txt(240, 22, c.b, 12, "middle", 800) + `</g>`;
    R2.forEach((r, i) => {
      const hi = Math.max(r[1], r[2]), y = 38 + i * 56, a = seg(t, 0.4 + i * 0.9, 1.3 + i * 0.9);
      s += txt(8, y + 12, r[0], 10.5, "start", 800, "#7A6A55");
      [[r[1], 24, B, 0], [r[2], 24, G, 1]].forEach(([v, , col, side]) => { const w = (v / hi) * 130 * a, x = side ? 190 : 30 + (130 - w); const xx = side ? 190 : 170 - w;
        s += `<rect x="${xx}" y="${y + 18}" width="${w}" height="24" rx="8" fill="${col}" stroke="${K}" stroke-width="2.5"/>`; if (a > 0.95) s += txt(side ? 190 + w + 4 : 170 - w - 4, y + 35, (c.fmt === "inr" ? inr(v) : f1(v)), 11, side ? "start" : "end", 800); });
    });
    s += `<path d="M180 30v${R2.length * 56}" stroke="${K}" stroke-width="2" stroke-dasharray="4 5"/>`;
    return s;
  }
};

/* ---- A shield that takes a hit: what protection does and does not stop ---- */
const guard = {
  dur: () => 7,
  draw(c, t) {
    const hit = seg(t, 1.0, 1.9), bounce = seg(t, 1.9, 2.8), items = c.stops || [];
    let s = txt(170, 18, c.title || "", 13, "middle", 800) + `<g transform="translate(78 ${26 - 4 * Math.sin(bounce * 3.14)}) scale(.64)"><path d="M170 30 252 60v64c0 44-34 70-82 88-48-18-82-44-82-88V60z" fill="${B}" stroke="${K}" stroke-width="4.5" stroke-linejoin="round"/><path d="M170 52 232 74v50c0 34-26 54-62 68-36-14-62-34-62-68V74z" fill="#fff" stroke="${K}" stroke-width="3.5"/><path d="M142 124l22 22 40-46" fill="none" stroke="${G}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    items.forEach((it, i) => { const a = seg(t, 2.4 + i * 0.8, 3.1 + i * 0.8), ok = it[1], y = 158 + i * 42; s += `<g opacity="${a}" transform="translate(${(1 - a) * (i % 2 ? 50 : -50)} 0)"><rect x="16" y="${y}" width="308" height="34" rx="12" fill="${ok ? "#E3F6EB" : "#FFE3E3"}" stroke="${K}" stroke-width="2.5"/>` + txt(170, y + 22, (ok ? "✓  " : "✗  ") + it[0], 12.5, "middle", 800) + `</g>`; });
    const arr = (1 - hit) * 150; if (hit > 0 && hit < 1) s += `<g transform="translate(${-arr} 0)"><path d="M20 84h56" stroke="${R}" stroke-width="6" stroke-linecap="round"/><path d="M68 72l14 12-14 12" fill="none" stroke="${R}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    return s;
  }
};

/* ---- Step-up: the staircase of instalments, flat against rising ---- */
const stairs = {
  dur: c => c.years * 0.7 + 4,
  draw(c, t) {
    const n = c.years, hi = c.start * Math.pow(1 + c.step, n - 1), sc = 150 / hi, w = Math.min(26, 300 / n - 4), x0 = (340 - n * (w + 4)) / 2, base = 232; let s = txt(170, 18, "Monthly instalment, year by year", 11, "middle", 800, "#7A6A55");
    let ball = null;
    for (let i = 0; i < n; i++) {
      const a = seg(t, i * 0.7, i * 0.7 + 0.6), v = c.start * Math.pow(1 + c.step, i), x = x0 + i * (w + 4), h = v * sc * a, fh = c.start * sc;
      if (a > 0) { s += `<rect x="${x}" y="${base - fh}" width="${w}" height="${fh}" rx="5" fill="none" stroke="#7A6A55" stroke-width="2" stroke-dasharray="4 3"/><rect x="${x}" y="${base - h}" width="${w}" height="${h}" rx="5" fill="${G}" stroke="${K}" stroke-width="2.5"/>`;
        if (i === 0 || i === n - 1) s += txt(x + w / 2, base - h - (i ? 26 : 6), inr(v), 9.5, "middle", 800); s += txt(x + w / 2, base + 13, "Y" + (i + 1), 9, "middle", 700, "#7A6A55"); ball = [x + w / 2, base - h - 14]; }
    }
    s += `<rect x="6" y="${base + 2}" width="328" height="3" rx="1.5" fill="${K}"/>`;
    if (ball) s += coin(ball[0], ball[1] + (Math.abs(Math.sin(t * 6)) * -4), 9);
    const fin = seg(t, n * 0.7 + 0.4, n * 0.7 + 1.2);
    if (fin > 0) s += `<g opacity="${fin}"><rect x="14" y="262" width="150" height="58" rx="14" fill="#E4EBF5" stroke="${K}" stroke-width="3"/>` + txt(89, 282, "Flat SIP", 11, "middle", 800, "#5b4a2e") + txt(89, 306, c.flat, 17, "middle", 800) + `<rect x="176" y="262" width="150" height="58" rx="14" fill="${Y}" stroke="${K}" stroke-width="3"/>` + txt(251, 282, "Step-up SIP", 11, "middle", 800, "#5b4a2e") + txt(251, 306, c.up, 17, "middle", 800) + `</g>`;
    return s;
  }
};

/* ---- STP: money walks from a calm jar into the growth jar, one month at a time ---- */
const pipes = {
  dur: c => c.months * 0.7 + 3.5,
  draw(c, t) {
    const m = c.months, per = 0.7, done = clamp(t / per, 0, m), whole = Math.floor(done), part = done - whole, tot = c.total, step = tot / m;
    const jar = (x, level, col, label, val) => `<rect x="${x}" y="60" width="96" height="160" rx="18" fill="#fff" stroke="${K}" stroke-width="3.5"/><rect x="${x + 4}" y="${216 - 152 * level}" width="88" height="${152 * level}" rx="14" fill="${col}" opacity=".9"/>` + txt(x + 48, 46, label, 12, "middle", 800) + txt(x + 48, 246, val, 13, "middle", 800);
    const left = 1 - (whole + ease(clamp(part * 1.4))) / m, right = (whole + ease(clamp(part * 1.4))) / m;
    let s = jar(20, clamp(left, 0, 1), B, c.from, inr(tot * clamp(left, 0, 1)).replace("₹", "₹")) + jar(224, clamp(right, 0, 1), G, c.to, inr(tot * clamp(right, 0, 1)));
    s += `<path d="M116 140h108" stroke="${K}" stroke-width="12" stroke-linecap="round"/><path d="M116 140h108" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`;
    if (whole < m) s += coin(116 + 108 * ease(clamp(part * 1.2)), 140, 11, "₹");
    const earned = (() => { let b = tot, e = 0; for (let i = 0; i < whole; i++) { e += b * c.rate / 12; b -= step; } return e + (b * c.rate / 12) * part; })();
    s += `<rect x="30" y="266" width="280" height="54" rx="14" fill="${Y}" stroke="${K}" stroke-width="3"/>` + txt(170, 288, `Month ${Math.min(whole + (part > 0 ? 1 : 0), m)} of ${m}: ${inr(step)} moves across`, 12.5, "middle", 800) + txt(170, 308, `Earned while waiting: ${inr(earned)}`, 12, "middle", 700, "#5b4a2e");
    return s;
  }
};

/* ---- SWP: the same withdrawals, two different markets ---- */
const drain = {
  dur: () => 11,
  draw(c, t) {
    const X0 = 28, X1 = 322, Y0 = 232, Y1 = 40, yrs = c.years || 25, sim = p => { let b = c.corpus, pts = [[0, b]], dead = null; for (let y = 1; y <= yrs; y++) { b = b * (1 + p.rates[Math.min(y - 1, p.rates.length - 1)]) - c.withdraw * 12; if (b <= 0 && dead === null) dead = y; pts.push([y, Math.max(b, 0)]); if (dead) break; } return { pts, dead }; }, hi = Math.max(c.corpus * 1.1, ...c.paths.flatMap(p => sim(p).pts.map(q => q[1]))) * 1.04, px = y => X0 + (X1 - X0) * (y / yrs), py = v => Y0 - (Y0 - Y1) * (v / hi);
    let s = `<path d="M${X0} ${Y1}v${Y0 - Y1}h${X1 - X0}" fill="none" stroke="${K}" stroke-width="3" stroke-linecap="round"/>` + txt(X0 + 4, 30, "What is left in the fund", 10.5, "start", 800, "#7A6A55") + txt(X1, Y0 + 16, "years →", 10, "end", 700, "#7A6A55");
    const colors = [G, R], prog = clamp(t / 8) * yrs;
    c.paths.forEach((p, k) => {
      const { pts, dead } = sim(p);
      const shown = pts.filter(q => q[0] <= prog); if (prog < pts[pts.length - 1][0]) { const a = Math.floor(prog), f = prog - a, p0 = pts[a], p1 = pts[Math.min(a + 1, pts.length - 1)]; shown.push([prog, p0[1] + (p1[1] - p0[1]) * f]); }
      s += `<polyline points="${shown.map(q => px(q[0]) + "," + py(q[1])).join(" ")}" fill="none" stroke="${colors[k]}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<rect x="${24 + k * 156}" y="256" width="148" height="26" rx="10" fill="${k ? "#FFE3E3" : "#E3F6EB"}" stroke="${K}" stroke-width="2.5"/>` + txt(98 + k * 156, 273, p.name, 10.5, "middle", 800);
      if (dead && prog >= dead) s += `<g><circle cx="${px(dead)}" cy="${Y0}" r="8" fill="${R}" stroke="${K}" stroke-width="2.5"/>` + txt(px(dead), Y0 - 16, `Empty in year ${dead}`, 11, "end", 800, R) + `</g>`;
      else if (!dead && prog >= yrs - 0.01) s += txt(px(yrs) - 6, py(pts[pts.length - 1][1]) - 10, `₹${f1(pts[pts.length - 1][1] / 1e7)} crore left`, 11, "end", 800, "#1E8E56");
    });
    s += txt(170, 308, `Withdrawing ${inr(c.withdraw)} a month from ${inr(c.corpus / 1e7)} crore`, 11, "middle", 700, "#5b4a2e");
    return s;
  }
};

/* ---- Goals: the target grows with inflation, and the mix turns safer as the date nears ---- */
const glide = {
  dur: c => c.eq.length * 0.55 + 3,
  draw(c, t) {
    const n = c.eq.length, w = Math.min(22, 300 / n - 3), x0 = (340 - n * (w + 3)) / 2, base = 228, H = 150; let s = "", shown = 0;
    for (let i = 0; i < n; i++) {
      const a = seg(t, i * 0.55, i * 0.55 + 0.5); if (a <= 0) continue; shown = i + 1;
      const x = x0 + i * (w + 3), e = c.eq[i] / 100, he = H * e * a, hs = H * (1 - e) * a;
      s += `<rect x="${x}" y="${base - he}" width="${w}" height="${he}" rx="4" fill="${G}" stroke="${K}" stroke-width="2"/><rect x="${x}" y="${base - he - hs}" width="${w}" height="${hs}" rx="4" fill="${B}" stroke="${K}" stroke-width="2"/>` + txt(x + w / 2, base + 13, "Y" + (i + 1), 8.5, "middle", 700, "#7A6A55");
    }
    s += `<rect x="6" y="${base + 2}" width="328" height="3" rx="1.5" fill="${K}"/>`;
    const tv = c.target * Math.pow(1 + c.infl, shown);
    s += `<rect x="30" y="14" width="280" height="62" rx="14" fill="${Y}" stroke="${K}" stroke-width="3"/>` + txt(170, 36, `${c.goal}: what it will cost`, 11.5, "middle", 800, "#5b4a2e") + txt(170, 64, `₹${f1(tv)} lakh`, 24, "middle", 800);
    s += `<rect x="30" y="262" width="14" height="14" rx="3" fill="${G}" stroke="${K}" stroke-width="2"/>` + txt(50, 274, "Equity (growth)", 11, "start", 700) + `<rect x="172" y="262" width="14" height="14" rx="3" fill="${B}" stroke="${K}" stroke-width="2"/>` + txt(192, 274, "Safer funds", 11, "start", 700);
    return s;
  }
};

/* ---- A SIP date against payday: why an instalment bounces ---- */
const mandate = {
  dur: () => 13,
  draw(c, t) {
    const runs = [[0.4, c.sip1, "Date 1"], [6.8, c.sip2, "Date 2"]], X0 = 20, X1 = 320, dx = d => X0 + (X1 - X0) * ((d - 1) / 30); let s = "";
    runs.forEach(([st, sip, name], k) => {
      const y = 50 + k * 140, p = clamp((t - st) / 4.6), day = 1 + 30 * p;
      s += `<rect x="10" y="${y - 30}" width="320" height="118" rx="16" fill="${k ? "#E3F6EB" : "#FFE9E3"}" stroke="${K}" stroke-width="3"/>` + txt(24, y - 12, `${name}: SIP on the ${sip}th`, 12, "start", 800);
      s += `<path d="M${X0} ${y + 20}H${X1}" stroke="${K}" stroke-width="4" stroke-linecap="round"/>`;
      [[c.salary, G, "Salary", -2], [sip, Y, "SIP", 1]].forEach(([d, col, lab, side]) => { s += `<circle cx="${dx(d)}" cy="${y + 20}" r="9" fill="${col}" stroke="${K}" stroke-width="3"/>` + txt(dx(d), side < 0 ? y + 2 : y + 44, lab + " " + d, 10, "middle", 800); });
      if (t >= st) {
        s += `<circle cx="${dx(day)}" cy="${y + 20}" r="5" fill="${K}"/>`;
        const bal = day < c.salary ? c.low : c.high, paid = day >= sip, ok = (sip < c.salary ? c.low : c.high) >= c.amt;
        s += txt(24, y + 74, `Balance: ${inr(bal)}`, 11.5, "start", 800, "#5b4a2e");
        if (paid) s += ok ? `<g><rect x="190" y="${y + 56}" width="130" height="26" rx="10" fill="${G}" stroke="${K}" stroke-width="2.5"/>` + txt(255, y + 74, "✓ Instalment paid", 11.5, "middle", 800) + `</g>` : `<g><rect x="190" y="${y + 56}" width="130" height="26" rx="10" fill="${R}" stroke="${K}" stroke-width="2.5"/>` + txt(255, y + 74, "✗ Bounced + fee", 11.5, "middle", 800, "#fff") + `</g>`;
      }
    });
    return s;
  }
};

export const KINDS = { sipbuy, growbars, duel, guard, stairs, pipes, drain, glide, mandate };
const H = { sipbuy: 340, growbars: 330, duel: 330, guard: 340, stairs: 330, pipes: 330, drain: 330, glide: 290, mandate: 330 };

export function animHtml(c) { return `<div class="anim"><svg id="stage" data-anim viewBox="0 0 340 ${H[c.type] || 330}" role="img" aria-label="${(c.alt || c.h || "Animation").replace(/"/g, "")}"></svg><div class="cap" id="cap"></div><button class="btn" data-replay style="align-self:center">↻ Replay</button></div>`; }

let raf = 0;
export function stopAnim() { cancelAnimationFrame(raf); raf = 0; }
/* Plays the film once on the stage, shows each caption when its time comes, then holds the last frame. */
export function startAnim(root, c, tx) {
  stopAnim();
  const svg = root.querySelector("#stage"), cap = root.querySelector("#cap"); if (!svg) return;
  const k = KINDS[c.type], dur = k.dur(c), caps = (c.caps || []).map(([s, text]) => [s, tx(text)]), t0 = performance.now(), reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let last = -1;
  const frame = now => {
    if (!svg.isConnected) return;
    const t = reduce ? dur : (now - t0) / 1000;
    svg.innerHTML = k.draw(c, Math.min(t, dur));
    let ci = -1; caps.forEach(([s], i) => { if (t >= s) ci = i; });
    if (ci !== last && cap) { last = ci; cap.textContent = ci >= 0 ? caps[ci][1] : ""; }
    if (t < dur) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
}
export const speakOf = (c, tx) => (c.caps || []).map(x => tx(x[1])).join(" ");
