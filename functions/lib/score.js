/* Pure marking logic, kept free of Firebase so it can be tested. */
function validAnswers(answers, n) {
  if (!Array.isArray(answers) || answers.length !== n) return false;
  return answers.every(x => x === null || (Number.isInteger(x) && x >= 0 && x <= 3));
}

/* key: { a:[correct index], u:[unit], m:[marks] }, answers: [index|null], negf: 0.25 */
function score(key, answers, negf) {
  const n = key.a.length, un = {};
  let c = 0, w = 0, sc = 0, sw = 0, tot = 0;
  const res = new Array(n); /* 1 right, 0 wrong, -1 skipped */
  for (let i = 0; i < n; i++) {
    const mk = key.m[i] || 1, u = (un[key.u[i]] = un[key.u[i]] || [0, 0]);
    tot += mk; u[1]++;
    if (answers[i] === null) { res[i] = -1; continue; }
    if (answers[i] === key.a[i]) { c++; sc += mk; u[0]++; res[i] = 1; } else { w++; sw += mk; res[i] = 0; }
  }
  const s = Math.round((sc - sw * negf) * 100) / 100;
  return { s, c, w, u: n - c - w, un, res, total: tot };
}

/* Fold an attempt into a learner's per-mock record. */
function foldRecord(prev, rec) {
  const r = prev && typeof prev === "object" ? prev : { att: 0, best: -999, hist: [] };
  const hist = Array.isArray(r.hist) ? r.hist : [];
  return { att: (r.att || 0) + 1, best: Math.max(r.best == null ? -999 : r.best, rec.s), last: rec, hist: [...hist.slice(-4), { s: rec.s, d: rec.d }] };
}

module.exports = { validAnswers, score, foldRecord };
