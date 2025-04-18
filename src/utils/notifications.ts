import api from "../api/api";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function setupNotifications(userId: string): Promise<void> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("Push notifications not supported in this browser.");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "/service-worker.js"
    );
    console.log("Service Worker registered:", registration.scope);

    // Check current permission state
    if (Notification.permission === "granted") {
      await subscribeUser(registration, userId);
      return;
    }

    // If permission is not granted or denied, request it
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await subscribeUser(registration, userId);
      } else {
        console.log("Notification permission denied.");
      }
    } else {
      console.log("Notification permission previously denied.");
    }
  } catch (error) {
    console.error("Notification setup failed:", error);
  }
}

export async function sendNotification(
  username: string | null,
  title: string,
  body: string,
  category?: string
): Promise<void> {
  if (!username) {
    console.error("Username is required to send notification.");
    return;
  }
  const userId = username;
  try {
    const payload = {
      userId,
      title,
      body,
      category,
    };

    const response = await api.post("/notify", payload);

    if (response.status === 200) {
      console.log("Notification sent successfully.");
    } else {
      console.error("Failed to send notification:", response.data);
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
}

async function subscribeUser(
  registration: ServiceWorkerRegistration,
  userId: string
): Promise<void> {
  const vapidPublicKey =
    "BNs6vAoTALj4B4HwsVW3Kz6y3EYGc6XK5ZjM9V3QH42XDolvBKNQNmMBkThCu6TualLn5ZMzpydHp74wrk7aqXY";

  if (!vapidPublicKey) {
    throw new Error("VAPID public key is not defined.");
  }

  // Subscribe to push notifications
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Log subscription object for debugging
    console.log("Subscription object:", subscription.toJSON());

    // Send subscription to server
    await api.post("/subscribe", {
      subscription: subscription.toJSON(),
      userId,
    });

    console.log("User subscribed to notifications with userId:", userId);
  } catch (error) {
    console.error("Failed to subscribe:", error);
    throw error;
  }
}
