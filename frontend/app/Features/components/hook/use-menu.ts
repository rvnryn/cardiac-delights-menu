import { useEffect, useState } from "react";
import api from "@/app/lib/axios";

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

export function useMenu() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/api/menu")
      .then((res) => {
        if (mounted) setMenu(res.data);
        setError(null);
      })
      .catch((err) => {
        if (mounted) setMenu([]);
        setError(err?.message || "Failed to fetch menu");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { menu, loading, error };
}
