// Service worker simples: guarda as páginas já visitadas para leitura sem internet.
// Ao mudar a estratégia de cache, troque a versão abaixo.
const CACHE = 'bdcl-v2';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const fontes = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== self.location.origin && !fontes) return;

  // Páginas: tenta a rede primeiro (conteúdo novo), cai para o cache sem internet.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copia));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('/'))),
    );
    return;
  }

  // Só os arquivos com nome versionado pelo build (/_astro/) e as fontes podem vir direto do
  // cache: o nome muda quando o conteúdo muda. O resto (favicon, manifest...) busca a rede primeiro.
  const versionado = fontes || url.pathname.startsWith('/_astro/');
  if (!versionado) {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  event.respondWith(
    caches.match(req).then((emCache) =>
      emCache ||
      fetch(req).then((res) => {
        if (res.ok || res.type === 'opaque') {
          const copia = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copia));
        }
        return res;
      }),
    ),
  );
});
