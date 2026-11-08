/* Pure exam marking, free of Firebase so it can be tested. */
const COUNT = { b: 20, i: 20, h: 20, r: 15 };   /* questions drawn per exam: Beginner, Intermediate, Hard, Refresher */
const PASS = { b: 80, i: 75, h: 70, r: 80 };    /* pass marks, in step with RULES in one/js/config.js */

/* Pure marking, kept apart so it can be tested. Returns an error string or the result. */
function mark(course, tier, qids, answers) {
  const pool = course.pools[tier];
  if (!Array.isArray(pool) || !pool.length) return { error: "That exam is not available." };
  const need = Math.min(COUNT[tier], pool.length);
  if (!Array.isArray(qids) || !Array.isArray(answers) || qids.length !== need || answers.length !== need) return { error: "The answers are not valid." };
  const ok = new Set(pool);
  if (new Set(qids).size !== need || !qids.every(q => typeof q === "string" && ok.has(q))) return { error: "The questions are not valid." };
  let right = 0; const review = [];
  qids.forEach((id, i) => {
    const [a, why, n] = course.keys[id], x = answers[i];
    if (x !== null && !(Number.isInteger(x) && x >= 0 && x < n)) throw new Error("bad answer");
    if (x === a) right++;
    review.push({ id, a, w: why });
  });
  const score = Math.round(100 * right / need);
  return { score, right, total: need, passed: score >= PASS[tier], pass: PASS[tier], review };
}

module.exports = { COUNT, PASS, mark };
