/* Credentials list, the certificate itself, and public verification. */
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
    h("div", { class: "stack stack-s" }, h("h1", { class: "h1" }, "Credentials"),
      h("div", { class: "stats" }, h("span", {}, h("b", {}, n), " lessons"), h("span", {}, h("b", {}, creds.length), " earned"), m != null && h("span", {}, h("b", {}, m + "%"), " first-try accuracy"))),
    masteryMap(),
    h("section", { class: "stack" },
      creds.length ? h("div", { class: "divide" }, creds.map(c => h("div", { class: "list-row" },
        h("span", { class: "check on" }, icon("award", 14)),
        h("a", { class: "grow", href: `#/cert/${c.id}` }, h("div", { class: "list-title" }, c.title), h("div", { class: "small mute" }, `${Creds.kindLabel(c)} · ${fmtDate(c.issued)}`)),
        stand(c), Creds.standing(c) !== "valid" && c.kind === "course" ? h("a", { class: "btn ghost", style: "height:38px;padding:0 16px", href: `#/quiz/refresh/${c.key}` }, "Renew") : null)))
        : h("div", { class: "card tint stack stack-s" }, h("h2", { class: "h2" }, "None yet."), h("p", {}, "Pass a course exam to earn your first certificate. Each one is valid for 12 months and can be verified by anyone with the link."))),
    h("section", { class: "stack" }, h("h2", { class: "h2" }, "Three kinds of credential"),
      h("div", { class: "grid3" }, [["Every course", "Course certificate", "Pass each module quiz at 70%, then the course exam at 80%. Valid 12 months."], ["Every level", "Level credential", "Earned when every course in a level is certified. Practitioner has four courses."], ["Top honour", "UpperCrust Certified Professional", "All courses, plus five Client Lab scenarios. The highest mark of competence."]].map(([a, b, t]) => h("div", { class: "card stack stack-s" }, h("div", { class: "eyebrow" }, a), h("h3", { class: "h3" }, b), h("p", { class: "small mute" }, t))))),
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
  const lv = level(c.level);
  const line = c.kind === "pro" ? "has demonstrated mastery across every UpperCrust One course" : c.kind === "level" ? `has completed every ${lv.name} course` : "has passed the course exam for";
  return h("div", { class: "cert-sheet" }, h("div", { class: "cert-in" },
    h("img", { src: "assets/logo-uppercrust.png", alt: ORG, style: "height:34px" }),
    h("div", { class: "eyebrow", style: "margin-top:36px;letter-spacing:.14em;text-transform:uppercase" }, Creds.kindLabel(c)),
    h("p", { class: "mute", style: "margin-top:18px" }, "This certifies that"),
    h("div", { class: "cert-name" }, c.name || Store.get().name || "Learner"),
    h("p", { class: "mute", style: "margin-top:12px" }, line),
    c.kind === "course" ? h("h2", { class: "serif", style: "font-size:34px;font-weight:400;margin-top:8px" }, c.title) : h("h2", { class: "serif", style: "font-size:34px;font-weight:400;margin-top:8px" }, c.title),
    h("p", { class: "small mute", style: "margin-top:10px" }, `${Creds.levelLabel(c)} · Score ${c.score}%`),
    h("div", { class: "cert-foot" },
      h("div", { class: "sig", style: "text-align:left" }, "Issued ", fmtDate(c.issued), h("br"), "Valid until ", fmtDate(c.until)),
      h("div", { class: "cert-seal", "aria-hidden": "true" }, "One"),
      h("div", { style: "text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:6px" }, qrNode(c.id), h("div", { class: "tiny mute" }, "Scan to verify"), h("div", { class: "tiny mute" }, "ID " + c.id), h("div", { class: "sig", style: "margin-left:auto" }, ORG)))),
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
    h("a", { class: "brand", href: "./" }, h("img", { src: "assets/logo-uppercrust.png", alt: "UpperCrust" }), h("span", { class: "one" }, "One")), box);
}
