/* The certificate's seal and score ring, drawn as inline SVG. Colours come from CSS variables set by the certificate's level. */
const NS = "http://www.w3.org/2000/svg";
const el = (t, a = {}) => { const e = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); return e; };

/* A scalloped rosette with two ribbon tails and the level written around it. */
export function seal(word) {
  const s = el("svg", { viewBox: "0 0 120 140", class: "cert-seal-svg", role: "img", "aria-label": word + " seal" });
  const d = el("defs"), g = el("radialGradient", { id: "sg", cx: "35%", cy: "30%", r: "80%" });
  [["0", "var(--c-hi)"], ["1", "var(--c-lo)"]].forEach(([o, c]) => g.append(el("stop", { offset: o, "stop-color": c }))); d.append(g); s.append(d);
  s.append(el("path", { d: "M40 88 L28 138 L50 124 L60 138 L66 92Z", fill: "var(--c-lo)" }), el("path", { d: "M80 88 L92 138 L70 124 L60 138 L54 92Z", fill: "var(--c-ink)" }));
  const n = 24; let p = "";
  for (let i = 0; i < n * 2; i++) { const a = (Math.PI * i) / n, r = i % 2 ? 50 : 56; p += (i ? "L" : "M") + (60 + r * Math.cos(a)).toFixed(1) + " " + (60 + r * Math.sin(a)).toFixed(1); }
  s.append(el("path", { d: p + "Z", fill: "url(#sg)" }), el("circle", { cx: 60, cy: 60, r: 42, fill: "none", stroke: "var(--c-ink)", "stroke-width": 1.5, opacity: ".55" }),
    el("circle", { cx: 60, cy: 60, r: 36, fill: "var(--c-ink)", opacity: ".12" }));
  const t = el("text", { x: 60, y: 58, "text-anchor": "middle", "font-size": 26, "font-weight": 800, fill: "var(--c-ink)", "font-family": "Georgia,serif" }); t.textContent = "UC";
  const w = el("text", { x: 60, y: 76, "text-anchor": "middle", "font-size": 8.5, "font-weight": 800, "letter-spacing": "2", fill: "var(--c-ink)" }); w.textContent = word.toUpperCase();
  s.append(t, w); return s;
}

/* A ring that fills to the score. */
export function ring(score) {
  const s = el("svg", { viewBox: "0 0 80 80", class: "cert-ring", role: "img", "aria-label": `Score ${score} percent` }), r = 33, C = 2 * Math.PI * r;
  s.append(el("circle", { cx: 40, cy: 40, r, fill: "none", stroke: "var(--c-soft)", "stroke-width": 7 }),
    el("circle", { cx: 40, cy: 40, r, fill: "none", stroke: "var(--c-lo)", "stroke-width": 7, "stroke-linecap": "round", "stroke-dasharray": `${(C * Math.min(100, score)) / 100} ${C}`, transform: "rotate(-90 40 40)" }));
  const t = el("text", { x: 40, y: 46, "text-anchor": "middle", "font-size": 20, "font-weight": 800, fill: "var(--c-ink)" }); t.textContent = score + "%"; s.append(t); return s;
}
