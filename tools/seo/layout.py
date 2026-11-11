"""The page shell and the small pieces every landing page shares."""
import json
from common import SITE, BRAND, esc, app_link


def jsonld(*objs):
    return "".join('<script type="application/ld+json">' + json.dumps(o, ensure_ascii=False, separators=(",", ":")) + "</script>" for o in objs)


def faq_ld(faqs):
    return {"@context": "https://schema.org", "@type": "FAQPage",
            "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]}


def crumbs_ld(items):
    return {"@context": "https://schema.org", "@type": "BreadcrumbList",
            "itemListElement": [{"@type": "ListItem", "position": i + 1, "name": n, "item": SITE + u} for i, (n, u) in enumerate(items)]}


def faq_html(faqs):
    return "<section><h2>Frequently asked questions</h2>" + "".join(f"<details class='faq'><summary>{esc(q)}</summary><p>{esc(a)}</p></details>" for q, a in faqs) + "</section>"


def crumbs_html(items):
    return "<nav class='crumbs' aria-label='Breadcrumb'>" + " <span>/</span> ".join(f"<a href='{u}'>{esc(n)}</a>" for n, u in items[:-1]) + (" <span>/</span> " if len(items) > 1 else "") + f"<b>{esc(items[-1][0])}</b></nav>"


def share_html(url, text):
    from urllib.parse import quote
    return ("<div class='share'><span>Share</span>"
            f"<a class='chip wa' href='https://wa.me/?text={quote(text + ' ' + url)}' rel='noopener'>WhatsApp</a>"
            f"<a class='chip' href='https://www.linkedin.com/sharing/share-offsite/?url={quote(url)}' rel='noopener'>LinkedIn</a>"
            f"<a class='chip' href='https://twitter.com/intent/tweet?text={quote(text)}&url={quote(url)}' rel='noopener'>X</a></div>")


def disclaimer():
    return ("<p class='fine'>UpperCrust Academy is independent study material from UpperCrust Wealth. It is not affiliated with NISM, SEBI or AMFI. "
            "For education only. Not investment advice. Always confirm the latest syllabus and rules on the official NISM website.</p>")


def page(*, path, title, desc, body, ld="", og="/assets/og/home.jpg", lang="en", alts=None, cta=None):
    url = SITE + path
    alt = "".join(f"<link rel='alternate' hreflang='{l}' href='{SITE}{p}'>" for l, p in (alts or []))
    sticky = f"<a class='sticky' href='{cta[1]}'>{esc(cta[0])}</a>" if cta else ""
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">{alt}
<meta name="theme-color" content="#FFB703">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{BRAND}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}{og}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(desc)}">
<meta name="twitter:image" content="{SITE}{og}">
<link rel="icon" type="image/svg+xml" href="/assets/icon.svg">
<link rel="stylesheet" href="/one/css/fonts.css">
<link rel="stylesheet" href="/learn/seo.css">
{ld}
</head>
<body>
<header class="top"><div class="wrap row"><a class="brand" href="/learn/"><img src="/assets/mark.svg" alt="" width="34" height="34"><span><b>UpperCrust</b><i>Academy</i></span></a>
<nav class="nav"><a href="/learn/nism">NISM</a><a href="/learn/personal-finance">Personal finance</a><a class="btn sm" href="{app_link('', 'header')}">Start free</a></nav></div></header>
<main class="wrap">
{body}
</main>
<footer class="foot"><div class="wrap">
<p><b>UpperCrust Academy</b> by UpperCrust Wealth. Free lessons, mock tests and verifiable certificates in English, Hindi and Gujarati.</p>
<p class="links"><a href="/learn/">All courses</a> · <a href="/learn/nism">NISM exams</a> · <a href="/learn/personal-finance">Personal finance</a> · <a href="/learn/hi-personal-finance">हिन्दी</a> · <a href="/learn/gu-personal-finance">ગુજરાતી</a> · <a href="{SITE}/#/privacy">Privacy</a> · <a href="{SITE}/#/terms">Terms</a></p>
{disclaimer()}
</div></footer>
{sticky}
</body>
</html>
"""
