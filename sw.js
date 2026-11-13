const SHELL_CACHE = 'ielts-boost-final-plan-57-shell-v1';
const VOCAB_CACHE = 'ielts-boost-final-stage-56-vocabulary-v1'; // stable shared cache; preserve the verified 19K index
const RELEASE_VERSION = '57.0.0-final-release';
const AUDIO_CACHE = 'ielts-boost-final-stage-audio'; // shared cache retained across releases
const SHELL = ['./', './index.html', './manifest.webmanifest', './release-check.html', './assets/js/release-check.js', './assets/css/release-check.css', './favicon.svg', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-192-maskable.png', './icons/icon-512-maskable.png', './assets/css/app-core.css', './assets/css/stage40-50.css', './assets/css/stage51.css', './assets/css/stage56.css', './assets/js/core/contract.js', './assets/js/core/module-registry.js', './assets/js/core/boot.js', './assets/js/compat/legacy-core.js', './assets/js/modules/backup-manager.js', './assets/js/modules/advanced-studio.js', './assets/js/stage40-50.js', './data/app-data.json', './data/stage47-skill-resources.json', './data/stage47-listening-companions.json', './data/stage47-task1-datasets.json', './data/stage48-vocabulary-coverage.json'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('ielts-boost-') && ![SHELL_CACHE, AUDIO_CACHE, VOCAB_CACHE].includes(key)).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

async function audioResponse(request) {
  const url = new URL(request.url);
  const cache = await caches.open(AUDIO_CACHE);
  const cacheKey = new Request(url.href, { method: 'GET' });
  const range = request.headers.get('range');
  let full = await cache.match(cacheKey);

  if (!full) {
    // Fetch the complete MP3 without Range so Cache API stores a normal 200 response.
    const headers = new Headers(request.headers);
    headers.delete('range');
    const fullRequest = new Request(url.href, { method: 'GET', headers, credentials: 'same-origin' });
    full = await fetch(fullRequest);
    if (full.ok && full.status === 200) {
      try { await cache.put(cacheKey, full.clone()); } catch (_) { /* Low storage quota must not block playback. */ }
    } else {
      // If a full response is unavailable, let the browser make its original Range request.
      return fetch(request);
    }
  }

  if (!range) return full;
  const buffer = await full.arrayBuffer();
  const total = buffer.byteLength;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!match) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });

  let start, end;
  if (match[1] === '') {
    const suffix = Number(match[2]);
    if (!Number.isFinite(suffix) || suffix <= 0) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
    start = Math.max(0, total - suffix);
    end = total - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), total - 1) : total - 1;
  }
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= total || end < start) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
  }

  const chunk = buffer.slice(start, end + 1);
  const headers = new Headers(full.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Range', `bytes ${start}-${end}/${total}`);
  headers.set('Content-Length', String(chunk.byteLength));
  return new Response(chunk, { status: 206, headers });
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // The full 19K vocabulary index is optional: cache it only after the learner opens Vocabulary Lab.
  if (url.pathname.endsWith('/data/vocabulary-index.json')) {
    event.respondWith((async () => {
      const cache = await caches.open(VOCAB_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok && response.type === 'basic') cache.put(request, response.clone()).catch(() => {});
        return response;
      } catch (_) { return (await cache.match(request)) || Response.error(); }
    })());
    return;
  }

  // MP3s are added to cache one-by-one after first online access; the ~55 MB pack is not precached.
  if (/\/audio\/listening-day-\d{2}\.mp3$/.test(url.pathname)) {
    event.respondWith(audioResponse(request));
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic' && (request.destination === 'document' || SHELL.some(path => url.pathname.endsWith(path.replace('./', ''))))) {
        const cache = await caches.open(SHELL_CACHE);
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    } catch (_) {
      if (request.mode === 'navigate') return (await caches.match('./index.html')) || Response.error();
      return Response.error();
    }
  })());
});
