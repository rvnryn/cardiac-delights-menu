// Offline Test Page - Navigate to this page to test offline functionality
"use client";

import { useState, useEffect } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";
import MenuPageLayout from "@/app/Features/components/MenuPageLayout";

export default function OfflineTestPage() {
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [originalFetch, setOriginalFetch] = useState<typeof fetch | null>(null);

  // Toggle offline simulation
  const toggleOffline = () => {
    if (!simulateOffline) {
      // Save original fetch and replace with failing version
      const original = window.fetch;
      setOriginalFetch(() => original);

      window.fetch = async (...args) => {
        throw new Error("Simulated offline - network unavailable");
      };

      setSimulateOffline(true);
    } else {
      // Restore original fetch
      if (originalFetch) {
        window.fetch = originalFetch;
      }
      setSimulateOffline(false);
    }
  };

  // Clear stored menu data to test fallback
  const clearOfflineData = () => {
    localStorage.removeItem("cardiac_delights_menu_offline");
    window.location.reload();
  };
  useEffect(() => {
    return () => {
      if (originalFetch) {
        window.fetch = originalFetch;
      }
    };
  }, [originalFetch]);

  const { menu, loading, error, isOffline } = useMenu();

  const items = menu.map((item) => ({
    name: item.dish_name,
    price: item.price,
    image: item.image_url || "/fallback-image.png",
    description: item.description || "No description available.",
  }));

  return (
    <div>
      {/* Test Controls */}
      <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border">
        <h3 className="font-bold text-sm mb-2">Offline Test Controls</h3>
        <button
          onClick={toggleOffline}
          className={`px-4 py-2 rounded font-medium text-sm mb-2 w-full ${
            simulateOffline
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          {simulateOffline ? "Go Online" : "Go Offline"}
        </button>

        <button
          onClick={clearOfflineData}
          className="px-4 py-2 rounded font-medium text-sm w-full bg-gray-500 text-white hover:bg-gray-600"
        >
          Clear Cache
        </button>
        <div className="mt-2 text-xs text-gray-600">
          <p>Status: {simulateOffline ? "🔴 Offline" : "🟢 Online"}</p>
          <p>Menu Items: {menu.length}</p>
          <p>Is Offline Mode: {isOffline ? "Yes" : "No"}</p>
        </div>
      </div>

      <MenuPageLayout
        title={
          <span className="text-4xl font-bold">
            Offline Test Menu
            <br />
            <span className="text-lg font-normal text-gray-600">
              Test offline functionality
            </span>
          </span>
        }
        description="This page allows you to test the offline functionality by simulating network failures."
        items={items}
        bottomSection={{
          title: "Offline Test Complete",
          description: "Your menu works even without internet connection!",
          badges: ["Offline Ready", "Always Available", "Cached Data"],
        }}
        loading={loading}
        error={error}
        isOffline={isOffline}
      />
    </div>
  );
}
