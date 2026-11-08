/* Credentials list, the certificate itself, and public verification. */
import { ledger, settingsCard, rankOf } from "./academy.js";
import { ORG } from "./config.js";
import { h, icon, fmtDate, toast, plural, pct } from "./dom.js";
import { D, level, course } from "./data.js";
import { skillsOf, LABEL } from "./progress.js";
import * as Store from "./store.js";
import * as Creds from "./creds.js";
import { questionById } from "./quiz.js";
import { page, widePage, notFound, bar } from "./ui.js";

const stand = c => { const s = Creds.standing(c); return s === "valid" ? h("span", { class: "pill ok" }, "Valid") : s === "soon" ? h("span", { class: "pill gold" }, "Expires soon") : h("span", { class: "pill" }, "Expired"); };

/* First-try accuracy by topic, from every question answered so far. */
function masteryMap() {
  const T = {};
  for (const [id, e] of Object.entries(Store.get().q)) {
    if (e.f == null) continue; const q = questionById(id); if (!q) continue;
    for (const t of q.tags || (q.n && D.lessons[q.n]?.tags) || []) { const o = T[t] = T[t] || { r: 0, n: 0 }; o.n++; o.r += e.f; }
  }
  const rows = Object.entries(T).filter(([, o]) => o.n >= 3).map(([t, o]) => [LABEL[t] || t, pct(o.r, o.n), o.n]).sort((a, b) => b[1] - a[1]);
  return h("section", { class: "stack" }, h("h2", { class: "h2" }, "Mastery map"),
    rows.length ? h("div", { class: "stack" }, rows.map(([t, p, n]) => h("div", { class: "stack stack-xxs" }, h("div", { class: "row-flex between small" }, h("span", {}, t), h("b", {}, p + "%")), bar(p, p >= 80))))
      : h("p", { class: "mute" }, "Answer a few quiz questions. Your strong and weak topics show here."));
}

export function me() {
  const s = Store.get(), creds = Creds.all(), n = Object.keys(s.done).length, m = Store.mastery();
  const open = D.courses.filter(c => !Creds.find("course", c.id));
  return widePage(
    h("section", { class: "score" },
      h("div", { class: "sc-main" },
        h("p", { class: "sc-label" }, "Your points"),
        h("div", { class: "sc-xp" }, h("span", { class: "sc-coin" }, "₹"), String(Store.xp())),
        h("p", { class: "sc-rank" }, rankOf(Store.xp()).title, rankOf(Store.xp()).next ? ` · ${rankOf(Store.xp()).need} points to ${rankOf(Store.xp()).next}` : ""),
        bar(rankOf(Store.xp()).pct)),
      h("div", { class: "sc-stats" },
        h("div", {}, icon("flame", 22), h("b", {}, Store.streakNow()), h("span", {}, "day streak")),
        h("div", {}, icon("book", 22), h("b", {}, n), h("span", {}, "lessons")),
        h("div", {}, icon("award", 22), h("b", {}, creds.length), h("span", {}, "earned")),
        m != null ? h("div", {}, icon("check", 22), h("b", {}, m + "%"), h("span", {}, "first-try accuracy")) : null),
      h("a", { class: "btn ghost sm", href: "#/board" }, "Leaderboard")),
    ledger(),
    masteryMap(),
    h("section", { class: "stack" },
      creds.length ? h("div", { class: "divide" }, creds.map(c => h("div", { class: "list-row" },
        h("span", { class: "check on" }, icon("award", 14)),
        h("a", { class: "grow", href: `#/cert/${c.id}` }, h("div", { class: "list-title" }, c.title), h("div", { class: "small mute" }, `${Creds.kindLabel(c)} · ${fmtDate(c.issued)}`)),
        stand(c), Creds.standing(c) !== "valid" && c.kind === "course" ? h("a", { class: "btn ghost", style: "height:38px;padding:0 16px", href: `#/quiz/refresh/${c.key}` }, "Renew") : null)))
        : h("div", { class: "card tint stack stack-s" }, h("h2", { class: "h2" }, "None yet."), h("p", {}, "Pass a course exam to earn your first certificate. Each one is valid for 12 months and can be verified by anyone with the link."))),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Three kinds of credential"),
      h("div", { class: "grid3" }, [["Every course", "Course certificate", "Pass each module quiz at 70%, then the Beginner exam at 80%. Valid 12 months."], ["Every level", "Level credential", "Earned when every course in a level is certified. Practitioner has four courses."], ["Top honour", "UpperCrust Certified Professional", "All courses, plus five Client Lab scenarios. The highest mark of competence."]].map(([a, b, t]) => h("div", { class: "card stack stack-s" }, h("div", { class: "eyebrow" }, a), h("h3", { class: "h3" }, b), h("p", { class: "small mute" }, t))))),
    settingsCard(),
    open.length ? h("section", { class: "stack" }, h("h2", { class: "h2" }, "Still to earn"),
      h("div", { class: "divide" }, open.map(c => { const p = Store.courseProgress(c); return h("a", { class: "list-row", href: `#/course/${c.id}` },
        h("div", { class: "grow stack stack-xs" }, h("div", { class: "list-title" }, c.title), bar(p.pct)), h("span", { class: "small mute" }, p.pct + "%")); })),
      h("p", { class: "small mute" }, "Complete both Practitioner courses for the level credential. Complete all courses and five Client Lab scenarios for the Professional credential.")) : null);
}

function qrNode(id) {
  const box = h("div", { class: "qr", title: "Scan to verify", "aria-label": "QR code for verification" });
  try { const q = qrcode(0, "M"); q.addData(Creds.verifyUrl(id)); q.make(); box.innerHTML = q.createSvgTag({ cellSize: 3, margin: 0, scalable: true }); } catch { box.hidden = true; }
  return box;
}
function sheet(c, extra) {
  const lv = level(c.level), cr = c.kind === "course" && c.key ? course(c.key) : null;
  const what = c.kind === "pro" ? "demonstrated mastery across the full UpperCrust Academy curriculum" : c.kind === "level" ? `completed every ${lv.name} course in the UpperCrust Academy curriculum` : "successfully completed the course and passed the Beginner assessment in";
  const write = c.kind === "course"
    ? `${cr ? cr.blurb + " " : ""}The holder completed every lesson and module quiz and passed the course assessment with a score of ${c.score}%, meeting the Academy’s standard for knowledge, accuracy and responsible communication.`
    : `The holder met the Academy’s standard across every course in this programme, with an average assessment score of ${c.score}%.`;
  const skills = cr ? skillsOf(cr).slice(0, 6) : [];
  return h("div", { class: "cert-sheet" }, h("div", { class: "cert-in" },
    h("div", { class: "cert-top" }, h("img", { src: "assets/logo-gold.svg", alt: ORG, style: "height:38px" }), h("div", { class: "cert-acad" }, "Academy")),
    h("div", { class: "cert-rule" }),
    h("div", { class: "cert-kind" }, Creds.kindLabel(c)),
    h("p", { class: "cert-lead" }, "This is to certify that"),
    h("div", { class: "cert-name" }, c.name || Store.get().name || "Learner"),
    h("p", { class: "cert-lead" }, `has ${what}`),
    h("h2", { class: "cert-title" }, c.title),
    h("p", { class: "cert-lv" }, `${Creds.levelLabel(c)} · Score ${c.score}%`),
    h("p", { class: "cert-write" }, write),
    skills.length ? h("div", { class: "cert-skills" }, h("b", {}, "Skills verified"), skills.join("  ·  ")) : null,
    h("div", { class: "cert-foot" },
      h("div", { class: "sig" }, h("div", { class: "sigline" }), h("b", {}, "Head of Learning"), h("span", {}, ORG + " Academy")),
      h("div", { class: "cert-seal", "aria-hidden": "true" }, "UC"),
      h("div", { class: "sig" }, h("div", { class: "sigline" }), h("b", {}, "Programme Director"), h("span", {}, ORG))),
    h("div", { class: "cert-meta" },
      h("div", {}, h("span", {}, "Issued"), h("b", {}, fmtDate(c.issued)), h("span", {}, "Valid until"), h("b", {}, fmtDate(c.until))),
      h("div", { style: "text-align:center" }, h("span", {}, "Credential ID"), h("b", {}, c.id)),
      h("div", { style: "display:flex;gap:10px;align-items:center" }, h("div", { class: "tiny mute", style: "text-align:right" }, "Scan to verify", h("br"), "authenticity"), qrNode(c.id))),
    h("p", { class: "cert-fine" }, `Issued by ${ORG} Academy, the learning arm of ${ORG}. Authenticity can be confirmed online using the credential ID or QR code. This certificate is educational and is not investment advice or a regulatory licence.`)),
    extra);
}

const linkedin = (c, url) => { const d = new Date(c.issued), e = new Date(c.until); return "https://www.linkedin.com/profile/add?" + new URLSearchParams({ startTask: "CERTIFICATION_NAME", name: c.title, organizationName: ORG, issueYear: d.getFullYear(), issueMonth: d.getMonth() + 1, expirationYear: e.getFullYear(), expirationMonth: e.getMonth() + 1, certUrl: url, certId: c.id }); };

export function cert(id) {
  const c = Store.get().creds[id];
  if (!c) return notFound("That credential is not in your account.");
  const url = Creds.verifyUrl(id);
  return page(
    h("a", { class: "small mute no-print", href: "#/me", style: "display:inline-flex;gap:6px;align-items:center" }, icon("left", 16), "Credentials"),
    sheet({ ...c, name: Store.get().name }),
    h("div", { class: "row-flex no-print", style: "justify-content:center" },
      h("button", { class: "btn primary", on: { click: () => print() } }, icon("print", 18), "Print or save as PDF"),
      h("button", { class: "btn ghost", on: { click: async () => { try { await navigator.clipboard.writeText(url); toast("Verification link copied"); } catch { prompt("Copy this link", url); } } } }, icon("link", 18), "Copy verification link"),
      h("a", { class: "btn ghost", target: "_blank", rel: "noopener", href: linkedin(c, url) }, "Add to LinkedIn"),
      stand(c)),
    c.kind === "course" && course(c.key) ? h("section", { class: "stack no-print" }, h("h2", { class: "h2" }, "Skills verified"), h("div", { class: "chips" }, skillsOf(course(c.key)).map(t => h("span", { class: "pill" }, t)))) : null,
    h("section", { class: "card tint stack stack-s no-print" }, h("h3", { class: "h3" }, "Why it expires"), h("p", { class: "small" }, "Rules, rates and data change. A 15-question refresher before the date keeps your credential current and your advice accurate.")),
    h("p", { class: "small mute no-print", style: "text-align:center" }, "Anyone with the link can confirm this credential. It shows your name, the title and the dates, nothing else."));
}

export function verify(id) {
  const box = h("div", { class: "stack stack-l" }, h("p", { class: "mute" }, "Checking…"));
  Creds.fetchPublic(id).then(c => {
    if (!c) return box.replaceChildren(h("h1", { class: "h1" }, "Not found."), h("p", { class: "lead" }, "No credential has this ID. Check the link and try again."));
    const st = Creds.standing(c);
    box.replaceChildren(
      h("div", { class: "stack stack-s" }, h("span", { class: "pill " + (st === "expired" ? "" : "ok"), style: "align-self:flex-start" }, st === "expired" ? "Expired" : "Verified"),
        h("h1", { class: "h1" }, st === "expired" ? "This credential has expired." : "This credential is genuine.")),
      sheet(c));
  }).catch(() => box.replaceChildren(h("h1", { class: "h1" }, "Could not check."), h("p", { class: "lead" }, "The verification service is unreachable. Try again shortly.")));
  return h("main", { class: "wrap page stack stack-l", id: "main" },
    h("a", { class: "brand", href: "./" }, h("img", { src: "assets/mark.svg", alt: "" }), h("span", { class: "bt" }, h("b", {}, "UpperCrust"), h("i", {}, "Academy"))), box);
}
