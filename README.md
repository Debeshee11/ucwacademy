# UpperCrust Academy

Learning portal for UpperCrust Wealth Relationship Managers.

## Live site
Once GitHub Pages is enabled: https://debeshee11.github.io/ucwacademy/

## Setup

### Step 1 — Create Firebase project

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `ucwacademy` → disable Google Analytics → Create project
3. In the left panel: **Build** → **Firestore Database** → Create database
   - Choose **Production mode** (we will set rules next)
   - Choose a region close to India (e.g. `asia-south1`)
4. In the left panel: **Project settings** (gear icon) → **General** tab
   - Scroll down to "Your apps" → click **</>** (Web app) → register it
   - Copy the `firebaseConfig` object — it looks like:
     ```js
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
     ```

### Step 2 — Set Firestore security rules

In Firebase Console: **Firestore Database** → **Rules** tab → paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /funds/{doc}   { allow read: if true; allow write: if true; }
    match /news/{doc}    { allow read: if true; allow write: if true; }
    match /lessons/{doc} { allow read: if true; allow write: if true; }
    match /i18n/{doc}    { allow read: if true; allow write: if true; }
    match /indices/{doc} { allow read: if true; allow write: if true; }
    match /players/{uid} { allow read, write: if true; }
    match /data/users/{uid}/{doc} { allow read, write: if true; }
  }
}
```

Click **Publish**.

### Step 3 — Fill in Firebase config in index.html

Open `index.html` and find this block near line 927:

```js
window.__firebase_config = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  ...
};
```

Replace each `REPLACE_WITH_...` value with the values from Step 1.

### Step 4 — Fill in config.json files for scheduled tasks

Open both files and replace the placeholder values with your Firebase details:
- `C:\Users\diyad\.claude\scheduled-tasks\fund-library-weekly\config.json`
- `C:\Users\diyad\.claude\scheduled-tasks\market-desk-daily-drafts\config.json`

Set `firebase_project_id` to your project ID and `firebase_api_key` to your API key from Step 1.

### Step 5 — Push to GitHub

Open Git Bash in this folder and run:

```bash
git init
git add .
git commit -m "Initial deploy"
git branch -M main
git remote add origin https://github.com/Debeshee11/ucwacademy.git
git push -u origin main
```

### Step 6 — Enable GitHub Pages

1. Go to https://github.com/Debeshee11/ucwacademy/settings/pages
2. Under **Source**: select **Deploy from a branch**
3. Branch: `main`, folder: `/ (root)`
4. Click **Save**
5. Your site will be live at: https://debeshee11.github.io/ucwacademy/

---

## Admin access (owner mode)

To unlock admin features on the live site, open the browser console on the portal and run:

```js
localStorage.setItem("uc_owner", "1"); location.reload();
```

To revoke: `localStorage.removeItem("uc_owner"); location.reload()`

## Scheduled tasks

The Fund Library and Market Desk update automatically via Claude scheduled tasks:
- **Fund Library**: every Monday at 8 AM (task: `fund-library-weekly-2`)
- **Market Desk**: every day at 8 AM (task: `market-desk-daily-drafts`)

Both tasks now write directly to Firebase Firestore — updates appear live on the site.
