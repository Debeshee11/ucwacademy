"""Builds every landing page, the share images, sitemap.xml and robots.txt.  Run from anywhere:  python3 tools/seo/build_seo.py
Output goes to learn/, assets/og/, sitemap.xml and robots.txt at the repo root. Re-run after changing content or adding an exam."""
import os, sys, shutil
sys.path.insert(0, os.path.dirname(__file__))
from common import ROOT, SITE, TODAY, write
import nism_pages, unit_pages, course_pages, hub_pages, lang_pages


def main(skip_og=False):
    os.makedirs(os.path.join(ROOT, "learn"), exist_ok=True)
    shutil.copy(os.path.join(os.path.dirname(__file__), "seo.css"), os.path.join(ROOT, "learn", "seo.css"))
    urls = hub_pages.build() + nism_pages.build() + unit_pages.build() + course_pages.build() + lang_pages.build()
    pri = lambda u: "0.9" if u in ("/learn/", "/learn/nism", "/learn/personal-finance") else "0.8" if u.startswith("/learn/nism-") and "-unit-" not in u else "0.7" if "-unit-" in u else "0.6"
    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    xml.append(f"<url><loc>{SITE}/</loc><lastmod>{TODAY}</lastmod><priority>1.0</priority></url>")
    xml += [f"<url><loc>{SITE}{u}</loc><lastmod>{TODAY}</lastmod><priority>{pri(u)}</priority></url>" for u in urls]
    xml.append("</urlset>")
    write("sitemap.xml", "\n".join(xml) + "\n")
    write("robots.txt", f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
    from layout import page
    write("404.html", page(path="/404", title="Page not found | UpperCrust Academy", desc="That page does not exist. Browse free NISM mock tests and finance courses.", noindex=True,
          body="<section class='hero'><h1>Page not found</h1><p class='lead'>That link is wrong or the page moved. Pick a place to start:</p><div class='cta'><a class='btn' href='/learn/nism'>NISM mock tests</a><a class='btn ghost' href='/learn/'>All courses</a></div></section>"))
    n = 0 if skip_og else __import__("og").build()
    print(f"{len(urls)} pages, {n} share images, sitemap.xml, robots.txt")


if __name__ == "__main__":
    main(skip_og="--no-og" in sys.argv)
