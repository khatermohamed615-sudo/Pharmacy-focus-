// التطبيق ده أصلًا من غير سيرفر - كل البيانات جوه الجهاز (localStorage). الـ Service
// Worker هنا وظيفته بس إنه يخزّن ملفات التطبيق (HTML/CSS/JS/أيقونات) عشان يفتح
// حتى لو مفيش إنترنت خالص من أول لحظة بعد أول زيارة.
const CACHE_NAME = "focus-offline-shell-v8";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// شبكة أولًا لصفحة التطبيق نفسها (index.html) عشان أي تحديث تجيبه يبان فورًا
// من غير ما يعلق على نسخة قديمة متخزنة. الملفات التانية (أيقونات) تفضل كاش-أولًا
// عشان الأداء والعمل من غير إنترنت.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const isPage = event.request.mode === "navigate" || event.request.url.endsWith("/index.html") || event.request.url.endsWith("/");
  if (isPage) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone()));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached))
  );
});
