/* Fetches course content from the backend. Needs a signed-in learner; results are kept in memory.
   A short outage or a cold start is retried a few times before we give up. */
import { fns } from "./fb.js";

const mem = new Map();
const wait = ms => new Promise(r => setTimeout(r, ms));
const RETRY = new Set(["internal", "unavailable", "deadline-exceeded", "functions/internal", "functions/unavailable", "functions/deadline-exceeded"]);

async function call(names) {
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
  if (need.length) { const d = await call(need); for (const n of need) mem.set(n, d[n]); }
  return Object.fromEntries(names.map(n => [n, mem.get(n)]));
}

export const getOne = async n => (await getContent([n]))[n];
