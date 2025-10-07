// Simple offline test utilities
export function simulateOffline() {
  // Override fetch to simulate network failure
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    throw new Error("Simulated network error - offline mode");
  };

  // Return function to restore normal fetch
  return () => {
    window.fetch = originalFetch;
  };
}

export function showOfflineStatus() {
  const banner = document.createElement("div");
  banner.id = "offline-test-banner";
  banner.innerHTML = `
    <div style="
      position: fixed; 
      top: 0; 
      left: 0; 
      right: 0; 
      background: #ef4444; 
      color: white; 
      padding: 8px; 
      text-align: center; 
      font-size: 14px; 
      z-index: 9999;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      🔴 OFFLINE MODE SIMULATION - Refresh page to restore connection
      <button onclick="window.location.reload()" style="
        margin-left: 10px; 
        background: white; 
        color: #ef4444; 
        border: none; 
        padding: 4px 8px; 
        border-radius: 4px; 
        cursor: pointer;
        font-size: 12px;
      ">Reconnect</button>
    </div>
  `;

  document.body.appendChild(banner);
}
