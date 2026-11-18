COURSE = dict(id="financial-statements", level="foundation", title="Reading financial statements", sec="stocks", track="research", topic="Financial statements", tag="STMT",
  blurb="Read the income statement, balance sheet and cash flow statement together, and spot weak quality of earnings.",
  hook="A company's numbers tell a story. Learn to read all three statements together instead of only the headline profit.",
  fun=["A company can report a profit and still run short of cash.", "The balance sheet always balances: what a company owns equals what it owes plus what belongs to its owners."],
  traps=["Looking only at profit and ignoring cash flow.", "Comparing standalone and consolidated numbers as if they were the same.", "Skipping the notes and the auditor's report."],
  lessons=[
  dict(title="The income statement", intro="It shows how much a company earned and kept over a period.", concepts=[
    ("Revenue", "Revenue is the money a company earns from selling its goods or services in a period.", "A mobile maker records the value of every phone it sold this quarter."),
    ("EBITDA", "EBITDA is profit before interest, tax, depreciation and amortisation, a rough measure of operating earnings.", "An analyst compares the core earnings of two factories without the effect of loans and write-offs."),
    ("Operating margin", "Operating margin is operating profit as a percentage of revenue.", "A firm keeps ₹14 of operating profit from every ₹100 of sales."),
    ("Net profit", "Net profit is what is left after all expenses, interest and tax, and it belongs to the shareholders.", "After paying suppliers, staff, the bank and the tax office, ₹8 crore remains.")],
    client=("“The company grew sales 20% but profit fell. Is that bad?”", "A client reading a results headline."), talk="“Sales growth is only the first line. Check the margin, which shows how much of each rupee of sales turns into profit.”", remember=["Revenue is the top line.", "Margin shows how much is kept.", "Net profit is the bottom line."]),
  dict(title="The balance sheet", intro="It is a photograph of what a company owns and owes on one day.", concepts=[
    ("Assets", "Assets are the things a company owns or is owed that have value, such as cash, stock, plants and customer dues.", "A retailer's shops, inventory and bank balance sit on one side of its balance sheet."),
    ("Liabilities", "Liabilities are the amounts a company owes to others, such as loans, supplier bills and taxes due.", "A firm has a bank loan and unpaid bills to its suppliers."),
    ("Shareholders' equity", "Shareholders' equity is what is left of the assets after all liabilities are paid, and it belongs to the owners.", "If a company owns ₹100 crore and owes ₹60 crore, the owners' stake is ₹40 crore."),
    ("Working capital", "Working capital is current assets minus current liabilities, the money tied up in day-to-day operations.", "A trader holds stock and customer dues but must also pay suppliers within weeks.")],
    client=("“The company has big profits but keeps borrowing. Why?”", "A client puzzled by rising debt."), talk="“Profit and borrowing can both rise when cash is locked in stock and unpaid customer bills. The balance sheet shows where the money is stuck.”", remember=["What a company owns equals what it owes plus equity.", "Working capital funds the daily business.", "Debt shows up on the owing side."]),
  dict(title="The cash flow statement", intro="It shows how cash actually moved, which profit alone cannot.", concepts=[
    ("Operating cash flow", "Operating cash flow is the cash a company generates from its core business after day-to-day payments.", "A manufacturer collects money from customers and pays staff and suppliers."),
    ("Capital expenditure", "Capital expenditure is money spent to buy or upgrade long-lasting assets such as plants and machinery.", "A cement maker builds a new kiln."),
    ("Free cash flow", "Free cash flow is the cash left after operating needs and capital spending, which can repay debt or reward owners.", "After running the business and buying new machines, ₹50 crore is left in the bank."),
    ("Cash conversion", "Cash conversion is the share of reported profit that turns into actual operating cash.", "A firm reports ₹100 crore of profit but collects only ₹60 crore of cash.")],
    client=("“The company reports record profit. Why is the stock not rising?”", "A client puzzled by a flat price."), talk="“Check whether the profit is turning into cash. Strong profit with weak cash flow can be a warning.”", remember=["Profit is not cash.", "Free cash flow comes after capital spending.", "Track cash conversion every year."]),
  dict(title="Quality of earnings", intro="Not all profit is equal. Some is repeatable and some is a one-off.", concepts=[
    ("Exceptional item", "An exceptional item is an unusual gain or loss that is not expected to repeat, such as the sale of a plot of land.", "A company books a large profit from selling land this quarter."),
    ("Accruals", "Accruals are income and expenses recorded when they are earned or incurred, not when cash moves.", "A firm books a sale in March but the customer pays in June."),
    ("Receivable days", "Receivable days is the average time a company takes to collect money from its customers.", "Customers who used to pay in 45 days now take 90 days."),
    ("Auditor's qualification", "An auditor's qualification is a remark in the audit report saying the accounts have a problem or that the audit was limited.", "The audit report says the auditor could not verify a large loan to a related firm.")],
    client=("“Profit jumped 60% this quarter. Should I buy more?”", "A client reacting to one strong quarter."), talk="“First check whether the jump is repeatable. One-off gains, slow-paying customers and audit remarks can make profit look better than the business is.”", remember=["Strip out one-offs.", "Rising receivable days is a warning.", "Read the audit report."]),
  dict(title="Reading the statements together", intro="The three statements connect. Read them as one story.", concepts=[
    ("Consolidated accounts", "Consolidated accounts combine the parent company and its subsidiaries into one set of numbers.", "A group with five subsidiaries reports a single combined profit."),
    ("Return on equity", "Return on equity is net profit divided by shareholders' equity, showing the profit earned on the owners' money.", "A firm earns ₹18 for every ₹100 of owners' capital in a year."),
    ("Debt to equity", "Debt to equity compares a company's borrowings with the owners' capital.", "A firm has borrowed ₹150 crore against ₹100 crore of owners' money."),
    ("Notes to accounts", "Notes to accounts are the explanations attached to financial statements, including accounting policies, contingent liabilities and related-party deals.", "A footnote reveals that the company guaranteed a loan taken by its promoter's other firm.")],
    client=("“Which single number tells me if a company is good?”", "A client looking for a shortcut."), talk="“No single number does. Read profit, cash flow and debt together, and read the notes. Each one checks the others.”", remember=["Use consolidated numbers for the group.", "Return on equity shows return on owners' money.", "Notes hide important facts."]),
  ])
