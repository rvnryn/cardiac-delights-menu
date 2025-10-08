import { useEffect, useState, useCallback } from "react";
import { FALLBACK_MENU } from "@/app/utils/fallback-menu";
import useSWR from "swr";

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

// SWR fetcher function
const fetcher = async (url: string) => {
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
  console.log(`✅ SWR fetched ${data.length} items from ${url}`);
  return data;
};

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
  const backendUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

  // Build URL with query parameters
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (fields) params.append("fields", fields);

  const url = `${backendUrl}/api/menu${
    params.toString() ? "?" + params.toString() : ""
  }`;
  const swrKey = category ? `menu-${category}` : "menu-all";

  // Use SWR for data fetching with automatic revalidation
  const {
    data: menu,
    error,
    isLoading,
    mutate: refetch,
  } = useSWR(swrKey, () => fetcher(url), {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true, // Refresh when window gets focus
    revalidateOnReconnect: true, // Refresh when reconnected
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
    fallbackData: category ? [] : FALLBACK_MENU, // Use fallback data immediately
    onSuccess: (data) => {
      // Save full menu to offline storage
      if (!category && data.length > 0) {
        saveToOfflineStorage(data);
      }
    },
    onError: (err) => {
      console.warn("SWR fetch failed, trying offline storage:", err);
      // Try to load from offline storage on error
      const offlineMenu = getFromOfflineStorage();
      if (offlineMenu && offlineMenu.length > 0) {
        const filteredMenu = category
          ? offlineMenu.filter((item: MenuItem) => item.category === category)
          : offlineMenu;
        return filteredMenu;
      }
    },
  });

  const [isOffline, setIsOffline] = useState(false);

  // Monitor connection status
  useEffect(() => {
    setIsOffline(!!error);
  }, [error]);

  return {
    menu: menu || [],
    loading: isLoading,
    error: error?.message || null,
    isOffline,
    refetch,
  };
}
