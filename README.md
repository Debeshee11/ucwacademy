# UpperCrust One

Learning platform for UpperCrust Wealth. Static site (GitHub Pages) + Firebase Auth + Firestore. No build step.

## What is where

| Path | What it is |
|---|---|
| `index.html` | App shell |
| `one/css/one.css` | All styles and design tokens |
| `one/js/*.js` | App code. `config.js` holds every setting |
| `functions/content/*.json` (served to signed-in learners only, through the `content` function) | Courses, lessons, client scenarios, fund factsheets, indices, Hindi and Gujarati questions |
| `assets/logo-uppercrust.png` | Logo |
| `firestore.rules` | Security rules. Paste into the Firebase console and Publish |
| `scripts/`, `.github/workflows/` | Headlines pipeline (writes to branch `news-data`) |
| `CNAME` | `ucwacademy.in` |

## Sign-in

Learners sign in with a mobile number (one-time code) or Google. Employees use the work-email door (accounts you create in Firebase Authentication). Email and password sign-in is for existing accounts only. After first sign-in every learner accepts the Privacy notice and Terms once.

## Adding an employee

1. Firebase console, Authentication, add the user (email + password).
2. Add the email in all three places: `STAFF` in `one/js/config.js`, `listed()` in `firestore.rules`, and `functions/lib/staff.js`. `npm test` in `functions/` fails if they differ.
3. Push to `main`. The deploy workflow publishes the rules and functions.
4. Sign in as admin > Growth and exams > **Verify staff accounts**. The new employee signs out and in once.

## Funds: what is automatic

`.github/workflows/update-funds.yml` runs every Sunday. It reads AMFI data (free feed api.mfapi.in), lists every open-ended fund of every category (Regular plan, Growth), and refreshes NAV, returns, category average and rank. It publishes `funds-live.json` on the `funds-data` branch; the Library reads it. New funds in a listed category appear on their own.

To list another kind of fund, add a group to `scripts/fund_rules.json` (by AMFI category or by a word in the name). Run the workflow once by hand from the Actions tab (Run workflow) to create the `funds-data` branch.

Holdings are not in any free feed. Fund houses publish them monthly, and the admin uploads them as below.

## Monthly fund holdings (admin)

Sign in as admin, open the avatar menu, choose **Fund data**.
1. Download each fund's monthly portfolio from the fund house website (published within 10 days of month end).
2. In Excel, copy the two columns: security name and % to NAV.
3. Pick the fund and month, paste, Save. New funds can be added on the same page.

The fund page then shows that month's holdings and what changed since last month. The **Holdings quiz** rebuilds itself from the latest data.

## Credentials

Pass a module quiz (70%), then the Beginner exam (80%) to earn a course certificate. Exams and refreshers are marked on the server, which issues the certificate. Valid 12 months; a 15-question refresher (80%) renews. Index courses are optional and do not count toward level credentials. Verify page: `https://ucwacademy.in/#/verify/<ID>`.

## AI feedback (optional)

Set `AI_ENDPOINT` in `config.js` to a URL you host. The app POSTs `{quote, context, answer, mustCover}` and expects `{feedback: "text"}`. Never put an API key in this repository.

## Known limits

- Lesson questions (and so the Beginner exam, which draws on them) ship with their answers, because lesson quizzes mark instantly. A learner who reads the data files can look those answers up. Intermediate and Hard exams, the extra Beginner questions and the refreshers' keys are private.
- Credentials are issued and marked only by the backend; the browser cannot create or change them.
- The interface is English. Quiz questions can be shown in Hindi and Gujarati where translated.


## Courses, exams and syllabus

- **Courses** page (was Explore) groups 37 courses into sections and has a **Market news** tab (headlines from the `news-data` branch; run Actions > Update headlines once to create it).
- Every course has three exams of 20 questions: Beginner (80% to pass, issues the certificate), Intermediate (75%) and Hard (70%). Each opens after the one before. Each has a syllabus page at `#/syllabus/<course>/<b|i|h>`.
- Exam questions live in `functions/content/exams.json` (answers removed; the full copy and the keys are made by `scripts/build_examkeys.py` into the git-ignored `private-keys/` folder and uploaded from the admin page). Beginner draws from the lesson questions; Intermediate and Hard have their own 20 each. Index course questions are generated from `indices.json`.
- Sections are defined in `functions/content/courses.json` (`sections`, and `sec` on each course).


## Launch, backups and operations

See `LAUNCH-CHECKLIST.md` for the one-time console steps (App Check, SMS limits, budget alert, backups, answer-key uploads) and the go-live check.

After changing lessons or exam questions: run `python3 scripts/build_examkeys.py`, commit `functions/content/*.json` (served to signed-in learners only, through the `content` function), then upload `private-keys/examkeys/*.json` from Admin > Growth and exams.
