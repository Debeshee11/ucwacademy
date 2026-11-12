COURSE = dict(id="bonds-gsecs", level="practitioner", title="Bonds, G-Secs and fixed income instruments", sec="assets", track="fixed", topic="Bonds", tag="Bonds",
  blurb="How bonds work, what moves their prices, how government and corporate bonds differ, and how they compare with deposits.",
  hook="Bonds look simple until rates move. Understanding yield, price and credit risk makes fixed income much clearer.",
  fun=["When interest rates rise, the price of existing bonds usually falls.", "Retail investors can buy government securities directly through an RBI platform."],
  traps=["Assuming bonds have no risk.", "Chasing yield without checking the credit rating.", "Ignoring how hard a bond may be to sell before maturity."],
  lessons=[
  dict(title="Bond basics", intro="A bond is a loan you give to a borrower in return for interest.", concepts=[
    ("Bond", "A bond is a loan an investor gives to a government or company, which promises interest and the return of the principal.", "An investor lends money to a company and receives interest and the principal back later."),
    ("Coupon", "A coupon is the regular interest a bond pays, usually stated as a percentage of face value.", "A security pays a fixed interest percentage every year."),
    ("Face value", "Face value is the amount printed on a bond that is repaid at maturity.", "A security printed at one lakh repays that amount at the end."),
    ("Maturity", "Maturity is the date on which the bond’s principal is repaid.", "A bond matures after ten years and returns the principal.")],
    client=("“Is a bond safer than a share?”", "A client new to fixed income."), talk="“A bond promises fixed payments, so it is usually less volatile than shares. It still has risks such as rate moves and credit risk.”", remember=["A bond is a loan.", "Coupon is the interest.", "Principal returns at maturity."]),
  dict(title="Yield, price and rates", intro="Bond prices move in the opposite direction to interest rates.", concepts=[
    ("Yield to maturity", "Yield to maturity is the annual return you earn if you buy a bond at its current price and hold it to maturity.", "A bond bought below face value has a higher yield than its coupon."),
    ("Interest rate risk", "Interest rate risk is the chance that rising rates push bond prices down.", "Prices of existing bonds fall when new bonds pay more interest."),
    ("Duration", "Duration measures how sensitive a bond’s price is to changes in interest rates, where a higher figure means more sensitivity.", "A long-term bond falls more than a short-term bond when rates rise."),
    ("Reinvestment risk", "Reinvestment risk is the chance that interest received must be reinvested at lower rates.", "A coupon is reinvested at a lower rate than before.")],
    client=("“Why did my bond fund fall when rates went up?”", "A client surprised by a drop."), talk="“When rates rise, existing bonds with lower coupons become less attractive, so their prices fall. Longer bonds fall more.”", remember=["Rates up, prices down.", "Duration shows sensitivity.", "Yield is not the coupon."]),
  dict(title="Government securities", intro="Government borrowing is a core part of the bond market.", concepts=[
    ("G-Sec", "A G-Sec is a government security, a bond issued by the central government with very low credit risk.", "An investor buys a ten-year government bond."),
    ("Treasury bill", "A treasury bill is a short-term government security sold at a discount and repaid at face value.", "A buyer pays less than face value and receives the full value at the end."),
    ("State development loan", "A state development loan is a bond issued by a state government to raise money.", "A state borrows by issuing bonds through an auction."),
    ("RBI Retail Direct", "RBI Retail Direct is a platform where individuals can buy government securities directly.", "A retail investor opens an account to buy a bond.")],
    client=("“Can I buy government bonds without a fund?”", "A client who wants to hold directly."), talk="“Yes, through the RBI’s retail platform. You hold the bond until maturity or sell it in the market, where the price can move.”", remember=["G-Secs have low credit risk.", "T-bills are short term.", "Direct buying is possible."]),
  dict(title="Corporate bonds and credit", intro="Companies pay more than governments because they carry more risk.", concepts=[
    ("Credit rating", "A credit rating is an agency’s opinion of how likely a borrower is to repay on time.", "A bond with a high rating is seen as safer than one with a low rating."),
    ("Default risk", "Default risk is the chance that a borrower fails to pay interest or principal.", "A company misses an interest payment."),
    ("Corporate bond", "A corporate bond is a bond issued by a company, which usually pays more than a government bond because of added risk.", "A firm raises money by selling bonds to investors."),
    ("Liquidity risk", "Liquidity risk is the difficulty of selling an investment quickly at a fair price.", "An investor cannot find a buyer for a little-traded bond.")],
    client=("“This bond pays much more than a deposit. Why not buy it?”", "A client drawn by high yield."), talk="“Higher yield usually means higher risk. Check the rating, the company’s finances and how easily you can sell before buying.”", remember=["High yield means high risk.", "Check ratings.", "Liquidity matters."]),
  dict(title="Deposits, debentures and ladders", intro="Several fixed income choices sit next to bonds.", concepts=[
    ("Fixed deposit", "A fixed deposit is a bank deposit that pays fixed interest for a set period, and deposits are insured up to a limit per depositor per bank.", "A saver places money in a one-year bank deposit."),
    ("NCD", "An NCD is a non-convertible debenture, a company bond that cannot be converted into shares.", "A finance company raises funds by selling debt that cannot be turned into shares."),
    ("Floating rate bond", "A floating rate bond is a bond whose interest resets with a benchmark rate.", "A bond’s coupon rises when the benchmark rate rises."),
    ("Bond laddering", "Bond laddering is buying bonds with different maturities so that money comes back at regular intervals.", "An investor holds bonds maturing in one, three and five years.")],
    client=("“Should I put everything in one deposit?”", "A client with a large sum."), talk="“Spreading across banks, maturities and instruments reduces risk. A ladder gives you cash at regular points.”", remember=["Deposit insurance has a limit.", "NCDs carry credit risk.", "Ladders spread maturities."]),
  ])
