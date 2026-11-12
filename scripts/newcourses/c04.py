COURSE = dict(id="tax-on-investments", level="practitioner", title="Tax on investments: capital gains, TDS and returns", sec="basics", track="tax", topic="Tax", tag="Tax",
  blurb="How gains, interest and dividends are taxed, what TDS means, how losses help, and how to file with confidence.",
  hook="Returns you keep matter more than returns you see. Knowing the tax basics stops expensive surprises.",
  fun=["You pay tax on a gain only when you sell, not while the price rises.", "A loss can be carried forward to offset future gains if you file on time."],
  traps=["Ignoring tax when comparing funds and deposits.", "Treating TDS as the full tax bill.", "Missing the return deadline and losing the carry-forward of losses."],
  lessons=[
  dict(title="Capital gains basics", intro="A capital gain is the profit on selling an asset. Timing and type decide the tax.", concepts=[
    ("Capital gain", "A capital gain is the profit made when you sell an asset for more than its cost.", "An investor sells shares for more than she paid."),
    ("Holding period", "Holding period is the time between buying and selling an asset, which decides whether the gain is short term or long term.", "Units sold after a longer holding are treated differently from units sold quickly."),
    ("Cost of acquisition", "Cost of acquisition is the price you paid for the asset, plus certain costs, used to work out the gain.", "The purchase price of a fund unit is subtracted from the sale value."),
    ("Realised gain", "A realised gain is a profit locked in by selling, and only such profits are taxed.", "A rise in portfolio value is not taxed until units are sold.")],
    client=("“My portfolio is up. Do I owe tax now?”", "A client worried about unsold gains."), talk="“Tax usually comes only when you sell. A rise on paper is not taxed until you realise it, but the type of asset and holding period decide the rate.”", remember=["Tax applies on sale.", "Holding period matters.", "Cost is subtracted from sale value."]),
  dict(title="Tax on shares and funds", intro="Different investments are taxed differently. Rates and limits are set by law and change, so always check the current rule.", concepts=[
    ("Equity capital gains", "Equity capital gains are gains on listed shares and equity-oriented funds, taxed at rates that differ for short and long holding.", "A long-term investor in an equity fund pays tax on gains at the long-term rate."),
    ("Debt fund taxation", "Debt fund taxation is the treatment of gains from funds investing mostly in debt, which for many such funds is taxed at the investor’s slab rate.", "An investor in a debt fund adds the gain to her income."),
    ("Dividend taxation", "Dividend taxation means dividends are added to your income and taxed at your slab rate.", "A fund dividend raises the investor’s taxable income."),
    ("STT", "STT, or securities transaction tax, is a tax charged on buying or selling listed shares and units of equity funds.", "A small tax is added to every trade on the exchange.")],
    client=("“Is a debt fund taxed like an equity fund?”", "A client comparing two funds."), talk="“Not usually. The tax rule depends on the type of fund and what the law currently says. Let us check the current rule before you decide.”", remember=["Rules differ by fund type.", "Dividends are taxable.", "Check current rates."]),
  dict(title="TDS and statements", intro="TDS is tax paid in advance by someone else. Statements show what was paid.", concepts=[
    ("TDS", "TDS is tax deducted at source by the payer before income reaches you.", "A bank cuts tax on fixed deposit interest above a limit."),
    ("Form 26AS and AIS", "Form 26AS and AIS are statements that show tax deducted on your PAN and many of your income transactions.", "A taxpayer checks these before filing to match the numbers."),
    ("Interest taxability", "Interest taxability means interest on deposits is added to income and taxed at your slab rate.", "Fixed deposit interest is taxed even if you reinvest it."),
    ("Forms 15G and 15H", "Forms 15G and 15H are declarations that ask a bank not to deduct tax because your total income is below the taxable limit.", "A retired person submits Form 15H to avoid TDS on interest.")],
    client=("“The bank cut tax on my FD. Is that all I owe?”", "A client who thinks TDS ends the matter."), talk="“TDS is only an advance payment. Your final tax depends on your total income. Check the statements, then add or claim back the difference when you file.”", remember=["TDS is not the final tax.", "Check AIS before filing.", "Declarations can avoid TDS."]),
  dict(title="Losses and advance tax", intro="Losses can reduce tax if you use them properly.", concepts=[
    ("Set-off", "Set-off is adjusting a loss against a gain of the same or allowed type in the same year.", "A loss on one share reduces the gain on another."),
    ("Carry forward", "Carry forward is moving an unused loss to later years to offset future gains, usually only if the return was filed on time.", "A loss this year is used against next year’s gain."),
    ("Tax-loss harvesting", "Tax-loss harvesting is selling an investment at a loss to offset gains, done carefully and without losing sight of the investing plan.", "An investor books a loss on a fund to reduce tax on a profit."),
    ("Advance tax", "Advance tax is tax paid in instalments during the year when the liability is above a threshold.", "A person with large capital gains pays tax before year end.")],
    client=("“I lost money on a stock. Is there any use?”", "A client with a loss."), talk="“A loss can often reduce tax on gains, now or in later years. To carry it forward you need to file your return on time.”", remember=["Losses can offset gains.", "File on time to carry forward.", "Pay advance tax if due."]),
  dict(title="Regimes and filing", intro="Choosing a regime and filing on time keeps you clear with the tax office.", concepts=[
    ("Old and new regime", "The old and new regimes are two ways of computing tax, where the old allows more deductions and the new offers different slab rates.", "A taxpayer compares both to see which gives a lower bill."),
    ("Deduction", "A deduction is an amount the law allows you to subtract from income to reduce tax.", "A qualifying investment reduces taxable income under the old regime."),
    ("ELSS lock-in", "ELSS lock-in is the three-year period during which units of an ELSS tax-saving fund cannot be redeemed.", "An investor buys an ELSS fund and cannot sell for three years."),
    ("Filing deadline", "A filing deadline is the last date to submit a return without penalty, and missing it can cost you loss carry-forward.", "A taxpayer files before the due date to carry forward a loss.")],
    client=("“Which regime should I choose?”", "A salaried client at filing time."), talk="“Compare both with your real numbers. If you use many deductions the old one may win. If not, the new one can be simpler.”", remember=["Compare both regimes.", "ELSS locks money for three years.", "Deadlines protect loss carry-forward."]),
  ])
