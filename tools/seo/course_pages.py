"""One landing page per course, and the lookup of which section a course belongs to."""
from common import SITE, esc, load, write, app_link, file_for
from layout import page, jsonld, faq_ld, faq_html, crumbs_ld, crumbs_html, share_html, disclaimer

C = load("courses.json")
LESSONS = {str(x["n"]): x for x in load("lessons.json")}
LEVELS = {l["id"]: l for l in C["levels"]}
COURSES = {c["id"]: c for c in C["courses"]}
SEC_OF = {cid: s for s in C["sections"] for t in s["tracks"] for cid in t.get("courses", [])}


def path_of(c):
    return f"/learn/course-{c['id']}"


def og_of(c):
    return f"/assets/og/c-{c['id']}.jpg"


def lessons_of(c):
    return [LESSONS[str(n)] for m in c["modules"] for n in m["lessons"] if str(n) in LESSONS]


def samples(c, k=2):
    out = []
    for l in lessons_of(c):
        for q in l.get("qs", []):
            if q.get("options") and isinstance(q.get("answer"), int):
                out.append(q); break
        if len(out) == k:
            break
    return out


def key_ideas(c, k=6):
    out = []
    for l in lessons_of(c):
        for r in (l.get("remember") or [])[:2]:
            out.append(r)
    return out[:k]


def faqs_for(c, n):
    lv = LEVELS[c["level"]]["name"]
    return [(f"Is the {c['title']} course free?", "Yes. Lessons, quizzes and practice are free. Sign in once with your mobile number or Google to start."),
            (f"Who is the {c['title']} course for?", f"It is a {lv.lower()}-level course with {n} short lessons, written in plain language for beginners and for people who advise others on money."),
            ("Can I learn this in Hindi or Gujarati?", "Yes. Switch the app between English, Hindi and Gujarati at any time, and the quiz questions follow."),
            ("Do I get a certificate?", "Yes. Pass the course exams to earn a certificate that anyone can verify online."),
            ("Is this investment advice?", "No. It is education only. Speak to a qualified adviser before you act on your own money.")]


def course_page(c):
    sec = SEC_OF.get(c["id"], {"name": "Courses"}); lv = LEVELS[c["level"]]["name"]; ls = lessons_of(c); p = path_of(c)
    title = f"{c['title']}: Free Course with Quizzes"
    desc = f"{c['blurb']} {len(ls)} short lessons, quizzes and practice. Free, in English, Hindi and Gujarati."[:300]
    fq = faqs_for(c, len(ls)); camp = "c-" + c["id"]
    crumbs = [("Home", "/learn/"), (sec["name"], "/learn/personal-finance" if sec["id"] == "basics" else "/learn/"), (c["title"], p)]
    mods = "".join(f"<div class='mod'><h3>{esc(m['title'])}</h3><ol>" + "".join(f"<li>{esc(LESSONS[str(n)]['title'])}</li>" for n in m["lessons"] if str(n) in LESSONS) + "</ol></div>" for m in c["modules"])
    ideas = key_ideas(c)
    qs = "".join(f"<div class='q'><p><b>Q{i + 1}.</b> {esc(q['prompt'])}</p><ol type='A'>" + "".join(f"<li>{esc(o)}</li>" for o in q["options"]) + f"</ol><details class='faq'><summary>Show the answer</summary><p><b>{'ABCD'[q['answer']]}.</b> {esc(q.get('why', ''))}</p></details></div>" for i, q in enumerate(samples(c)))
    sib = [COURSES[x] for t in sec.get("tracks", []) for x in t.get("courses", []) if x in COURSES and x != c["id"]][:4]
    rel = "<div class='cards'>" + "".join(f"<a class='card' href='{path_of(x)}'><b>{esc(x['title'])}</b><span>{esc(LEVELS[x['level']]['name'])}</span></a>" for x in sib) + "</div>" if sib else ""
    body = f"""{crumbs_html(crumbs)}
<section class="hero"><p class="eyebrow">{esc(sec['name'])} · {esc(lv)}</p><h1>{esc(c['title'])}</h1><p class="lead">{esc(c['blurb'])}</p>
<div class="cta"><a class="btn" href="{app_link('course/' + c['id'], camp)}">Start this course free</a></div>{share_html(SITE + p, 'Free course: ' + c['title'])}</section>
<section><h2>What is inside</h2><p>{len(ls)} short lessons. Each ends with a quiz, so you know what you have learnt.</p>{mods}</section>
{('<section><h2>Key ideas you will take away</h2><ul>' + ''.join(f'<li>{esc(x)}</li>' for x in ideas) + '</ul></section>') if ideas else ''}
{('<section><h2>Try a question</h2>' + qs + '</section>') if qs else ''}
{faq_html(fq)}
{('<section><h2>Related courses</h2>' + rel + '</section>') if rel else ''}
{disclaimer()}"""
    write(file_for(p), page(path=p, title=title, desc=desc, body=body, og=og_of(c),
          ld=jsonld(crumbs_ld(crumbs), faq_ld(fq), {"@context": "https://schema.org", "@type": "Course", "name": c["title"], "description": c["blurb"],
                    "provider": {"@type": "Organization", "name": "UpperCrust Wealth", "sameAs": SITE}, "isAccessibleForFree": True, "inLanguage": ["en", "hi", "gu"],
                    "educationalLevel": lv, "offers": {"@type": "Offer", "price": "0", "priceCurrency": "INR", "category": "Free"}}),
          cta=("Start free", app_link("course/" + c["id"], camp))))
    return p


def build():
    return [course_page(c) for c in C["courses"]]
