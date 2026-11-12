/* The fun words: a title each learner can wear, a one-line brag and ready-to-post captions. No promises about money or exams, only about learning. */
const BY_COURSE = {
  "mf-foundations": "Mutual Fund Explorer", regulation: "Rulebook Ranger", "financial-maths": "Compounding Wizard", "sip-planning": "SIP Strategist", "equity-funds": "Equity Fund Navigator",
  "economy-markets": "Market Mapper", "hybrid-funds": "Balance Master", "passive-etf": "Index Insider", "debt-funds": "Fixed Income Pilot", "multi-asset": "Allocation Architect",
  behaviour: "Mind over Market", "gold-silver": "Precious Metals Pro", defence: "Defence Sector Scout", "reit-invit": "Real Asset Ranger", "fund-analysis": "Fund Detective",
  "pms-aif-sif": "Structures Specialist", "tax-retirement": "Retirement Planner", "stock-basics": "Market Opener", "company-fundamentals": "Balance Sheet Reader",
  "futures-explained": "Futures Fluent", "options-explained": "Options Aware", "term-life-insurance": "Protection Planner", "health-insurance-basics": "Cover Champion",
  "budgeting-emergency-fund": "Budget Boss", "loans-credit-scores": "Credit Smart", "nri-banking-investing": "Global Indian Investor",
  "nri-tax-residency": "Borderless Tax Navigator", "nri-investing-routes": "NRI Route Master", "global-investing": "Global Portfolio Pilot", "tax-on-investments": "Tax Smart Investor", "retirement-epf-ppf-nps": "Retirement Architect",
  "general-insurance": "Safety Net Builder", "scam-safety": "Scam Slayer", "wealth-succession": "Legacy Keeper", "bonds-gsecs": "Bond Boss", "ipo-investing": "IPO Insider"
};
const BY_LEVEL = { foundation: "Money Starter", practitioner: "Money Practitioner", expert: "Money Expert", pro: "UpperCrust Professional" };
export const nick = c => (c.kind === "course" && BY_COURSE[c.key]) || (c.kind === "level" ? BY_LEVEL[c.level] + " Level" : BY_LEVEL[c.kind === "pro" ? "pro" : c.level]) || "Money Learner";

const GRADE = s => (s >= 90 ? "with Distinction" : s >= 80 ? "with Merit" : "");
export const grade = s => GRADE(Number(s) || 0);

/* A short line about the journey, built from real numbers only. */
export const brag = (c, st) => {
  const bits = [];
  if (st.lessons) bits.push(`${st.lessons} lessons finished`);
  if (st.streak > 1) bits.push(`${st.streak}-day streak`);
  bits.push(`${c.score}% in the assessment`);
  return bits.join("  ·  ");
};

/* Captions people can copy. Each ends with the verification link so anyone can check it. */
export function captions(c, name, url) {
  const t = nick(c), g = grade(c.score), what = c.kind === "course" ? `the ${c.title} course` : c.title;
  return {
    whatsapp: `I just earned my "${t}" title at UpperCrust Academy ${g}! ${c.score}% on ${what}. Check it here: ${url}`.replace(/\s+/g, " "),
    linkedin: `Proud to share that I completed ${what} at UpperCrust Academy and earned the title "${t}"${g ? " " + g : ""}.\n\nWhat I took from it: how to think about money clearly, ask better questions and avoid common mistakes.\n\nThis is a learning credential and not financial advice. Verify it here: ${url}\n\n#FinancialLiteracy #Learning #UpperCrustAcademy`,
    short: `${t} unlocked at UpperCrust Academy${g ? " " + g : ""}. ${c.score}% score. ${url}`
  };
}
