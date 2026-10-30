# UpperCrust One

Learning platform for UpperCrust Wealth. Static site (GitHub Pages) + Firebase Auth + Firestore. No build step.

## What is where

| Path | What it is |
|---|---|
| `index.html` | App shell |
| `one/css/one.css` | All styles and design tokens |
| `one/js/*.js` | App code. `config.js` holds every setting |
| `one/data/*.json` | Courses, lessons, client scenarios, fund factsheets, indices, Hindi and Gujarati questions |
| `assets/logo-uppercrust.png` | Logo |
| `firestore.rules` | Security rules. Paste into the Firebase console and Publish |
| `scripts/`, `.github/workflows/` | Headlines pipeline (writes to branch `news-data`) |
| `CNAME` | `ucwacademy.in` |

## Sign-in

Two tabs: UpperCrust employee (accounts you create in Firebase Authentication) and New learner (name, mobile, email, password; needs Email/Password enabled in Firebase Authentication).

## Adding an employee

1. Firebase console, Authentication, add the user (email + password).
2. Add the email to `STAFF` in `one/js/config.js` and to `listed()` in `firestore.rules`. Publish the rules.

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

Pass a module quiz (70%), then the course exam (80%) to earn a course certificate. Valid 12 months; a 15-question refresher (80%) renews. Index courses are optional and do not count toward level credentials. Verify page: `https://ucwacademy.in/#/verify/<ID>`.

## AI feedback (optional)

Set `AI_ENDPOINT` in `config.js` to a URL you host. The app POSTs `{quote, context, answer, mustCover}` and expects `{feedback: "text"}`. Never put an API key in this repository.

## Known limits

- Lesson content and answers ship to the browser, so a determined learner can read them.
- Scores and credentials are computed in the browser. For tamper-proof results, move scoring to Cloud Functions.
- The interface is English. Quiz questions can be shown in Hindi and Gujarati where translated.


## Courses, exams and syllabus

- **Courses** page (was Explore) groups 23 courses into sections and has a **Market news** tab (headlines from the `news-data` branch; run Actions > Update headlines once to create it).
- Every course has three exams of 20 questions: Beginner (80% to pass, issues the certificate), Intermediate (75%) and Hard (70%). Each opens after the one before. Each has a syllabus page at `#/syllabus/<course>/<b|i|h>`.
- Exam questions live in `one/data/exams.json`. Beginner draws from the lesson questions; Intermediate and Hard have their own 20 each. Index course questions are generated from `indices.json`.
- Sections are defined in `one/data/courses.json` (`sections`, and `sec` on each course).
