const assert = require("assert");
const { validAnswers, score, foldRecord } = require("../lib/score");
const key = { a: [0, 1, 2, 3], u: [1, 1, 2, 2], m: [1, 1, 2, 2] };

assert(validAnswers([0, null, 3, 1], 4));
assert(!validAnswers([0, 1], 4));
assert(!validAnswers([0, 1, 2, 4], 4));
assert(!validAnswers([0, 1, 2, "3"], 4));
assert(!validAnswers("x", 4));

let r = score(key, [0, 1, 2, 3], 0.25);
assert.strictEqual(r.s, 6); assert.strictEqual(r.c, 4); assert.strictEqual(r.total, 6);

r = score(key, [0, 0, 2, 0], 0.25);          /* right 1 + 2, wrong 1 + 2 */
assert.strictEqual(r.s, 3 - 3 * 0.25); assert.strictEqual(r.w, 2);

r = score(key, [null, null, null, null], 0.25);
assert.strictEqual(r.s, 0); assert.strictEqual(r.u, 4);
assert.deepStrictEqual(r.un, { 1: [0, 2], 2: [0, 2] });

r = score(key, [1, 1, 0, 3], 0);              /* no negative marking */
assert.strictEqual(r.s, 3);

const a = foldRecord(null, { s: 5, d: 1 });
assert.strictEqual(a.att, 1); assert.strictEqual(a.best, 5);
const b = foldRecord(a, { s: 3, d: 2 });
assert.strictEqual(b.att, 2); assert.strictEqual(b.best, 5); assert.strictEqual(b.hist.length, 2);
let h = b; for (let i = 0; i < 10; i++) h = foldRecord(h, { s: i, d: i });
assert.strictEqual(h.hist.length, 5);
console.log("score tests ok");
