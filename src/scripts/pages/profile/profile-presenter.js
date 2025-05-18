import Auth from "../../utils/auth";
import {
  subscribe,
  unsubscribe,
  isCurrentPushSubscriptionAvailable,
  NotificationHelper,
  ensureServiceWorkerExists,
} from "../../utils/notification-helper.js";

const ProfilePresenter = {
  async init() {
    try {
      const logoutBtn = document.getElementById("logout-btn");
      const subscribeBtn = document.getElementById("subscribe-button");
      const unsubscribeBtn = document.getElementById("unsubscribe-button");

      // Initialize buttons if not found
      if (!subscribeBtn || !unsubscribeBtn) return;

      // Event listener for logout button
      this._setupLogoutButton(logoutBtn);

      // Ensure service worker is available
      await ensureServiceWorkerExists();

      // Check if push notifications are supported
      if (!this._isPushNotificationSupported()) {
        this._disablePushNotifications(subscribeBtn, unsubscribeBtn);
        return;
      }

      // Handle subscription status
      const isSubscribed = await this._checkSubscriptionStatus();
      this._updateSubscriptionButtons(
        isSubscribed,
        subscribeBtn,
        unsubscribeBtn
      );

      // Subscribe button event listener
      subscribeBtn.addEventListener("click", () =>
        this._handleSubscribe(subscribeBtn, isSubscribed)
      );

      // Unsubscribe button event listener
      unsubscribeBtn.addEventListener("click", () =>
        this._handleUnsubscribe(unsubscribeBtn, isSubscribed)
      );
    } catch (error) {
      console.error("Error initializing ProfilePresenter:", error);
      this._handleInitializationError();
    }
  },

  // Setup logout button event listener
  _setupLogoutButton(logoutBtn) {
    logoutBtn?.addEventListener("click", () => {
      Auth.clearToken();
      Auth.clearUser();
      window.location.hash = "#/login";
      window.location.reload();
    });
  },

  // Check if push notifications are supported
  _isPushNotificationSupported() {
    return "serviceWorker" in navigator && "PushManager" in window;
  },

  // Disable push notifications if not supported
  _disablePushNotifications(subscribeBtn, unsubscribeBtn) {
    subscribeBtn.innerHTML =
      '<i class="fas fa-bell-slash"></i> Notifikasi tidak didukung';
    subscribeBtn.disabled = true;
    unsubscribeBtn.style.display = "none";
  },

  // Check current push subscription status
  async _checkSubscriptionStatus() {
    try {
      return await isCurrentPushSubscriptionAvailable();
    } catch (error) {
      console.error("Error checking subscription status:", error);
      return false; // Default to false if error occurs
    }
  },

  // Update the subscription buttons based on status
  _updateSubscriptionButtons(isSubscribed, subscribeBtn, unsubscribeBtn) {
    subscribeBtn.style.display = isSubscribed ? "none" : "inline-block";
    unsubscribeBtn.style.display = isSubscribed ? "inline-block" : "none";

    subscribeBtn.innerHTML = '<i class="fas fa-bell"></i> Langganan';
    unsubscribeBtn.innerHTML =
      '<i class="fas fa-bell-slash"></i> Berhenti Langganan';
  },

  // Handle subscription logic
  async _handleSubscribe(subscribeBtn, isSubscribed) {
    if (subscribeBtn.disabled) return;

    try {
      subscribeBtn.disabled = true;
      subscribeBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Memproses...';

      const result = await subscribe();

      if (result) {
        isSubscribed = true;
        this._updateSubscriptionButtons(
          isSubscribed,
          subscribeBtn,
          document.getElementById("unsubscribe-button")
        );

        setTimeout(() => {
          this._showNotification();
        }, 1000);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
    } finally {
      subscribeBtn.disabled = false;
      this._updateSubscriptionButtons(
        isSubscribed,
        subscribeBtn,
        document.getElementById("unsubscribe-button")
      );
    }
  },

  // Handle unsubscribe logic
  async _handleUnsubscribe(unsubscribeBtn, isSubscribed) {
    if (unsubscribeBtn.disabled) return;

    try {
      unsubscribeBtn.disabled = true;
      unsubscribeBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Memproses...';

      const result = await unsubscribe();

      if (result) {
        isSubscribed = false;
        this._updateSubscriptionButtons(
          isSubscribed,
          document.getElementById("subscribe-button"),
          unsubscribeBtn
        );
      }
    } catch (error) {
      console.error("Error unsubscribing:", error);
    } finally {
      unsubscribeBtn.disabled = false;
      this._updateSubscriptionButtons(
        isSubscribed,
        document.getElementById("subscribe-button"),
        unsubscribeBtn
      );

      setTimeout(async () => {
        const currentStatus = await this._checkSubscriptionStatus();
        if (currentStatus !== isSubscribed) {
          isSubscribed = currentStatus;
          this._updateSubscriptionButtons(
            isSubscribed,
            document.getElementById("subscribe-button"),
            unsubscribeBtn
          );
        }
      }, 1000);
    }
  },

  // Show a notification after subscription
  _showNotification() {
    try {
      NotificationHelper.sendPushNotification(
        "Notifikasi berhasil diaktifkan!",
        { body: "Anda akan menerima update terbaru dari StoryApp" }
      );
    } catch (notifError) {
      console.error("Error showing notification:", notifError);
    }
  },

  // Handle initialization error
  _handleInitializationError() {
    const subscribeBtn = document.getElementById("subscribe-button");
    subscribeBtn.innerHTML =
      '<i class="fas fa-exclamation-triangle"></i> Gagal memuat status notifikasi';
    subscribeBtn.disabled = true;
  },
};

export default ProfilePresenter;
