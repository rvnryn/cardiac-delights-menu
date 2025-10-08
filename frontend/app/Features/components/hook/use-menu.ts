import { useEffect, useState, useCallback } from "react";
import { menuDB, MenuItem } from "@/app/utils/indexeddb";

// Cache for menu data
const CACHE_DURATION = 30 * 1000; // 30 seconds
const OFFLINE_STORAGE_KEY = "cardiac_delights_menu_offline";

// Network fetcher function
const fetchMenuFromNetwork = async (url: string): Promise<MenuItem[]> => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ Fetched ${data.length} items from network`);
  return data;
};

export function useMenu(category?: string, fields?: string) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

  // Build URL with query parameters
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (fields) params.append("fields", fields);

  const url = `${backendUrl}/api/menu${
    params.toString() ? "?" + params.toString() : ""
  }`;

  const loadMenu = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setIsValidating(true);
        setError(null);

        // Initialize IndexedDB
        await menuDB.init();

        // Try to get cached data first (instant loading)
        const cachedData = await menuDB.getMenu(category);

        if (cachedData.length > 0) {
          console.log(
            `⚡ Instant load: ${cachedData.length} items from IndexedDB`
          );
          setMenu(cachedData);
          setLoading(false);

          // Check cache age
          const cacheAge = await menuDB.getCacheAge();
          const shouldRefresh = !cacheAge || cacheAge > CACHE_DURATION;

          if (!shouldRefresh) {
            console.log(
              `🎯 Cache is fresh (${Math.round((cacheAge ?? 0) / 1000)}s old)`
            );
            setIsValidating(false);
            return;
          }

          console.log(
            `🔄 Cache is stale (${Math.round(
              (cacheAge ?? 0) / 1000
            )}s old), refreshing...`
          );
        }

        // Fetch fresh data from network
        try {
          const freshData = await fetchMenuFromNetwork(url);

          // Save to IndexedDB for future instant loading
          if (!category && freshData.length > 0) {
            await menuDB.saveMenu(freshData);
          }

          // Filter data if category is specified
          const filteredData = category
            ? freshData.filter((item) => item.category === category)
            : freshData;

          setMenu(filteredData);
          setIsOffline(false);
          console.log(
            `🌐 Updated with fresh data: ${filteredData.length} items`
          );
        } catch (networkError) {
          console.warn("Network request failed:", networkError);
          setIsOffline(true);

          // If no cached data and network failed, show error
          if (cachedData.length === 0) {
            setError("Unable to load menu. Please check your connection.");
            setMenu([]);
          }
          // If we have cached data, we already showed it above
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        setError("Failed to load menu data");
        setMenu([]);
      } finally {
        setLoading(false);
        setIsValidating(false);
      }
    },
    [url, category]
  );

  // Initial load
  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  // Auto-refresh every 30 seconds when page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadMenu(false); // Background refresh without loading state
      }
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [loadMenu]);

  // Refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadMenu(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loadMenu]);

  const refetch = useCallback(() => {
    loadMenu(true);
  }, [loadMenu]);

  const clearCache = useCallback(async () => {
    try {
      await menuDB.clearCache();
      loadMenu(true);
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }, [loadMenu]);

  return {
    menu,
    loading,
    error,
    isOffline,
    isValidating,
    refetch,
    clearCache,
  };
}
