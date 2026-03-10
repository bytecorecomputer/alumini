importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAFnFqw6iD1YhQ5xwhSnd2rIKUJeR17wkU",
    authDomain: "practice-be58e.firebaseapp.com",
    projectId: "practice-be58e",
    storageBucket: "practice-be58e.appspot.com",
    messagingSenderId: "849847321136",
    appId: "1:849847321136:web:27525bc43f41aca1b3e3f5"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
