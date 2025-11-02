import { useEffect, useState, useCallback } from "react";

export interface MenuItem {
  menu_id: number;
  dish_name: string;
  image_url: string;
  category: string;
  price: number;
  description?: string;
  stock_status: string;
  created_at?: string;
  updated_at?: string;
}

// Simple localStorage cache
const CACHE_KEY = "cardiac_delights_menu_cache";
const CACHE_DURATION = 30 * 1000; // 30 seconds

interface CachedData {
  menu: MenuItem[];
  timestamp: number;
}

// Memory cache for instant access
let memoryCache: CachedData | null = null;

const saveToCache = (menu: MenuItem[]) => {
  if (typeof window === "undefined") return;
  try {
    const cacheData: CachedData = {
      menu,
      timestamp: Date.now(),
    };
    memoryCache = cacheData;
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log(`💾 Cached ${menu.length} items`);
  } catch (error) {
    console.warn("Failed to save cache:", error);
  }
};

const getFromCache = (): MenuItem[] | null => {
  if (typeof window === "undefined") return null;
  try {
    if (memoryCache) {
      const age = Date.now() - memoryCache.timestamp;
      if (age < CACHE_DURATION) {
        console.log(`⚡ Instant load from memory: ${memoryCache.menu.length} items`);
        return memoryCache.menu;
      }
    }
    const cached = window.localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const cacheData: CachedData = JSON.parse(cached);
    const age = Date.now() - cacheData.timestamp;
    memoryCache = cacheData;
    if (age < CACHE_DURATION) {
      console.log(`🗄️ Fast load from localStorage: ${cacheData.menu.length} items`);
      return cacheData.menu;
    }
    console.log(`📱 Stale data loaded: ${cacheData.menu.length} items (${Math.round(age / 1000)}s old)`);
    return cacheData.menu;
  } catch (error) {
    console.warn("Failed to load cache:", error);
    return null;
  }
};

const isCacheFresh = (): boolean => {
  if (typeof window === "undefined") return false;
  if (memoryCache) {
    return Date.now() - memoryCache.timestamp < CACHE_DURATION;
  }
  try {
    const cached = window.localStorage.getItem(CACHE_KEY);
    if (!cached) return false;
    const cacheData: CachedData = JSON.parse(cached);
    return Date.now() - cacheData.timestamp < CACHE_DURATION;
  } catch {
    return false;
  }
};

export function useMenu(category?: string, fields?: string) {
  const [menu, setMenu] = useState<MenuItem[]>(() => []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

  const fetchFromNetwork = useCallback(async (): Promise<MenuItem[]> => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (fields) params.append("fields", fields);

    const url = `${backendUrl}/api/menu${
      params.toString() ? "?" + params.toString() : ""
    }`;

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
    // Backend returns {items: [...], page: 1, ...} format
    const items = data.items || data;
    console.log(`✅ Fetched ${items.length} items from network`);
    return items;
  }, [backendUrl, category, fields]);

  const loadMenu = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError(null);

        // Try cache first (instant)
        const cachedMenu = getFromCache();
        if (cachedMenu) {
          const filteredMenu = category
            ? cachedMenu.filter((item) => item.category === category)
            : cachedMenu;

          setMenu(filteredMenu);
          setLoading(false);

          // If cache is fresh, we're done
          if (isCacheFresh()) {
            console.log("✨ Cache is fresh, no network request needed");
            return;
          }
        }

        // Fetch fresh data
        setIsValidating(true);

        try {
          const freshData = await fetchFromNetwork();

          // Save full menu to cache (not filtered)
          if (!category) {
            saveToCache(freshData);
          }

          // Apply filtering
          const filteredData = category
            ? freshData.filter((item) => item.category === category)
            : freshData;

          setMenu(filteredData);
          setIsOffline(false);
          console.log(
            `🌐 Updated with fresh data: ${filteredData.length} items`
          );
        } catch (networkError) {
          console.warn("Network failed:", networkError);
          setIsOffline(true);

          // If no cached data, show error
          if (!cachedMenu || cachedMenu.length === 0) {
            setError("Unable to load menu. Please check your connection.");
          }
        }
      } catch (err) {
        console.error("Load menu error:", err);
        setError("Failed to load menu");
      } finally {
        setLoading(false);
        setIsValidating(false);
      }
    },
    [category, fetchFromNetwork]
  );

  // Initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      loadMenu();
    }
  }, [loadMenu]);

  // Refresh when page becomes visible
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && !document.hidden && !isCacheFresh()) {
        loadMenu(false);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [loadMenu]);

  const refetch = useCallback(() => {
    memoryCache = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CACHE_KEY);
    }
    loadMenu(true);
  }, [loadMenu]);

  const clearCache = useCallback(() => {
    memoryCache = null;
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(CACHE_KEY);
    }
    console.log("🗑️ Cache cleared");
  }, []);

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
