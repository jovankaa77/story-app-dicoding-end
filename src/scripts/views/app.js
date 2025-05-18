import "regenerator-runtime";
import "../styles/styles.css";
import routes from "../routes/routes.js";
import UrlParser from "../routes/url-parser.js";
import Auth from "../utils/auth";
import AddStoryPresenter from "../pages/add-story/add-story-presenter";
import {
  subscribe,
  unsubscribe,
  ensureServiceWorkerExists,
} from "../utils/notification-helper";

const skipLink = document.querySelector(".skip-to-content");
const mainContent = document.getElementById("app");

skipLink.addEventListener("click", function (e) {
  e.preventDefault();
  mainContent.focus();
});

const scrollTopBtn = document.getElementById("scrollTopBtn");
window.addEventListener("scroll", () => {
  if (window.scrollY > 250) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
});

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const app = {
  _currentPresenter: null,
  _currentPageInstance: null,

  // Render the page based on the current URL
  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    const PageComponent = routes[url];
    const appContainer = document.querySelector("#app");

    try {
      this._cleanUpPreviousPage();

      if (!PageComponent) {
        this._renderNotFound(appContainer);
        return;
      }

      this._currentPageInstance = new PageComponent();
      const htmlContent = await this._currentPageInstance.render();
      await this._animatePageTransition(appContainer, htmlContent);

      if (url === "/add-story") {
        this._initializeAddStoryPresenter();
      } else if (typeof this._currentPageInstance.afterRender === "function") {
        await this._currentPageInstance.afterRender();
      }

      updateAuthUI();
    } catch (error) {
      console.error("Failed:", error);
      appContainer.innerHTML = "<h1>Failed</h1>";
    }
  },

  // Clean up the previous page's presenter and instance
  _cleanUpPreviousPage() {
    if (this._currentPresenter) {
      this._currentPresenter.destroy();
      this._currentPresenter = null;
    }

    if (
      this._currentPageInstance &&
      typeof this._currentPageInstance.destroy === "function"
    ) {
      this._currentPageInstance.destroy();
    }

    this._currentPageInstance = null;
  },

  // Render the 404 Page Not Found content
  _renderNotFound(appContainer) {
    appContainer.innerHTML = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
        <h1 style="font-size: 50px; color: #FF6347;">404 - Page Not Found</h1>
        <p style="font-size: 20px;">Sorry, the page you are looking for doesn't exist.</p>
        <p><a href="#/home" style="font-size: 18px; color:rgb(125, 34, 129); text-decoration: none;">Go back to Home</a></p>
      </div>
    `;
  },

  // Initialize Add Story presenter
  _initializeAddStoryPresenter() {
    this._currentPresenter = new AddStoryPresenter(this._currentPageInstance);
    this._currentPresenter.init();
  },

  // Handle page transition animations
  async _animatePageTransition(container, newContent) {
    if (document.startViewTransition) {
      await document.startViewTransition(() => {
        container.innerHTML = newContent;
      }).finished;
    } else {
      await this._fadeOutAndIn(container, newContent);
    }
  },

  // Perform fade-out and fade-in animations
  async _fadeOutAndIn(container, newContent) {
    await container.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(0.95)" },
      ],
      { duration: 300, easing: "ease-in-out" }
    ).finished;

    container.innerHTML = newContent;

    await container.animate(
      [
        { opacity: 0, transform: "scale(1.05)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 300, easing: "ease-in-out" }
    ).finished;
  },

  // Initialize app with event listeners for routing
  async init() {
    window.addEventListener("hashchange", () => this.renderPage());
    window.addEventListener("load", () => this.renderPage());
    await this._preloadResources();
  },

  // Preload necessary resources
  async _preloadResources() {
    const preloadList = [
      "/images/story-app-big.png",
      "/styles/styles.css",
      "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css",
    ];

    await Promise.all(preloadList.map((res) => fetch(res).catch(() => {})));
  },
};

// Update the authentication UI based on the user's login status
function updateAuthUI() {
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
}

// Handle logout functionality
function handleLogout() {
  Auth.deleteToken();
  window.location.hash = "#/login";
  updateAuthUI();
}

document.addEventListener("DOMContentLoaded", async () => {
  const logoutLink = document.querySelector("#logout-link");
  logoutLink?.addEventListener("click", handleLogout);

  await updateNotificationButtons();

  let isProcessing = false;

  // Subscribe to notifications
  const subscribeButton = document.querySelector("#subscribe-button");
  subscribeButton?.addEventListener("click", async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      await ensureServiceWorkerExists();
      subscribeButton.disabled = true;
      subscribeButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Wait a second';
      await subscribe();
      await updateNotificationButtons();
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      subscribeButton.disabled = false;
      subscribeButton.innerHTML =
        '<i class="fas fa-bell"></i> Langganan notifikasi';
      isProcessing = false;
    }
  });

  // Unsubscribe from notifications
  const unsubscribeButton = document.querySelector("#unsubscribe-button");
  unsubscribeButton?.addEventListener("click", async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      await ensureServiceWorkerExists();
      unsubscribeButton.disabled = true;
      unsubscribeButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i>  Wait a second';
      await unsubscribe();
      await updateNotificationButtons();
    } catch (error) {
      console.error("Failed:", error);
    } finally {
      unsubscribeButton.disabled = false;
      unsubscribeButton.innerHTML =
        '<i class="fas fa-bell-slash"></i> Berhenti notif';
      isProcessing = false;
    }
  });
});

// Update notification buttons based on subscription status
async function updateNotificationButtons() {
  const subscribeButton = document.querySelector("#subscribe-button");
  const unsubscribeButton = document.querySelector("#unsubscribe-button");

  if (!subscribeButton || !unsubscribeButton) return;

  try {
    const { isCurrentPushSubscriptionAvailable } = await import(
      "../utils/notification-helper"
    );
    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    subscribeButton.style.display = isSubscribed ? "none" : "inline-block";
    unsubscribeButton.style.display = isSubscribed ? "inline-block" : "none";

    subscribeButton.innerHTML =
      '<i class="fas fa-bell"></i> Langganan notifikasi';
    unsubscribeButton.innerHTML =
      '<i class="fas fa-bell-slash"></i> Berhenti notif';
  } catch (error) {
    console.error("Failed:", error);
  }
}

// Handle app installation prompt
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById("install-button");
  if (installBtn) installBtn.style.display = "block";

  installBtn?.addEventListener("click", async () => {
    installBtn.style.display = "none";
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Prompt install: ${outcome}`);
    deferredPrompt = null;
  });
});

export default app;
