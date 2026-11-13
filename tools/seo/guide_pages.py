"""Five guides that answer what people search before and around a NISM exam. Facts about NISM rules link to nism.ac.in."""
from common import SITE, esc, write, app_link, file_for, fit, GUIDES
from layout import page, jsonld, faq_ld, faq_html, crumbs_ld, crumbs_html, share_html, disclaimer
import nism_pages as N

OFFICIAL = "https://www.nism.ac.in/"
CERT = "https://cert.nism.ac.in/Certification/auth/login"
OK = "Rules and fees change. Check cert.nism.ac.in before you book."


def ext(url, text):
    return f"<a href='{url}' rel='noopener nofollow' target='_blank'>{esc(text)}</a>"


def guide_links(skip):
    return "<div class='cards'>" + "".join(f"<a class='card' href='{p}'><b>{esc(t)}</b></a>" for p, t in GUIDES if p != skip) + "</div>"


def wrap(path, title, h1, lead, body, faqs, desc, crumb):
    crumbs = [("Home", "/learn/"), ("NISM exams", "/learn/nism"), (crumb, path)]
    full = f"""{crumbs_html(crumbs)}
<section class="hero"><p class="eyebrow">NISM exam guide</p><h1>{esc(h1)}</h1><p class="lead">{esc(lead)}</p>
<div class="cta"><a class="btn" href="{app_link('nism', 'guide')}">Take a free mock test</a><a class="btn ghost" href="/learn/nism">All NISM exams</a></div>
{share_html(SITE + path, h1)}</section>
{body}
{faq_html(faqs)}
<section><h2>More NISM guides</h2>{guide_links(path)}</section>
<p class='fine'>{esc(OK)}</p>{disclaimer()}"""
    write(file_for(path), page(path=path, title=title, desc=desc, body=full, og="/assets/og/nism.jpg",
          ld=jsonld(crumbs_ld(crumbs), faq_ld(faqs)), cta=("Take a free mock test", app_link("nism", "guide"))))
    return path


def register():
    steps = [
        f"Create your profile on the NISM certification portal at {ext(CERT, 'cert.nism.ac.in')}. Registration is online and the window is open all year.",
        "Log in and choose Enrolment for Certification. Pick the exam you need, for example NISM Series V-A.",
        "Check seat availability, then choose a test centre, a date and a time slot.",
        "Pay the exam fee online. Fees differ by exam, so read the amount on the payment page.",
        "Download your confirmation and admit card and keep a copy of the payment receipt.",
        "On exam day, carry the admit card and a valid photo ID such as Aadhaar, PAN, passport or driving licence.",
    ]
    body = f"""<section><h2>NISM exam registration: step by step</h2><ol class="steps">{"".join(f"<li>{s}</li>" for s in steps)}</ol>
<p>NISM runs its exams at test centres in more than 150 cities, so book early to get the slot and centre you want.</p></section>
<section><h2>What does a NISM exam cost?</h2><p>The fee depends on the exam. NISM lists {ext(OFFICIAL + 'frequently-asked-questions-portfolio-management-services-distributors', 'Series XXI-A at ₹1,500')} including GST, and its certification pamphlet lists Series I at ₹1,500 and Series XIX-A at ₹1,770. Investment adviser exams cost more. Always read the fee on the portal on the day you book.</p></section>
<section><h2>Study material is free</h2><p>NISM sends a soft copy of the official workbook after you enrol, and you can also download it free from the NISM website. Our <a href="/learn/nism">unit-wise study guides and free mocks</a> work alongside it.</p></section>
<section><h2>Before you book</h2><ul><li>Finish one full read and at least two mocks first. <a href="/learn/nism-v-a-study-plan">See the 4-week plan</a>.</li><li>Not sure which exam to pick? Read <a href="/learn/which-nism-exam-should-i-take">which NISM exam to take</a>.</li><li>Enter your name exactly as it appears on your ID.</li></ul></section>"""
    fq = [("Is NISM registration open all year?", "Yes. NISM exam registration and the testing window stay open throughout the year, so you can book when you are ready."),
          ("Where do I register for a NISM exam?", "On the NISM certification portal, cert.nism.ac.in. After registration you choose a test centre, date and time slot and pay online."),
          ("Is the NISM study material free?", "Yes. NISM gives a soft copy of the workbook after enrolment and also lets you download it free from its website."),
          ("How early should I book a NISM exam?", "Book as early as you can. Popular centres and dates fill up, and you need time to finish your mocks first.")]
    return wrap("/learn/nism-how-to-register-and-book-exam", fit("How to Register for a NISM Exam", [": Steps, Fees & Booking", ": Steps & Fees"], 62),
                "How to register and book a NISM exam", "Six steps from profile to admit card, with what the exam costs and what to carry on exam day.", body, fq,
                "How to register for a NISM exam on cert.nism.ac.in: six steps, what it costs, how to book a test centre and what to carry on exam day.", "How to register")


def validity():
    body = f"""<section><h2>How long is a NISM certificate valid?</h2><p>NISM certificates are valid for <b>3 years</b>. To keep working in a regulated role you must renew the certificate before it expires.</p></section>
<section><h2>Two ways to renew</h2><ol class="steps"><li><b>Pass the exam again</b> before the certificate expires.</li>
<li><b>Complete a CPE programme</b> (continuing professional education) for that exam during the 12 months before the expiry date. NISM offers a classroom CPE and a shorter online eCPE. {ext(OFFICIAL + 'continuing-professional-education-cpe-ecpe', 'See the NISM CPE page')} for the exams that offer it and the current fee.</li></ol>
<p>Renewal gives you a further 3 years counted from the date your old certificate expires, so renewing early does not waste time.</p></section>
<section><h2>What if the certificate has already expired?</h2><p>The CPE route works only while the certificate is still valid. For example, NISM states that a mutual fund distributor whose certificate and ARN have expired must pass the NISM Series V-A exam again. Plan your renewal a few months ahead.</p></section>
<section><h2>Steps to avoid a lapse</h2><ul><li>Note the expiry date from your certificate the day you pass.</li><li>Set a reminder 6 months before it.</li><li>Take the CPE, or practise with our <a href="/learn/nism">free mocks</a> and rebook the exam.</li></ul></section>"""
    fq = [("How many years is a NISM certificate valid?", "A NISM certificate is valid for 3 years from the date it is issued."),
          ("How do I renew a NISM certificate?", "Either pass the same NISM exam again before expiry, or complete the CPE programme for that exam in the 12 months before the certificate expires."),
          ("How long does a renewed certificate last?", "A renewed certificate is valid for 3 years, counted from the date the old certificate expires."),
          ("Can I renew after the certificate has expired?", "CPE renewal needs a valid certificate. If it has expired, you generally have to pass the exam again.")]
    return wrap("/learn/nism-certificate-validity-and-renewal", fit("NISM Certificate Validity", [" and Renewal: 3 Years, CPE", " and Renewal"], 62),
                "NISM certificate validity and renewal", "Every NISM certificate lasts 3 years. Here is how to renew it on time, by CPE or by re-taking the exam.", body, fq,
                "NISM certificates are valid for 3 years. Learn how to renew by passing again or by CPE, and what to do if your certificate expires.", "Validity and renewal")


def which():
    roles = [("nism-v-a", "You sell or distribute mutual funds (ARN holder or sales staff)"), ("nism-v-d", "You distribute specialized investment funds (SIF)"),
             ("nism-xxi-a", "You distribute PMS products"), ("nism-xix-a", "You distribute AIFs (Category I and II)"),
             ("nism-viii", "You deal in equity derivatives at a broker"), ("nism-i", "You deal in currency derivatives"),
             ("nism-xv", "You want to publish research as a research analyst"), ("nism-x-a", "You want to become an investment adviser, Level 1"),
             ("nism-xb", "You are an investment adviser, Level 2"), ("nism-xi", "You work in equity sales"),
             ("nism-vi", "You work in depository operations"), ("nism-xxi-b", "You manage portfolios (portfolio manager)"),
             ("nism-xii", "You are new to the market or a student and want a first exam")]
    by = {e["id"]: e for e in N.EXAMS}
    rows = "".join(f"<tr><td>{esc(t)}</td><td><a href='{N.path_of(by[i])}'><b>{esc(by[i]['code'])}</b></a></td><td>{esc(by[i]['title'])}</td></tr>" for i, t in roles)
    body = f"""<section><h2>Find your exam by your job</h2><p>The right NISM exam follows the role you want. Find your situation in the table.</p>
<div class="tbl"><table><thead><tr><th>If…</th><th>Take</th><th>Exam</th></tr></thead><tbody>{rows}</tbody></table></div></section>
<section><h2>Not sure where to start?</h2><p>Students and career changers usually begin with <a href="{N.path_of(by['nism-xii'])}">NISM Series XII</a>, a broad market foundation. Anyone planning to sell mutual funds starts with <a href="{N.path_of(by['nism-v-a'])}">Series V-A</a>. Check your employer or the rule for your role before you pay for an exam.</p></section>
<section><h2>Compare pass marks and length</h2><p>See <a href="/learn/nism-passing-marks-all-exams">passing marks for every NISM exam</a> before you choose.</p></section>"""
    fq = [("Which NISM exam is required to sell mutual funds?", "NISM Series V-A, Mutual Fund Distributors."),
          ("Which NISM exam is required for a research analyst?", "NISM Series XV, Research Analyst."),
          ("Which NISM exam is required for an investment adviser?", "Investment advisers take NISM Series X-A (Level 1) and X-B (Level 2)."),
          ("Which NISM exam is best for beginners?", "NISM Series XII, Securities Markets Foundation, is a broad first exam. If you plan to distribute mutual funds, start with V-A.")]
    return wrap("/learn/which-nism-exam-should-i-take", "Which NISM Exam Should I Take? Pick by Job Role",
                "Which NISM exam should I take?", "Pick by what you want to do. A table of 13 exams matched to the job each one is for.", body, fq,
                "Which NISM exam should you take? Match your job, from mutual fund distributor to research analyst, to the right NISM series. Free mocks for each.", "Which exam")


def marks():
    rows = "".join(f"<tr><td><a href='{N.path_of(e)}'><b>{esc(e['code'])}</b></a></td><td>{esc(e['title'])}</td><td>{e['qs']}</td><td>{e['marks']}</td><td>{e['mins']}</td><td>{e['pass']}%</td><td>{esc(e['neg'])}</td></tr>" for e in N.EXAMS)
    body = f"""<section><h2>NISM pass marks, questions and time</h2><div class="tbl"><table><thead><tr><th>Exam</th><th>Title</th><th>Questions</th><th>Marks</th><th>Minutes</th><th>Pass</th><th>Negative marking</th></tr></thead><tbody>{rows}</tbody></table></div></section>
<section><h2>How to read this</h2><ul><li><b>Pass %</b> is the share of total marks you need. Series V-A needs 50%, most others need 60%.</li><li><b>Negative marking</b> takes marks off a wrong answer in some exams. Where it applies, leave a question blank if you are unsure.</li><li>Where there is no negative marking, attempt every question.</li></ul>
<p>Aim for 15 marks above the pass mark in your mocks before you book. <a href="/learn/nism-v-a-study-plan">See a 4-week plan</a>.</p></section>"""
    fq = [("What is the passing mark in NISM Series V-A?", "50% of the total marks, with no negative marking."),
          ("Is there negative marking in NISM exams?", "It depends on the exam. Series V-A and XII have none. Several others, such as VIII and XV, have 25% negative marking."),
          ("How many questions are in a NISM exam?", "Most have 100 questions in 120 minutes. The longer exams, such as X-B and XXI-B, run 3 hours."),
          ("How many marks should I score in mocks?", "Aim for about 15 marks above the pass mark before you book the real exam.")]
    return wrap("/learn/nism-passing-marks-all-exams", "NISM Passing Marks, Questions & Negative Marking",
                "NISM passing marks for every exam", "One table: pass mark, questions, time and negative marking for the 13 NISM exams we cover.", body, fq,
                "NISM pass marks, number of questions, exam time and negative marking for 13 NISM exams in one table. V-A needs 50%, most others 60%.", "Passing marks")


def plan():
    e = next(x for x in N.EXAMS if x["id"] == "nism-v-a"); d = N.detail(e); us = d["units"]
    learn = 15; tot = sum(u["w"] for u in us)
    days = {u["n"]: max(1, int(learn * u["w"] / tot)) for u in us}
    order = sorted(us, key=lambda u: -(learn * u["w"] / tot - days[u["n"]]))
    i = 0
    while sum(days.values()) < learn:
        days[order[i % len(order)]["n"]] += 1; i += 1
    while sum(days.values()) > learn:
        k = max(days, key=lambda n: days[n]); days[k] -= 1
    cur = 1; rows = ""
    for u in us:
        a, b = cur, cur + days[u["n"]] - 1; cur = b + 1
        rows += f"<tr><td>{a if a == b else f'{a}–{b}'}</td><td><a href='{N.unit_path(e, u)}'>Unit {u['n']}: {esc(u['title'])}</a></td><td>{u['w']}%</td></tr>"
    body = f"""<section><h2>The plan at a glance</h2><ul><li><b>Week 1–3:</b> read the units, about one hour a day. The heaviest units get the most days.</li><li><b>Week 4:</b> take the 5 mocks, redo every wrong answer, rest the day before.</li></ul>
<p>Most candidates need two to four weeks for an exam like V-A. If you work full time, use the full four weeks.</p></section>
<section><h2>Days 1–15: study the units</h2><div class="tbl"><table><thead><tr><th>Day</th><th>Unit</th><th>Weight</th></tr></thead><tbody>{rows}</tbody></table></div>
<p>Each unit page has notes, key terms, exam traps and practice questions.</p></section>
<section><h2>Days 16–28: mocks and revision</h2><ol class="steps"><li>Day 16–17: take <a href="{app_link('nism/nism-v-a/mock/1', 'plan')}">Mock 1</a>. Note your weak units.</li><li>Day 18–20: reread the weak units.</li><li>Day 21–25: take Mocks 2 to 5, one a day.</li><li>Day 26–27: redo every wrong answer. Each one names its unit.</li><li>Day 28: rest. Do not study new material.</li></ol>
<p>Book the real exam when you clear 65 or more in your mocks.</p></section>"""
    fq = [("How long does it take to prepare for NISM V-A?", "Most candidates need two to four weeks of about an hour a day. This plan uses four weeks."),
          ("Which NISM V-A units matter most?", "The units with the highest weight, listed in the plan table. Spend the most days on them."),
          ("How many mocks should I take?", "Take all 5 full mocks and redo every wrong answer. Book the exam once you score about 65 or more."),
          ("Is the official NISM workbook free?", "Yes. NISM gives a free soft copy after you enrol and lets you download it from its website.")]
    return wrap("/learn/nism-v-a-study-plan", "NISM V-A Study Plan: Pass in 4 Weeks (Day by Day)",
                "NISM V-A study plan: 4 weeks, day by day", "Fifteen days for the units in proportion to their weight, then mocks, revision and rest.", body, fq,
                "A day-by-day NISM Series V-A study plan: 15 days of unit study by weightage, then 5 mocks, revision and rest. Free notes and questions for every unit.", "V-A study plan")


def build():
    return [register(), validity(), which(), marks(), plan()]
