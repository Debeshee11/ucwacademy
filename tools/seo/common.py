"""Shared helpers for the SEO page builder. Reads the course and NISM data, never writes outside the repo."""
import json, os, re, html

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SITE = "https://ucwacademy.in"
BRAND = "UpperCrust Academy"
TODAY = os.environ.get("SEO_DATE", "2026-11-11")
UTM = "utm_source=seo&utm_medium=landing&utm_campaign="


def esc(s):
    return html.escape(str(s), quote=True)


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def load(p):
    with open(os.path.join(ROOT, "functions", "content", p), encoding="utf-8") as f:
        return json.load(f)


def app_link(hash_, campaign):
    """A link into the app, tagged so we can see which page sent the visitor."""
    return f"{SITE}/?{UTM}{campaign}#/{hash_}"


def write(rel, text):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(text)
