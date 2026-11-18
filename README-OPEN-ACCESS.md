# Open access, offline, light theme, calculators and the new lesson standard

Everything here is added on top of the existing app. No learner data, lesson number, question id, security rule or backend function was removed or changed in meaning.

## What changed for a visitor

| Before | Now |
| --- | --- |
| Sign-in screen before anything can be read | Lessons, practice quizzes, daily five, funds, indices, news, NISM guides and calculators open at once |
| Progress only with an account | A guest's progress is kept on the device and joins the account at sign-in |
| Dark brown hero, dark score card, dark mock bar, dark tour overlay | Bright tints everywhere (`one/css/light.css`) |
| Browser pop-ups for "Leave this quiz?" | In-app dialogs, translated |
| Online only | Opens offline after the first visit; can be added to the home screen |
| No calculators | Eight calculators at `#/tools`, and inside lessons |
| Budgeting course: five glossary lessons | Five full lessons to the new standard |

Still behind a free account, because they are marked on the server or carry a name: course exams, NISM mocks, refreshers, certificates, the leaderboard, reviews.

## Second round (same rules: added on top, nothing removed)

| Area | Change |
| --- | --- |
| Speed | "Deploy site" now joins the 63 script modules into one file (92 KB compressed, was 139 KB across 63 requests). If bundling ever fails, the site is published unbundled exactly as before |
| Speed | The database, backend-call, App Check and QR parts of the SDK load on demand (`one/js/fb.js`, `backend()`), so a guest's first screen does not wait for them. A returning signed-in learner starts fetching them at once |
| Home | A learner managing their own money now starts with budgeting, scam safety, loans and insurance. Advisers, partners and the team keep the catalogue order |
| Lessons | Scam safety (501 to 505) and Loans, EMIs and credit scores (461 to 465) rewritten to the standard: 10 lessons, 40 new questions, three with a calculator |
| Sign-in | The headline no longer slides under the logo on short phones |

Rule facts used in the new lessons were checked on 15 Nov 2026 and are listed under `sources` in each file in `content/rewrites/`.
One item (the 2023 Reserve Bank circular on floating-rate resets) was written from memory and is marked for the reviewer to confirm.

## How to publish

1. Upload this folder over the repository as usual and commit to `main`.
2. "Deploy site" publishes the app. It now also copies `functions/content/` to `one/content/` on the site, joins the stylesheets and adds preload hints. Nothing to configure.
3. "Deploy Firebase" re-deploys the functions because `functions/content/lessons.json` changed. No rule or function logic changed.
4. Optional, when convenient: re-run `python3 scripts/build_examkeys.py` with your private exam file and upload the keys, so the 60 new questions enter those courses' Beginner exams. Until then the exam keeps working from the earlier questions.

## How to undo any part

| To undo | Do this |
| --- | --- |
| Light theme | Remove the `light.css` line from `index.html` |
| Offline | Delete `sw.js` and replace it with a one-line worker that unregisters itself, or remove the registration at the foot of `one/js/app.js` |
| Open access | In `one/js/auth.js`, `start()`: make the guest branch call `mount(a, note)` as before |
| A rewritten course | Delete its file in `content/rewrites/` and restore `functions/content/lessons.json` from git |

## Files

New: `sw.js`, `manifest.webmanifest`, `assets/icon-*.png`, `one/css/light.css`, `one/css/tools.css`, `one/js/tools.js`, `one/js/toolmath.js`,
`functions/test/tools.test.js`, `scripts/apply_rewrites.py`, `content/LESSON-STANDARD.md`, `content/rewrites/*.json` (three courses).

Changed: `one/js/` app, auth, store, content, ui, ux, lesson, data, progress, quiz, quizzes, exam, nism, practice, academy, credview, sharepanel, funddata, holdings, dom;
`one/css/ux.css`; `one/data/ui-hi.json`, `ui-gu.json` (130 new strings each); `index.html`; `scripts/stamp.py`, `scripts/build_examkeys.py`;
`.github/workflows/pages.yml`; `tools/seo/*` and the 65 landing pages that say how to start; `functions/content/lessons.json` (lessons 456 to 460); `functions/package.json` (one more test).

## Known limits

- A guest does not see the admin's extra fund data (it is readable by signed-in learners only, by the security rules). The base fund library is shown.
- The course files are public on the site. Exam and mock answer keys are not in them.
- Hindi and Gujarati text for the new screens was drafted by an AI assistant and has not yet been read by a native-speaking finance reviewer.
- The fifteen new lessons were drafted by an AI assistant and have not yet been read by a certified reviewer. Add the reviewer's name as `rev` in the rewrite file when they have.
