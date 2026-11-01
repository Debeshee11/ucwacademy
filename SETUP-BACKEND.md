# Backend setup

The full step-by-step is in PUSH-GUIDE.md that came with the master zip. Short version:

1. Firebase: upgrade to Blaze, enable Phone and Google sign-in, set SMS limits and a budget alert.
2. GitHub: add the secret FIREBASE_SERVICE_ACCOUNT, then add `.github/workflows/firebase.yml` (deploys the functions).
3. GitHub (owner account): Settings > Pages > Source: GitHub Actions, then add `.github/workflows/pages.yml`.
4. Sign in as admin > account menu > Growth and exams: Verify staff accounts, then upload the answer keys.
5. Firebase console > Firestore > Rules: publish `firestore.rules.STRICT`.
