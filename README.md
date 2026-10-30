# UpperCrust One

Learning platform for UpperCrust Wealth. Static site (GitHub Pages) + Firebase Auth + Firestore. No build step.

## What is where

| Path | What it is |
|---|---|
| `index.html` | UpperCrust One (new app shell) |
| `one/css/one.css` | All styles and design tokens |
| `one/js/*.js` | App code. `config.js` holds every setting |
| `one/data/*.json` | Courses, 90 lessons, 11 client scenarios, Hindi and Gujarati questions |
| `classic/` | The previous app (Fund library, Index Lab, Profiler, Rapid Fire, admin console), unchanged |
| `assets/logo-uppercrust.png` | Logo |
| `firestore.rules` | Security rules. Paste into Firebase console |
| `scripts/`, `.github/workflows/` | Headlines pipeline (writes to branch `news-data`) |
| `CNAME` | `ucwacademy.in` |

## Settings (`one/js/config.js`)

Admin email, pass marks, question counts, credential validity, headlines location, optional AI endpoint.

## Adding a new learner

1. Firebase console, Authentication, add the user (email + password).
2. Add the email to the `listed()` array in `firestore.rules`, publish the rules.

## Credentials

Pass a module quiz (70%), then the course exam (80%) to earn a course certificate. Both Practitioner courses give the Practitioner credential. All courses plus five Client Lab scenarios give the Professional credential. Valid 12 months; a 15-question refresher (80%) renews. Verify page: `https://ucwacademy.in/#/verify/<ID>`.

## AI feedback (optional)

Set `AI_ENDPOINT` in `config.js` to a URL you host. The app POSTs `{quote, context, answer, mustCover}` and expects `{feedback: "text"}`. Never put an API key in this repository.

## Known limits

- Lesson content and answers ship to the browser, so a determined learner can read them.
- Scores and credentials are computed in the browser. For tamper-proof results, move scoring to Cloud Functions.
- The interface is English. Quiz questions can be shown in Hindi and Gujarati.
- Rapid Fire, leaderboard, Index Lab, Fund library and Profiler remain in `/classic/`.


## v3: two logins, Library, REITs and InvITs
- Login has two tabs: UpperCrust employee (existing accounts) and New learner (name, mobile, email, password).
- In Firebase Console > Authentication > Sign-in method, Email/Password must be enabled (it already is for staff).
- Publish the new `firestore.rules` (any signed-in user can save their own progress; staff-only classic data stays gated).
- Library: `#/funds`, `#/indices` with factsheets. Quizzes: fund, market, index. New course: REITs and InvITs.
