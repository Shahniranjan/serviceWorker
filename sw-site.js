const cachename = 'fixed';
let fallback = new Request('/offline.html');
/**
 * Installing the service worker
 */

self.addEventListener('install', (e) => {
    console.log('install successfull');
    e.waitUntil(
        fetch(fallback).then(function (response) {
            return caches.open(cachename).then(function (cache) {
                return cache.put(fallback, response);
            });
        })
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
    if (e.request.method !== "GET") return;
    e.respondWith(networkOrCache(e.request)
        .catch(() => {
            return useFallback();
        }));
});

function networkOrCache(request) {
    return fetch(request)
        .then(response => {
            let resClone = response.clone();
            caches.open(cachename)
                .then(cache => {
                    cache.put(request, resClone);
                });
            return response;
        })
        .catch(() => {
            return fromCache(request);
        });
}

function fromCache(request) {
    return caches.open(CACHE).then(cache => {
        return cache.match(request)
            .then(matching => {
                return matching || Promise.reject('request-not-in-cache');
            });
    });
}

function useFallback() {
    return caches.open(cachename)
        .then(function (cache) {
            return cache.match('/offline.html');
        })
}

self.addEventListener('notificationclick', function(event) {
    var notification = event.notification;
    var action = event.action;
    console.log(notification);
    if (action === 'confirm') {
        console.log('Confirm was chosen');
        notification.close();
    } else {
        console.log(action);
        notification.close();
    }
});

self.addEventListener('notificationclose', function(event) {
    console.log('Notification was closed', event);
});
