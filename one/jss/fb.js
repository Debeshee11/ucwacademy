/* Firebase, loaded from the SDK scripts in index.html. Returns null when the SDK could not load, so the app can say so plainly. */
import { FIREBASE } from "./config.js";

let app = null;
export function fb() {
  if (app) return app;
  if (typeof firebase === "undefined") return null;
  try {
    app = firebase.apps.length ? firebase.app() : firebase.initializeApp(FIREBASE);
    return app;
  } catch (e) { console.warn("Firebase init failed", e); return null; }
}
export const auth = () => (fb() ? firebase.auth() : null);
export const db = () => (fb() ? firebase.firestore() : null);
