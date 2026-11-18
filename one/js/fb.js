/* Firebase. The core and sign-in parts load with the page (index.html). The database, backend-call and App Check parts are
   larger and are fetched by backend() only when they are needed, so a first-time visitor reading a lesson does not wait for them.
   Everything returns null when the SDK could not load, so the app can say so plainly. */
import { FIREBASE, APPCHECK_SITE_KEY } from "./config.js";

let app = null, checked = false;
/* App Check must be switched on before the first database or backend call. Safe to call more than once. */
function appCheck() {
  if (checked || !APPCHECK_SITE_KEY || typeof firebase === "undefined" || !firebase.appCheck) return;
  checked = true;
  try { firebase.appCheck().activate(APPCHECK_SITE_KEY, true); } catch (e) { console.warn("App Check failed", e); }
}
export function fb() {
  if (app) return app;
  if (typeof firebase === "undefined") return null;
  try {
    app = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE);
    appCheck();
    return app;
  } catch (e) { console.warn("Firebase init failed", e); return null; }
}
export const auth = () => (fb() ? firebase.auth() : null);
export const db = () => (fb() && firebase.firestore ? firebase.firestore() : null);

/* Backend callable functions, deployed in Mumbai (asia-south1). */
export const fns = () => (fb() && firebase.functions ? fb().functions("asia-south1") : null);

/* The deploy stamps ?v=<release> on this module's address; the files it loads carry the same stamp. */
let VER = ""; try { VER = new URL(import.meta.url).search || ""; } catch {}
const loading = new Map();
/* Load one file from one/vendor/ once. Resolves true when it is ready, false when it could not be fetched. */
export function vendor(file) {
  if (!loading.has(file)) loading.set(file, new Promise(res => {
    const s = document.createElement("script");
    s.src = `one/vendor/${file}${VER}`; s.async = false;
    s.onload = () => res(true); s.onerror = () => { loading.delete(file); s.remove(); res(false); };
    document.head.append(s);
  }));
  return loading.get(file);
}
/* The database, backend calls and App Check. Call and await this before the first db() or fns() of a flow.
   Resolves true when all are ready. If index.html already loaded them (the older layout), it resolves at once. */
let ready = null;
export function backend() {
  if (ready) return ready;
  if (!fb()) return Promise.resolve(false);
  const need = [["app-check", () => !!firebase.appCheck], ["firestore", () => !!firebase.firestore], ["functions", () => !!firebase.functions]].filter(x => !x[1]());
  ready = Promise.all(need.map(x => vendor(`firebase-${x[0]}-compat.js`))).then(ok => {
    appCheck();
    if (ok.every(Boolean)) return true;
    ready = null; return false;          /* offline or blocked: the next call tries again */
  });
  return ready;
}
