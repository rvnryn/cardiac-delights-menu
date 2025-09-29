import { useEffect, useRef, useState } from "react";
import { supabase } from "../utils/Server/supabaseClient";

export interface MenuItem {
  menu_id: number;
  dish_name: string;
  image_url: string;
  category: string;
  price: number;
  stock_status: string;
  created_at?: string;
  updated_at?: string;
}

// Add a type for the Supabase realtime payload
interface SupabaseMenuChangePayload {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: MenuItem;
  old?: MenuItem;
}

export function useOfflineRealtimeMenu(initialData: MenuItem[]) {
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    // Try to load from localStorage first
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("menu_cache");
      if (cached) return JSON.parse(cached);
    }
    return initialData;
  });
  const [connected, setConnected] = useState(true);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("menu_cache", JSON.stringify(menu));
    }
  }, [menu]);

  useEffect(() => {
    function handleEvent(payload: SupabaseMenuChangePayload) {
      const { eventType, new: newRow, old } = payload;
      setMenu((prev) => {
        if (eventType === "INSERT" && newRow) {
          if (prev.some((item) => item.menu_id === newRow.menu_id)) return prev;
          return [...prev, newRow].sort(sortMenu);
        }
        if (eventType === "UPDATE" && newRow) {
          return prev
            .map((item) =>
              item.menu_id === newRow.menu_id &&
              (!item.updated_at ||
                (newRow.updated_at && newRow.updated_at > item.updated_at))
                ? { ...item, ...newRow }
                : item
            )
            .sort(sortMenu);
        }
        if (eventType === "DELETE" && old) {
          return prev.filter((item) => item.menu_id !== old.menu_id);
        }
        return prev;
      });
    }

    const channel = supabase
      .channel("menu")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "menu" },
        handleEvent
      )
      .subscribe((status: string) => {
        setConnected(status === "SUBSCRIBED");
      });

    // Poll fallback if disconnected
    function pollMenu() {
      fetch("/api/menu")
        .then((res) => res.json())
        .then((data) => setMenu(data));
    }
    if (!connected) {
      pollingRef.current = setInterval(pollMenu, 30000);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      supabase.removeChannel(channel);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [connected]);

  return { menu, connected };
}

function sortMenu(a: MenuItem, b: MenuItem) {
  if (a.category < b.category) return -1;
  if (a.category > b.category) return 1;
  if (a.dish_name < b.dish_name) return -1;
  if (a.dish_name > b.dish_name) return 1;
  return 0;
}
