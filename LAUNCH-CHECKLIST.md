# Launch checklist

Tick every line before opening the Academy to the public.

## Before you push
- [ ] `functions/lib/staff.js`, `listed()` in `firestore.rules` and `STAFF` in `one/js/config.js` all list the same people (`cd functions && npm install && npm test`).
- [ ] `CONTACT_EMAIL` in `one/js/config.js` is a mailbox that exists and is watched (default: social@uppercrustwealth.com).
- [ ] Privacy notice and Terms (`one/js/legal.js`) read by your lawyer or compliance officer. Names a grievance contact.
- [ ] Compliance has approved the fund pages (risk wording is in `one/js/disclaimer.js`) and the "Certified Professional" wording.
- [ ] Run `sh scripts/sri.sh` on a computer with internet and paste the output over the CDN `<script>` tags in `index.html`.

## Firebase console
- [ ] Authentication > Sign-in method: Phone, Google, Email/Password on. Authorized domains include `ucwacademy.in`.
- [ ] Authentication > Settings > SMS region policy: allow India only (add other countries only if you want NRIs).
- [ ] Phone sign-in: set a daily SMS quota; add a fictional test number only for your own testing.
- [ ] Google Cloud > Billing > Budgets: a budget alert (for example Rs 2,000 and Rs 5,000).
- [ ] Firestore > Disaster recovery: enable point-in-time recovery, and a daily backup schedule (`gcloud firestore backups schedules create --database='(default)' --recurrence=daily --retention=14d`).
- [ ] Firestore > Rules: the deployed rules match `firestore.rules` in the repository (the deploy workflow publishes them).
- [ ] Firestore location is a Mumbai/India region if you want data in India (cannot be changed later).

## App Check (blocks bots from SMS and the backend)
- [ ] Firebase console > App Check > Apps > Web: register with reCAPTCHA v3, copy the site key into `APPCHECK_SITE_KEY` in `one/js/config.js`, deploy the site.
- [ ] Watch App Check metrics for a day; if verified requests are above 95%, set `ENFORCE_APPCHECK=1` on the functions and enforce App Check for Authentication (phone) and Firestore.

## Data
- [ ] Admin > Growth and exams: **Verify staff accounts**, then sign out and in.
- [ ] Course exam keys: all 37 courses and `_meta` show "All uploaded".
- [ ] NISM answer keys: all 13 exams show "Keys uploaded".
- [ ] Actions > Update funds: run once by hand; check the fund pages show a recent "as on" date.
- [ ] Actions > Update headlines: run once by hand.
- [ ] Firestore > `credentials`: delete any test credentials made before this release (they were issued by the old browser code).

## Go-live test (use a phone, not your computer)
- [ ] Sign in with a mobile number: receive the code, sign in, accept the consent step, finish the profile.
- [ ] Close the app, reopen on another device with the same number: progress is still there (this proves the database save works for phone users).
- [ ] Pass one module quiz and the Beginner exam of a short course: certificate appears; open its verify link in a private window.
- [ ] Try a refresher on that course.
- [ ] Take one NISM mock; open its review.
- [ ] Delete the test account from My progress; confirm it signs out and the certificate link now says "Not found".
- [ ] Admin > Growth and exams shows the new learner; Recent errors is empty.

## After launch
- [ ] Check Recent errors daily for the first week.
- [ ] Re-run `scripts/build_examkeys.py` and upload keys whenever lessons or exam questions change.
- [ ] GitHub scheduled workflows pause after 60 days without repository activity: make a commit or run them by hand.
