/* Merge two progress documents so two devices never overwrite each other. Pure; tested in functions/test. */
const num = v => (typeof v === "number" && isFinite(v) ? v : 0);
const first = (a, b) => (a && b ? Math.min(a, b) : a || b || null);

function mapMerge(a = {}, b = {}, pick) {
  const out = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) out[k] = a[k] && b[k] ? pick(a[k], b[k]) : a[k] || b[k];
  return out;
}

export function mergeStates(x, y) {
  const [old, cur] = num(x.updated) <= num(y.updated) ? [x, y] : [y, x];   /* cur is the newer document */
  const out = { ...old, ...cur };
  out.done = mapMerge(x.done, y.done, (a, b) => Math.min(a, b));
  out.part = mapMerge(x.part, y.part, (a, b) => Math.max(num(a), num(b)));
  out.q = mapMerge(x.q, y.q, (a, b) => {
    const w = num(a.n) >= num(b.n) ? a : b, o = w === a ? b : a;
    return { ...w, r: Math.max(num(a.r), num(b.r)), n: Math.max(num(a.n), num(b.n)), f: w.f ?? o.f ?? null, d: num(a.d) >= num(b.d) && w === a ? a.d : w.d };
  });
  out.quiz = mapMerge(x.quiz, y.quiz, (a, b) => ({ best: Math.max(num(a.best), num(b.best)), n: Math.max(num(a.n), num(b.n)), last: Math.max(num(a.last), num(b.last)), passed: first(a.passed, b.passed) }));
  out.lab = mapMerge(x.lab, y.lab, (a, b) => ({ score: Math.max(num(a.score), num(b.score)), n: Math.max(num(a.n), num(b.n)), last: Math.max(num(a.last), num(b.last)) }));
  out.act = mapMerge(x.act, y.act, (a, b) => ({ l: Math.max(num(a.l), num(b.l)), r: Math.max(num(a.r), num(b.r)), d: Math.max(num(a.d), num(b.d)) }));
  const sx = x.streak || { n: 0, last: "" }, sy = y.streak || { n: 0, last: "" };
  out.streak = sx.last > sy.last ? sx : sy.last > sx.last ? sy : { n: Math.max(num(sx.n), num(sy.n)), last: sx.last };
  out.created = Math.min(num(x.created) || Infinity, num(y.created) || Infinity);
  if (!isFinite(out.created)) out.created = Date.now();
  out.updated = Math.max(num(x.updated), num(y.updated));
  return out;
}
