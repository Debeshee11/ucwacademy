/* Small sign-in helpers: keep the session even when the browser blocks storage, and read SMS codes automatically. */

/* Try the longest-lived storage first, then fall back. Private mode in some browsers refuses LOCAL. */
export async function safePersist(a, keep = true) {
  const P = firebase.auth.Auth.Persistence;
  for (const mode of keep ? [P.LOCAL, P.SESSION, P.NONE] : [P.SESSION, P.NONE]) {
    try { await a.setPersistence(mode); return mode; } catch { /* try the next one */ }
  }
  return null;
}

/* Submit as soon as six digits are in the box, and on Android Chrome read the SMS code without typing (WebOTP). */
export function autoOtp(input, form) {
  const go = () => { if (input.value.replace(/\D/g, "").length === 6 && !form.dataset.busy) { form.dataset.busy = "1"; (form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true }))); setTimeout(() => { delete form.dataset.busy; }, 400); } };
  input.addEventListener("input", () => { input.value = input.value.replace(/\D/g, "").slice(0, 6); go(); });
  if ("OTPCredential" in window && navigator.credentials?.get) {
    const ac = new AbortController();
    form.addEventListener("submit", () => ac.abort());
    navigator.credentials.get({ otp: { transport: ["sms"] }, signal: ac.signal }).then(c => { if (c?.code) { input.value = String(c.code).replace(/\D/g, "").slice(0, 6); go(); } }).catch(() => {});
  }
}
