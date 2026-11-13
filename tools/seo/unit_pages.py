"""One landing page per NISM unit: notes (key terms, examples, exam traps) and practice questions. Answers stay in the app."""
from common import SITE, esc, slug, write, app_link, file_for, fit
from layout import page, jsonld, faq_ld, faq_html, crumbs_ld, crumbs_html, share_html, disclaimer
import nism_pages as N


def questions(d, n, k=6):
    seen, out = set(), []
    for m in d["mocks"]:
        for q in m:
            if q["u"] == n and q["p"] not in seen:
                seen.add(q["p"]); out.append(q)
                if len(out) == k:
                    return out
    return out


def terms(u):
    rows = []
    for f in u.get("facts", []):
        name, defn, ex = f[0], f[1], f[2]
        trap = f[3] if len(f) > 3 else ""
        rows.append(f"<div class='term'><h3>{esc(name)}</h3><p>{esc(defn)}</p><p class='ex'><b>Example.</b> {esc(ex)}</p>"
                    + (f"<p class='trap'><b>Exam trap.</b> This statement is false: {esc(trap)}</p>" if trap else "") + "</div>")
    return "".join(rows)


def unit_page(e, d, u):
    p = N.unit_path(e, u); ep = N.path_of(e); code = e["code"]; camp = f"{e['id']}-u{u['n']}"
    qs = questions(d, u["n"])
    title = fit(f"NISM {e['series']} Unit {u['n']}: {u['title']}", [" Notes & Questions", " Questions", ""], 64)
    desc = (f"{u['title']} for {code}: key terms with examples, exam traps and {len(qs)} practice questions. "
            f"Unit {u['n']} carries about {u['w']}% of the paper. Free.")
    prev = next((x for x in d["units"] if x["n"] == u["n"] - 1), None); nxt = next((x for x in d["units"] if x["n"] == u["n"] + 1), None)
    crumbs = [("Home", "/learn/"), ("NISM exams", "/learn/nism"), (code, ep), (f"Unit {u['n']}", p)]
    fq = [(f"How much of {code} comes from Unit {u['n']}?", f"Unit {u['n']} ({u['title']}) usually carries about {u['w']}% of the questions. The whole exam has {e['qs']} questions and the pass mark is {e['pass']}%."),
          (f"What should I study in {code} Unit {u['n']}?", " ".join(u.get("focus", [])[:4]) or u["overview"]),
          (f"Are these {code} practice questions free?", f"Yes. Take the full free mocks to see the correct answer and the reason for every question.")]
    qh = "".join(f"<div class='q'><p><b>Q{i + 1}.</b> {esc(q['p'])}</p><ol type='A'>" + "".join(f"<li>{esc(o)}</li>" for o in q["o"]) + "</ol></div>" for i, q in enumerate(qs))
    nav = "<div class='cards'>" + (f"<a class='card' href='{N.unit_path(e, prev)}'><b>← Unit {prev['n']}</b><span>{esc(prev['title'])}</span></a>" if prev else "") + \
          (f"<a class='card' href='{N.unit_path(e, nxt)}'><b>Unit {nxt['n']} →</b><span>{esc(nxt['title'])}</span></a>" if nxt else "") + "</div>"
    body = f"""{crumbs_html(crumbs)}
<section class="hero"><p class="eyebrow">{esc(code)} · Unit {u['n']} of {e['units']} · about {u['w']}% of the paper</p><h1>{esc(u['title'])}: {esc(code)} notes and practice questions</h1>
<p class="lead">{esc(u['overview'])}</p>
<div class="cta"><a class="btn" href="{app_link(f"nism/{e['id']}/mock/1", camp)}">Practise this unit free</a><a class="btn ghost" href="{ep}">All of {esc(code)}</a></div>
{share_html(SITE + p, f"{code} Unit {u['n']} notes and questions")}</section>
<section><h2>What to know in Unit {u['n']}</h2><ul>{"".join(f"<li>{esc(x)}</li>" for x in u.get('focus', []))}</ul></section>
<section><h2>Key terms, examples and exam traps</h2>{terms(u)}</section>
<section><h2>{len(qs)} practice questions</h2><p>Read each question and choose your answer before opening the free mock, which shows the correct answer and the reason.</p>{qh}
<div class="cta"><a class="btn" href="{app_link(f"nism/{e['id']}/mock/1", camp)}">See the answers in the free mock</a></div></section>
{faq_html(fq)}
<section><h2>Next</h2>{nav}<p><a href="{ep}">Back to {esc(code)}: syllabus, pattern and mocks</a></p></section>
{disclaimer()}"""
    write(file_for(p), page(path=p, title=title, desc=desc, body=body, og=N.og_of(e),
          ld=jsonld(crumbs_ld(crumbs), faq_ld(fq)), cta=("Practise this unit free", app_link(f"nism/{e['id']}/mock/1", camp))))
    return p


def build():
    out = []
    for e in N.EXAMS:
        d = N.detail(e)
        out += [unit_page(e, d, u) for u in d["units"]]
    return out
