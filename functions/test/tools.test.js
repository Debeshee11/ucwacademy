/* The calculators' arithmetic, checked against figures worked out by hand and against the standard formulas. */
const test = require("node:test"), assert = require("node:assert");
const near = (a, b, tol = 1) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`);

test("money calculators", async () => {
  const M = await import("../../one/js/toolmath.js");

  /* SIP: ₹10,000 a month, 10 years, 12% a year. Closed form: P × ((1+i)^n − 1)/i × (1+i), i = 1%. */
  const i = 0.01, n = 120, closed = 10000 * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const s = M.sip({ monthly: 10000, years: 10, rate: 12 });
  near(s.value, closed, 1); near(s.invested, 1200000, 0.001); near(s.value, 2323391, 2);
  assert.equal(s.byYear.length, 10);
  /* No growth: you get back what you put in. */
  near(M.sip({ monthly: 5000, years: 3, rate: 0 }).value, 180000, 0.001);
  /* A 10% yearly step-up: instalments are 1000 in year 1 and 1100 in year 2. */
  near(M.sip({ monthly: 1000, years: 2, rate: 0, step: 10 }).invested, 12000 + 13200, 0.001);
  assert.ok(M.sip({ monthly: 1000, years: 10, rate: 12, step: 10 }).value > M.sip({ monthly: 1000, years: 10, rate: 12 }).value);

  /* Lump sum: ₹1 lakh at 12% for 6 years ≈ ₹1,97,382 (the Rule of 72 says "about double"). */
  near(M.lumpsum({ amount: 100000, years: 6, rate: 12 }).value, 197382, 1);

  /* Goal: the instalment found must build the target when fed back into the SIP. */
  const g = M.goal({ target: 5000000, years: 15, rate: 11 });
  near(M.sip({ monthly: g.monthly, years: 15, rate: 11 }).value, 5000000, 2);
  near(M.goal({ target: 120000, years: 1, rate: 0 }).monthly, 10000, 0.001);

  /* EMI: ₹10 lakh, 9%, 20 years = ₹8,997 a month (standard amortisation tables). */
  const e = M.emi({ loan: 1000000, rate: 9, years: 20 });
  near(e.emi, 8997, 1); near(e.total, e.emi * 240, 0.01); near(e.interest, e.total - 1000000, 0.01);
  near(M.emi({ loan: 120000, rate: 0, years: 1 }).emi, 10000, 0.001);

  /* Inflation: ₹1 lakh at 6% for 12 years ≈ ₹2,01,220; and ₹1 lakh then buys what ₹49,697 buys today. */
  const f = M.inflation({ amount: 100000, years: 12, rate: 6 });
  near(f.future, 201220, 1); near(f.worth, 49697, 1);

  /* Emergency fund: ₹40,000 of essentials × 6 months = ₹2.4 lakh; ₹60,000 saved covers 1.5 months; ₹10,000 a month fills the gap in 18 months. */
  const ef = M.emergency({ essentials: 40000, months: 6, saved: 60000, monthly: 10000 });
  assert.equal(ef.target, 240000); assert.equal(ef.gap, 180000); assert.equal(ef.covered, 1.5); assert.equal(ef.monthsToFill, 18);
  assert.equal(M.emergency({ essentials: 40000, months: 6, saved: 300000 }).monthsToFill, 0);
  assert.equal(M.emergency({ essentials: 40000, months: 6, saved: 0, monthly: 0 }).monthsToFill, null);

  /* Card debt: ₹1 lakh at 36% a year is ₹3,000 interest in month one. Paying ₹3,000 never clears it; paying ₹5,000 does, slowly. */
  assert.equal(M.cardDebt({ balance: 100000, rate: 36, pay: 3000 }).months, null);
  const c = M.cardDebt({ balance: 100000, rate: 36, pay: 5000 });
  assert.ok(c.months > 25 && c.months < 36, "months " + c.months); assert.ok(c.interest > 40000 && c.interest < 60000, "interest " + c.interest);
  near(M.cardDebt({ balance: 12000, rate: 0, pay: 1000 }).months, 12, 0);

  /* Retirement: with returns equal to inflation after retiring, the pot is simply first-year spending × years. */
  const r = M.retirement({ age: 30, retireAt: 60, till: 85, spend: 50000, inflationRate: 6, before: 12, after: 6 });
  near(r.firstYearSpend, 600000 * Math.pow(1.06, 30), 1); near(r.corpus, r.firstYearSpend * 25, 5);
  near(M.sip({ monthly: r.monthly, years: 30, rate: 12 }).value, r.corpus, 50);
  /* Savings already held reduce what must be invested each month. */
  assert.ok(M.retirement({ age: 30, retireAt: 60, till: 85, spend: 50000, inflationRate: 6, before: 12, after: 6, saved: 1000000 }).monthly < r.monthly);

  assert.equal(M.rupees(125000), "₹1,25,000"); assert.equal(M.rupeesShort(125000), "₹1.25 lakh"); assert.equal(M.rupeesShort(24000000), "₹2.4 crore"); assert.equal(M.rupeesShort(9500), "₹9,500");
});
