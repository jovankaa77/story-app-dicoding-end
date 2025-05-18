import Auth from "../utils/auth";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}

const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

export async function ensureServiceWorkerExists() {
  if (!("serviceWorker" in navigator)) {
    console.error("Browser tidak support");
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      console.log("SW sudah terdaftar", registration.scope);
      return true;
    }

    const newRegistration = await navigator.serviceWorker.register(
      "/service-worker.js"
    );
    console.log("SW berhasil di daftarkan", newRegistration.scope);
    await new Promise((resolve) => {
      if (newRegistration.installing) {
        newRegistration.installing.addEventListener("statechange", (e) => {
          if (e.target.state === "activated") {
            console.log("SW Aktif");
            resolve();
          }
        });
      }
    });
    return true;
  } catch (error) {
    console.error("SW gagal", error);
    return false;
  }
}

export function isNotificationAvailable() {
  return "Notification" in window;
}

export function isNotificationGranted() {
  return Notification.permission === "granted";
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error("Notification API unsupported.");
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  if (status === "denied") {
    alert("Notif izin ditolak");
    return false;
  }

  if (status === "default") {
    alert("Notif izin di abaikan");
    return false;
  }

  return true;
}

export async function getPushSubscription() {
  try {
    const serviceWorkerReady = await ensureServiceWorkerExists();
    if (!serviceWorkerReady) {
      console.error("SW gagal di daftarkan / tidak terdaftar");
      return null;
    }

    await navigator.serviceWorker.ready;
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.error("SW tidak terdaftar");
      return null;
    }

    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error("Failed", error);
    return null;
  }
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  try {
    const serviceWorkerReady = await ensureServiceWorkerExists();
    if (!serviceWorkerReady) {
      alert("SW tidak di daftarkan, push tidak berfungsi");
      return false;
    }

    if (!(await requestNotificationPermission())) {
      return false;
    }

    if (await isCurrentPushSubscriptionAvailable()) {
      console.log("Berlangganan push notif");
      return true;
    }

    const pushSubscription = await createPushSubscription();
    if (!pushSubscription) {
      console.error("Gagal push notif");
      return false;
    }

    const { endpoint, keys } = pushSubscription.toJSON();
    console.log("Push notif berhasil", pushSubscription);

    return await savePushSubscription(endpoint, keys);
  } catch (error) {
    console.error(" error notif:", error);
    alert("Kesalahan notif langganan");
    return false;
  }
}

async function createPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration || !registration.pushManager) {
    console.error("Push manag tidak tersedia");
    return null;
  }

  return await registration.pushManager.subscribe(generateSubscribeOptions());
}

async function savePushSubscription(endpoint, keys) {
  const token = Auth.getToken();
  if (!token) {
    console.error("Token tidak ada");
    alert("Perlu login");
    return false;
  }

  try {
    const response = await fetch(
      "https://story-api.dicoding.dev/v1/notifications/subscribe",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint, keys }),
      }
    );

    const responseData = await response.json();
    if (!response.ok) {
      console.error("Failed:", responseData);
      alert("Gagal berlangganan ");
      return false;
    }

    console.log("Notif berhasil di simpan:", responseData);
    alert("Berhasil berlangganan ");
    return true;
  } catch (error) {
    console.error("Failed:", error);
    alert("Gagal berlangganan ");
    return false;
  }
}

let isAlertShown = false;

export async function unsubscribe() {
  const failureUnsubscribeMessage = "Berhasil berhenti langganan.";
  const successUnsubscribeMessage = "Berhasil berhenti langganan";

  isAlertShown = false;

  try {
    const pushSubscription = await getPushSubscription();
    if (!pushSubscription) {
      if (!isAlertShown) {
        isAlertShown = true;
        alert("Tidak ada langganan push di hentikan.");
      }
      return false;
    }

    await unsubscribeFromBrowser(pushSubscription);
    await unsubscribeFromServer(pushSubscription);

    if (!isAlertShown) {
      isAlertShown = true;
      alert(successUnsubscribeMessage);
    }
    return true;
  } catch (error) {
    console.error(" error notif di batalkan:", error);
    if (!isAlertShown) {
      isAlertShown = true;
      alert(failureUnsubscribeMessage);
    }
    return false;
  }
}

async function unsubscribeFromBrowser(pushSubscription) {
  try {
    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      console.error("Gagal berhenti langganan ");
      if (!isAlertShown) {
        isAlertShown = true;
        alert("Gagal langganan berhenti");
      }
      return false;
    }
    console.log("Berhasil berhenti notif");
  } catch (browserError) {
    console.error("Error:", browserError);
    if (!isAlertShown) {
      isAlertShown = true;
      alert("Failed");
    }
    return false;
  }
}

async function unsubscribeFromServer(pushSubscription) {
  try {
    const token = Auth.getToken();
    const endpoint = pushSubscription.toJSON().endpoint;

    if (!token) {
      console.log("Token tidak ada");
      return;
    }

    const response = await fetch(
      "https://story-api.dicoding.dev/v1/notifications/subscribe",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint }),
      }
    );

    if (!response.ok) {
      console.error("Berhenti langganan gagal:", response.status);
      return;
    }

    console.log("Berhasil berhenti langganan");
  } catch (error) {
    console.error("Failed:", error);
  }
}

export const NotificationHelper = {
  sendPushNotification(title, options = {}) {
    if (!("Notification" in window)) return;

    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        ...options,
        icon: "/images/story-app-small.png",
        badge: "/images/story-app-big.png",
        vibrate: [100, 50, 100],
      });
    });
  },
};
