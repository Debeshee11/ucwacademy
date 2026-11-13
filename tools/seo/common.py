"""Shared helpers for the SEO page builder. Reads the course and NISM data, never writes outside the repo."""
import json, os, re, html

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SITE = "https://ucwacademy.in"
BRAND = "UpperCrust Academy"
TODAY = os.environ.get("SEO_DATE", "2026-11-13")
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


def file_for(path):
    """Landing pages are flat files in learn/ (easy to upload by hand). GitHub Pages serves /learn/x from learn/x.html."""
    return "learn/index.html" if path == "/learn/" else path.strip("/") + ".html"


def write(rel, text):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        f.write(text)


def clip(s, n=155):
    """Meta descriptions over ~155 characters get cut in results. Cut at a sentence end if we can, else at a word."""
    if len(s) <= n:
        return s
    cut = s[:n]
    i = max(cut.rfind(". "), cut.rfind("? "))
    if i >= 90:
        return cut[:i + 1]
    return cut[:cut.rfind(" ")].rstrip(" ,;:") + "."


def fit(base, tails, n=62):
    """Longest title (base + tail) that fits n characters; falls back to the shortest."""
    for t in tails:
        if len(base + t) <= n:
            return base + t
    return base + tails[-1]


# Plain-language guides that answer the questions people search for. (path, link text)
GUIDES = [
    ("/learn/nism-how-to-register-and-book-exam", "How to register and book a NISM exam"),
    ("/learn/nism-certificate-validity-and-renewal", "NISM certificate validity and renewal"),
    ("/learn/which-nism-exam-should-i-take", "Which NISM exam should I take?"),
    ("/learn/nism-passing-marks-all-exams", "NISM passing marks for every exam"),
    ("/learn/nism-v-a-study-plan", "NISM V-A study plan: 4 weeks"),
]
