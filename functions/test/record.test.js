/* A save must only carry fields the Firestore rules allow, or every save after the first is refused. */
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), path = require("path");
test("saved learner record only has fields the rules allow", async () => {
  const { mergeStates, toRecord } = await import("../../one/js/merge.js");
  const rules = fs.readFileSync(path.join(__dirname, "../../firestore.rules"), "utf8");
  const allowed = new Set([...rules.match(/hasOnly\(\[('v'[^\]]*)\]\)/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]));
  const blank = () => ({ v: 1, name: "", mobile: "", mv: 0, kind: "", door: "", age: "", ints: [], prov: "", consent: 0, show: 1, study: {}, nm: {}, onb: 0, lang: "en", start: null, done: {}, part: {}, q: {}, quiz: {}, creds: {}, lab: {}, act: {}, streak: { n: 0, last: "" }, last: null, created: 1, updated: 0 });
  const merged = mergeStates({ ...blank(), name: "A B" }, { ...blank(), name: "A B", done: { 1: 5 } });
  const extra = Object.keys(toRecord(merged, "a@b.co")).filter(k => !allowed.has(k));
  assert.deepEqual(extra, []);
});
