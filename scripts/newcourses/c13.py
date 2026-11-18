COURSE = dict(id="technical-analysis", level="foundation", title="Technical analysis", sec="stocks", track="research", topic="Technical analysis", tag="TECH",
  blurb="Read charts, trends and indicators, and understand what technical analysis can and cannot tell you.",
  hook="Charts show what buyers and sellers did. Learn to read them without treating them as magic.",
  fun=["Technical analysis studies price and volume, not company accounts.", "Most charting tools work on past prices, so they give odds, not certainty."],
  traps=["Treating an indicator signal as a guaranteed forecast.", "Trading without deciding the exit in advance.", "Using one indicator alone without confirmation."],
  lessons=[
  dict(title="Reading a chart", intro="A chart turns thousands of trades into a picture of price over time.", concepts=[
    ("Candlestick", "A candlestick shows the open, high, low and close of a share for one time period.", "A single daily bar shows where the price began, how far it moved and where it ended."),
    ("Trend", "A trend is the general direction of price over time, which can be up, down or sideways.", "A share has made higher peaks and higher lows for six months."),
    ("Timeframe", "Timeframe is the length of time each candle on a chart covers, such as a day or a week.", "A trader checks the weekly chart for direction and the hourly chart for entry."),
    ("Volume", "Volume is the number of shares traded in a period.", "On a breakout day, three times the usual number of shares change hands.")],
    client=("“My friend says the chart looks bullish. What does that mean?”", "A client hearing chart talk."), talk="“It means the price pattern shows buyers in control. It is an observation about price, not a promise about the company.”", remember=["Trend is the direction.", "Volume shows participation.", "Charts show price, not profits."]),
  dict(title="Support, resistance and patterns", intro="Prices often react at levels where many traders made decisions before.", concepts=[
    ("Support", "Support is a price level where buying has tended to stop a fall.", "A share has bounced three times near ₹480."),
    ("Resistance", "Resistance is a price level where selling has tended to stop a rise.", "A share has failed to cross ₹620 on several attempts."),
    ("Breakout", "A breakout is a move of price through a support or resistance level, ideally with strong volume.", "A share closes above its long-standing ceiling on heavy trading."),
    ("Head and shoulders", "Head and shoulders is a chart pattern of three peaks with the middle one highest, often seen as a sign of a trend reversal.", "A rally makes a peak, a higher peak, then a lower peak before prices turn down.")],
    client=("“It broke the support level. Should I sell now?”", "A client alarmed by a chart move."), talk="“A broken level is a warning, not a verdict. We look for confirmation and recheck our reason for holding.”", remember=["Support holds price up.", "Resistance caps price.", "Wait for confirmation."]),
  dict(title="Trend indicators", intro="Indicators turn price history into simple signals.", concepts=[
    ("Moving average", "A moving average is the average price over a set number of days, updated each day to smooth out noise.", "A 200-day line shows the long-term direction of a share."),
    ("Golden cross", "A golden cross is when a short-term moving average rises above a long-term one, taken as a bullish sign.", "The 50-day line crosses above the 200-day line."),
    ("MACD", "MACD is a trend indicator based on the gap between a fast and a slow moving average.", "A line built from a 12-day and a 26-day average crosses its signal line."),
    ("Trendline", "A trendline is a straight line drawn along a series of lows or highs to show the direction of a trend.", "A line joining the last four higher lows slopes upwards.")],
    client=("“The 50-day line crossed the 200-day line. Is it time to buy?”", "A client acting on a single signal."), talk="“It is one signal. It lags the price, so we combine it with volume and the business story before acting.”", remember=["Averages smooth the noise.", "Signals lag the price.", "Combine more than one tool."]),
  dict(title="Momentum and volume tools", intro="Momentum shows how strongly a price is moving.", concepts=[
    ("RSI", "RSI is a momentum indicator from 0 to 100 that shows how fast and how far a price has recently moved.", "A reading above 70 hints that a rally may be stretched."),
    ("Overbought", "Overbought describes a share that has risen quickly and may be due for a pause or a fall.", "After a sharp week-long rally, momentum readings are very high."),
    ("VWAP", "VWAP is the average price of a share over a day, weighted by the volume traded at each price.", "An intraday trader compares the current price with the day's volume-weighted average."),
    ("Divergence", "Divergence is when price and an indicator move in opposite directions, hinting that the trend may be weakening.", "A share makes a new high but its momentum reading makes a lower high.")],
    client=("“The RSI is above 70, so should we sell everything?”", "A client reacting to one indicator."), talk="“A high reading says the move is stretched, not that it must reverse. Strong trends can stay stretched for a long time.”", remember=["RSI measures momentum.", "Overbought is not a sell order.", "Divergence is an early hint."]),
  dict(title="Using it with discipline", intro="Tools help only when you decide the rules before the trade.", concepts=[
    ("Stop-loss", "A stop-loss is a preset price at which a position is closed to limit the loss.", "A trader decides in advance to exit if the share falls five per cent from entry."),
    ("Risk-reward ratio", "Risk-reward ratio compares the possible loss on a trade with the possible gain.", "A trade risks ₹10 to try to make ₹30."),
    ("Confirmation", "Confirmation is waiting for a second signal, such as volume or a close beyond a level, before acting.", "A trader waits for a strong close above the ceiling before buying."),
    ("Backtesting", "Backtesting is testing a trading rule on past data to see how it would have performed.", "An analyst checks how a crossover rule would have done over ten years of prices.")],
    client=("“Can charts predict the market?”", "A client curious about forecasts."), talk="“Charts help us read what buyers and sellers are doing and plan the risk. They do not predict the future, so we use them with an exit plan.”", remember=["Decide the exit first.", "Size the risk.", "Charts give odds, not certainty."]),
  ])
