/* UpperCrust Academy service worker: makes the app open instantly on a return visit and keeps opened lessons readable offline.
   It only ever touches this site's own files. Sign-in, the database, the backend and outside data are never intercepted.

   How each kind of request is served:
   - Pages (the app, /learn/ pages): network first, so a new release always shows; the saved copy is used only when offline.
   - Files stamped with ?v=<release> (scripts, styles, lesson files): saved copy first. A new release has a new stamp, so it is fetched fresh.
   - Everything else on this site (fonts, images, language files): saved copy at once, refreshed in the background.
   The deploy writes the release id into VERSION below; a new release clears the previous one's files. */
const VERSION = "dev";
const CACHE = "uc-" + VERSION;
const SHELL = ["./", "assets/mark.svg", "assets/icon.svg"];

self.addEventListener("install", ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});

self.addEventListener("activate", ev => {
  ev.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("uc-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

const save = (req, res) => { if (res && res.ok && res.type === "basic") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {}); } return res; };

self.addEventListener("fetch", ev => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;                    /* Firebase, Google, data branches: untouched */
  if (/\/(sw\.js|__\/)/.test(url.pathname)) return;

  if (req.mode === "navigate") {
    ev.respondWith(fetch(req).then(res => save(req, res)).catch(async () =>
      (await caches.match(req, { ignoreSearch: true })) || (await caches.match("./")) || Response.error()));
    return;
  }
  if (url.searchParams.has("v")) {
    ev.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => save(req, res))));
    return;
  }
  ev.respondWith(caches.match(req).then(hit => {
    const fresh = fetch(req).then(res => save(req, res)).catch(() => hit || Response.error());
    return hit || fresh;
  }));
});
