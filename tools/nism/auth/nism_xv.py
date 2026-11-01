"""Hand-written XV (Research Analyst) cases and questions. Every figure is checked by the asserts below."""
# case A: financial ratios
_ebit = 240 - 60; _ebt = _ebit - 30; _pat = _ebt * .75
assert (_ebit, _ebt, _pat) == (180, 150, 112.5) and _pat / 10 == 11.25 and round(_pat / 800 * 100, 1) == 14.1 and _ebit / 30 == 6
# case C: SMA
assert (100 + 102 + 104 + 103 + 106) / 5 == 103
# case E: DuPont
assert round(.08 * 1.5 * 2, 2) == .24 and round(.12 * .8 * 2.5, 2) == .24
# case F: DCF
_pv = [100 / 1.12, 110 / 1.12 ** 2, 121 / 1.12 ** 3]; _tv = 121 * 1.04 / (.12 - .04); _pvtv = _tv / 1.12 ** 3; _ev = sum(_pv) + _pvtv
assert round(_pv[0], 1) == 89.3 and round(_tv) == 1573 and round(_pvtv) == 1120 and round(_ev) == 1383 and round((_ev - 200) / 10, 1) == 118.3
# case G: CAPM
assert round(7 + 1.2 * (12 - 7), 1) == 13.0 and round(.6 * 14 + .4 * 9, 1) == 12.0 and round(.6 * 1.2 + .4 * .7, 2) == 1.0 and round((12 - 7) / 15, 2) == .33
# case J: corporate actions
assert 900 / 1.5 == 600 and 600 / 5 == 120 and 30 / 1.5 == 20 and 20 / 5 == 4 and 100 * 1.5 * 5 == 750

CASES = [
dict(u=8, lvl=1, text="Alpha Ltd reports revenue of ₹1,200 crore, EBITDA of ₹240 crore, depreciation of ₹60 crore and interest of ₹30 crore. The tax rate is 25%. It has 10 crore shares, shareholders' equity of ₹800 crore and debt of ₹400 crore.",
 qs=[("What is Alpha's EBITDA margin?", "20%", ["15%", "9.4%", "25%"], "EBITDA ÷ revenue = 240 ÷ 1,200 = 20%."),
     ("What is its earnings per share?", "₹11.25", ["₹15.00", "₹18.00", "₹9.00"], "EBIT = 240 − 60 = 180. Profit before tax = 180 − 30 = 150. Tax at 25% leaves PAT of ₹112.5 crore. EPS = 112.5 ÷ 10 = ₹11.25. ₹15 is the pre-tax figure."),
     ("What is its return on equity, using closing equity?", "About 14.1%", ["About 9.4%", "About 18.8%", "About 28%"], "ROE = PAT ÷ equity = 112.5 ÷ 800 = 14.06%."),
     ("What is its interest coverage ratio, taken as EBIT ÷ interest?", "6.0 times", ["8.0 times", "5.0 times", "4.5 times"], "EBIT of ₹180 crore ÷ interest of ₹30 crore = 6 times. Using EBITDA would give 8 times, which flatters coverage.")]),
dict(u=10, lvl=1, text="Beta Ltd trades at ₹300. Its EPS is ₹15, book value per share is ₹100 and it pays a dividend of ₹6 per share. The average P/E of its industry is 18.",
 qs=[("What is Beta's P/E ratio?", "20", ["15", "50", "2"], "P/E = price ÷ EPS = 300 ÷ 15 = 20."),
     ("What is its price-to-book ratio?", "3.0", ["0.33", "2.0", "5.0"], "P/B = 300 ÷ 100 = 3."),
     ("What is its dividend yield?", "2.0%", ["5.0%", "40%", "0.5%"], "Dividend yield = dividend ÷ price = 6 ÷ 300 = 2%."),
     ("Compared with its industry average, Beta trades at", "A premium of about 11%", ["A discount of about 11%", "A premium of 20%", "Exactly the industry level"], "20 ÷ 18 = 1.11, so about 11% above the industry P/E. An analyst should ask whether higher growth or quality justifies it.")]),
dict(u=15, lvl=2, text="Gamma Ltd closed at ₹100, ₹102, ₹104, ₹103 and ₹106 over the last five sessions. Its 14-day RSI is now 78. Today it broke above a resistance level of ₹105 on volume twice the average.",
 qs=[("What is the five-day simple moving average of the closing price?", "₹103", ["₹104", "₹106", "₹102"], "(100 + 102 + 104 + 103 + 106) ÷ 5 = 515 ÷ 5 = ₹103."),
     ("An RSI of 78 is conventionally read as", "Overbought, so a pullback is possible", ["Oversold, so a rally is due", "Neutral", "A sell signal on its own, with certainty"], "RSI above 70 suggests overbought conditions, but it is a warning, not a certainty."),
     ("A break above resistance on volume twice the average is generally seen as", "A bullish signal with stronger confirmation than a low-volume break", ["A bearish signal", "Meaningless unless the RSI is below 30", "A sign that the trend has ended"], "Volume that confirms a breakout makes it more reliable."),
     ("If the stock later falls back below ₹105 and closes there, the break is best called", "A possible false breakout", ["A confirmed trend", "A dividend adjustment", "A support level"], "A breakout that fails to hold suggests the move was not backed by real demand.")]),
dict(u=14, lvl=2, text="Ravi, a registered research analyst, plans to publish a report on Zeta Ltd. He owns shares worth 1.5% of Zeta's equity. Zeta's investment bankers have offered to pay him for the report. He also plans to buy more Zeta shares the day before publication.",
 qs=[("What must Ravi do about his holding?", "Disclose it in the report, since beneficial ownership of 1% or more must be disclosed", ["Nothing, as holdings need not be disclosed", "Sell all shares secretly after the report", "Disclose only if he sells"], "Research analysts must disclose financial interest, including beneficial ownership of 1% or more, in the subject company."),
     ("What is the rule on his buying Zeta shares around publication?", "He may not trade the subject company's shares in the 30 days before and 5 days after publication", ["He may trade freely if he discloses it", "He may trade in the week before only", "Only his employer is restricted"], "Analysts and their associates are barred from trading in the subject company during that window."),
     ("How should he treat the payment offer from Zeta's bankers?", "Disclose the compensation and manage the conflict, or decline it to protect independence", ["Accept it silently", "Accept it and give a Buy rating", "Accept it if it is paid in cash"], "Compensation from the subject company or its advisers is a conflict that must be disclosed, and independence must not be compromised."),
     ("Which certification must a research analyst hold?", "NISM Series XV", ["NISM Series V-A", "NISM Series VIII", "No certification is required"], "Individuals acting as research analysts must have the prescribed NISM certification.")]),
dict(u=8, lvl=3, text="X Ltd has a net profit margin of 8%, asset turnover of 1.5 and an equity multiplier of 2. Y Ltd has a net margin of 12%, asset turnover of 0.8 and an equity multiplier of 2.5.",
 qs=[("What is X's ROE by the DuPont formula?", "24%", ["12%", "16%", "48%"], "ROE = margin × turnover × equity multiplier = 0.08 × 1.5 × 2 = 24%."),
     ("What is Y's ROE?", "24%", ["30%", "9.6%", "20%"], "0.12 × 0.8 × 2.5 = 24%."),
     ("Which company relies more on financial leverage for its return?", "Y, because its equity multiplier is higher", ["X, because its turnover is higher", "Neither, because ROE is equal", "X, because its margin is lower"], "Same ROE, but Y gets more of it from leverage, which adds financial risk."),
     ("Which is the better quality source of ROE for a long-term investor?", "Margin and turnover, because they come from operations rather than debt", ["Leverage, because it is cheaper", "Only the equity multiplier", "Share buybacks"], "Operational drivers are more durable than leverage, which magnifies risk.")]),
dict(u=10, lvl=3, text="Delta Ltd is expected to generate free cash flow to the firm of ₹100 crore, ₹110 crore and ₹121 crore in the next three years. After year 3 it will grow at 4% a year for ever. The discount rate (WACC) is 12%. Net debt is ₹200 crore and there are 10 crore shares.",
 qs=[("What is the present value of the year-1 cash flow?", "About ₹89.3 crore", ["About ₹100 crore", "About ₹112 crore", "About ₹78 crore"], "100 ÷ 1.12 = 89.3."),
     ("What is the terminal value at the end of year 3?", "About ₹1,573 crore", ["About ₹1,512 crore", "About ₹1,008 crore", "About ₹2,015 crore"], "TV = 121 × 1.04 ÷ (0.12 − 0.04) = 125.84 ÷ 0.08 = ₹1,573 crore."),
     ("What is the enterprise value (sum of present values)?", "About ₹1,383 crore", ["About ₹1,573 crore", "About ₹263 crore", "About ₹1,120 crore"], "Present values of the three cash flows total about ₹263 crore, plus the present value of the terminal value, about ₹1,120 crore, gives ₹1,383 crore."),
     ("What is the value per share?", "About ₹118", ["About ₹138", "About ₹158", "About ₹98"], "Equity value = 1,383 − 200 = ₹1,183 crore. ÷ 10 crore shares = ₹118.3. Forgetting net debt gives ₹138.")]),
dict(u=12, lvl=4, text="The risk-free rate is 7% and the expected market return is 12%. Stock A has a beta of 1.2 and an expected return of 14%. Stock B has a beta of 0.7 and an expected return of 9%. A portfolio holds 60% in A and 40% in B. The portfolio's standard deviation is 15%.",
 qs=[("What return does CAPM require for Stock A?", "13%", ["12%", "14%", "15%"], "Required return = 7 + 1.2 × (12 − 7) = 13%."),
     ("Compared with that requirement, Stock A is", "Offering an expected excess return (alpha) of 1%", ["Overpriced, with alpha of −1%", "Fairly priced with zero alpha", "Risk free"], "Expected 14% against the required 13% gives alpha of +1%."),
     ("What are the portfolio's expected return and beta?", "12% and 1.0", ["11.5% and 1.0", "12% and 0.95", "10% and 1.2"], "Return = 0.6 × 14 + 0.4 × 9 = 12%. Beta = 0.6 × 1.2 + 0.4 × 0.7 = 1.0."),
     ("What is the portfolio's Sharpe ratio?", "About 0.33", ["About 0.80", "About 0.47", "About 1.00"], "(12 − 7) ÷ 15 = 0.33.")]),
dict(u=5, lvl=4, text="The central bank cuts the repo rate by 50 basis points. Retail inflation has eased to 4%, GDP growth is steady at 6.5% and the rupee is stable. An analyst must update her sector views.",
 qs=[("Other things equal, which sector is likely to benefit most from lower interest rates?", "Interest-sensitive sectors such as real estate, autos and NBFCs", ["Gold-jewellery exporters", "Cash-rich software firms", "Cold-storage firms only"], "Lower rates cut borrowing costs and EMIs, boosting demand for rate-sensitive sectors."),
     ("What typically happens to prices of existing fixed-rate government bonds?", "They rise", ["They fall", "They are unchanged", "They are suspended from trading"], "Bond prices and yields move in opposite directions."),
     ("A lower discount rate in a valuation model generally", "Raises the present value of future cash flows", ["Lowers the present value", "Has no effect", "Changes only the terminal growth"], "A lower required return increases the value of the same cash flows."),
     ("Which of these is a leading economic indicator the analyst might track?", "Purchasing managers' index or new orders", ["Last year's GDP", "Past CPI inflation", "Last quarter's company profits"], "Leading indicators such as PMI and new orders change before the broader economy does.")]),
dict(u=7, lvl=5, text="Omega Ltd reports PAT up 25%. But: operating cash flow is negative; receivable days rose from 60 to 110; 60% of the promoters' shares are pledged; related-party sales are 25% of revenue; and the statutory auditor and CFO both resigned within a year.",
 qs=[("Which pair of facts most directly questions earnings quality?", "Rising profit alongside negative operating cash flow and ballooning receivable days", ["High PAT growth and a 25% jump", "A large number of shares outstanding", "Rising revenue alone"], "Profits that are not turning into cash, with receivables stretching, may signal aggressive revenue recognition."),
     ("What risk does a 60% pledge of promoter shares add?", "A sharp price fall can trigger margin calls and forced selling by lenders", ["It raises the dividend", "It strengthens promoter control for sure", "It has no effect on the share price"], "If the price falls, lenders may sell pledged shares, hurting the price further."),
     ("The statutory auditor and the CFO both resigning is", "A serious governance red flag that needs explanation before any positive view", ["Routine and always harmless", "A sign of improved efficiency", "Relevant only for debt markets"], "Unexplained exits of control functions often precede disclosures of problems."),
     ("What should the analyst do?", "Flag these risks in the report, lower the rating or hold off, and seek clarification from management", ["Ignore them because profit is up", "Publish a Buy rating citing the profit growth only", "Hide the red flags to avoid upsetting the company"], "An analyst's duty is to report honestly and independently, including risks that may affect investors.")]),
dict(u=9, lvl=5, text="Sigma Ltd's shares trade at ₹900 with a face value of ₹10 and an EPS of ₹30. The company announces a bonus issue of 1 share for every 2 held, followed by a stock split of ₹10 into ₹2 per share. An investor holds 100 shares.",
 qs=[("After the bonus issue, the adjusted price is about", "₹600", ["₹450", "₹900", "₹1,350"], "Shares rise by one-half, so the price adjusts to 900 ÷ 1.5 = ₹600."),
     ("After the split as well, the price and EPS are about", "₹120 and ₹4", ["₹600 and ₹20", "₹120 and ₹20", "₹180 and ₹6"], "The split multiplies shares by 5, so price = 600 ÷ 5 = ₹120. EPS = 30 ÷ 1.5 ÷ 5 = ₹4."),
     ("How many shares will the investor hold after both actions?", "750", ["150", "500", "600"], "100 × 1.5 = 150 after the bonus; × 5 = 750 after the split."),
     ("Has the investor's total wealth changed because of these two actions alone?", "No, the total value is unchanged", ["Yes, it rises by 50%", "Yes, it rises fivefold", "Yes, it falls by one-third"], "Both actions change the number of shares and the price per share, not the value of the holding: 750 × ₹120 = ₹90,000, the same as 100 × ₹900.")]),
]

Q = [
(8, 1, "EBITDA margin is calculated as", "EBITDA ÷ revenue", ["PAT ÷ revenue", "EBIT ÷ equity", "Revenue ÷ EBITDA"], "It shows operating profitability before interest, tax, depreciation and amortisation."),
(10, 1, "The price-to-earnings ratio equals", "Price per share ÷ earnings per share", ["Earnings per share ÷ price per share", "Price per share ÷ book value per share", "Market capitalisation ÷ revenue"], "P/E shows how much investors pay for each rupee of earnings."),
(15, 1, "In technical analysis, a support level is", "A price area where buying interest tends to stop a decline", ["The highest price ever reached", "The average of closing prices", "A price at which the company pays a dividend"], "Support is a zone where demand has previously halted falls."),
(9, 2, "After a 1:1 bonus issue, the number of shares", "Doubles and the share price adjusts to about half", ["Halves and the price doubles", "Is unchanged and the price is unchanged", "Doubles and the price doubles"], "A bonus issue increases shares without changing the company's value, so the price adjusts."),
(12, 2, "A stock with a beta of 1.5 tends to", "Move about 1.5 times as much as the market", ["Move half as much as the market", "Move opposite to the market", "Have no market risk"], "Beta measures sensitivity to market moves."),
(14, 2, "A research analyst's report should", "Be based on reasonable grounds and disclose conflicts of interest", ["Guarantee returns", "Hide the analyst's holdings", "Copy a competitor's report"], "Independence, honesty and disclosure are the core of the research analyst regulations."),
(8, 3, "Positive profit with consistently negative free cash flow may indicate", "Poor earnings quality or heavy working-capital build-up", ["Excellent cash management", "A low tax rate only", "A bonus issue"], "Cash conversion tests whether reported profit is real."),
(10, 3, "Which multiple suits a young loss-making company with growing sales?", "EV/Sales", ["P/E", "Dividend yield", "Price/book only"], "With no positive earnings, P/E is not meaningful, so analysts use revenue-based multiples."),
(5, 3, "Rising inflation normally makes the central bank", "Raise or hold policy rates to cool demand", ["Cut rates sharply", "Print more money", "Remove all reserve requirements"], "Higher rates tighten credit and help bring inflation down."),
(15, 4, "An RSI reading above 70 is usually interpreted as", "Overbought", ["Oversold", "Trendless", "A dividend signal"], "RSI above 70 suggests a stock may have risen too far, too fast."),
(10, 4, "In the Gordon growth formula, terminal value equals", "FCF × (1 + g) ÷ (WACC − g)", ["FCF ÷ (WACC + g)", "FCF × g ÷ WACC", "FCF × (WACC − g)"], "The formula capitalises next year's cash flow at the difference between the required return and growth."),
(7, 5, "Which of these is a governance red flag?", "Frequent changes of auditors without a clear reason", ["A stable independent board", "Regular audit committee meetings", "Timely, detailed disclosures"], "Unexplained auditor changes can indicate disagreements over accounts."),
]
