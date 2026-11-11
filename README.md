# UCW SEO and share pack
Unzip at repo root, push to `main`. Only "Deploy site" runs (the workflow now also publishes `learn/`, `sitemap.xml`, `robots.txt`).

| Path | Copy to | Type |
|---|---|---|
| learn/ (55 pages + seo.css) | learn/ | Frontend (public landing pages) |
| assets/og/*.jpg (53 share images) | assets/og/ | Frontend |
| sitemap.xml, robots.txt | repo root | Frontend |
| index.html | index.html | Frontend (meta tags, JSON-LD, noscript links; includes the desktop login CSS link) |
| one/css/login-desktop.css | one/css/login-desktop.css | Frontend (desktop login fix) |
| .github/workflows/pages.yml | .github/workflows/pages.yml | Deploy config |
| tools/seo/*.py, seo.css | tools/seo/ | Build tool (not published) |

Regenerate after content changes: `python3 tools/seo/build_seo.py` (needs Playwright + Chrome for share images; `--no-og` skips them).

After the deploy:
1. Open https://ucwacademy.in/learn/nism/ and https://ucwacademy.in/sitemap.xml.
2. Search Console: add property `ucwacademy.in`, verify (DNS or HTML tag), submit `sitemap.xml`.
3. Request indexing for /, /learn/, /learn/nism/, /learn/personal-finance/.
4. Test share cards: paste a /learn/ link into WhatsApp.
