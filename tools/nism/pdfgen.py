"""UpperCrust Academy NISM study-guide PDF engine (reportlab)."""
import os, io, math, textwrap
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table, TableStyle,
    PageBreak, NextPageTemplate, Flowable, KeepTogether, Image, CondPageBreak)
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

FD = "/usr/share/fonts/truetype/crosextra/"
for n, f in [("Sans", "Carlito-Regular"), ("Sans-B", "Carlito-Bold"), ("Sans-I", "Carlito-Italic"), ("Sans-BI", "Carlito-BoldItalic"),
             ("Ser", "Caladea-Regular"), ("Ser-B", "Caladea-Bold"), ("Ser-I", "Caladea-Italic"), ("Ser-BI", "Caladea-BoldItalic")]:
    pdfmetrics.registerFont(TTFont(n, FD + f + ".ttf"))
pdfmetrics.registerFontFamily("Sans", normal="Sans", bold="Sans-B", italic="Sans-I", boldItalic="Sans-BI")
pdfmetrics.registerFontFamily("Ser", normal="Ser", bold="Ser-B", italic="Ser-I", boldItalic="Ser-BI")

NAVY = colors.HexColor("#0B1F3A"); GOLD = colors.HexColor("#C9A24B"); GOLDD = colors.HexColor("#8C6D26")
IVORY = colors.HexColor("#FBF8F1"); INK = colors.HexColor("#1B2A41"); MUTE = colors.HexColor("#5B6880")
LINE = colors.HexColor("#E3DAC4"); TINT = colors.HexColor("#F3ECDA"); NAVY2 = colors.HexColor("#16335C"); OK = colors.HexColor("#2F7A57"); WARN = colors.HexColor("#A5412D")
W, H = A4; M = 18 * mm
LOGO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logo-gold.png")

S = {}
def st(n, **k): S[n] = ParagraphStyle(n, **k); return S[n]
st("body", fontName="Sans", fontSize=10.2, leading=14.6, textColor=INK, spaceAfter=5)
st("small", parent=S["body"], fontSize=8.8, leading=12, textColor=MUTE)
st("h1", fontName="Ser", fontSize=27, leading=31, textColor=NAVY, spaceAfter=8)
st("h2", fontName="Ser", fontSize=17, leading=21, textColor=NAVY, spaceBefore=10, spaceAfter=5)
st("h3", fontName="Sans-B", fontSize=11.5, leading=15, textColor=NAVY, spaceBefore=6, spaceAfter=2)
st("eye", fontName="Sans-B", fontSize=8, leading=10, textColor=GOLDD, spaceAfter=3)
st("lead", fontName="Ser-I", fontSize=13, leading=18, textColor=NAVY2, spaceAfter=8)
st("bul", parent=S["body"], leftIndent=12, bulletIndent=2, spaceAfter=3)
st("cardt", fontName="Ser-B", fontSize=12.5, leading=15, textColor=NAVY, spaceAfter=2)
st("cardb", fontName="Sans", fontSize=9.8, leading=13.6, textColor=INK)
st("cardx", fontName="Sans", fontSize=9.2, leading=12.6, textColor=INK)
st("tc", fontName="Sans", fontSize=9, leading=12, textColor=INK)
st("tch", fontName="Sans-B", fontSize=8.6, leading=11, textColor=colors.white)
st("center", parent=S["body"], alignment=TA_CENTER)

def P(t, s="body"): return Paragraph(t, S[s])
def esc(t): return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

# ——— charts ———
def fig_png(fig, dpi=200):
    b = io.BytesIO(); fig.savefig(b, format="png", dpi=dpi, transparent=True, bbox_inches="tight", pad_inches=0.02); plt.close(fig); b.seek(0); return b
plt.rcParams["font.family"] = "Carlito"
def weight_chart(units):
    fig, ax = plt.subplots(figsize=(7.2, 0.34 * len(units) + 0.4))
    names = [f"{u['n']}. {u['title']}" for u in units][::-1]; ws = [u["w"] for u in units][::-1]
    mx = max(ws)
    ax.barh(names, ws, color=["#C9A24B" if w == mx else "#16335C" for w in ws], height=0.62)
    for i, w in enumerate(ws): ax.text(w + mx * 0.015, i, f"{w}%", va="center", fontsize=10, color="#0B1F3A", fontweight="bold")
    ax.set_xlim(0, mx * 1.18); ax.tick_params(axis="y", labelsize=9.6, length=0, colors="#1B2A41"); ax.set_xticks([])
    for s in ax.spines.values(): s.set_visible(False)
    return fig_png(fig)
def donut(w):
    fig, ax = plt.subplots(figsize=(1.5, 1.5))
    ax.pie([w, 100 - w], colors=["#C9A24B", "#2A4A78"], startangle=90, counterclock=False, wedgeprops=dict(width=0.32, edgecolor="none"))
    ax.text(0, 0, f"{w}%", ha="center", va="center", fontsize=17, color="white", fontweight="bold"); return fig_png(fig)
def study_plan_chart(units):
    fig, ax = plt.subplots(figsize=(7.2, 1.0))
    left = 0; tot = sum(u["w"] for u in units)
    for i, u in enumerate(units):
        ax.barh(0, u["w"], left=left, color=["#0B1F3A", "#16335C", "#2A4A78", "#C9A24B", "#8C6D26"][i % 5], edgecolor="white", height=0.6)
        if u["w"] >= 5: ax.text(left + u["w"] / 2, 0, str(u["n"]), ha="center", va="center", color="white", fontsize=10, fontweight="bold")
        left += u["w"]
    ax.set_xlim(0, tot); ax.axis("off"); return fig_png(fig)

# ——— flowables ———
class Band(Flowable):
    def __init__(self, w, h, draw): super().__init__(); self.w, self.h, self._d = w, h, draw
    def wrap(self, aw, ah): return self.w, self.h
    def draw(self): self._d(self.canv, self.w, self.h)

def stat_tiles(items, width):
    n = len(items); cw = width / n
    def d(c, w, h):
        for i, (v, l) in enumerate(items):
            x = i * cw
            c.setFillColor(NAVY); c.rect(x + 2, 0, cw - 4, h, 0, 1)
            c.setFillColor(GOLD); c.rect(x + 2, h - 3, cw - 4, 3, 0, 1)
            c.setFillColor(colors.white); c.setFont("Ser", 21); c.drawCentredString(x + cw / 2, h / 2 - 2, str(v))
            c.setFillColor(colors.HexColor("#B7C3D8")); c.setFont("Sans", 8)
            c.drawCentredString(x + cw / 2, 8, l.upper())
    return Band(width, 52, d)

def flow(steps, width, title=None):
    n = len(steps); gap = 10; bw = (width - gap * (n - 1)) / n; hh = 54
    def d(c, w, h):
        for i, s in enumerate(steps):
            x = i * (bw + gap)
            c.setFillColor(NAVY if i % 2 == 0 else NAVY2); c.roundRect(x, 6, bw, hh, 5, 0, 1)
            c.setFillColor(GOLD); c.setFont("Sans-B", 8); c.drawString(x + 7, 6 + hh - 12, str(i + 1))
            c.setFillColor(colors.white); c.setFont("Sans-B", 8.6)
            lines = textwrap.wrap(s, max(6, int(bw / 4.4)))[:3]
            for k, ln in enumerate(lines): c.drawCentredString(x + bw / 2, 6 + hh - 26 - k * 10.5, ln)
            if i < n - 1:
                c.setFillColor(GOLD); p = c.beginPath(); ax = x + bw + 1; p.moveTo(ax, 6 + hh / 2 + 5); p.lineTo(ax + gap - 2, 6 + hh / 2); p.lineTo(ax, 6 + hh / 2 - 5); p.close(); c.drawPath(p, 0, 1)
    out = [Band(width, hh + 12, d)]
    return ([P(esc(title), "h3")] if title else []) + out + [Spacer(1, 6)]

def table(rows, widths, head=True):
    data = [[Paragraph(esc(str(c)), S["tch"] if (head and r == 0) else S["tc"]) for c in row] for r, row in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1 if head else 0)
    ts = [("VALIGN", (0, 0), (-1, -1), "TOP"), ("GRID", (0, 0), (-1, -1), 0.4, LINE), ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
          ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6)]
    if head: ts += [("BACKGROUND", (0, 0), (-1, 0), NAVY)]
    ts += [("BACKGROUND", (0, r), (-1, r), TINT) for r in range(2 if head else 1, len(rows), 2)]
    t.setStyle(TableStyle(ts)); return t

def callout(title, text, kind="gold", width=None):
    col = {"gold": GOLD, "warn": WARN, "ok": OK, "navy": NAVY}[kind]
    paras = [Paragraph(f"<b>{esc(title)}</b>", ParagraphStyle("x", parent=S["cardx"], textColor=col if kind != "gold" else GOLDD, fontName="Sans-B", fontSize=8.4, spaceAfter=2)), Paragraph(esc(text), S["cardx"])]
    t = Table([[paras]], colWidths=[width or (W - 2 * M)])
    t.setStyle(TableStyle([("LINEBEFORE", (0, 0), (0, 0), 3, col), ("BACKGROUND", (0, 0), (-1, -1), TINT if kind in ("gold", "navy") else colors.HexColor("#FBEFEA") if kind == "warn" else colors.HexColor("#EAF4EE")),
        ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10), ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    return t

def concept_card(i, f, width):
    term, d, s, m = f[:4]
    left = Paragraph(f"<font name='Ser' size='17' color='#C9A24B'>{i:02d}</font>", S["body"])
    body = [Paragraph(esc(term), S["cardt"]), Paragraph(esc(d), S["cardb"]), Spacer(1, 4),
            Table([[Paragraph(f"<b><font color='#8C6D26'>EXAMPLE</font></b>  {esc(s)}", S["cardx"]), Paragraph(f"<b><font color='#A5412D'>WATCH OUT</font></b>  Not true: {esc(m[:1].lower() + m[1:])}", S["cardx"])]],
                  colWidths=[(width - 48) / 2] * 2, style=TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (0, 0), 10), ("RIGHTPADDING", (1, 0), (1, 0), 0), ("TOPPADDING", (0, 0), (-1, -1), 0), ("BOTTOMPADDING", (0, 0), (-1, -1), 0)]))]
    t = Table([[left, body]], colWidths=[46, width - 46])
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("BOX", (0, 0), (-1, -1), 0.5, LINE), ("BACKGROUND", (0, 0), (-1, -1), colors.white), ("LINEBEFORE", (0, 0), (0, 0), 3, GOLD),
        ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8), ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
    return KeepTogether([t, Spacer(1, 6)])

# ——— page templates ———
def build_pdf(path, ex):
    code, title = ex["code"], ex["title"]
    def cover(c, doc):
        c.saveState(); c.setFillColor(NAVY); c.rect(0, 0, W, H, 0, 1)
        c.setFillColor(NAVY2); c.circle(W - 40 * mm, H - 60 * mm, 90 * mm, 0, 1); c.setFillColor(colors.HexColor("#122A4D")); c.circle(W - 20 * mm, H - 120 * mm, 60 * mm, 0, 1)
        c.drawImage(LOGO, M, H - 38 * mm, width=62 * mm, height=62 * mm * 644 / 2580, mask="auto")
        c.setFillColor(GOLD); c.rect(M, H - 64 * mm, 22 * mm, 1.2 * mm, 0, 1)
        c.setFont("Sans-B", 10); c.drawString(M, H - 78 * mm, "NISM CERTIFICATION · COMPLETE STUDY GUIDE")
        c.setFillColor(colors.white); c.setFont("Ser", 15); c.drawString(M, H - 92 * mm, code)
        y = H - 110 * mm; c.setFont("Ser", 38)
        for ln in textwrap.wrap(title, 22): c.drawString(M, y, ln); y -= 15 * mm
        c.setFont("Ser-I", 14); c.setFillColor(colors.HexColor("#C7D2E4"))
        yy = y - 2 * mm
        for ln in textwrap.wrap(ex["blurb"], 62)[:4]: c.drawString(M, yy, ln); yy -= 7 * mm
        c.setFillColor(GOLD); c.setFont("Sans-B", 9)
        c.drawString(M, 30 * mm, f"{ex['qs']} QUESTIONS  ·  {ex['mins']} MINUTES  ·  PASS {ex['pass']}%  ·  {len(ex['units'])} UNITS")
        c.setFillColor(colors.HexColor("#8FA0BD")); c.setFont("Sans", 8.5)
        c.drawString(M, 22 * mm, "UpperCrust Academy  ·  ucwacademy.in  ·  Free for every learner  ·  Edition " + ex.get("edition", "2026"))
        c.restoreState()
    def body(c, doc):
        c.saveState(); c.setFillColor(IVORY); c.rect(0, 0, W, H, 0, 1)
        c.setFillColor(NAVY); c.rect(0, H - 11 * mm, W, 11 * mm, 0, 1); c.setFillColor(GOLD); c.rect(0, H - 11.8 * mm, W, 0.8 * mm, 0, 1)
        c.drawImage(LOGO, M, H - 9.2 * mm, width=26 * mm, height=26 * mm * 644 / 2580, mask="auto")
        c.setFillColor(colors.HexColor("#B7C3D8")); c.setFont("Sans-B", 7.6); c.drawRightString(W - M, H - 7.4 * mm, f"{code.upper()}  ·  {title.upper()}")
        c.setStrokeColor(LINE); c.line(M, 14 * mm, W - M, 14 * mm)
        c.setFillColor(MUTE); c.setFont("Sans", 7.6); c.drawString(M, 9.5 * mm, "UpperCrust Academy · Study material for exam preparation. Not investment advice. Always read the latest official NISM workbook and SEBI circulars.")
        c.setFont("Sans-B", 9); c.setFillColor(NAVY); c.drawRightString(W - M, 9.5 * mm, str(doc.page)); c.restoreState()
    doc = BaseDocTemplate(path, pagesize=A4, leftMargin=M, rightMargin=M, topMargin=22 * mm, bottomMargin=20 * mm, title=f"{code} {title} – UpperCrust Academy Study Guide", author="UpperCrust Academy")
    fw, fh = W - 2 * M, H - 42 * mm
    doc.addPageTemplates([PageTemplate("cover", [Frame(0, 0, 1, 1)], onPage=cover), PageTemplate("body", [Frame(M, 20 * mm, fw, fh, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)], onPage=body)])
    fl = [NextPageTemplate("body"), PageBreak()]
    units = ex["units"]
    # about
    fl += [P("ABOUT THIS GUIDE", "eye"), P("Everything you need, in one place.", "h1"), P(esc(ex["intro"]), "lead")]
    fl += [stat_tiles([(ex["qs"], "Questions"), (f"{ex['mins']} min", "Duration"), (f"{ex['pass']}%", "To pass"), (ex["neg"], "Negative marking")], fw), Spacer(1, 10)]
    fl += [P("Who should take this exam", "h2"), P(esc(ex["who"])), P("How this guide works", "h2")]
    fl += flow(["Read the unit overview", "Study each concept card", "Say the example aloud", "Check the watch-outs", "Take the unit mock"], fw)
    fl += [P("Each unit opens with its exam weight, so you know where marks are. Each concept card gives the idea, a worked example, and the mistake the exam wants you to make. The same ideas power the five mock tests on the UpperCrust Academy app, which get harder one by one."), Spacer(1, 4)]
    fl += [callout("Keep this in mind", ex.get("note", "NISM revises its syllabus and workbook from time to time, and rules change by SEBI circular. This guide follows the official unit structure and weightage. Check the latest NISM workbook for any changes before your exam date."), "gold", fw), PageBreak()]
    # at a glance
    fl += [P("EXAM AT A GLANCE", "eye"), P("Structure and marks.", "h1")]
    rows = [["Item", "Detail"]] + ex["glance"]
    fl += [table(rows, [fw * 0.3, fw * 0.7]), Spacer(1, 12), P("Where the marks are", "h2"), Image(weight_chart(units), width=fw, height=fw * (0.34 * len(units) + 0.4) / 7.2), Spacer(1, 8)]
    fl += [callout("Read the chart like an examiner", "Units above 10% decide most results. Master them first, then use the small units for easy marks. A unit worth 3% still supplies three marks at no extra effort once you have the concepts.", "navy", fw), PageBreak()]
    # study plan
    fl += [P("YOUR STUDY PLAN", "eye"), P("Time follows marks.", "h1"), P("The bar shows how the exam is split across units. Spend your hours in the same proportion.", "lead"), Image(study_plan_chart(units), width=fw, height=fw / 7.2), Spacer(1, 8)]
    days = ex.get("days", 28); tot = sum(u["w"] for u in units)
    plan = [["Unit", "Marks", "Share of study time", "Suggested days"]]
    for u in units: plan.append([f"{u['n']}. {u['title']}", f"{u['w']}", f"{u['w'] / tot * 100:.0f}%", f"{max(1, round(u['w'] / tot * (days - 7)))}"])
    plan.append(["Revision and five mocks", "", "", "7"])
    fl += [table(plan, [fw * 0.5, fw * 0.12, fw * 0.2, fw * 0.18]), Spacer(1, 10)]
    fl += [P("The mock ladder", "h2")] + flow(["Mock 1 Foundation", "Mock 2 Core", "Mock 3 Applied", "Mock 4 Exam level", "Mock 5 Beyond exam"], fw)
    fl += [P("Take Mock 1 after your first pass through the guide. Move to the next mock only when you score 15 marks above the pass mark. Review every wrong answer in the app; each one links back to its unit."), PageBreak()]
    # units
    for u in units:
        fl += [Band(fw, 70, (lambda u: lambda c, w, h: (c.setFillColor(NAVY), c.rect(0, 0, w, h, 0, 1), c.setFillColor(GOLD), c.rect(0, 0, 4, h, 0, 1),
               c.setFillColor(GOLD), c.setFont("Sans-B", 8.5), c.drawString(18, h - 20, f"UNIT {u['n']}  ·  {u['w']}% OF THE EXAM"),
               c.setFillColor(colors.white), c.setFont("Ser", 21), [c.drawString(18, h - 43 - k * 24, ln) for k, ln in enumerate(textwrap.wrap(u["title"], 48)[:2])], None))(u)), Spacer(1, 10)]
        fl += [P(esc(u["overview"]), "lead")]
        if u.get("focus"):
            fl += [P("What the exam looks for", "h3")] + [Paragraph(esc(t), S["bul"], bulletText="•") for t in u["focus"]]
        for v in u.get("visuals", []):
            if v[0] == "flow": fl += flow(v[2], fw, v[1])
            elif v[0] == "table": fl += [P(esc(v[1]), "h3"), table(v[2], v[3] if len(v) > 3 else [fw / len(v[2][0])] * len(v[2][0])), Spacer(1, 8)]
            elif v[0] == "formula": fl += [callout("FORMULA · " + v[1], v[2], "navy", fw), Spacer(1, 6)]
            elif v[0] == "keynums": fl += [Spacer(1, 4), stat_tiles(v[1], fw), Spacer(1, 8)]
            elif v[0] == "note": fl += [callout(v[1], v[2], v[3] if len(v) > 3 else "gold", fw), Spacer(1, 6)]
        fl += [P("Concept cards", "h2")]
        for i, f in enumerate(u["facts"], 1): fl += [concept_card(i, f, fw)]
        fl += [callout("Unit recap · one line each", "  ·  ".join(f[0] for f in u["facts"]), "gold", fw), PageBreak()]
    # formulas
    if ex.get("sheet"):
        fl += [P("QUICK REFERENCE", "eye"), P("Numbers and formulas.", "h1")]
        for h_, rows in ex["sheet"]: fl += [P(esc(h_), "h2"), table(rows, [fw * 0.3, fw * 0.7] if len(rows[0]) == 2 else [fw / len(rows[0])] * len(rows[0])), Spacer(1, 6)]
        fl += [PageBreak()]
    # glossary
    fl += [P("GLOSSARY", "eye"), P("Every term, A to Z.", "h1")]
    seen = {}
    for u in units:
        for f in u["facts"]: seen.setdefault(f[0], (f[1], u["n"]))
    rows = [["Term", "Meaning", "Unit"]] + [[k, v[0], str(v[1])] for k, v in sorted(seen.items(), key=lambda kv: kv[0].lower())]
    fl += [table(rows, [fw * 0.24, fw * 0.69, fw * 0.07])]
    fl += [PageBreak(), P("FINAL STRETCH", "eye"), P("The last seven days.", "h1")]
    fl += [P("Revision checklist", "h2")] + [Paragraph("☐  " + esc(t), S["bul"]) for t in ex.get("checklist", ["Read every unit overview again.", "Redo every wrong answer from your mocks.", "Say each unit recap line from memory.", "Take Mock 5 under timed conditions."])]
    fl += [P("Exam-day tips", "h2")] + [Paragraph(esc(t), S["bul"], bulletText="•") for t in ex.get("tips", [])]
    fl += [Spacer(1, 12), callout("Disclaimer", "This guide is independent exam-preparation material written by UpperCrust Academy against the published NISM syllabus outline. It is not NISM’s workbook, not endorsed by NISM or SEBI, and not investment, tax or legal advice. Rules and figures change; confirm against the latest NISM workbook, SEBI circulars and exchange notices before relying on any number.", "warn", fw)]
    doc.build(fl)
