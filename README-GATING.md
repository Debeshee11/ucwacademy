## Content gating: files and where they go

| File | Destination | Type |
|---|---|---|
| functions/lib/content.js | functions/lib/content.js | BACKEND (new) |
| functions/index.js | functions/index.js | BACKEND |
| functions/content/** (all JSON, moved) | functions/content/ | BACKEND (moved from one/data) |
| one/js/content.js | one/js/content.js | FRONTEND (new) |
| one/js/data.js, nism.js, admin.js | same paths | FRONTEND |
| scripts/*.py, tools/nism/build_nism.py, README.md | same paths | tooling |

## Steps
1. In repo DELETE from one/data: courses, lessons, sims, funds, fundqs, indices, companies, indexqs, exams, tx-hi, tx-gu, nism.json and the nism/ folder. Keep ui-*.json and cat-*.json.
2. Unzip over repo. Push. Order matters: backend workflow deploys functions first (wait for green), then Pages.
3. Test: sign in, open Home, a lesson, NISM, Hindi.
4. Rollback: revert the commit.

## Notes
- Pages publishes only index.html, one/, assets/ (workflow). functions/ is never published.
- If the GitHub repo is PUBLIC, content is still readable on github.com. Make repo private (Pages on private repo needs paid plan) or accept.
- assets/nism/*.pdf study guides remain public files.
- Cost: one function call per app load (~1.7 MB), cached per session.
