"""Share images (1200x630) so WhatsApp, LinkedIn and X show a bright card, not a bare link. One per page type."""
import os, html
from common import ROOT, load
import nism_pages as NP
import course_pages as CP

FONTS = "file://" + os.path.join(ROOT, "assets", "fonts")
MARK = "file://" + os.path.join(ROOT, "assets", "mark.svg")
PAL = ["#FF6B6B", "#4CC9F0", "#9B5DE5", "#2EC4B6"]
E = html.escape


def card(eyebrow, title, chips, i=0):
    ch = "".join(f"<span>{E(c)}</span>" for c in chips)
    size = 84 if len(title) < 26 else 70 if len(title) < 42 else 58
    return f"""<html><head><style>
@font-face{{font-family:B;font-weight:200 800;src:url("{FONTS}/bricolage-grotesque-latin-wght-normal.woff2")}}
@font-face{{font-family:F;font-weight:200 800;src:url("{FONTS}/figtree-latin-wght-normal.woff2")}}
*{{box-sizing:border-box;margin:0}} body{{width:1200px;height:630px;overflow:hidden;font-family:F;color:#2A1E12;background:linear-gradient(150deg,#FFF3C9,#FFE08A 55%,#FFC93C);position:relative}}
.b1{{position:absolute;right:-90px;top:-110px;width:440px;height:440px;border-radius:50%;background:{PAL[i % 4]};opacity:.55}} .b2{{position:absolute;left:-80px;bottom:-120px;width:340px;height:340px;border-radius:50%;background:#4CC9F0;opacity:.45}}
.in{{position:relative;padding:56px 64px;height:100%;display:flex;flex-direction:column;justify-content:space-between}}
.br{{display:flex;align-items:center;gap:14px;font:800 30px B}} .br img{{width:52px}} .br i{{font:700 14px F;letter-spacing:.28em;text-transform:uppercase;font-style:normal;opacity:.7;margin-left:6px}}
.ey{{font:800 22px F;letter-spacing:.18em;text-transform:uppercase;color:#8A5F00;margin-bottom:14px}} h1{{font:800 {size}px/1.02 B;letter-spacing:-.03em;max-width:1000px}}
.ch{{display:flex;gap:12px;flex-wrap:wrap}} .ch span{{background:#fff;border:3px solid #2A1E12;border-radius:99px;padding:8px 20px;font:800 24px F;box-shadow:0 4px 0 #2A1E12}} .ch span.g{{background:#FFB703}}
</style></head><body><div class="b1"></div><div class="b2"></div><div class="in"><div class="br"><img src="{MARK}"><span>UpperCrust</span><i>Academy</i></div>
<div><div class="ey">{E(eyebrow)}</div><h1>{E(title)}</h1></div><div class="ch"><span class="g">Free</span>{ch}</div></div></body></html>"""


def jobs():
    j = [("home", card("Free learning", "Learn money, markets and NISM", ["English", "हिन्दी", "ગુજરાતી"], 0)),
         ("nism", card("NISM exam preparation", "Free NISM mock tests and study guides", [f"{len(NP.EXAMS)} exams", "Mock tests", "PDF guides"], 2)),
         ("personal-finance", card("Personal finance course", "Personal finance for India", ["Budget", "Insurance", "SIP", "Tax"], 1))]
    for i, e in enumerate(NP.EXAMS):
        j.append((e["id"], card(e["code"], e["title"], [f"{e['qs']} questions", f"{e['pass']}% to pass", "Mock tests"], i)))
    for i, c in enumerate(CP.C["courses"]):
        j.append(("c-" + c["id"], card("Free course · " + CP.LEVELS[c["level"]]["name"], c["title"], ["Short lessons", "Quizzes"], i)))
    return j


def build():
    from playwright.sync_api import sync_playwright
    out = os.path.join(ROOT, "assets", "og"); os.makedirs(out, exist_ok=True)
    tmp = os.path.join("/tmp", "ogtmp"); os.makedirs(tmp, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--allow-file-access-from-files"])
        pg = b.new_page(viewport={"width": 1200, "height": 630})
        for name, h in jobs():
            f = os.path.join(tmp, name + ".html"); open(f, "w", encoding="utf-8").write(h)
            pg.goto("file://" + f); pg.wait_for_timeout(120)
            pg.screenshot(path=os.path.join(out, name + ".jpg"), type="jpeg", quality=80)
        b.close()
    return len(jobs())
