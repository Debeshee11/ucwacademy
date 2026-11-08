const assert = require("assert");
const { mark, COUNT, PASS } = require("../lib/mark");

const keys = {}, ids = [];
for (let i = 0; i < 25; i++) { const id = "q" + i; ids.push(id); keys[id] = [i % 4, "because " + i, 4]; }
const course = { pools: { b: ids, i: ids.slice(0, 20), h: [], r: ids.slice(0, 15) }, keys };
const draw = n => ids.slice(0, n);
const right = n => draw(n).map(id => keys[id][0]);

let r = mark(course, "b", draw(20), right(20));
assert.strictEqual(r.score, 100); assert(r.passed); assert.strictEqual(r.review.length, 20); assert.strictEqual(r.review[3].a, 3);

const wrong4 = right(20).map((a, i) => (i < 4 ? (a + 1) % 4 : a));         /* 16 of 20 = 80% */
r = mark(course, "b", draw(20), wrong4); assert.strictEqual(r.score, 80); assert(r.passed);
r = mark(course, "b", draw(20), right(20).map((a, i) => (i < 5 ? null : a))); assert.strictEqual(r.score, 75); assert(!r.passed);   /* Beginner needs 80 */
r = mark(course, "i", draw(20), right(20).map((a, i) => (i < 5 ? null : a))); assert.strictEqual(r.score, 75); assert(r.passed);     /* Intermediate needs 75 */
r = mark(course, "r", draw(15), right(15)); assert(r.passed); assert.strictEqual(r.total, 15);

assert(mark(course, "h", [], []).error);                                       /* empty pool */
assert(mark(course, "b", draw(19), right(19)).error);                          /* wrong count */
assert(mark(course, "b", [...draw(19), "q0"], right(20)).error);               /* duplicate id */
assert(mark(course, "b", [...draw(19), "zzz"], right(20)).error);              /* id not in pool */
assert(mark(course, "i", [...draw(19), "q22"], right(20)).error);              /* id from another pool */
assert.throws(() => mark(course, "b", draw(20), right(20).map((a, i) => (i === 0 ? 9 : a))));  /* option out of range */
assert.throws(() => mark(course, "b", draw(20), right(20).map((a, i) => (i === 0 ? "1" : a)))); /* wrong type */

const small = { pools: { b: ids.slice(0, 8), i: [], h: [], r: [] }, keys };   /* pool smaller than the draw */
assert.strictEqual(mark(small, "b", draw(8), right(8)).total, 8);
assert.strictEqual(COUNT.b, 20); assert.strictEqual(PASS.b, 80);
console.log("exam tests ok");
