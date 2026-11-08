All FRONTEND. Unzip at repo root, push.

| File | Destination | Type |
|---|---|---|
| one/js/store.js | one/js/store.js | frontend |
| one/js/auth.js | one/js/auth.js | frontend |
| one/js/app.js | one/js/app.js | frontend |
| one/js/team.js | one/js/team.js | frontend (admin text) |
| one/data/ui-hi.json, ui-gu.json | same paths | frontend |

Phone users now must enter an email on the profile step. Existing phone users without email see it once on next login.
Firestore rules already allow the email field. No backend change.
