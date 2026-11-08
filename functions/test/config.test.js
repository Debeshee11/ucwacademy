/* The staff list lives in three places. This fails if they drift apart. Also checks pass marks match the browser config. */
const assert = require("assert"), fs = require("fs"), path = require("path");
const { STAFF, ADMIN_EMAILS } = require("../lib/staff");
const { PASS } = require("../lib/mark");
const root = path.join(__dirname, "..", "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const sorted = a => [...new Set(a)].sort();

const rules = read("firestore.rules");
const listed = rules.match(/function listed\(\)[\s\S]*?\]/)[0].match(/'([^']+@[^']+)'/g).map(s => s.slice(1, -1));
assert.deepStrictEqual(sorted(listed), sorted(STAFF), "listed() in firestore.rules differs from functions/lib/staff.js");

const cfg = read("one/js/config.js");
const cstaff = JSON.parse(cfg.match(/export const STAFF = (\[[^\]]*\])/)[1]);
assert.deepStrictEqual(sorted(cstaff), sorted(STAFF), "STAFF in one/js/config.js differs from functions/lib/staff.js");
assert.strictEqual(new Set(STAFF).size, STAFF.length, "duplicate staff email");

const adminRule = rules.match(/function isAdmin\(\)[\s\S]*?\}/)[0].match(/== '([^']+)'/)[1];
assert.strictEqual(adminRule, ADMIN_EMAILS[0], "isAdmin() differs from ADMIN_EMAILS");
assert.strictEqual(cfg.match(/ADMIN_EMAIL = "([^"]+)"/)[1], ADMIN_EMAILS[0], "ADMIN_EMAIL in config.js differs");

const tp = cfg.match(/tierPass: \{ b: (\d+), i: (\d+), h: (\d+) \}/), ep = cfg.match(/examPass: (\d+)/);
assert.deepStrictEqual([+tp[1], +tp[2], +tp[3], +ep[1]], [PASS.b, PASS.i, PASS.h, PASS.r], "pass marks differ between config.js and functions/lib/mark.js");
console.log("config tests ok");
