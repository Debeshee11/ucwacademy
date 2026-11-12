/* Credentials. The backend issues them (functions/lib/creds.js) when a Beginner exam or refresher is passed, and when a level or the
   Professional credential becomes due. This file only reads and describes them. Each is published at credentials/<id>, so anyone
   with the link can verify it. Valid for RULES.validMonths; a refresher renews it. */
import { db, fns } from "./fb.js";
import { dayMs } from "./dom.js";
import { level } from "./data.js";
import * as Store from "./store.js";

export const all = () => Object.values(Store.get().creds).sort((a, b) => b.issued - a.issued);
export const find = (kind, key) => all().find(c => c.kind === kind && c.key === key) || null;
export function standing(c) {
  const left = c.until - Date.now();
  return left < 0 ? "expired" : left < 30 * dayMs ? "soon" : "valid";
}

/* Keep a copy of what the server issued or renewed, from an exam result. */
export function absorb(res) { for (const c of [res?.cred, ...(res?.extra || [])]) if (c) Store.addCredential(c); }

/* After Client Lab practice the Professional credential may be due. Resolves with the credentials newly awarded. */
export async function recheck() {
  const f = fns(); if (!f) return [];
  try { const r = (await f.httpsCallable("checkCredentials")()).data; (r.extra || []).forEach(Store.addCredential); return r.extra || []; } catch { return []; }
}

export async function fetchPublic(id) {
  const d = db(); if (!d) throw new Error("offline");
  const snap = await d.doc("credentials/" + id).get();
  return snap.exists ? snap.data() : null;
}

export const kindLabel = c => c.kind === "pro" ? "Professional credential" : c.kind === "level" ? "Level credential" : "Course certificate";
export const levelLabel = c => { const l = level(c.level); return l ? (l.alias && l.alias !== l.name ? `${l.name} · ${l.alias}` : l.name) : ""; };
export const verifyUrl = id => `${location.origin}${location.pathname}#/verify/${id}`;
