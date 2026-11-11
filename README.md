# SEO pages, flat version (easy manual upload)
All 55 pages are now plain files directly inside `learn/`. No subfolders.
Use this INSTEAD of UCW-seo-missing.zip. Do not upload the old nested folders.

| Path | Copy to | Type |
|---|---|---|
| learn/*.html (55) + learn/seo.css | learn/ (overwrites learn/index.html and seo.css) | Frontend |
| sitemap.xml | repo root (replace) | Frontend |
| index.html | repo root (replace) | Frontend |
| tools/seo/*.py, seo.css | tools/seo/ (replace) | Build tool |

Steps: 1) Upload files inside `learn` (56 files, one batch). 2) Upload sitemap.xml and index.html at root. 3) Upload tools/seo files.
URLs now look like ucwacademy.in/learn/nism-v-a-mutual-fund-distributors
