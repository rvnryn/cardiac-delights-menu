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

  // Check for immediate cache availability to reduce initial loading time
  useEffect(() => {
    const now = Date.now();

    // Try memory cache first
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

    // Try offline storage for immediate display
    const offlineMenu = getFromOfflineStorage();
    if (offlineMenu && offlineMenu.length > 0) {
      setMenu(offlineMenu);
      setLoading(false);
      // Don't set offline flag here - let fetchMenu determine connectivity
      // Still fetch fresh data in background
      setTimeout(() => fetchMenu(), 100);
      return;
    }

    // Use fallback menu immediately if no cache available
    if (FALLBACK_MENU.length > 0) {
      setMenu(FALLBACK_MENU);
      setLoading(false);
      // Don't set offline flag here - let fetchMenu determine connectivity
      // Fetch real data in background
      setTimeout(() => fetchMenu(), 100);
    }
  }, []);

  const fetchMenu = useCallback(async () => {
    try {
      // Only set loading if we don't already have data
      const hasData = menu.length > 0;
      if (!hasData) {
        setLoading(true);
      }
      setError(null);

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
        setIsOffline(false);
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Cache-Control": "public, max-age=300", // 5 minutes
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Debug: Log the first menu item to check if stock_status is included
      if (data && data.length > 0) {
        console.log("🔍 Sample menu item from API:", data[0]);
        console.log("🔍 Stock status field:", data[0].stock_status);
        console.log("🔍 All fields in first item:", Object.keys(data[0]));
      }

      // Update memory cache and offline storage for all requests (not just full menu)
      menuCache = data;
      cacheTimestamp = now;
      saveToOfflineStorage(data);

      setMenu(data);
      setIsOffline(false); // Clear offline flag when network succeeds
    } catch (err: unknown) {
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
    // Always try to fetch fresh data to check connectivity
    fetchMenu();
  }, [fetchMenu]);

  return { menu, loading, error, isOffline, refetch: fetchMenu };
}
