const test = require("node:test"), assert = require("node:assert");
test("merge keeps progress from both devices", async () => {
  const { mergeStates } = await import("../../one/js/merge.js");
  const a = { done: { 1: 100 }, part: { 2: 1 }, q: { x: { b: 1, d: 5, n: 1, r: 1, f: 1 } }, quiz: { m1: { best: 60, n: 1, last: 5, passed: null } }, lab: {}, act: { "2026-01-01": { l: 1, r: 0, d: 0 } }, streak: { n: 2, last: "2026-01-01" }, created: 10, updated: 100 };
  const b = { done: { 2: 200, 1: 50 }, part: { 2: 3 }, q: { x: { b: 2, d: 9, n: 3, r: 2, f: 1 }, y: { b: 0, d: 1, n: 1, r: 0, f: 0 } }, quiz: { m1: { best: 80, n: 2, last: 9, passed: 9 } }, lab: {}, act: { "2026-01-01": { l: 0, r: 1, d: 1 } }, streak: { n: 1, last: "2026-01-02" }, created: 5, updated: 50 };
  const m = mergeStates(a, b);
  assert.deepEqual(Object.keys(m.done).sort(), ["1", "2"]); assert.equal(m.done[1], 50);
  assert.equal(m.part[2], 3); assert.equal(m.q.x.n, 3); assert.ok(m.q.y);
  assert.equal(m.quiz.m1.best, 80); assert.equal(m.quiz.m1.passed, 9);
  assert.deepEqual(m.act["2026-01-01"], { l: 1, r: 1, d: 1 });
  assert.equal(m.streak.last, "2026-01-02"); assert.equal(m.created, 5); assert.equal(m.updated, 100);
});
