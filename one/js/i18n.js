/* Language engine. The app is written in English; English strings are the keys.
   one/data/ui-<lang>.json (screen text) and cat-<lang>.json (course catalogue) map them to Hindi or Gujarati.
   Text is translated where it is put on the page, so every screen follows the chosen language without changes.
   Strings with {0} {1} are patterns: the numbers and names stay, the words around them are translated.
   Add ?i18nlog to the address to list, in the console, every English string that still has no translation. */
export const LANGS = [["en", "English"], ["hi", "हिन्दी"], ["gu", "ગુજરાતી"]];
const LS = "uc.lang", LOCALES = { en: "en-IN", hi: "hi-IN", gu: "gu-IN" };
const valid = v => LANGS.some(l => l[0] === v);
let lang = "en", saved = false;
try { const v = localStorage.getItem(LS); if (valid(v)) { lang = v; saved = true; } } catch {}

export const getLang = () => lang;
export const hasPref = () => saved;
export const locale = () => LOCALES[lang];

const dict = new Map(), pats = [], memo = new Map(), misses = new Set();
let logOn = false;
try { logOn = /i18nlog/.test(location.search + location.hash); } catch {}
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function addPattern(k, v) {
  const parts = k.split(/\{(\d)\}/), ix = [];
  let lit = 0, src = "^";
  parts.forEach((p, i) => { if (i % 2) { ix.push(+p); src += "([\\s\\S]*?)"; } else { lit += p.length; src += esc(p); } });
  if (lit < 3) return;
  /* a pattern with almost no words of its own ("{0} of {1}") may only match short values, never a whole sentence */
  const letters = parts.filter((_, i) => !(i % 2)).join("").replace(/[^A-Za-z]/g, "").length;
  pats.push({ re: new RegExp(src + "$"), ix, out: v, lit, strict: letters > 0 && letters < 5 });
}
async function load(l) {
  const get = async f => { try { const r = await fetch(`one/data/${f}-${l}.json`); return r.ok ? await r.json() : {}; } catch { return {}; } };
  const [a, b] = await Promise.all([get("ui"), get("cat")]);
  for (const src of [a, b]) for (const [k, v] of Object.entries(src)) { if (!v) continue; if (/\{\d\}/.test(k)) addPattern(k, v); else dict.set(k, v); }
  pats.sort((x, y) => y.lit - x.lit);
}

function look(s) {
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), core = m[2];
  if (!core) return s;
  let t = dict.get(core);
  if (t === undefined && core.length < 400) {
    for (const p of pats) {
      const x = p.re.exec(core);
      if (!x || (p.strict && x.slice(1).some(a => a.length > 14))) continue;
      const args = [];
      p.ix.forEach((n, i) => { args[n] = tr(x[i + 1]); });
      t = p.out.replace(/\{(\d)\}/g, (_, n) => args[n] ?? "");
      break;
    }
  }
  if (t === undefined) { if (logOn && /[A-Za-z]{3,}/.test(core)) misses.add(core); return s; }
  return m[1] + t + m[3];
}
export function tr(s) {
  if (lang === "en" || typeof s !== "string" || !s) return s;
  let r = memo.get(s);
  if (r === undefined) { r = look(s); if (memo.size > 6000) memo.clear(); memo.set(s, r); }
  return r;
}
/* A string with its parts joined at run time, e.g. t("{0} lessons", n). */
export const t = (s, ...a) => tr(s).replace(/\{(\d)\}/g, (_, n) => a[n] ?? "");
export const missing = () => [...misses];

/* Write the choice and reload, so every screen is drawn again in the new language. */
export function setLanguage(l) {
  if (!valid(l)) return;
  try { localStorage.setItem(LS, l); } catch {}
  location.reload();
}
/* Remember a language chosen on another device. False when this browser cannot store it. */
export function remember(l) {
  if (!valid(l)) return false;
  try { localStorage.setItem(LS, l); return localStorage.getItem(LS) === l; } catch { return false; }
}

function patch() {
  const ct = document.createTextNode.bind(document);
  document.createTextNode = s => ct(tr(String(s)));
  for (const P of [Element.prototype, DocumentFragment.prototype])
    for (const m of ["append", "prepend", "replaceChildren"]) {
      const o = P[m]; if (!o) continue;
      P[m] = function (...a) { return o.apply(this, a.map(x => (typeof x === "string" ? tr(x) : x))); };
    }
  const tc = Object.getOwnPropertyDescriptor(Node.prototype, "textContent");
  Object.defineProperty(Node.prototype, "textContent", { configurable: true, get: tc.get, set(v) { tc.set.call(this, typeof v === "string" ? tr(v) : v); } });
  const sa = Element.prototype.setAttribute, ATTR = new Set(["aria-label", "title", "placeholder", "alt", "aria-description"]);
  Element.prototype.setAttribute = function (k, v) { return sa.call(this, k, ATTR.has(k) && typeof v === "string" ? tr(v) : v); };
  for (const C of [HTMLInputElement, HTMLTextAreaElement]) {
    const d = Object.getOwnPropertyDescriptor(C.prototype, "placeholder");
    if (d) Object.defineProperty(C.prototype, "placeholder", { configurable: true, get: d.get, set(v) { d.set.call(this, tr(v)); } });
  }
  const td = Object.getOwnPropertyDescriptor(Document.prototype, "title");
  Object.defineProperty(Document.prototype, "title", { configurable: true, get: td.get, set(v) { td.set.call(this, tr(v)); } });
  for (const k of ["alert", "confirm", "prompt"]) { const o = window[k].bind(window); window[k] = (m, ...r) => o(tr(m), ...r); }
  document.documentElement.lang = lang;
}

if (lang !== "en") {
  await load(lang);
  patch();
}
if (logOn) window.__i18n = { missing };
