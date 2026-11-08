/* Fetches course content from the backend. Needs a signed-in learner; results are kept in memory. */
import { fns } from "./fb.js";

const mem = new Map();

export async function getContent(names) {
  const need = names.filter(n => !mem.has(n));
  if (need.length) {
    const f = fns();
    if (!f) throw new Error("content: backend unavailable");
    const r = await f.httpsCallable("content")({ names: need });
    for (const n of need) mem.set(n, r.data[n]);
  }
  return Object.fromEntries(names.map(n => [n, mem.get(n)]));
}

export const getOne = async n => (await getContent([n]))[n];
