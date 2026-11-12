const test = require("node:test"), assert = require("node:assert");
const { buildRoll } = require("../lib/roll");
test("roll counts lessons, week and name", () => {
  const now = Date.UTC(2026, 10, 12, 6), k = new Date(now + 5.5 * 3600e3).toISOString().slice(0, 10);
  const r = buildRoll({ name: "Dhruv Shah", done: { 1: 1, 2: 1, 900: 1 }, act: { [k]: { l: 2 } }, created: now - 864e5 * 3 }, null, now, false);
  assert.equal(r.lessons, 2); assert.equal(r.wk, 2); assert.equal(r.wkd[k], 2); assert.equal(r.name, "Dhruv S."); assert.equal(r.xp, 40);
});
test("empty record is safe", () => { const r = buildRoll({}, null, 1e12, false); assert.equal(r.name, "Learner"); assert.equal(r.xp, 0); });
test("seals and exam points come from server results, not browser quiz data", () => {
  const now = Date.UTC(2026, 10, 12, 6);
  const fake = { name: "A B", quiz: { "x3:c": { passed: 1 }, "x2:c": { passed: 1 }, "m:c:0": { passed: 1 } }, created: now - 864e5 * 5 };
  const r = buildRoll(fake, null, now, false, { "c:i": { passed: 5 }, "c:h": { passed: null }, "c:b": { passed: 3 } });
  assert.equal(r.seals, 2); assert.equal(r.xp, 30 + 2 * 30);
});
