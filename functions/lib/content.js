/* Course content is served only to signed-in learners. One call returns several named files so the app loads in a single request. */
const fs = require("fs");
const path = require("path");
const { makeR, fail, needAuth } = require("./common");

const DIR = path.join(__dirname, "..", "content");
const NAME = /^[a-z0-9-]+(\/[a-z0-9-]+)?$/;
const cache = new Map();

function load(name) {
  if (cache.has(name)) return cache.get(name);
  const file = path.join(DIR, name + ".json");
  if (!file.startsWith(DIR + path.sep) || !fs.existsSync(file)) return null;
  const v = JSON.parse(fs.readFileSync(file, "utf8"));
  cache.set(name, v);
  return v;
}

exports.content = makeR({ memory: "512MB" }).https.onCall(async (data, ctx) => {
  needAuth(ctx);
  const names = Array.isArray(data && data.names) ? data.names : [];
  if (!names.length || names.length > 16) fail("invalid-argument", "Ask for 1 to 16 files.");
  const out = {};
  for (const n of names) {
    if (typeof n !== "string" || !NAME.test(n)) fail("invalid-argument", "Bad name.");
    const v = load(n);
    if (v === null) fail("not-found", "No such content.");
    out[n] = v;
  }
  return out;
});
