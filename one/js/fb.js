/* Firebase, loaded from the SDK scripts in index.html. Returns null when the SDK could not load, so the app can say so plainly. */
import { FIREBASE, APPCHECK_SITE_KEY } from "./config.js";

let app = null;
export function fb() {
  if (app) return app;
  if (typeof firebase === "undefined") return null;
  try {
    app = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE);
    if (APPCHECK_SITE_KEY && firebase.appCheck) { try { firebase.appCheck().activate(APPCHECK_SITE_KEY, true); } catch (e) { console.warn("App Check failed", e); } }
    return app;
  } catch (e) { console.warn("Firebase init failed", e); return null; }
}
export const auth = () => (fb() ? firebase.auth() : null);
export const db = () => (fb() ? firebase.firestore() : null);

/* Backend callable functions, deployed in Mumbai (asia-south1). */
export const fns = () => (fb() && firebase.functions ? fb().functions("asia-south1") : null);
