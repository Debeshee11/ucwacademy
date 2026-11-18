/* Everyday wording, door tracks and the quote bank. Source files are ES modules; they are loaded here by stripping import and export. */
const fs = require("fs"), path = require("path"), assert = require("assert");
const root = path.join(__dirname, "..", "..");
const load = (rel, stubs = {}) => {
  let src = fs.readFileSync(path.join(root, rel), "utf8").replace(/^import .*$/gm, "").replace(/^export \{.*\};?$/gm, "").replace(/\bexport (const|function|let)\b/g, "$1");
  const names = Object.keys(stubs);
  return new Function(...names, src + "\n;return {" + [...src.matchAll(/^(?:const|function|let) ([A-Za-z0-9_]+)/gm)].map(m => m[1]).join(",") + "};")(...names.map(n => stubs[n]));
};
const P = load("one/js/plain.js");

/* wording */
const eq = (a, b) => assert.strictEqual(P.plain(a), b);
eq("A client concludes the fund is bad.", "Someone concludes the fund is bad.");
eq("A salaried client with a 3-year-old SIP.", "A salaried investor with a 3-year-old SIP.");
eq("Always move from the industry number to the client's own plan.", "Always move from the industry number to your own plan.");
eq("Client with missed instalments.", "Someone with missed instalments.");
eq("RMs need to explain this.", "Advisers need to explain this.");
eq("Check if your client already owns them.", "Check if the investor already owns them.");
eq("Clients trust advisers who explain.", "Investors trust advisers who explain.");
eq("Nothing to change here.", "Nothing to change here.");
const q = { id: "v2-1-1", prompt: "A client asks.", options: ["Tell the client", "Wait"], answer: 1, why: "Clients first." };
const r = P.plainDeep(q);
assert.strictEqual(r.id, q.id); assert.strictEqual(r.answer, 1); assert.strictEqual(r.options.length, 2);
assert.ok(![r.prompt, ...r.options, r.why].join(" ").match(/client/i), "no client left in a rewritten question");

/* every lesson rewritten for everyday learners: no "client" left in the body of courses they see */
const C = JSON.parse(fs.readFileSync(path.join(root, "functions/content/courses.json"))), L = JSON.parse(fs.readFileSync(path.join(root, "functions/content/lessons.json")));
const A = load("one/js/audience.js", { Store: { get: () => ({}), isStaff: () => false, subscribe() {} }, plain: P.plain, plainDeep: P.plainDeep, D: { courses: [], sections: [], levels: [], lessons: {} }, personalise: x => x });
const byN = {}; L.forEach(l => (byN[l.n] = l));
let seen = 0;
for (const c of C.courses) {
  if (A.PRO_ONLY.has(c.id)) continue;
  for (const n of c.modules.flatMap(m => m.lessons)) {
    const { qs, tags, ...body } = byN[n] || {};
    const words = v => (typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(words) : v && typeof v === "object" ? Object.values(v).flatMap(words) : []);
    const text = words(P.plainDeep(body)).concat(words((qs || []).map(P.plainDeep))).join(" ");
    assert.ok(!/client/i.test(text), `lesson ${n} (${c.id}) still says client`); seen++;
  }
}
assert.ok(seen > 200, "checked the everyday lessons");

/* doors */
const ids = new Set(C.courses.map(c => c.id)), doorIds = A.DOORS.map(d => d.id);
assert.strictEqual(new Set(doorIds).size, doorIds.length, "door ids are unique");
for (const old of ["student", "homemaker", "teacher", "salaried", "business", "retiree", "partner", "team", "global"]) assert.ok(doorIds.includes(old), "existing door kept: " + old);
for (const d of A.DOORS) {
  assert.ok(["everyday", "pro"].includes(d.seg), d.id + " has an audience");
  for (const id of d.track || []) assert.ok(ids.has(id), `${d.id} names a course that exists: ${id}`);
  if (d.seg === "everyday") for (const id of d.track || []) assert.ok(!A.PRO_ONLY.has(id), `${d.id} (everyday) should not lead with a professional course: ${id}`);
}
assert.ok(A.DOORS.filter(d => d.seg === "pro").length >= 4, "professional kinds exist");
assert.ok(doorIds.filter(id => A.DOORS.find(d => d.id === id).seg === "everyday").length >= 6, "everyday kinds exist");
const fnIndex = fs.readFileSync(path.join(root, "functions/index.js"), "utf8");
for (const id of doorIds) assert.ok(fnIndex.includes(`"${id}"`), "admin counts door " + id);

/* the quote bank */
const Q = JSON.parse(fs.readFileSync(path.join(root, "one/data/quotes.json"), "utf8"));
assert.ok(Q.length >= 150, "quotes: " + Q.length);
const seenQ = new Set(), seenId = new Set();
for (const [id, text, author, tags] of Q) {
  assert.ok(/^[0-9a-f]{6}$/.test(id) && !seenId.has(id), "id " + id); seenId.add(id);
  assert.ok(text.length >= 20 && text.length <= 220, "length: " + text);
  assert.ok(author && /^[ispwrmleg]+$/.test(tags), "author and tags: " + text);
  assert.ok(!seenQ.has(text.toLowerCase()), "duplicate: " + text); seenQ.add(text.toLowerCase());
}
console.log("audience OK:", seen, "lessons,", A.DOORS.length, "doors,", Q.length, "quotes");
