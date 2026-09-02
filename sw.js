// Service Worker do Qualidade SP3 Enterprise (FonTech)
// IMPORTANTE: aumente o número da versão (v1.3 -> v1.4 -> v1.5...) toda vez que
// publicar uma atualização do app no GitHub. Isso garante que o cache antigo
// seja descartado e todo mundo (inclusive quem já tinha o app aberto) receba a versão nova.
const CACHE_NAME = 'qualidade-sp3-v1.6';

const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

// Limpa caches de versões antigas e assume controle imediato das abas já abertas.
// Sem isso, quem já tinha o app instalado ficava preso na versão antiga até
// desinstalar/limpar o cache manualmente — mesmo depois de você atualizar no GitHub.
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(nomes =>
            Promise.all(nomes.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
        )
    );
    self.clients.claim();
});

// Estratégia:
// - Navegação (abrir/recarregar o app): tenta a REDE primeiro, pra sempre pegar
//   a versão mais nova do index.html. Só usa o cache se estiver offline.
// - Outros arquivos (fontes, bibliotecas): cache primeiro, já que raramente mudam.
self.addEventListener('fetch', event => {
    const isNavegacao = event.request.mode === 'navigate';

    if (isNavegacao) {
        event.respondWith(
            fetch(event.request)
                .then(resposta => {
                    const copia = resposta.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia));
                    return resposta;
                })
                .catch(() => caches.match('./index.html'))
        );
    } else {
        event.respondWith(
            caches.match(event.request).then(resposta => resposta || fetch(event.request))
        );
    }
});
