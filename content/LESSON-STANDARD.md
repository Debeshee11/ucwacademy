# The lesson standard

Every lesson in the Academy is being rewritten to this standard. The first course done is
`budgeting-emergency-fund` (lessons 456 to 460); read it in the app to see the standard in practice.

## What a lesson contains

| Part | Field | Rule |
| --- | --- | --- |
| A real situation | `story` | A named person and a money problem, or a dated news story with its source. `kicker` ("Meet Riya"), `headline`, 2 to 4 `paras`. |
| The idea | `concept` | 4 to 6 short paragraphs. One idea each. Written to "you". No jargon without an explanation. |
| Worked example | `example` | A small table in rupees: `title`, optional `intro`, `head` (2 column names), `rows`, `note`. A row that starts with `"="` is a total. Every figure must add up. |
| Try it | `tool`, `toolAsk` | Optional. One of: `sip`, `goal`, `emergency`, `emi`, `card`, `inflation`, `lumpsum`, `retirement`. |
| A common question | `client` | `quote` is what a real person asks. `context` is one line for advisers ("A client who..."). |
| Check yourself | `qs` | At least 4 questions. See below. |
| The short answer | `talk` | Two to four sentences answering the question above, in quotation marks. |
| Remember | `remember` | 3 to 5 one-line takeaways. |

Length: 400 to 750 words across story, idea, example, short answer and takeaways. About five minutes to read.

A table can have two or three columns. When the last column holds sentences instead of amounts, the app lays it out as two reading columns.
List every rule, rate or limit you relied on under `sources` at the top of the file, with the date you checked it.

## Questions

- Ask about a situation or a calculation. A learner should have to think, not recognise a definition.
- Never start with "Which statement best describes", "Which statement about X is correct" or "Which is NOT correct".
- Exactly four options. Wrong options must be believable and about as long as the right one.
- `answer` is the position of the right option, counting from 0. Mix the positions.
- `why` explains the right answer. `wrong` gives one reason for each wrong option, and `null` in the right option's place.
- Ids look like `v2-<lesson number>-<1, 2, 3...>`.

## Voice

- Speak to the learner about their own money: "you", "your salary".
- Indian names, cities, rupees, lakh and crore.
- Short sentences. One idea per sentence.
- No promises of returns. Say "assumed", "could", "if".
- Any tax rate, limit or regulation: give the source and the date it was checked, and keep it out of questions unless it is the point of the lesson.

The app shows the same lesson two ways. Advisers, partners and team members see "Think like a client" and "What to tell a client".
Everyone else sees "A common question" and "The short answer". You write it once.

## How to add a rewritten course

1. Copy `content/rewrites/budgeting-emergency-fund.json`, rename it to the course id, and write the lessons. Lesson numbers stay the same.
2. Check it: `python3 scripts/apply_rewrites.py --check`. It lists anything that misses the standard.
3. Have a qualified reviewer read every lesson. Add `"rev": "Name, qualification"` at the top of the file; it is shown under each lesson.
4. Apply it: `python3 scripts/apply_rewrites.py`. This updates `functions/content/lessons.json`.
5. Rebuild the landing pages: `python3 tools/seo/build_seo.py`.
6. Rebuild and upload the exam keys (`python3 scripts/build_examkeys.py`, then Admin > Growth and exams) so the new questions enter the Beginner exam.

Nothing a learner has done is lost. Finished lessons stay finished. A lesson's earlier questions are kept and marked `legacy`,
so progress on them is kept and any exam already drawn from them can still be marked. Learners practise on the new questions.
