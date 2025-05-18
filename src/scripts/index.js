import "regenerator-runtime";
import "../styles/styles.css";
import routes from "./routes/routes";
import UrlParser from "./routes/url-parser";
import Auth from "./utils/auth";
import {
  subscribe,
  unsubscribe,
  NotificationHelper,
  ensureServiceWorkerExists,
} from "./utils/notification-helper";

let app = null;

// Update the UI based on authentication status
const updateAuthUI = () => {
  const loginLink = document.querySelector("#login-link");
  const logoutLink = document.querySelector("#logout-link");

  if (loginLink && logoutLink) {
    if (Auth.isAuthenticated()) {
      loginLink.style.display = "none";
      logoutLink.style.display = "inline";
    } else {
      loginLink.style.display = "inline";
      logoutLink.style.display = "none";
    }
  }
};

// Render the current page based on the active URL
const renderPage = async () => {
  if (!app) {
    console.error("Failed");
    return;
  }

  const url = UrlParser.parseActiveUrlWithCombiner();
  const page = routes[url];

  if (!page) {
    app.innerHTML = "<h2>No page</h2>";
    return;
  }

  try {
    await loadPageComponent(page);
    updateAuthUI();
  } catch (error) {
    displayErrorPage(error);
  }
};

// Load the page component based on the route
const loadPageComponent = async (page) => {
  if (typeof page.init === "function") {
    await page.init(app);
  } else if (typeof page === "function") {
    const pageInstance = new page();
    if (typeof pageInstance.render === "function") {
      app.innerHTML = await pageInstance.render();
      if (typeof pageInstance.afterRender === "function") {
        await pageInstance.afterRender();
      }
    } else {
      app.innerHTML = "<h2>Failed</h2>";
    }
  } else {
    app.innerHTML = "<h2>No page</h2>";
  }
};

// Display an error page when something goes wrong
const displayErrorPage = (error) => {
  app.innerHTML = `<h2>Error: ${error.message}</h2>`;
};

// Update the notification buttons based on the subscription status
const updateNotificationButtons = async () => {
  const subscribeButton = document.querySelector("#subscribe-button");
  const unsubscribeButton = document.querySelector("#unsubscribe-button");

  if (!subscribeButton || !unsubscribeButton) return;

  try {
    const { isCurrentPushSubscriptionAvailable } = await import(
      "./utils/notification-helper"
    );
    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    toggleNotificationButtons(subscribeButton, unsubscribeButton, isSubscribed);
  } catch (error) {
    console.error("Failed:", error);
  }
};

// Toggle visibility and content of subscribe/unsubscribe buttons
const toggleNotificationButtons = (
  subscribeButton,
  unsubscribeButton,
  isSubscribed
) => {
  subscribeButton.style.display = isSubscribed ? "none" : "inline-block";
  unsubscribeButton.style.display = isSubscribed ? "inline-block" : "none";
  subscribeButton.innerHTML = '<i class="fas fa-bell"></i> Aktif berlangganan';
  unsubscribeButton.innerHTML =
    '<i class="fas fa-bell-slash"></i> Stoped Langganan';
};

// Handle the subscription process
const handleSubscribe = async () => {
  const subscribeButton = document.querySelector("#subscribe-button");
  if (subscribeButton.disabled) return;

  try {
    subscribeButton.disabled = true;
    subscribeButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> wait a second';
    await subscribe();
    await updateNotificationButtons();
  } catch (error) {
    console.error("Failed:", error);
  } finally {
    resetButtonState(
      subscribeButton,
      '<i class="fas fa-bell"></i> aktif langganan'
    );
  }
};

// Handle the unsubscription process
const handleUnsubscribe = async () => {
  const unsubscribeButton = document.querySelector("#unsubscribe-button");
  if (unsubscribeButton.disabled) return;

  try {
    unsubscribeButton.disabled = true;
    unsubscribeButton.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Wait a second';
    await unsubscribe();
    await updateNotificationButtons();
  } catch (error) {
    console.error("Failed:", error);
  } finally {
    resetButtonState(
      unsubscribeButton,
      '<i class="fas fa-bell-slash"></i> Stoped Langganan'
    );
  }
};

// Reset the button state after an action completes
const resetButtonState = (button, text) => {
  button.disabled = false;
  button.innerHTML = text;
};

// Handle the installation prompt for the PWA
const handleInstallPrompt = () => {
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installButton = document.querySelector("#install-button");
    if (installButton) {
      installButton.style.display = "inline-block";
      installButton.addEventListener("click", async () => {
        installButton.style.display = "none";
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);
        deferredPrompt = null;
      });
    }
  });
};

// Initialize event listeners and app setup
const initEventListeners = () => {
  window.addEventListener("hashchange", renderPage);
  document
    .querySelector("#logout-link")
    ?.addEventListener("click", handleLogout);
  document
    .querySelector("#subscribe-button")
    ?.addEventListener("click", handleSubscribe);
  document
    .querySelector("#unsubscribe-button")
    ?.addEventListener("click", handleUnsubscribe);
};

// Handle the user logout process
const handleLogout = () => {
  Auth.deleteToken();
  window.location.hash = "#/login";
  updateAuthUI();
};

// Initialize the app
document.addEventListener("DOMContentLoaded", async () => {
  app = document.querySelector("#app");
  renderPage();

  await ensureServiceWorkerExists();
  handleInstallPrompt();

  if (window.Notification && Notification.permission === "granted") {
    setTimeout(() => {
      NotificationHelper.sendPushNotification("App mu siap digunakan!", {
        body: "App mu siap dalam mode offline",
      });
    }, 1000);
  }

  initEventListeners();
});

export default app;
