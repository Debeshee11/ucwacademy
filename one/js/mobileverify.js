/* Proves a learner owns the mobile number they typed, when they signed in with Google or email.
   The number is linked to their sign-in with a one-time code. Phone sign-in already proves it. */
import { auth } from "./fb.js";
import * as Store from "./store.js";

/* True when this learner still has to verify a mobile number. Phone sign-in and staff accounts do not. */
export function needsVerify() {
  const u = auth()?.currentUser;
  if (u?.phoneNumber) { if (!Store.get().mv) Store.setProfile({ mv: 1 }); return false; }
  return !Store.isStaff() && !Store.get().mv;
}

export const verifyError = e => {
  const c = e?.code || "";
  if (/credential-already-in-use|account-exists|already-in-use/.test(c)) return "That number is already used by another account. Use a different number, or sign in with it.";
  if (/invalid-phone-number|missing-phone-number/.test(c)) return "That mobile number does not look right.";
  if (/invalid-verification-code|missing-verification-code/.test(c)) return "That code is not right. Check the SMS and try again.";
  if (/code-expired|session-expired/.test(c)) return "That code has expired. Send a new one.";
  if (/too-many/.test(c)) return "Too many tries. Wait a few minutes and try again.";
  if (/quota-exceeded/.test(c)) return "Too many codes sent today. Try again tomorrow.";
  if (/network/.test(c)) return "No connection. Check your internet and try again.";
  if (/captcha/.test(c)) return "Security check failed. Reload the page and try again.";
  return "Could not send the code just now. Try again in a moment.";
};

let verifier = null;
const clear = () => { try { verifier?.clear(); } catch {} verifier = null; };

/* Sends the code. `holder` is an empty element in the page for the invisible security check. Resolves with a confirmation. */
export async function sendCode(e164, holder) {
  const u = auth()?.currentUser;
  if (!u) throw { code: "auth/network-request-failed" };
  clear(); holder.replaceChildren();
  verifier = new firebase.auth.RecaptchaVerifier(holder, { size: "invisible" });
  try { return await u.linkWithPhoneNumber(e164, verifier); } catch (e) { clear(); throw e; }
}

/* Checks the code. On success the number is saved as verified. */
export async function confirmCode(confirmation, code, mobile) {
  await confirmation.confirm(code);
  clear();
  Store.setProfile({ mobile, mv: 1 });
}
