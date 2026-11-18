/* House rule: the Academy is never presented as free. No "free", "costs nothing" or their Hindi/Gujarati forms in anything a learner or a search engine reads.
   Finance terms that happen to contain the word (tax free, free float, free-look period, risk free ...) are allowed. */
const test = require("node:test"), assert = require("node:assert"), fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..", "..");
const OK = /tax[- ]free|debt[- ]free|risk[- ]free|interest[- ]free|free[- ]float|free[- ]look|free cash|free lunch|free reserves|free from|free of|free flow|free withdraw|free additional|free share|free money|free text|-free\b/i;
const BAD = /\bfree\b|costs? nothing|no charge|निःशुल्क|मुफ़्त|मुफ्त|મફત/gi;
function files(dir, exts, out = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".git", "content", "nism", "newcourses", "auth"].includes(f.name)) continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) files(p, exts, out); else if (exts.some(e => f.name.endsWith(e))) out.push(p);
  }
  return out;
}
test("no 'free' positioning in the app, data, pages or generators", () => {
  const list = [...files(path.join(root, "one"), [".js", ".json", ".html", ".css"]), ...files(path.join(root, "tools", "seo"), [".py"]), ...files(path.join(root, "learn"), [".html"]), path.join(root, "index.html"), path.join(root, "404.html"), path.join(root, "manifest.webmanifest")]
    .filter(f => !/quotes\.json$/.test(f) && !/one[\\/]content[\\/]/.test(f) && !/learn[\\/]nism-/.test(f));
  const hits = [];
  for (const f of list) {
    const s = fs.readFileSync(f, "utf8");
    for (const m of s.matchAll(BAD)) {
      const ctx = s.slice(Math.max(0, m.index - 20), m.index + 25);
      if (!OK.test(ctx)) hits.push(path.relative(root, f) + ": " + ctx.replace(/\s+/g, " "));
    }
  }
  assert.deepStrictEqual(hits.slice(0, 15), []);
});
