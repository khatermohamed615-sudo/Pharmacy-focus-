// التطبيق ده أصلًا من غير سيرفر - كل البيانات جوه الجهاز (localStorage). الـ Service
// Worker هنا وظيفته بس إنه يخزّن ملفات التطبيق (HTML/CSS/JS/أيقونات) عشان يفتح
// حتى لو مفيش إنترنت خالص من أول لحظة بعد أول زيارة.
const CACHE_NAME = "focus-offline-shell-v1";
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

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).catch(() => cached))
  );
});
