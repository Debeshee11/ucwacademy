"""The /learn/ home and the personal finance hub."""
from common import SITE, esc, write, app_link
from layout import page, jsonld, faq_ld, faq_html, crumbs_ld, crumbs_html, share_html, disclaimer
import course_pages as CP
import nism_pages as NP


def course_cards(ids):
    return "<div class='cards'>" + "".join(f"<a class='card' href='{CP.path_of(CP.COURSES[i])}'><b>{esc(CP.COURSES[i]['title'])}</b><span>{esc(CP.COURSES[i]['blurb'][:110])}</span></a>" for i in ids if i in CP.COURSES) + "</div>"


def personal_finance():
    p = "/learn/personal-finance/"; crumbs = [("Home", "/learn/"), ("Personal finance", p)]
    basics = next(s for s in CP.C["sections"] if s["id"] == "basics")
    blocks = "".join(f"<section><h3>{esc(t['name'])}</h3><p>{esc(t['blurb'])}</p>{course_cards(t.get('courses', []))}</section>" for t in basics["tracks"])
    more = [t for sid in ("mf", "stocks") for s in CP.C["sections"] if s["id"] == sid for t in s["tracks"][:2]]
    blocks += "".join(f"<section><h3>{esc(t['name'])}</h3><p>{esc(t['blurb'])}</p>{course_cards(t.get('courses', []))}</section>" for t in more)
    fq = [("Where should I start with personal finance?", "Start with a budget and an emergency fund, then cover insurance, clear costly debt, and only then begin investing through a SIP."),
          ("How much should an emergency fund be?", "A common rule is three to six months of essential expenses, kept in a safe and easy-to-withdraw place such as a savings account or liquid fund."),
          ("Is this personal finance course free?", "Yes. All lessons, quizzes and practice are free. Sign in once with your mobile number or Google."),
          ("Can I learn personal finance in Hindi or Gujarati?", "Yes. The app switches between English, Hindi and Gujarati, and the quiz questions follow your language."),
          ("Is this financial advice?", "No. It is education only. Speak to a qualified adviser before you act on your own money.")]
    body = f"""{crumbs_html(crumbs)}
<section class="hero"><p class="eyebrow">Personal finance course</p><h1>Personal finance course for India: free, in English, Hindi and Gujarati</h1>
<p class="lead">Budgeting, emergency funds, insurance, loans and credit scores, SIPs and mutual funds, tax and retirement. Short lessons, honest quizzes and a certificate you can verify.</p>
<div class="cta"><a class="btn" href="{app_link('courses', 'pf-hub')}">Start free</a><a class="btn ghost" href="/learn/hi/personal-finance/">हिन्दी में</a><a class="btn ghost" href="/learn/gu/personal-finance/">ગુજરાતીમાં</a></div>{share_html(SITE + p, 'Free personal finance course for India')}</section>
{blocks}{faq_html(fq)}{disclaimer()}"""
    write("learn/personal-finance/index.html", page(path=p, title="Personal Finance Course India: Free, Hindi, Gujarati & English", og="/assets/og/personal-finance.jpg",
          desc="Free personal finance course for India: budgeting, emergency fund, insurance, loans, credit score, SIP, mutual funds and tax. Short lessons and quizzes.",
          alts=[("en", p), ("hi", "/learn/hi/personal-finance/"), ("gu", "/learn/gu/personal-finance/")],
          body=body, ld=jsonld(crumbs_ld(crumbs), faq_ld(fq)), cta=("Start free", app_link("courses", "pf-hub"))))
    return p


def home():
    p = "/learn/"
    secs = "".join(f"<section><h2>{esc(s['name'])}</h2><p>{esc(s['blurb'])}</p>{course_cards([c for t in s['tracks'] for c in t.get('courses', [])])}</section>" for s in CP.C["sections"] if any(t.get("courses") for t in s["tracks"]))
    body = f"""<section class="hero"><p class="eyebrow">Free learning from UpperCrust Wealth</p><h1>Learn money, markets and NISM, free</h1>
<p class="lead">Short lessons, honest quizzes and verifiable certificates, in English, Hindi and Gujarati. Built by a wealth firm with 25+ years of experience.</p>
<div class="cta"><a class="btn" href="{app_link('', 'learn-home')}">Start free</a></div>{share_html(SITE + p, 'Free money and NISM courses')}</section>
<div class="cards big"><a class="card hot" href="/learn/nism/"><b>NISM exams</b><span>{len(NP.EXAMS)} exams with free mock tests and study guides</span></a><a class="card hot" href="/learn/personal-finance/"><b>Personal finance</b><span>Budgeting, insurance, loans, SIPs and tax</span></a></div>
{secs}{disclaimer()}"""
    write("learn/index.html", page(path=p, title="UpperCrust Academy: Free NISM Mock Tests & Personal Finance Courses", og="/assets/og/home.jpg",
          desc="Free NISM mock tests, study guides and personal finance courses in English, Hindi and Gujarati. Short lessons, quizzes and verifiable certificates.",
          body=body, ld=jsonld({"@context": "https://schema.org", "@type": "EducationalOrganization", "name": "UpperCrust Academy", "url": SITE, "parentOrganization": {"@type": "Organization", "name": "UpperCrust Wealth"}}),
          cta=("Start free", app_link("", "learn-home"))))
    return p


def build():
    return [home(), personal_finance()]
