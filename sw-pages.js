const cachename = 'hii';
const cachefiles = [
    'js/main.js',
    'index.html',
    'about.html',
    'style.css'
];

/**
 * Installing the service worker
 */

self.addEventListener('install', (e) => {
    console.log('install successfull');
    //Add cache of the files while installing.
    e.waitUntil(
        caches.open(cachename)
            .then(cache => {
                cache.addAll(cachefiles);
            }).then(() => self.skipWaiting())
    );
});

/**
 * Activating the service worker
 */

self.addEventListener('activate', () => {
    console.log('activation successful');
    //removing old caches
    caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map((name) => {
            if (name !== cachename) {
                caches.delete(name);
            }
        }))
    })
});

self.addEventListener('fetch', (e) => {
    console.log('fetching');
    e.respondWith(
        fetch(e.request).catch(() => caches.match(e.request))
)
});