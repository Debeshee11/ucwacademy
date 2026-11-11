/* Keeps staff addresses out of public files and the domain rule in step. Also checks pass marks match the browser config. */
const assert = require("assert"), fs = require("fs"), path = require("path");
const { STAFF_DOMAIN, ADMIN_EMAILS, isStaffEmail } = require("../lib/staff");
const { PASS } = require("../lib/mark");
const root = path.join(__dirname, "..", "..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
const sorted = a => [...new Set(a)].sort();

const rules = read("firestore.rules");
const cfg = read("one/js/config.js");
/* No individual staff address may sit in the public repository (admin address excepted). */
const mails = f => (read(f).match(/[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[a-z]{2,}/g) || []).map(x => x.toLowerCase());
const allowed = new Set([ADMIN_EMAILS[0], "social@uppercrustwealth.com"]);
for (const f of ["firestore.rules", "one/js/config.js", "functions/lib/staff.js", "functions/index.js", "one/js/team.js"])
  for (const m of mails(f)) if (m.endsWith("@uppercrustwealth.com") && !allowed.has(m)) assert.fail(`staff address ${m} in ${f}`);
assert(isStaffEmail("a@uppercrustwealth.com") && !isStaffEmail("a@gmail.com") && !isStaffEmail("a@uppercrustwealth.com.evil.io"));
assert(rules.includes("uppercrustwealth[.]com") && STAFF_DOMAIN === cfg.match(/STAFF_DOMAIN = "([^"]+)"/)[1], "staff domain differs between rules, config and backend");

const adminRule = rules.match(/function isAdmin\(\)[\s\S]*?\}/)[0].match(/== '([^']+)'/)[1];
assert.strictEqual(adminRule, ADMIN_EMAILS[0], "isAdmin() differs from ADMIN_EMAILS");
assert.strictEqual(cfg.match(/ADMIN_EMAIL = "([^"]+)"/)[1], ADMIN_EMAILS[0], "ADMIN_EMAIL in config.js differs");

const tp = cfg.match(/tierPass: \{ b: (\d+), i: (\d+), h: (\d+) \}/), ep = cfg.match(/examPass: (\d+)/);
assert.deepStrictEqual([+tp[1], +tp[2], +tp[3], +ep[1]], [PASS.b, PASS.i, PASS.h, PASS.r], "pass marks differ between config.js and functions/lib/mark.js");
console.log("config tests ok");
