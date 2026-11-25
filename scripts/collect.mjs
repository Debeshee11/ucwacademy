/* Collects every line the lesson player would speak, for one language, into scripts/voice/texts.json.
   Needs the site served (node build, then python3 -m http.server 8765 in the built folder) and puppeteer-core + Chrome.
   Usage: node scripts/voice/collect.mjs [en|hi|gu] [baseUrl] */
import puppeteer from "puppeteer-core"; import fs from "fs";
const lang = process.argv[2] || "en", base = process.argv[3] || "http://localhost:8765", out = new URL("./texts.json", import.meta.url).pathname;
const ids = fs.readdirSync(new URL("../../one/data/stories/", import.meta.url)).map(f => parseInt(f)).filter(Number.isFinite).sort((a, b) => a - b);
const b = await puppeteer.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome", headless: "new", args: ["--no-sandbox"] });
const p = await b.newPage();
await p.evaluateOnNewDocument(l => { window.__col = {}; window.__ucCollect = (lg, h, t) => { window.__col[lg + "/" + h] = t; }; try { localStorage.setItem("uc.lang", l); localStorage.setItem("uc.tour", "1"); localStorage.setItem("one:tour:guest", "1"); localStorage.setItem("one:v1:guest", JSON.stringify({ v: 1, door: "salaried", onb: 1, consent: 1, show: 1, study: {}, nm: {}, lang: l, name: "x", done: {}, act: {} })); } catch (e) {} }, lang);
const all = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : {};
for (const n of ids) {
  await p.goto(`${base}/#/lesson/${n}`); await p.reload(); await new Promise(r => setTimeout(r, 900));
  Object.assign(all, await p.evaluate(() => window.__col || {}));
}
fs.writeFileSync(out, JSON.stringify(all));
console.log(Object.keys(all).length, "lines;", Object.values(all).reduce((a, s) => a + s.length, 0), "characters");
await b.close();
