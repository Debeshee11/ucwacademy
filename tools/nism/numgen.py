"""Seeded numeric question generators. Each returns (prompt, correct, [w1,w2,w3], why)."""
import random
def fmt(x, d=2):
    s = f"{x:,.{d}f}"
    return s.rstrip("0").rstrip(".") if "." in s else s
def inr(x, d=2): return "₹" + fmt(x, d)
def wrongs(r, c, mk, n=3, lo=0.6, hi=1.5):
    out = set(); tries = 0
    while len(out) < n and tries < 200:
        tries += 1; v = c * r.uniform(lo, hi) if r.random() < .6 else c + r.choice([-1, 1]) * r.choice([1, 2, 5, 10, 0.5, 0.25]) * max(abs(c) * .1, 1)
        t = mk(v)
        if t != mk(c) and t not in out and v > 0: out.add(t)
    return list(out)
def g_nav(r):
    a = r.choice([200, 500, 800, 1200, 2500]); l = r.choice([5, 10, 20, 30]); u = r.choice([10, 20, 25, 40, 50]); nav = (a - l) / u
    return (f"A scheme has net assets of ₹{a} crore before deducting liabilities of ₹{l} crore. It has {u} crore units outstanding. What is the NAV per unit?", inr(nav), wrongs(r, nav, inr), f"NAV = (₹{a} − ₹{l}) crore ÷ {u} crore units = {inr(nav)}.")
def g_units(r):
    amt = r.choice([10000, 25000, 50000, 75000, 120000]); nav = r.choice([12.5, 20, 25, 32.5, 40, 50]); u = amt / nav
    return (f"An investor invests {inr(amt,0)} in a scheme when the applicable NAV is {inr(nav)}. Ignoring charges, how many units are allotted?", fmt(u), wrongs(r, u, fmt), f"Units = {inr(amt,0)} ÷ {inr(nav)} = {fmt(u)}.")
def g_abs(r):
    a = r.choice([10, 20, 25, 40]); b = round(a * r.uniform(1.1, 1.8), 2); p = (b - a) / a * 100
    return (f"A fund's NAV rose from ₹{a} to ₹{b}. What is the absolute return?", f"{fmt(p)}%", wrongs(r, p, lambda v: f"{fmt(v)}%"), f"({b} − {a}) ÷ {a} = {fmt(p)}%.")
def g_cagr(r):
    y = r.choice([2, 3, 5]); rate = r.choice([8, 10, 12, 15]); a = r.choice([1, 2, 5]) * 100000; b = a * (1 + rate / 100) ** y
    return (f"₹{a:,} grows to ₹{b:,.0f} in {y} years. What is the CAGR, approximately?", f"{rate}%", [f"{x}%" for x in r.sample([v for v in [5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 18, 20] if v != rate], 3)], f"CAGR = (end ÷ start)^(1/{y}) − 1 ≈ {rate}%.")
def g_stcg(r):
    inv = r.choice([200000, 300000, 500000]); gain = r.choice([40000, 60000, 100000]); t = gain * .2
    return (f"An investor sells equity-oriented fund units after 8 months, with a short-term gain of ₹{gain:,}. At 20% short-term capital gains tax (ignoring cess), how much tax is payable?", inr(t, 0), wrongs(r, t, lambda v: inr(v, 0)), f"20% of ₹{gain:,} = {inr(t,0)}.")
def g_ltcg(r):
    gain = r.choice([200000, 275000, 325000, 425000]); t = (gain - 125000) * .125
    return (f"An investor's long-term capital gain from equity-oriented funds in a year is ₹{gain:,} (no other gains). At 12.5% above the ₹1.25 lakh exemption, what is the tax (ignoring cess)?", inr(t, 0), wrongs(r, t, lambda v: inr(v, 0)), f"Taxable = ₹{gain:,} − ₹1,25,000 = ₹{gain-125000:,}; tax at 12.5% = {inr(t,0)}.")
def g_ter(r):
    aum = r.choice([1000, 2000, 5000]); ter = r.choice([0.5, 1.0, 1.5, 2.0]); c = aum * ter / 100
    return (f"A scheme with average assets of ₹{aum} crore has a total expense ratio of {ter}%. What is the annual expense charged to the scheme?", f"₹{fmt(c)} crore", wrongs(r, c, lambda v: f"₹{fmt(v)} crore"), f"{ter}% of ₹{aum} crore = ₹{fmt(c)} crore.")
def g_exit(r):
    amt = r.choice([50000, 80000, 120000]); ld = r.choice([0.5, 1, 1.0]); v = amt * ld / 100
    return (f"An investor redeems units worth {inr(amt,0)} within the exit-load period, where the exit load is {ld}%. What amount is deducted as exit load?", inr(v, 0), wrongs(r, v, lambda x: inr(x, 0)), f"{ld}% of {inr(amt,0)} = {inr(v,0)}.")
def g_sip(r):
    m = r.choice([2000, 5000, 10000]); n = r.choice([12, 24, 36, 60]); t = m * n
    return (f"An investor runs a monthly SIP of {inr(m,0)} for {n} months. What is the total amount invested?", inr(t, 0), wrongs(r, t, lambda v: inr(v, 0)), f"{inr(m,0)} × {n} = {inr(t,0)}.")
def g_avgcost(r):
    navs = r.choice([[10, 8, 12], [20, 25, 16], [50, 40, 50]]); amt = 1000
    u = sum(amt / x for x in navs); avg = amt * len(navs) / u
    return (f"A SIP invests ₹{amt} each month at NAVs of {', '.join('₹'+str(x) for x in navs)}. What is the average cost per unit?", inr(avg), wrongs(r, avg, inr), f"Total ₹{amt*len(navs)} ÷ {fmt(u,3)} units = {inr(avg)}. Because fixed money buys more units when NAV is low, the cost per unit is below the simple average of NAVs.")
def g_stamp(r):
    amt = r.choice([100000, 200000, 500000]); v = amt * 0.00005
    return (f"At stamp duty of 0.005% on purchases, how much stamp duty applies to a purchase of ₹{amt:,}?", inr(v, 2), wrongs(r, v, lambda x: inr(x, 2)), f"0.005% of ₹{amt:,} = {inr(v)}.")
def g_ret_div(r):
    a = r.choice([20, 25, 40]); b = a + r.choice([2, 4, 6]); d = r.choice([1, 2]); p = (b - a + d) / a * 100
    return (f"An investor bought units at NAV ₹{a}. One year later the NAV is ₹{b} after an IDCW of ₹{d} per unit was paid. What is the return including the payout?", f"{fmt(p)}%", wrongs(r, p, lambda v: f"{fmt(v)}%"), f"({b} − {a} + {d}) ÷ {a} = {fmt(p)}%.")

def pct(v): return f"{fmt(v)}%"
def g_fut_pnl(r):
    lot = r.choice([25, 50, 75, 100, 200, 500]); e = r.choice([1500, 2400, 22000, 24500, 800]); d = r.choice([-60, -35, -20, 15, 40, 85]); x = e + d; p = d * lot
    side = r.choice(["bought", "sold"]); pl = p if side == "bought" else -p
    return (f"A trader {side} one futures lot of {lot} units at ₹{e:,} and squares off at ₹{x:,}. Ignoring costs, the profit or loss is:", ("profit of " if pl > 0 else "loss of ") + inr(abs(pl), 0), [("profit of " if v > 0 else "loss of ") + inr(abs(v), 0) for v in [-pl, pl * 2, pl // 2 or 100]], f"{'Long' if side=='bought' else 'Short'}: ({x} − {e}) × {lot} × {'1' if side=='bought' else '−1'} = {fmt(pl,0)}.")
def g_opt_net(r):
    kind = r.choice(["call", "put"]); k = r.choice([100, 500, 1000, 22000, 24000]); prem = r.choice([5, 12, 20, 45, 80]); lot = r.choice([25, 50, 100, 250]); mv = r.choice([-1.04, 1.03, 1.06, 0.93, 1.1, 0.9, 0.96])
    s = round(k * mv); iv = max(0, s - k) if kind == "call" else max(0, k - s); net = (iv - prem) * lot
    t = lambda v: ("profit of " if v > 0 else "loss of ") + inr(abs(v), 0)
    return (f"A buyer pays a premium of ₹{prem} for one {kind} option lot of {lot} units, strike ₹{k:,}. At expiry the underlying settles at ₹{s:,}. Net result for the buyer, before costs:", t(net), [t(v) for v in {-prem * lot, (iv + prem) * lot, (prem - iv) * lot, iv * lot} - {net}][:3] or [t(1)], f"Intrinsic value at expiry = ₹{iv}. Net per unit = {iv} − {prem} = {iv-prem}; × {lot} = {fmt(net,0)}.")
def g_breakeven(r):
    kind = r.choice(["call", "put"]); k = r.choice([100, 250, 500, 1200, 22000]); prem = r.choice([4, 10, 15, 30]); be = k + prem if kind == "call" else k - prem
    return (f"A {kind} option with strike ₹{k:,} is bought for a premium of ₹{prem}. The break-even price at expiry for the buyer is:", inr(be, 0), [inr(v, 0) for v in [k, (k - prem if kind == "call" else k + prem), k + 2 * prem]], f"{'Strike + premium' if kind=='call' else 'Strike − premium'} = ₹{be:,}.")
def g_contract(r):
    p = r.choice([250, 800, 1500, 2400, 22000]); lot = r.choice([25, 50, 100, 250, 500]); v = p * lot
    return (f"A futures contract is priced at ₹{p:,} and the lot size is {lot}. What is the contract value of one lot?", inr(v, 0), wrongs(r, v, lambda x: inr(x, 0)), f"₹{p:,} × {lot} = {inr(v,0)}.")
def g_margin(r):
    v = r.choice([500000, 800000, 1500000, 2000000]); m = r.choice([10, 12, 15, 20]); x = v * m / 100
    return (f"The contract value of a futures position is ₹{v:,} and the total margin requirement is {m}%. How much margin must the trader deposit?", inr(x, 0), wrongs(r, x, lambda y: inr(y, 0)), f"{m}% of ₹{v:,} = {inr(x,0)}.")
def g_fv(r):
    p = r.choice([10000, 50000, 100000]); i = r.choice([6, 8, 10, 12]); n = r.choice([2, 3, 5]); f = p * (1 + i / 100) ** n
    return (f"₹{p:,} is invested at {i}% a year compounded annually for {n} years. What is the approximate future value?", inr(f, 0), wrongs(r, f, lambda x: inr(x, 0), lo=.8, hi=1.25), f"FV = {p:,} × (1 + {i/100})^{n} = {inr(f,0)}.")
def g_pv(r):
    f = r.choice([100000, 200000, 500000]); i = r.choice([6, 8, 10]); n = r.choice([2, 3, 5]); p = f / (1 + i / 100) ** n
    return (f"What is the present value of ₹{f:,} receivable in {n} years if the discount rate is {i}% a year?", inr(p, 0), wrongs(r, p, lambda x: inr(x, 0), lo=.8, hi=1.25), f"PV = {f:,} ÷ (1 + {i/100})^{n} = {inr(p,0)}.")
def g_pe(r):
    pr = r.choice([120, 240, 450, 800, 1500]); e = r.choice([6, 10, 15, 20, 30]); x = pr / e
    return (f"A share trades at ₹{pr} and its earnings per share is ₹{e}. What is its price-to-earnings ratio?", f"{fmt(x)}", wrongs(r, x, fmt), f"P/E = {pr} ÷ {e} = {fmt(x)}.")
def g_eps(r):
    pat = r.choice([120, 250, 480, 900]); n = r.choice([10, 20, 40, 60]); x = pat / n
    return (f"A company reports profit after tax of ₹{pat} crore and has {n} crore shares outstanding. What is its EPS?", inr(x), wrongs(r, x, inr), f"EPS = ₹{pat} crore ÷ {n} crore = {inr(x)}.")
def g_mcap(r):
    pr = r.choice([50, 120, 340, 900]); n = r.choice([10, 25, 80, 200]); x = pr * n
    return (f"A share is priced at ₹{pr} and the company has {n} crore shares outstanding. What is its market capitalisation?", f"₹{x:,} crore", wrongs(r, x, lambda v: f"₹{v:,.0f} crore"), f"₹{pr} × {n} crore = ₹{x:,} crore.")
def g_divy(r):
    pr = r.choice([100, 250, 400, 800]); d = r.choice([2, 5, 8, 12]); x = d / pr * 100
    return (f"A share priced at ₹{pr} pays a dividend of ₹{d} per share. What is the dividend yield?", pct(x), wrongs(r, x, pct), f"{d} ÷ {pr} = {pct(x)}.")
def g_roe(r):
    pat = r.choice([40, 90, 150, 300]); eq = r.choice([200, 500, 750, 1500]); x = pat / eq * 100
    return (f"A company has profit after tax of ₹{pat} crore and shareholders' equity of ₹{eq} crore. What is its return on equity?", pct(x), wrongs(r, x, pct), f"ROE = {pat} ÷ {eq} = {pct(x)}.")
def g_bonus(r):
    a, b = r.choice([(1, 1), (1, 2), (2, 1), (1, 4)]); h = r.choice([100, 200, 500, 1000]); n = h * a // b if h * a % b == 0 else h
    n = h * a // b
    return (f"A company announces a bonus issue in the ratio {a}:{b} ({a} new share for every {b} held). An investor holds {h} shares. How many shares does she hold after the bonus?", str(h + n), [str(x) for x in {h, h + n * 2, h + max(1, n // 2), h + n + h // 5} - {h + n}][:3], f"Bonus shares = {h} × {a} ÷ {b} = {n}; total {h+n}.")
def g_split(r):
    fv = r.choice([10, 5, 2]); to = r.choice([1, 2, 5]) if fv > 1 else 1
    if to >= fv: to = 1
    h = r.choice([100, 200, 500]); n = h * fv // to; p = r.choice([1000, 2000, 500]); np_ = p * to / fv
    return (f"A stock splits from face value ₹{fv} to ₹{to}. An investor holds {h} shares trading at ₹{p:,} before the split. How many shares after the split, and what is the approximate ex-split price?", f"{n} shares at about ₹{fmt(np_)}", [f"{h} shares at about ₹{p:,}", f"{n} shares at about ₹{p:,}", f"{h} shares at about ₹{fmt(np_)}"], f"Each share becomes {fv//to if fv%to==0 else fv/to} shares, so {n} shares; price falls in proportion to about ₹{fmt(np_)}; total value is unchanged.")
def g_cfut(r):
    lot = r.choice([1000]); e = round(r.uniform(82, 90), 4); d = r.choice([-0.35, -0.12, 0.18, 0.42]); x = round(e + d, 4); p = round(d * lot, 2)
    side = r.choice(["bought", "sold"]); pl = p if side == "bought" else -p
    return (f"A trader {side} one USDINR futures contract (lot of USD 1,000) at ₹{e} and closes it at ₹{x}. Ignoring costs, the result is:", ("profit of " if pl > 0 else "loss of ") + inr(abs(pl)), [("profit of " if v > 0 else "loss of ") + inr(abs(v)) for v in [-pl, pl * 10, pl / 10]], f"({x} − {e}) × 1,000 = {fmt(p)}; {'long' if side=='bought' else 'short'} gives {fmt(pl)}.")
def g_cpt(r):
    lot = 1000; tick = 0.0025; n = r.choice([4, 8, 12, 20]); v = n * tick * lot
    return (f"On USDINR futures the tick size is ₹0.0025 and the lot is USD 1,000. What is the value of a move of {n} ticks on one lot?", inr(v), wrongs(r, v, inr), f"{n} × 0.0025 × 1,000 = {inr(v)}.")
def g_twr(r):
    a, b = r.choice([5, 8, 10, 12]), r.choice([4, 6, 9, 15]); x = ((1 + a / 100) * (1 + b / 100) - 1) * 100
    return (f"A portfolio returns {a}% in year one and {b}% in year two. What is the cumulative return (time-weighted)?", pct(x), wrongs(r, x, pct, lo=.8, hi=1.2), f"(1+{a/100}) × (1+{b/100}) − 1 = {pct(x)}.")
def g_sharpe(r):
    rp, rf, sd = r.choice([12, 15, 18]), r.choice([5, 6, 7]), r.choice([8, 10, 12, 15]); x = (rp - rf) / sd
    return (f"A portfolio returns {rp}% with a standard deviation of {sd}%. The risk-free rate is {rf}%. What is its Sharpe ratio?", fmt(x), wrongs(r, x, fmt), f"({rp} − {rf}) ÷ {sd} = {fmt(x)}.")
def g_capm(r):
    rf, b, rm = r.choice([5, 6, 7]), r.choice([0.8, 1.0, 1.2, 1.5]), r.choice([11, 12, 13, 14]); x = rf + b * (rm - rf)
    return (f"The risk-free rate is {rf}%, the market return is {rm}% and a stock's beta is {b}. By CAPM the required return is:", pct(x), wrongs(r, x, pct), f"{rf} + {b} × ({rm} − {rf}) = {pct(x)}.")
def g_ev(r):
    mc, d, c = r.choice([1000, 2500, 4000]), r.choice([200, 500, 800]), r.choice([100, 300]); ev = mc + d - c
    return (f"A company has market capitalisation of ₹{mc} crore, debt of ₹{d} crore and cash of ₹{c} crore. What is its enterprise value?", f"₹{ev:,} crore", wrongs(r, ev, lambda v: f"₹{v:,.0f} crore"), f"EV = {mc} + {d} − {c} = ₹{ev:,} crore.")
def g_dscr(r):
    cur_a, cur_l = r.choice([300, 450, 600]), r.choice([150, 200, 300]); x = cur_a / cur_l
    return (f"A company has current assets of ₹{cur_a} crore and current liabilities of ₹{cur_l} crore. What is its current ratio?", fmt(x), wrongs(r, x, fmt), f"{cur_a} ÷ {cur_l} = {fmt(x)}.")
def g_ipo(r):
    lo = r.choice([200, 300, 450]); hi = int(lo * r.choice([1.05, 1.1, 1.15])); lot = r.choice([30, 45, 60]); amt = hi * lot
    return (f"An IPO price band is ₹{lo} to ₹{hi} with a minimum bid lot of {lot} shares. What is the minimum application amount at the cut-off (upper band) price?", inr(amt, 0), wrongs(r, amt, lambda x: inr(x, 0)), f"₹{hi} × {lot} = {inr(amt,0)}.")
def g_gross(r):
    g, tds = r.choice([1000000, 2400000]), r.choice([10, 20]); return g_fv(r)


def g_moic(r):
    inv = r.choice([10, 20, 50]); ret = inv * r.choice([1.5, 2, 2.5, 3, 0.8]); x = ret / inv
    return (f"An AIF investor commits and invests ₹{inv} crore and receives total distributions and residual value of ₹{fmt(ret)} crore. What is the multiple on invested capital (MOIC)?", fmt(x) + "x", wrongs(r, x, lambda v: fmt(v) + "x"), f"MOIC = {fmt(ret)} ÷ {inv} = {fmt(x)}x.")
def g_mgmtfee(r):
    c = r.choice([10, 25, 50, 100]); f = r.choice([1.5, 2, 2.5]); x = c * f / 100
    return (f"An investor has committed ₹{c} crore to an AIF that charges a management fee of {f}% a year on commitments. What is the annual management fee?", f"₹{fmt(x)} crore", wrongs(r, x, lambda v: f"₹{fmt(v)} crore"), f"{f}% of ₹{c} crore = ₹{fmt(x)} crore.")
def g_carry(r):
    p = r.choice([10, 20, 40, 60]); c = r.choice([15, 20]); x = p * c / 100
    return (f"A fund earns a profit of ₹{p} crore on invested capital. Assuming no hurdle and a carried interest of {c}% of profits, how much carry goes to the manager?", f"₹{fmt(x)} crore", wrongs(r, x, lambda v: f"₹{fmt(v)} crore"), f"{c}% of ₹{p} crore = ₹{fmt(x)} crore.")
def g_pref(r):
    c = r.choice([10, 20, 50]); h = r.choice([8, 10, 12]); n = r.choice([1, 2, 3]); x = c * ((1 + h / 100) ** n - 1)
    return (f"Investors contributed ₹{c} crore. The fund has a hurdle (preferred return) of {h}% a year compounded. What preferred return must be paid to investors over {n} year(s) before any carry?", f"₹{fmt(x)} crore", wrongs(r, x, lambda v: f"₹{fmt(v)} crore", lo=.7, hi=1.4), f"{c} × ((1 + {h/100})^{n} − 1) = ₹{fmt(x)} crore.")
def g_dpi(r):
    d = r.choice([5, 8, 12, 20]); p = r.choice([10, 20, 25, 40]); x = d / p
    return (f"An AIF has called ₹{p} crore from investors and distributed ₹{d} crore. What is DPI (distributions to paid-in capital)?", fmt(x), wrongs(r, x, fmt), f"DPI = {d} ÷ {p} = {fmt(x)}.")

G = {k[2:]: v for k, v in globals().items() if k.startswith("g_")}
