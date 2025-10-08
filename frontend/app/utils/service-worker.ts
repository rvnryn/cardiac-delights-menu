// Service Worker registration utility
export const registerServiceWorker = async (): Promise<void> => {
  if (typeof window === "undefined") {
    console.log("🚫 Service Worker not supported in SSR");
    return;
  }

  if (!("serviceWorker" in navigator)) {
    console.log("🚫 Service Worker not supported in this browser");
    return;
  }

  try {
    console.log("🔧 Registering Service Worker...");

    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    console.log(
      "✅ Service Worker registered successfully:",
      registration.scope
    );

    // Handle updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        console.log("🔄 New Service Worker version available");

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log(
              "🎉 New Service Worker installed, ready for activation"
            );

            // Optionally show a notification to user about update
            if (confirm("A new version is available. Reload to update?")) {
              window.location.reload();
            }
          }
        });
      }
    });

    // Listen for messages from Service Worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      console.log("📨 Message from Service Worker:", event.data);
    });

    // Check for waiting service worker
    if (registration.waiting) {
      console.log("⏳ Service Worker is waiting to activate");
    }

    // Check for active service worker
    if (registration.active) {
      console.log("🚀 Service Worker is active");
    }
  } catch (error) {
    console.error("❌ Service Worker registration failed:", error);
  }
};

// Unregister service worker (for development/debugging)
export const unregisterServiceWorker = async (): Promise<void> => {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();

    for (const registration of registrations) {
      await registration.unregister();
      console.log("🗑️ Service Worker unregistered");
    }
  } catch (error) {
    console.error("❌ Service Worker unregistration failed:", error);
  }
};

// Check if app is running in standalone mode (PWA)
export const isStandalone = (): boolean => {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true
  );
};

// Check if device is online
export const isOnline = (): boolean => {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
};

// Listen for online/offline events
export const addConnectionListener = (
  callback: (online: boolean) => void
): (() => void) => {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
};
