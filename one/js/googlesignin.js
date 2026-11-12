/* Google sign-in through Google Identity Services. Works on iPhone browsers where the Firebase popup/redirect page fails. */
import { GOOGLE_CLIENT_ID } from "./config.js";

let loading = null;
export const gisReady = () => !!GOOGLE_CLIENT_ID;

/* Call early (page load) so the script is ready before the tap; popups must open straight from a tap. */
export function preloadGis() {
  if (!GOOGLE_CLIENT_ID || loading) return loading;
  loading = new Promise(res => {
    if (window.google?.accounts?.oauth2) return res(true);
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client"; s.async = true;
    s.onload = () => res(!!window.google?.accounts?.oauth2);
    s.onerror = () => { loading = null; res(false); };
    document.head.appendChild(s);
  });
  return loading;
}

/* Resolves with a Firebase credential. Rejects with {code} on cancel or failure. Must be called from a tap. */
export function gisCredential() {
  return new Promise((resolve, reject) => {
    const o = window.google?.accounts?.oauth2;
    if (!o) return reject({ code: "gis/not-loaded" });
    let client;
    try {
      client = o.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: "openid email profile",
        callback: r => r?.access_token ? resolve(firebase.auth.GoogleAuthProvider.credential(null, r.access_token)) : reject({ code: "gis/" + (r?.error || "failed") }),
        error_callback: e => reject({ code: "gis/" + (e?.type || "failed") })
      });
      client.requestAccessToken({ prompt: "select_account" });
    } catch (e) { reject({ code: "gis/" + (e?.message || "failed") }); }
  });
}
