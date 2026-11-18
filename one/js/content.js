/* Fetches course content. Lessons and practice are open to everyone, so the files are read straight from the site
   (one/content/, published by the "Deploy site" workflow) where the browser and the offline cache can keep them.
   If a file is not there yet, a signed-in learner still gets it from the backend, as before. Results are kept in memory.
   A short outage or a cold start is retried a few times before we give up. */
import { fns, backend } from "./fb.js";

const mem = new Map();
const wait = ms => new Promise(r => setTimeout(r, ms));
const RETRY = new Set(["internal", "unavailable", "deadline-exceeded", "functions/internal", "functions/unavailable", "functions/deadline-exceeded"]);
/* The deploy stamps ?v=<release> on every module address; the content files carry the same stamp, so a new release is never mixed with old lessons. */
let VER = ""; try { VER = new URL(import.meta.url).search || ""; } catch {}

async function fromSite(name) {
  const r = await fetch(`one/content/${name}.json${VER}`);
  if (!r.ok) throw new Error("content: " + name + " " + r.status);
  return r.json();
}

async function call(names) {
  await backend();
  const f = fns();
  if (!f) throw new Error("content: backend unavailable");
  let last;
  for (let i = 0; i < 4; i++) {
    try { return (await f.httpsCallable("content")({ names })).data; }
    catch (e) { last = e; if (!RETRY.has(e?.code)) throw e; await wait(1200 * (i + 1)); }
  }
  throw last;
}

export async function getContent(names) {
  const need = names.filter(n => !mem.has(n));
  if (need.length) {
    const got = await Promise.all(need.map(n => fromSite(n).then(v => [n, v], () => null)));
    for (const g of got) if (g) mem.set(g[0], g[1]);
    const left = need.filter(n => !mem.has(n));
    if (left.length) { const d = await call(left); for (const n of left) mem.set(n, d[n]); }
  }
  return Object.fromEntries(names.map(n => [n, mem.get(n)]));
}

export const getOne = async n => (await getContent([n]))[n];
