/* The path each kind of learner follows: stages, each a small set of courses followed by that stage's exam.
   A stage is one chunk: finish its lessons, then sit its exam, then move on. Courses that are not written yet are named with `+`
   (they appear as "Being written" and never block a stage). Beginner stages are in plain words; adviser material waits for the pro doors. */
const S = (t, g, c) => ({ t, g, c });
export const CURRICULUM = {
  student: [
    S("Money habits", "Spend, save and stay safe before your first salary.", ["budgeting-emergency-fund", "scam-safety"]),
    S("Borrowing and credit", "What a loan really costs and how a credit score works.", ["loans-credit-scores"]),
    S("Your first investments", "Mutual funds, SIPs and shares in plain words.", ["+mf-start", "sip-planning", "stock-basics"]),
    S("Taxes and the bigger picture", "Tax on gains, IPOs and the habits that decide results.", ["tax-on-investments", "ipo-investing", "behaviour"])],
  firstjob: [
    S("First salary, first rules", "A budget, an emergency fund and fraud safety.", ["budgeting-emergency-fund", "scam-safety"]),
    S("Protect yourself", "Health and term cover, bought the right way.", ["health-insurance-basics", "term-life-insurance"]),
    S("Start investing", "Mutual funds, debt and a first SIP.", ["+mf-start", "+debt-start", "sip-planning"]),
    S("Tax, retirement and loans", "Keep more, plan ahead, borrow wisely.", ["tax-on-investments", "retirement-epf-ppf-nps", "loans-credit-scores"])],
  salaried: [
    S("Safety first", "A budget, an emergency fund and the cover your family needs.", ["budgeting-emergency-fund", "health-insurance-basics", "term-life-insurance"]),
    S("Start investing", "What a mutual fund, a SIP, debt and a bond are, and how to start.", ["+mf-start", "sip-planning", "+debt-start"]),
    S("Tax, retirement and credit", "Tax on gains, EPF, PPF, NPS, loans and your credit score.", ["tax-on-investments", "retirement-epf-ppf-nps", "loans-credit-scores"]),
    S("Build your portfolio", "Equity, hybrid and index funds, and how to mix them.", ["equity-funds", "hybrid-funds", "passive-etf", "behaviour"]),
    S("Protect and pass on", "General insurance, wills and nominees.", ["general-insurance", "wealth-succession"])],
  homemaker: [
    S("Household money", "A household budget, an emergency fund and scam safety.", ["budgeting-emergency-fund", "scam-safety"]),
    S("Cover the family", "Health, term and general insurance.", ["health-insurance-basics", "term-life-insurance", "general-insurance"]),
    S("Grow savings", "Gold, mutual funds and SIPs.", ["gold-asset", "+mf-start", "sip-planning"]),
    S("Loans and the future", "Borrowing well, and wills and nominees.", ["loans-credit-scores", "wealth-succession"])],
  business: [
    S("Separate you from the business", "A budget, credit and loans.", ["budgeting-emergency-fund", "loans-credit-scores"]),
    S("Cover the risks", "Business, health and life cover.", ["general-insurance", "health-insurance-basics", "term-life-insurance"]),
    S("Put surplus to work", "Mutual funds, debt and SIPs for spare cash.", ["+mf-start", "+debt-start", "sip-planning"]),
    S("Tax and succession", "Tax on gains, debt funds and passing wealth on.", ["tax-on-investments", "debt-funds", "wealth-succession"])],
  retiree: [
    S("Stay safe", "Scam safety and the health cover that protects savings.", ["scam-safety", "health-insurance-basics"]),
    S("Make savings last", "EPF, PPF, NPS, pensions and tax in retirement.", ["retirement-epf-ppf-nps", "tax-retirement"]),
    S("Steady income", "Debt, bonds and debt funds in plain words.", ["+debt-start", "bonds-gsecs", "debt-funds"]),
    S("Some growth", "Mutual funds and hybrid funds, with calm habits.", ["+mf-start", "hybrid-funds", "behaviour"]),
    S("Pass it on", "Wills, nominees and general insurance.", ["wealth-succession", "general-insurance"])],
  teacher: [
    S("Money habits", "Budgeting and safety.", ["budgeting-emergency-fund", "scam-safety"]),
    S("Investing basics", "Mutual funds, SIPs and tax.", ["+mf-start", "sip-planning", "tax-on-investments"]),
    S("Retirement and behaviour", "Pensions and money psychology.", ["retirement-epf-ppf-nps", "behaviour"])],
  global: [
    S("Banking and tax as an NRI", "Accounts, residency and tax.", ["nri-banking-investing", "nri-tax-residency"]),
    S("Investing from abroad", "Funds, shares, property and deposits.", ["nri-investing-routes", "+mf-start", "sip-planning"]),
    S("Going global", "Overseas markets and tax on gains.", ["global-investing", "tax-on-investments"])],
  mfd: [
    S("The rules", "How the industry works and what SEBI and AMFI require.", ["regulation", "mf-foundations"]),
    S("The products", "Equity, debt, hybrid and passive funds, and SIPs.", ["sip-planning", "equity-funds", "debt-funds", "hybrid-funds", "passive-etf"]),
    S("The advice", "Financial maths, behaviour, allocation and fund analysis.", ["financial-maths", "behaviour", "multi-asset", "fund-analysis"])],
  ria: [
    S("Rules and maths", "SEBI's adviser rules and the maths behind advice.", ["regulation", "financial-maths"]),
    S("Products and behaviour", "Fund analysis, debt, allocation and client behaviour.", ["fund-analysis", "behaviour", "debt-funds", "multi-asset"]),
    S("Planning and structures", "Tax, retirement, estates, PMS, AIF and SIF.", ["tax-retirement", "wealth-succession", "pms-aif-sif"])],
  analyst: [
    S("Markets and the economy", "How markets work and what drives them.", ["stock-basics", "economy-markets", "financial-statements"]),
    S("Company and sector analysis", "Fundamentals, valuation and industries.", ["company-fundamentals", "valuation-methods", "industry-analysis"]),
    S("Charts and derivatives", "Technical analysis, futures and options.", ["technical-analysis", "futures-explained", "options-explained"]),
    S("Research and funds", "Research rules and fund analysis.", ["research-reports-sebi", "fund-analysis"])],
  partner: [
    S("Ideas to teach", "Budgeting, safety and the first steps in investing.", ["budgeting-emergency-fund", "scam-safety", "+mf-start", "sip-planning"]),
    S("Markets and products", "Shares, equity, debt and hybrid funds.", ["stock-basics", "equity-funds", "debt-funds", "hybrid-funds"]),
    S("Advice skills", "Behaviour, tax and fund analysis.", ["behaviour", "tax-on-investments", "fund-analysis"])],
  team: [
    S("The rules", "How the industry works and what SEBI and AMFI require.", ["regulation", "mf-foundations"]),
    S("The products", "Equity, debt, hybrid and passive funds, and SIPs.", ["sip-planning", "equity-funds", "debt-funds", "hybrid-funds", "passive-etf"]),
    S("The advice", "Financial maths, behaviour, allocation and fund analysis.", ["financial-maths", "behaviour", "multi-asset", "fund-analysis"])],
  planner: [
    S("Planning maths and tax", "Goal maths, tax and retirement schemes.", ["financial-maths", "tax-retirement", "retirement-epf-ppf-nps"]),
    S("Risk cover", "Life, health and general insurance.", ["term-life-insurance", "health-insurance-basics", "general-insurance"]),
    S("Wealth and behaviour", "Estates, client behaviour, funds and structures.", ["wealth-succession", "behaviour", "fund-analysis", "pms-aif-sif"])]
};
/* Doors with no stages of their own get their ordered list cut into chunks of three. */
export function stagesFor(door, trackIds) {
  if (door && CURRICULUM[door.id]) return CURRICULUM[door.id];
  const ids = trackIds && trackIds.length ? trackIds : [], out = [];
  for (let i = 0; i < ids.length; i += 3) out.push(S("Stage " + (out.length + 1), "The next courses on your path.", ids.slice(i, i + 3)));
  return out;
}
