# UCW all pending changes (one zip)
Includes: email-required, profile-save, compulsory-basics (name+email+mobile, CSV), content-retry.
Unzip at repo root, push to `main`. Two workflows run: "Deploy site" and "Deploy backend" (because of firestore.rules).

| File | Copy to | Type |
|---|---|---|
| firestore.rules | firestore.rules | Backend (deployed by "Deploy backend") |
| auth.js | one/js/auth.js | Frontend |
| content.js | one/js/content.js | Frontend |
| store.js | one/js/store.js | Frontend |
| team.js | one/js/team.js | Frontend |

After push: check both Actions runs are green.
