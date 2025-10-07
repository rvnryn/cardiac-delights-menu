import { useEffect, useState, useCallback } from "react";
import { FALLBACK_MENU } from "@/app/utils/fallback-menu";

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

// Cache for menu data
let menuCache: MenuItem[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const OFFLINE_STORAGE_KEY = "cardiac_delights_menu_offline";

// Utility functions for offline storage
const saveToOfflineStorage = (data: MenuItem[]) => {
  try {
    const offlineData = {
      menu: data,
      savedAt: Date.now(),
    };
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(offlineData));
  } catch (error) {
    console.warn("Could not save menu to offline storage:", error);
  }
};

const getFromOfflineStorage = (): MenuItem[] | null => {
  try {
    const stored = localStorage.getItem(OFFLINE_STORAGE_KEY);
    if (!stored) return null;

    const { menu } = JSON.parse(stored);
    return menu;
  } catch (error) {
    console.warn("Could not load menu from offline storage:", error);
    return null;
  }
};

export function useMenu(category?: string, fields?: string) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsOffline(false);

      // Check memory cache first
      const now = Date.now();
      if (
        menuCache &&
        now - cacheTimestamp < CACHE_DURATION &&
        !category &&
        !fields
      ) {
        setMenu(menuCache);
        setLoading(false);
        return;
      }

      const backendUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

      // Build optimized query parameters
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (fields) params.append("fields", fields);

      const url = `${backendUrl}/api/menu${
        params.toString() ? "?" + params.toString() : ""
      }`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Cache-Control": "public, max-age=300", // 5 minutes
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update memory cache and offline storage for all requests (not just full menu)
      menuCache = data;
      cacheTimestamp = now;
      saveToOfflineStorage(data);

      setMenu(data);
    } catch (err: any) {
      console.warn("Network request failed, trying offline storage:", err);

      // Try to load from offline storage first (your actual menu data)
      const offlineMenu = getFromOfflineStorage();
      if (offlineMenu && offlineMenu.length > 0) {
        console.log(
          "Loading YOUR menu from offline storage:",
          offlineMenu.length,
          "items"
        );
        setMenu(offlineMenu);
        setIsOffline(true);
        setError(null); // Clear error since we have your actual menu data
      } else {
        // Only use fallback menu if no real menu data was ever cached
        console.log(
          "No cached menu found, using basic fallback menu:",
          FALLBACK_MENU.length,
          "items"
        );
        setMenu(FALLBACK_MENU);
        setIsOffline(true);
        setError(null); // Clear error since we have fallback data
      }
    } finally {
      setLoading(false);
    }
  }, [category, fields]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return { menu, loading, error, isOffline, refetch: fetchMenu };
}
