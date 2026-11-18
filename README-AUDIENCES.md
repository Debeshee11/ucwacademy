# Two audiences, the Quote Bank, and sign-in fixes

## Who the Academy is for
`one/js/audience.js` is the single place that says who learns here.

* **Everyday** (`seg: "everyday"`): Student, First job, Working professional, Homemaker, Business owner, Retired, Teacher, Living abroad (NRI).
* **Finance professionals** (`seg: "pro"`): Mutual fund distributor, Investment adviser, Analyst or researcher, Financial planner, Partner, UpperCrust team.

Existing learners keep their old door ids (`student`, `salaried`, `retiree`, `partner`, `team` and the rest), so nobody loses progress or gets re-asked.
Staff (work email) are always treated as professionals.

### What changes for an everyday learner
* Each door has its own course order (`track` in `DOORS`). Retired starts with scam safety, health cover and retirement income; Student starts with budgeting, scams, SIPs.
* The lesson text, quiz questions and exam questions that say "client", "RM" or "relationship manager" are reworded on the fly by `one/js/plain.js` ("a client asks" becomes "someone asks", "the client's goal" becomes "your goal"). Nothing in `functions/content` is edited, so professionals still see the original client wording.
* A few lessons written as sales scripts get plain titles and closing lines (`TITLES`, `TALK`, `HIDE_Q` in `audience.js`).
* Seven courses written for the working side of finance (`PRO_ONLY`) move to a collapsed "For finance professionals" section of the course list.
* Client Lab, "what to tell clients" and the Professional credential line are shown to professionals only.

### Changing things
* New door: add it to `DOORS` in `audience.js` and to the `DOORS` list in `functions/index.js` (admin counts). `npm test` in `functions/` checks every course id in a track exists.
* Reword a course blurb or unit title for everyday learners: `COURSE` in `audience.js`.
* The wording rules are in `plain.js`; `functions/test/audience.test.js` fails if any everyday lesson still says "client".

## Quote Bank (`#/quotes`, `#/quote/<id>`)
* Source: `content/quotes.tsv` (text, author, tags, source). Run `python3 scripts/build_quotes.py` to validate it and write `one/data/quotes.json`. The script rejects duplicates, bad tags and lines outside 20 to 220 characters. Ids are a hash of the text, so shared links survive edits and new additions.
* Add as many as you like; the page pages 24 at a time and searches by word or person. The pictures (JPG, 1080 square, 4:5 or 9:16) are drawn in the browser in eight light styles, with the Academy mark and ucwacademy.in. Nothing is uploaded.
* **Check attributions before you add**: only add a quote you can source (a book, speech, letter or the person's own post). Mark anything doubtful as "Disputed" in the source column and leave it out. The current 186 are well-known lines; please have someone spot-check them.

## Sign-in and sign-up counts
* A learner who signs in with Google or email and then gives a mobile number that another account already holds is no longer stuck: the verify step always has **Skip for now**, **Change number**, **Back** and **Sign out**, and the "already used" message offers **Carry on without verifying**. The number is kept on file with `mv: 2` (given, not verified). `mv: 1` still means verified. Admin > Team lists "mobile not verified" in the Missing column.
* The `signup` event now fires only for brand-new accounts (Google, email and phone). Before, every phone sign-in counted, so returning learners inflated it. A new `profile` event fires when someone finishes name, mobile and email. Admin > Traffic shows both ("New sign-ins" and "Finished profile") so the drop-off is visible. Learners (the 84) is still the count of saved learner records.
* No Firestore rules change is needed (`mv` already exists). Deploy `functions/` so the new `profile` event is accepted.
