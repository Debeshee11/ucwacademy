const test = require("node:test"), assert = require("node:assert");
const { scrub } = require("../lib/scrub");
test("scrub hides emails and numbers", () => {
  assert.equal(scrub("mail me a.b@x.co or +91 98765 43210 ok"), "mail me [email hidden] or [number hidden] ok");
  assert.equal(scrub("20 points a lesson, 3 quizzes"), "20 points a lesson, 3 quizzes");
});
