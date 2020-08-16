var enableNotificationsButtons = document.querySelectorAll('.js-push-btn');
var installButton = document.querySelectorAll('.install-btn');
var deferredPrompt;

if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker
        .register('sw-site.js')
        .then(() => {
            console.log("service worker registered");
        })
        .catch(err => console.log('service worker not registered'));

}

if ('Notification' in window && 'serviceWorker' in navigator) {
    for (var i = 0; i < enableNotificationsButtons.length; i++) {
        enableNotificationsButtons[i].style.display = 'inline-block';
        enableNotificationsButtons[i].addEventListener('click', console.log('here'));
    }
}

window.addEventListener('beforeinstallprompt', event => {
    console.log('beforeinstallprompt fired');
    event.preventDefault();
    deferredPrompt = event;
    return false;
});

function configurePushSub() {
    if (!('serviceWorker' in navigator)) {
        return;
    }
    var reg;
    navigator.serviceWorker.ready
        .then(swreg => {
            reg = swreg;
            return swreg.pushManager.getSubscription();
        })
        .then(sub => {
            if (sub === null) {
                console.log('create new sub');
                var vapidPublicKey = 'BEh7pyCk5-U3uf6hLo4jqpy-nuU0R8zwKU78dJn_azBuOgJ5yD2WMXohVQN7iTbV4e7OLV-6zkjEBojaSBqb2dc';
                var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
                return reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidPublicKey
                })
            } else {
                console.log('we have a sub')
            }
        })
        .then(newSub => {
            return fetch('https://dwt-test-cb872.firebaseio.com/subscriptions.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newSub)
            })
        })
        .then(res => {
            console.log('here');
            if (res.ok) {
                displayConfirmNotification()
            }
        }).catch(err => {
        console.log(err);
    });
}

function askForNotificationPermission() {
    console.log('clicked');
    Notification.requestPermission(result => {
        console.log('User Choice', result);
        if (result !== 'granted') {
            console.log('No notification permission granted!');
        } else {
            configurePushSub();
        }
    });
}

function displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
        var options = {
            body: 'You successfully subscribed to our Notification service!',
            dir: 'ltr',
            lang: 'en-US', // BCP 47,
            actions: [
                {action: 'confirm', title: 'Okay'},
                {action: 'cancel', title: 'Cancel'}
            ]
        };
        navigator.serviceWorker.ready
            .then(swreg => {
                swreg.showNotification('Successfully subscribed (from SW)!', options);
            });
    }
}

function installAppPrompt() {
    console.log(deferredPrompt);
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choiceResult => {
            console.log(choiceResult);
            if (choiceResult.outcome === 'dismissed') {
                console.log('User didnt installed app');
            } else {
                console.log('user installed the app');
            }
        });
        deferredPrompt = null;
    }
}

installButton[0].addEventListener('click', installAppPrompt);

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
