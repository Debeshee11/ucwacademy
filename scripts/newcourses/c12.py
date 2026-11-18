COURSE = dict(id="valuation-methods", level="practitioner", title="Valuation methods", sec="stocks", track="research", topic="Valuation", tag="VAL",
  blurb="Value a business with discounted cash flows, multiples and sum-of-the-parts, and test how sure you really are.",
  hook="Price is what you pay. Value is what you estimate. Learn the main ways to estimate it and how to test the estimate.",
  fun=["A small change in the discount rate can move a discounted cash flow value by a lot.", "Two analysts can use the same data and reach different values because their assumptions differ."],
  traps=["Treating a single target price as a certain outcome.", "Using a multiple without comparing like-for-like companies.", "Ignoring how sensitive the answer is to the assumptions."],
  lessons=[
  dict(title="Value versus price", intro="Price is what the market asks today. Value is what the business may be worth.", concepts=[
    ("Intrinsic value", "Intrinsic value is the estimated worth of a business based on the cash it can generate in future.", "An analyst estimates a company is worth ₹800 a share even though it trades at ₹650."),
    ("Market price", "Market price is the price at which a share trades on the exchange right now.", "A share changes hands at ₹650 this morning."),
    ("Margin of safety", "Margin of safety is the gap between the estimated value and the price paid, which protects against errors.", "An investor buys only when the price is well below her own estimate of worth."),
    ("Time value of money", "Time value of money is the idea that a rupee today is worth more than a rupee received later.", "Receiving ₹100 now is preferred to receiving ₹100 after five years.")],
    client=("“The stock fell 20%. Is it cheap now?”", "A client judging by price alone."), talk="“A lower price is not the same as good value. Compare it with an estimate of what the business is worth, and how sure we are of that estimate.”", remember=["Price is what you pay.", "Value is an estimate.", "A cushion protects against errors."]),
  dict(title="Discounted cash flow", intro="This method adds up the cash a business will earn, after adjusting for time and risk.", concepts=[
    ("Free cash flow to the firm", "Free cash flow to the firm is the cash a business generates after expenses and investment, available to all its capital providers.", "A company has ₹200 crore left after paying costs, tax and new investment, before paying lenders."),
    ("Discount rate", "Discount rate is the yearly return used to convert future cash into today's value, reflecting risk.", "A riskier business is valued using 13% a year instead of 10%."),
    ("Terminal value", "Terminal value is the estimated worth of all cash flows beyond the forecast period.", "After projecting ten years, an analyst adds one figure for everything that comes later."),
    ("WACC", "WACC is the weighted average cost of a company's debt and equity, often used as the discount rate.", "A firm funded by cheap loans and costlier shareholder money blends both costs into one rate.")],
    client=("“Why do two analysts give different fair values for the same company?”", "A client confused by conflicting reports."), talk="“Small changes in growth and the discount rate move the answer a lot. Ask what each analyst assumed.”", remember=["Value is discounted future cash.", "The discount rate reflects risk.", "Terminal value is often the largest part."]),
  dict(title="Valuation multiples", intro="Multiples compare a price with earnings, sales or assets.", concepts=[
    ("Price to earnings", "Price to earnings is the share price divided by earnings per share.", "A share priced at ₹300 earns ₹15 a year, so buyers pay 20 times its yearly profit."),
    ("EV to EBITDA", "EV to EBITDA compares the value of the whole business, including debt, with its operating earnings.", "Two companies with different debt loads are compared on whole-business value against core profit."),
    ("Price to book", "Price to book is the share price divided by net worth per share, often used for banks.", "A bank share trades at ₹210 against ₹100 of net worth per share."),
    ("PEG ratio", "PEG ratio is the price-to-earnings multiple divided by the expected earnings growth rate.", "A share at 30 times earnings growing 30% a year gets a score of one.")],
    client=("“This stock has a P/E of 12. Isn't that cheap?”", "A client comparing two shares by one number."), talk="“Cheap or dear depends on growth, risk and the industry. Compare it with similar companies and its own history before deciding.”", remember=["Multiples need like-for-like peers.", "Banks are often judged on price to book.", "Growth changes what is a fair multiple."]),
  dict(title="Other methods", intro="Different businesses call for different tools.", concepts=[
    ("Sum of the parts", "Sum of the parts values each business of a group separately and adds the results.", "A conglomerate with telecom, retail and energy arms is valued arm by arm."),
    ("Asset-based valuation", "Asset-based valuation estimates worth from what a company owns minus what it owes.", "A land-rich firm is valued on the market value of its plots less its loans."),
    ("Dividend discount model", "Dividend discount model values a share as the present value of the dividends it is expected to pay.", "A mature utility that pays steady payouts is valued on the stream of those payouts."),
    ("Relative valuation", "Relative valuation judges a company by comparing it with similar companies.", "A paint maker is judged against other listed paint makers.")],
    client=("“The group has many businesses. How do I value it?”", "A client holding a diversified group."), talk="“We can value each business on its own and add them up, then compare with how the market prices the whole group.”", remember=["Use the method that fits the business.", "For groups, add up the parts.", "Steady payers suit dividend models."]),
  dict(title="Testing your answer", intro="A valuation is only as good as its assumptions. Test them.", concepts=[
    ("Sensitivity analysis", "Sensitivity analysis shows how the valuation changes when key assumptions are changed.", "An analyst shows the value at three growth rates and three discount rates."),
    ("Scenario analysis", "Scenario analysis values a company under distinct stories such as best, base and worst cases.", "A report gives separate values if demand booms, holds or collapses."),
    ("Target price", "Target price is an analyst's estimate of where a share may trade over a stated period.", "A report says the share could reach ₹900 in twelve months."),
    ("Valuation trap", "A valuation trap is a share that looks cheap on the numbers but is cheap because the business is getting worse.", "A share trades at a very low multiple because its profits keep shrinking.")],
    client=("“The target price is ₹900. Is that guaranteed?”", "A client treating a target as a promise."), talk="“A target price is an estimate with a range. It depends on assumptions that may not come true, so we check the downside as well.”", remember=["Test the assumptions.", "Think in ranges.", "A target price is not a promise."]),
  ])
