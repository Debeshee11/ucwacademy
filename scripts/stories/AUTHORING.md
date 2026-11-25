# Writing a lesson as an animated story

Each lesson is a file `one/data/stories/<lesson n>.json`: an array of cards the Stories player shows one at a time. Study `331.json`, `334.json`, `311.json` and `313.json` first. They are the standard.

## The bar
- The learner should **understand the idea by watching** before reading anything. Every lesson needs at least one `anim` card that shows the concept happening with real numbers. Prefer two.
- Beginner means beginner: define terms, use small round numbers, one idea per card. Intermediate and Advanced lessons must actually be harder (trade-offs, edge cases, what an adviser says to a client).
- Honest: every number must be right (compute it in Python), say "made-up path" or "assumed" where it is an illustration, never promise returns. Facts about SEBI, tax and products must match the old lesson text and current Indian rules. If unsure, leave the claim out.
- Indian context: rupees, lakh, crore, Indian names (Rohan, Meena, Dadi, Sarthi is the guide, called `sikka` in dialog lines).
- House rule: **never use the word "free"** in any card (also not "no charge" or "costs nothing"). Use "open", "unlocked", "zero cost" only if true and not about the Academy.

## Card order (adapt, 9 to 12 cards)
1. `fact` hook: why this matters (one short paragraph, a concrete situation).
2. `dialog`: a short chat (2 to 4 lines) with a person's real question. Speakers: `rohan`, `meena`, `dadi`, `sikka` (Sarthi the guide).
3. One to three `anim` cards (see below), each with `caps` (timed captions).
4. Optionally a `fact` or `eg` card for a number table.
5. Exactly four `pick` questions.
6. `remember` with three short points.

## Card shapes (JSON)
- `{"k":"fact","art":"<scene>","h":"Heading","big":"One or two sentences"}`. Add `"long":true` if over ~150 characters. `art` is one of: grow, shield, house, car, health, gold, silver, bank, stocks, pie, calendar, percent, globe, doc, scam, scales, factory, family, wallet, loan, growth.
- `{"k":"dialog","h":"Heading","lines":[["rohan","text"],["sikka","text"]]}`
- `{"k":"eg","h":"Title","intro":"...","rows":[["Label","value"],["=","Total","value"]],"note":"..."}`
- `{"k":"pick","id":"s<n>q1","h":"Check yourself","q":"scenario question","opts":[4 options],"ans":0-3,"why":[4 reasons, one per option, same order as opts]}`
- `{"k":"remember","h":"Remember","pts":["...","...","..."]}`
- `{"k":"anim","type":"<kind>","h":"Title","alt":"what the picture shows","caps":[[seconds,"caption"],...], ...kind fields}`

## Film kinds (all in one/js/anim.js, drawn from your numbers)
- `sipbuy`: `navs:[...]` (prices per month), `amt` (instalment), optional `scale` (bar height per unit, default 1.6; use smaller if units are large). Same money buying units at changing prices. Duration = len(navs)*1.7+3.2 s.
- `growbars`: `vals:[...]`, optional `labels:[...]`, `fmt:"inr"` for rupees, `big`, `small` (end box). Bars grow one by one. Duration len*0.9+2.2.
- `duel`: `a`,`b` (names), `rows:[["label",valueA,valueB],...]`, optional `fmt:"inr"`. Two sets of bars side by side; each row scales on its own. Duration 5.5+rows*0.9.
- `guard`: `title`, `stops:[["statement",true|false],...]` up to 4. A shield, then green true statements and red false ones. 7 s.
- `stairs`: `years`, `start`, `step` (0.10), `flat`, `up` (strings for the end boxes). Rising instalments.
- `pipes`: `months`, `total`, `from`, `to`, `rate`. Money moving between two jars each month.
- `drain`: `corpus`, `withdraw` (monthly), `years`, `paths:[{name,rates:[yearly returns]},{...}]` (two paths). A balance line that can run out. 11 s.
- `glide`: `goal`, `target` (lakh today), `infl`, `eq:[equity % per year]`. Cost counter plus equity to safer shift.
- `mandate`: `salary`,`sip1`,`sip2` (days), `amt`,`low`,`high`. Dates against payday.
- `ladder`: no fields. Market-cap ladder (large, mid, small).
- `lines`: `ylab`, `series:[{name,color,vals:[11 numbers]},...]` 2 or 3 lines, all the same length. Colours: "#8EC5FF" blue, "#3CC47A" green, "#FFC531" yellow, "#E8573D" red. Shows the deepest fall of each. 11 s.
- `stack`: `rows:[{name,segs:[[label,percent,colour,striped?],...]},...]`. Bars cut into labelled parts (allocations, minimums, mixes). Striped (true) means open choice; use colour "#fff" for striped.
- `lockin`: no fields. ELSS-style 36-month lock per instalment.

Captions: 3 to 6 per film, at times when that part of the film is on screen. Keep each under 110 characters, plain words. Last caption states the lesson in one sentence.
If no existing kind fits an idea, use the closest one and write the idea you wanted in `scripts/stories/requests-<your name>.md` (kind name, what it should draw, parameters). **Do not edit one/js/anim.js, stories.js or any other code file.**

## Questions (the checker enforces most of this)
- Four per lesson, ids `s<n>q1` to `s<n>q4`, each a **scenario or reasoning** question, not a definition lookup.
- All four options plausible to someone half-informed. Options within about 15% of each other in length. The right option is **never the longest** and the right answers are spread: do not put them all in the same position.
- A reason for **every** option (why it is right, or why it tempts and fails). Reasons about 80 to 130 characters, similar length for right and wrong ones.
- Do not reveal the answer in the question stem. Avoid "all of the above".

## Check your work
1. Validate: `python3 scripts/stories/apply.py --check --only=<n1>,<n2>` from the repo root. Fix every problem it prints. Do **not** run apply.py without `--check`.
2. See your films: start `python3 -m http.server <your port> ` from the repo root in the background (ports are given in your task), then from /home/claude/tools run `PORT=<port> OUT=<dir> node frames.mjs '[[<lesson>,<anim index>,[0.3,0.98]],...]'`. It writes f00.png, f01.png ... into OUT (make the directory first; use /tmp/<your name>/). Look at them (Read the PNG). Fix overlapping text, empty space, wrong numbers. Anim index counts only the `anim` cards in that lesson, from 0. Fractions are positions in the film (0 to 1).
3. JSON must be valid. Use `json.dump(..., ensure_ascii=False, indent=1)` from a small Python script; compute numbers in code.
