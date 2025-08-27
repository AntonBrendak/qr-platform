self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', () => {
  //  Стратегии кэша добавим позже (offline меню и т.п.).
});