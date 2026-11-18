/* The arithmetic behind the money calculators. Pure functions, no screen code, tested in functions/test/tools.test.js.
   Every figure is an illustration from the inputs given. Returns are assumptions, never promises.
   Rates are per cent a year; monthly compounding uses rate / 12, the convention fund houses and banks use in their own calculators. */
const num = (v, lo, hi) => { v = Number(v); if (!isFinite(v)) v = 0; return Math.min(hi, Math.max(lo, v)); };

/* Monthly investing. Each instalment goes in at the start of the month; "step" raises the instalment by that per cent once a year. */
export function sip({ monthly, years, rate, step = 0 }) {
  monthly = num(monthly, 0, 1e9); years = num(years, 0, 60); rate = num(rate, 0, 40); step = num(step, 0, 50);
  const i = rate / 1200, months = Math.round(years * 12);
  let value = 0, invested = 0, pay = monthly; const byYear = [];
  for (let m = 0; m < months; m++) {
    if (m > 0 && m % 12 === 0) pay *= 1 + step / 100;
    value = (value + pay) * (1 + i); invested += pay;
    if ((m + 1) % 12 === 0) byYear.push({ year: (m + 1) / 12, invested, value });
  }
  return { invested, value, gain: value - invested, byYear };
}

/* One amount left to grow, compounded once a year. */
export function lumpsum({ amount, years, rate }) {
  amount = num(amount, 0, 1e12); years = num(years, 0, 60); rate = num(rate, 0, 40);
  const value = amount * Math.pow(1 + rate / 100, years);
  return { invested: amount, value, gain: value - amount };
}

/* The monthly instalment that reaches a target. */
export function goal({ target, years, rate }) {
  target = num(target, 0, 1e12); years = num(years, 0.0833, 60); rate = num(rate, 0, 40);
  const i = rate / 1200, n = Math.round(years * 12);
  const factor = i === 0 ? n : ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
  const monthly = factor ? target / factor : 0;
  return { monthly, invested: monthly * n, gain: target - monthly * n };
}

/* A loan repaid in equal monthly instalments (EMI), reducing balance. */
export function emi({ loan, rate, years }) {
  loan = num(loan, 0, 1e12); rate = num(rate, 0, 60); years = num(years, 0.0833, 40);
  const r = rate / 1200, n = Math.round(years * 12);
  const pay = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return { emi: pay, total: pay * n, interest: pay * n - loan };
}

/* What today's price becomes, and what today's money will buy, after years of rising prices. */
export function inflation({ amount, years, rate }) {
  amount = num(amount, 0, 1e12); years = num(years, 0, 60); rate = num(rate, 0, 30);
  const k = Math.pow(1 + rate / 100, years);
  return { future: amount * k, worth: amount / k };
}

/* The emergency fund: months of essential spending, what is still missing, and how long it takes to fill. */
export function emergency({ essentials, months, saved = 0, monthly = 0 }) {
  essentials = num(essentials, 0, 1e9); months = num(months, 1, 24); saved = num(saved, 0, 1e12); monthly = num(monthly, 0, 1e9);
  const target = essentials * months, gap = Math.max(0, target - saved);
  return { target, gap, covered: essentials ? saved / essentials : 0, monthsToFill: gap === 0 ? 0 : monthly > 0 ? Math.ceil(gap / monthly) : null };
}

/* Paying only part of a credit card bill each month: how long the debt lasts and what it costs. "pay" is a fixed amount a month. */
export function cardDebt({ balance, rate, pay }) {
  balance = num(balance, 0, 1e9); rate = num(rate, 0, 60); pay = num(pay, 0, 1e9);
  const r = rate / 1200; let b = balance, months = 0, interest = 0;
  if (pay <= b * r) return { months: null, interest: null, total: null };   /* the payment does not even cover the interest */
  while (b > 0.5 && months < 1200) { const int = b * r; interest += int; b = b + int - Math.min(pay, b + int); months++; }
  return { months, interest, total: balance + interest };
}

/* Retirement: the pot needed on the day work stops, and the monthly investing that builds it.
   Spending rises with prices until retirement and through it; the pot keeps earning "after" while it is drawn down. */
export function retirement({ age, retireAt, till, spend, inflationRate, before, after, saved = 0 }) {
  age = num(age, 15, 80); retireAt = num(retireAt, age + 1, 85); till = num(till, retireAt + 1, 110);
  spend = num(spend, 0, 1e9); inflationRate = num(inflationRate, 0, 20); before = num(before, 0, 30); after = num(after, 0, 20); saved = num(saved, 0, 1e12);
  const yrs = retireAt - age, life = till - retireAt;
  const firstYear = spend * 12 * Math.pow(1 + inflationRate / 100, yrs);
  const real = (1 + after / 100) / (1 + inflationRate / 100) - 1;
  const corpus = Math.abs(real) < 1e-9 ? firstYear * life : firstYear * ((1 - Math.pow(1 + real, -life)) / real) * (1 + real);
  const have = saved * Math.pow(1 + before / 100, yrs), need = Math.max(0, corpus - have);
  return { corpus, firstYearSpend: firstYear, monthlySpendThen: firstYear / 12, fromSavings: have, monthly: goal({ target: need, years: yrs, rate: before }).monthly };
}

/* Rupees the Indian way: ₹1,25,000; and in words for big numbers: ₹1.25 lakh, ₹2.4 crore. */
export const rupees = v => "₹" + Math.round(Number(v) || 0).toLocaleString("en-IN");
export function rupeesShort(v) {
  v = Number(v) || 0; const a = Math.abs(v), t = n => String(+n.toFixed(2));
  if (a >= 1e7) return "₹" + t(v / 1e7) + " crore";
  if (a >= 1e5) return "₹" + t(v / 1e5) + " lakh";
  return rupees(v);
}
