# Film wishes from the debt and rules-of-the-road lessons

- `curve` (lesson 116): draw yield against maturity as a line with the shape visible (normal, flat, inverted), with a toggle for steep and flat. `lines` prints "₹100 → ₹x" boxes and fall markers that do not suit a curve, and `growbars` starts bars at zero so slopes look tiny. Parameters: `points:[[label,yield],...]`, optional second `points2` to morph the curve (for example before and after a repo cut).
- `duel` negative and long labels (lessons 111 to 120): right-hand value labels clip when the right bar is the longest and the text is 3 or more characters. A label that flips inside the bar when it would overflow would fix it.
- `flow` (lessons 118, 301, 306): boxes joined by arrows with a coin moving along them. For 301 (sponsor, trustees, AMC, custodian, RTA), 306 (fund house, SCORES, ODR) and 118 (redemptions, liquid assets, forced sale). Parameters: `nodes:[...]`, `edges:[[from,to,label]]`.
- `checklist` (lesson 304): ticks appearing one by one on a form (KYC, nominee, ARN and EUIN, mobile and email).
- `duel` with negative values (lesson 113): a bar going below a zero line for a fall in price.
