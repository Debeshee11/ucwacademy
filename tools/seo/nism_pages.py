"""One landing page per NISM exam, plus the NISM hub."""
from common import SITE, BRAND, esc, slug, load, write, app_link
from layout import page, jsonld, faq_ld, faq_html, crumbs_ld, crumbs_html, share_html, disclaimer

IDX = load("nism.json")
EXAMS = IDX["exams"]
TRACKS = {t["id"]: t for t in IDX["tracks"]}


def path_of(e):
    return f"/learn/nism/{slug(e['series'])}-{slug(e['short'])}/"


def og_of(e):
    return f"/assets/og/{e['id']}.jpg"


def detail(e):
    return load(f"nism/{e['id']}.json")


def samples(d, k=4):
    """A few questions spread across different units. Answers stay in the app."""
    seen, out = set(), []
    for q in d["mocks"][0]:
        if q["u"] in seen:
            continue
        seen.add(q["u"]); out.append(q)
        if len(out) == k:
            break
    return out


def facts(e, n_mocks):
    neg = e["neg"] if e["neg"] and e["neg"] != "None" else "None"
    cells = [(e["qs"], "Questions"), (e["marks"], "Marks"), (f"{e['mins']} min", "Time allowed"), (f"{e['pass']}%", "To pass"),
             (neg, "Negative marking"), (e["units"], "Units"), (n_mocks, "Full mock tests")]
    if e.get("pages"):
        cells.append((e["pages"], "Study guide pages"))
    return "<div class='facts'>" + "".join(f"<div><b>{esc(v)}</b><span>{esc(t)}</span></div>" for v, t in cells) + "</div>"


def faqs_for(e, n_mocks):
    neg = e["neg"] if e["neg"] and e["neg"] != "None" else None
    return [
        (f"How many questions are there in {e['code']}?", f"The {e['code']} ({e['title']}) exam has {e['qs']} multiple-choice questions carrying {e['marks']} marks, to be answered in {e['mins']} minutes."),
        (f"What is the passing score for {e['code']}?", f"The pass mark is {e['pass']}%. Aim to clear {min(e['pass'] + 15, 95)}% in practice mocks before you book the real exam."),
        (f"Is there negative marking in {e['code']}?", (f"Yes. The negative marking is {neg}. Practise leaving a question blank when you are unsure." if neg else "No. There is no negative marking, so attempt every question.")),
        (f"Is the {e['code']} study guide free?", f"Yes. UpperCrust Academy gives a free {e.get('pages', '')}-page study guide PDF for {e['code']}, written unit by unit." if e.get("pages") else f"Yes. UpperCrust Academy gives a free study guide PDF for {e['code']}."),
        (f"Are the {e['code']} mock tests free?", f"Yes. You get {n_mocks} full-length mock tests with the answer and the reason for every question. Sign in once with your mobile number or Google to start."),
        ("Is this affiliated with NISM?", "No. UpperCrust Academy is independent preparation material from UpperCrust Wealth. Confirm the latest syllabus and exam rules on the official NISM website."),
    ]


STEPS = ["Download the study guide and read the first three pages.", "Study the biggest units first. Their weight shows on this page.",
         "Take Mock 1 after one pass through the guide.", "Move to the next mock only when you clear the pass mark by 15 marks.",
         "Redo every wrong answer. Each one names its unit."]


def exam_page(e):
    d = detail(e); n_mocks = len(d["mocks"]); p = path_of(e); camp = e["id"]
    title = f"NISM {e['series']} {e['short']}: Free Mock Test, Syllabus & PDF"
    desc = f"Prepare for {e['code']} ({e['title']}) free: unit-wise syllabus, study guide PDF and {n_mocks} full mock tests with explanations. {e['qs']} questions, {e['pass']}% to pass."
    pdf = f"/assets/nism/{e['id']}-study-guide.pdf"
    fq = faqs_for(e, n_mocks)
    crumbs = [("Home", "/learn/"), ("NISM exams", "/learn/nism/"), (e["code"], p)]
    units = "".join(
        f"<details class='unit'{' open' if i == 0 else ''}><summary><b>Unit {u['n']}</b> {esc(u['title'])}<span class='w'>{u['w']}%</span></summary>"
        f"<p>{esc(u['overview'])}</p><ul>" + "".join(f"<li>{esc(x)}</li>" for x in u.get("focus", [])) + "</ul></details>" for i, u in enumerate(d["units"]))
    qs = "".join(
        f"<div class='q'><p><b>Q{i + 1}.</b> {esc(q['p'])}</p><ol type='A'>" + "".join(f"<li>{esc(o)}</li>" for o in q["o"]) + "</ol></div>" for i, q in enumerate(samples(d)))
    related = [x for x in EXAMS if x["track"] == e["track"] and x["id"] != e["id"]] or [x for x in EXAMS if x["id"] != e["id"]][:3]
    rel = "<div class='cards'>" + "".join(f"<a class='card' href='{path_of(x)}'><b>{esc(x['code'])}</b><span>{esc(x['title'])}</span></a>" for x in related[:4]) + "</div>"
    body = f"""{crumbs_html(crumbs)}
<section class="hero"><p class="eyebrow">NISM exam preparation · free</p><h1>{esc(e['code'])}: {esc(e['title'])} exam preparation</h1>
<p class="lead">{esc(e['blurb'])}</p>
<div class="cta"><a class="btn" href="{app_link(f"nism/{e['id']}/mock/1", camp)}">Take Mock 1 free</a><a class="btn ghost" href="{pdf}" download>Study guide PDF{f" · {e['pages']} pages" if e.get('pages') else ''}</a></div>
{share_html(SITE + p, f"Free {e['code']} mock tests and study guide")}</section>
<section><h2>{esc(e['code'])} exam pattern</h2>{facts(e, n_mocks)}</section>
<section><h2>{esc(e['code'])} syllabus, unit by unit</h2><p>The exam covers {e['units']} units. The percentage is the share of questions each unit usually carries, so spend your time in that proportion.</p>{units}</section>
<section><h2>Try {len(samples(d))} sample questions</h2><p>These are from Mock 1. Open the free mock to see the correct answer and the reason behind each one.</p>{qs}
<div class="cta"><a class="btn" href="{app_link(f"nism/{e['id']}/mock/1", camp)}">See answers in the free mock</a></div></section>
<section><h2>How to prepare for {esc(e['code'])}</h2><ol class="steps">{"".join(f"<li>{esc(s)}</li>" for s in STEPS)}</ol>
<p>The app also lists your weak units after each mock and lets you study in English, Hindi or Gujarati.</p></section>
{faq_html(fq)}
<section><h2>More NISM exams</h2>{rel}<p><a href="/learn/nism/">See all NISM exams</a></p></section>
{disclaimer()}"""
    write(p.strip("/") + "/index.html", page(path=p, title=title, desc=desc, body=body, og=og_of(e),
          ld=jsonld(crumbs_ld(crumbs), faq_ld(fq), {"@context": "https://schema.org", "@type": "Course", "name": f"{e['code']} {e['title']} preparation", "description": desc,
                    "provider": {"@type": "Organization", "name": "UpperCrust Wealth", "sameAs": SITE}, "isAccessibleForFree": True, "inLanguage": ["en", "hi", "gu"],
                    "offers": {"@type": "Offer", "price": "0", "priceCurrency": "INR", "category": "Free"}}),
          cta=("Take Mock 1 free", app_link(f"nism/{e['id']}/mock/1", camp))))
    return p


def hub():
    p = "/learn/nism/"; crumbs = [("Home", "/learn/"), ("NISM exams", p)]
    rows = "".join(f"<tr><td><a href='{path_of(e)}'><b>{esc(e['code'])}</b></a></td><td>{esc(e['title'])}</td><td>{e['qs']}</td><td>{e['mins']}</td><td>{e['pass']}%</td><td>{esc(e['neg'])}</td></tr>" for e in EXAMS)
    tracks = "".join(f"<section><h3>{esc(t['name'])}</h3><p>{esc(t['blurb'])}</p><div class='cards'>" +
                     "".join(f"<a class='card' href='{path_of(x)}'><b>{esc(x['code'])}</b><span>{esc(x['title'])}</span></a>" for x in EXAMS if x['track'] == t['id']) + "</div></section>" for t in IDX["tracks"])
    fq = [("Which NISM exam should I take?", "It depends on the role. Mutual fund distributors look at Series V-A, those new to markets at Series XII, and advisers and analysts at the advice and research exams listed below. Use the table to compare each exam."),
          ("Are these NISM mock tests free?", f"Yes. UpperCrust Academy gives free mock tests and a free study guide PDF for all {len(EXAMS)} exams listed here."),
          ("How do I prepare for a NISM exam?", "Read the study guide once, study the heaviest units first, then take mock tests. Move on only when you clear the pass mark by 15 marks, and redo every wrong answer."),
          ("Is the study material available in Hindi or Gujarati?", "The app, including its lessons and quizzes, can be switched between English, Hindi and Gujarati. The study guide PDFs are in English."),
          ("Is UpperCrust Academy part of NISM?", "No. It is independent preparation material from UpperCrust Wealth. Check the official NISM website for the latest syllabus and rules.")]
    body = f"""{crumbs_html(crumbs)}
<section class="hero"><p class="eyebrow">NISM exam preparation</p><h1>NISM exam preparation: free mock tests and study guides</h1>
<p class="lead">{len(EXAMS)} NISM exams, one place. Pick your exam, download the unit-wise study guide and practise with full mock tests that explain every answer.</p>
<div class="cta"><a class="btn" href="{app_link('nism', 'nism-hub')}">Start free</a></div>{share_html(SITE + p, 'Free NISM mock tests and study guides')}</section>
<section><h2>Compare all NISM exams</h2><div class="tbl"><table><thead><tr><th>Exam</th><th>Title</th><th>Questions</th><th>Minutes</th><th>Pass</th><th>Negative marking</th></tr></thead><tbody>{rows}</tbody></table></div></section>
<h2>Choose by what you do</h2>{tracks}
{faq_html(fq)}{disclaimer()}"""
    write("learn/nism/index.html", page(path=p, title="NISM Exam Preparation: Free Mock Tests & Study Guide PDFs", og="/assets/og/nism.jpg",
          desc=f"Free NISM mock tests, study guide PDFs and unit-wise syllabus for {len(EXAMS)} exams including V-A Mutual Fund Distributors, XII, VIII, X-A and XXI-A.",
          body=body, ld=jsonld(crumbs_ld(crumbs), faq_ld(fq)), cta=("Start free", app_link("nism", "nism-hub"))))
    return p


def build():
    return [path_of(e) for e in EXAMS if exam_page(e)] + [hub()]
