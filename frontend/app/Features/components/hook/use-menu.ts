import { useEffect, useState, useCallback } from "react";
import { FALLBACK_MENU } from "@/app/utils/fallback-menu";
import { supabase } from "@/app/utils/Server/supabaseClient";

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

// Cache for menu data - use Map to cache by category
const menuCacheMap = new Map<string, { data: MenuItem[]; timestamp: number }>();
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
    const cacheKey = category || "all";

    // Try memory cache first
    const cached = menuCacheMap.get(cacheKey);
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      setMenu(cached.data);
      setLoading(false);
      return;
    }

    // For full menu (no category), try offline storage for immediate display
    if (!category) {
      const offlineMenu = getFromOfflineStorage();
      if (offlineMenu && offlineMenu.length > 0) {
        setMenu(offlineMenu);
        setLoading(false);
        // Still fetch fresh data in background
        setTimeout(() => fetchMenu(), 100);
        return;
      }

      // Use fallback menu immediately if no cache available
      if (FALLBACK_MENU.length > 0) {
        setMenu(FALLBACK_MENU);
        setLoading(false);
        // Fetch real data in background
        setTimeout(() => fetchMenu(), 100);
      }
    } else {
      // For category-specific requests, always fetch fresh data
      fetchMenu();
    }
  }, [category, fields]);

  const fetchMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = Date.now();
      const cacheKey = category || "all";

      // Check memory cache first
      const cached = menuCacheMap.get(cacheKey);
      if (cached && now - cached.timestamp < CACHE_DURATION) {
        setMenu(cached.data);
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

      console.log(`🔄 Fetching menu data for: ${cacheKey}`, { url, category });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache", // Force fresh data
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log(`✅ Received ${data.length} items for category: ${cacheKey}`);

      // Update cache with category-specific data
      menuCacheMap.set(cacheKey, { data, timestamp: now });

      // Only save full menu to offline storage
      if (!category) {
        saveToOfflineStorage(data);
      }

      setMenu(data);
      setIsOffline(false);
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
        // Filter by category if specified
        const filteredMenu = category
          ? offlineMenu.filter((item) => item.category === category)
          : offlineMenu;

        setMenu(filteredMenu);
        setIsOffline(true);
        setError(null);
      } else {
        // Only use fallback menu if no real menu data was ever cached
        console.log(
          "No cached menu found, using basic fallback menu:",
          FALLBACK_MENU.length,
          "items"
        );
        const filteredFallback = category
          ? FALLBACK_MENU.filter((item) => item.category === category)
          : FALLBACK_MENU;

        setMenu(filteredFallback);
        setIsOffline(true);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [category, fields]);

  useEffect(() => {
    // Always try to fetch fresh data to check connectivity
    fetchMenu();
  }, [fetchMenu]);

  // Real-time subscription for menu updates
  useEffect(() => {
    const channel = supabase.channel("menu-changes").on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "menu",
      },
      (payload: any) => {
        console.log("🔄 Real-time menu update:", payload);

        const { eventType, new: newRow, old: oldRow } = payload;

        setMenu((currentMenu) => {
          let updatedMenu = [...currentMenu];

          if (eventType === "INSERT" && newRow) {
            // Add new item if it doesn't exist
            const exists = updatedMenu.find(
              (item) => item.menu_id === newRow.menu_id
            );
            if (!exists) {
              updatedMenu.push(newRow as MenuItem);
            }
          }

          if (eventType === "UPDATE" && newRow) {
            // Update existing item
            const index = updatedMenu.findIndex(
              (item) => item.menu_id === newRow.menu_id
            );
            if (index !== -1) {
              updatedMenu[index] = {
                ...updatedMenu[index],
                ...newRow,
              } as MenuItem;
            }
          }

          if (eventType === "DELETE" && oldRow) {
            // Remove deleted item
            updatedMenu = updatedMenu.filter(
              (item) => item.menu_id !== oldRow.menu_id
            );
          }

          // Update cache and offline storage
          const allMenuKey = "all";
          const currentAllMenu = menuCacheMap.get(allMenuKey);
          if (currentAllMenu) {
            menuCacheMap.set(allMenuKey, {
              data: updatedMenu,
              timestamp: Date.now(),
            });
            saveToOfflineStorage(updatedMenu);
          }

          return updatedMenu;
        });
      }
    );

    channel.subscribe((status: string) => {
      console.log("📡 Supabase subscription status:", status);
      if (status === "SUBSCRIBED") {
        setIsOffline(false);
      }
    });

    return () => {
      console.log("🔌 Unsubscribing from menu changes");
      supabase.removeChannel(channel);
    };
  }, []);

  return { menu, loading, error, isOffline, refetch: fetchMenu };
}
