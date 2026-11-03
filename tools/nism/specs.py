# (module, numeric-generator map by unit number)
SPECS = [
 ("ex_xii", {2: ["mcap", "pe", "eps", "divy", "bonus", "split"], 3: ["ipo"], 5: ["nav", "ter", "exit", "sip"], 6: ["contract", "margin", "fut_pnl", "breakeven"], 7: ["fv", "pv"]}),
 ("ex_viii", {1: ["contract"], 3: ["fut_pnl", "contract", "margin"], 4: ["opt_net", "breakeven"], 5: ["opt_net", "breakeven"], 7: ["margin", "fut_pnl"]}),
 ("ex_xa", {3: ["nav", "ter", "units", "sip"], 6: ["fv", "pv", "cagr", "abs", "twr"], 4: ["pe", "divy"], 7: ["fv"], 10: ["fv", "pv"], 8: ["fv"], 5: ["sharpe", "capm"]}),
 ("ex_xv", {3: ["mcap"], 8: ["pe", "eps", "roe", "dscr", "ev"], 9: ["bonus", "split", "divy"], 10: ["pe", "ev", "capm", "fv", "pv"], 12: ["sharpe", "capm", "twr"], 2: ["mcap"]}),
 ("ex_xxia", {3: ["mcap", "pe", "eps", "roe", "divy"], 9: ["fv"], 10: ["twr", "sharpe", "abs", "cagr"], 1: ["fv", "pv"]}),
 ("ex_xixa", {3: ["moic", "mgmtfee", "carry", "pref", "dpi"], 6: ["moic", "dpi", "cagr"], 8: ["mgmtfee", "moic"], 4: ["mgmtfee"]}),
 ("ex_xb", {2: ["fv", "pv", "sip"], 3: ["stcg", "ltcg"], 6: ["fv", "cagr", "sharpe", "capm", "twr"]}),
 ("ex_i", {3: ["cfut", "fut_pnl", "margin"], 4: ["cpt", "opt_net", "breakeven"], 5: ["opt_net", "breakeven"], 7: ["margin"], 2: ["cfut"]}),
 ("ex_xi", {3: ["ipo"], 5: ["mcap", "pe", "divy"], 6: ["margin", "contract"], 4: ["mcap"]}),
 ("ex_va", {1: ["nav", "units"], 6: ["nav", "units", "stcg", "ltcg", "ter", "exit", "stamp", "ret_div"], 7: ["units", "sip", "avgcost", "stamp"], 8: ["abs", "cagr", "ret_div"], 11: ["sip"]}),
 ("ex_vd", {1: ["nav","units"], 3: ["nav","units","stcg","ltcg","ter","exit","stamp"], 4: ["sip","abs","cagr","sharpe"], 7: ["cfut","fut_pnl","margin","contract"], 8: ["opt_net","breakeven"], 11: ["fut_pnl","margin"]}),
 ("ex_vi", {}),
 ("ex_xxib", {2: ["pe","eps","roe","ev"], 3: ["fv","pv"], 6: ["fv","pv","cagr"], 7: ["capm","sharpe"], 9: ["sharpe"], 11: ["twr","sharpe","capm","abs","cagr"], 12: ["stcg","ltcg"]}),
]
TRACKS = [
 dict(id="nism-mf", name="Mutual funds and distribution", blurb="Distribute funds, advise investors, understand the product."),
 dict(id="nism-market", name="Markets and foundations", blurb="How securities markets work, from first principles."),
 dict(id="nism-deriv", name="Derivatives", blurb="Futures, options and currency contracts, with the numbers."),
 dict(id="nism-adv", name="Advice and research", blurb="Investment advisers and research analysts."),
 dict(id="nism-alt", name="Alternatives and PMS", blurb="PMS and alternative investment fund distribution."),
 dict(id="nism-sales", name="Broking and sales", blurb="Equity sales and client management."),
]
