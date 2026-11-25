# Film wishes from the hybrid and index course author

1. `duel`: the value label of the longer right-hand bar is clipped at the edge of the picture (for example "32?" in 331 and "₹1,100" style numbers). Wish: reserve about 40px on the right, or draw the label inside the bar when the bar is full length. Until then the lessons keep the larger value on the left or the right value to two characters.
2. `hedge` (lessons 322): two legs for one share. Left: the cash share price moving, with a profit or loss tag. Right: the futures price moving to meet it. Bottom: net of the two legs stays at the locked gap. Parameters: `buy`, `futures`, `ends:[900,1100]`. Used `duel` with "locked gap" rows instead.
3. `dial` (lesson 323): a gauge for net equity that turns as a valuation (P/E) line rises and falls, with the debt share filling the rest. Parameters: `pe:[...]`, `equity:[...]`. Used `stack` rows (cheap, fair, expensive) instead.
4. `lines` with `mark:false`: option to hide the red "deepest fall" arrows and percentages when all series fall in the same year (labels overlap, as in 321 and 346). Parameter: `nodd:true`.
5. `compare` bars that allow different units per row on one side only, for client tolerance against fund fall (lesson 326). `duel` works, but the left bar repeats the same value.
