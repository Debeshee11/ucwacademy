# Backend setup

Everything is deployed by GitHub Actions. One-time steps:

1. **Firebase**: upgrade to Blaze. Enable Phone, Google and Email/Password sign-in. Add `ucwacademy.in` to Authentication > Settings > Authorized domains.
2. **GitHub secret**: add `FIREBASE_SERVICE_ACCOUNT` (a service-account JSON with permission to deploy functions and rules).
3. **GitHub Pages**: Settings > Pages > Source: GitHub Actions. The site is published by `.github/workflows/pages.yml`.
4. Push to `main`. `.github/workflows/firebase.yml` runs the tests, then deploys the functions and `firestore.rules`.
5. Sign in as admin > account menu > Growth and exams:
   - **Verify staff accounts** (the admin and employees must have verified emails; sign out and in once afterwards).
   - Upload the **course exam keys** (`private-keys/examkeys/*.json`, including `_meta.json`).
   - Upload the **NISM answer keys**.
6. Work through `LAUNCH-CHECKLIST.md`.
