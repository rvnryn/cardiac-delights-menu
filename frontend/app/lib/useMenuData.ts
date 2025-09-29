import { useState, useEffect } from "react";

interface MenuItem {
  dish_name: string;
  price: number;
  image_url: string;
  stock_status?: string;
}

export function useMenuData(category: string) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/menu?category=${encodeURIComponent(category)}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [category]);

  return { items, loading, error };
}
