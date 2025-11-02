import useSWR from "swr";
import { useState, useCallback } from "react";

interface MenuItem {
  dish_name: string;
  price: number;
  image_url: string;
  stock_status?: string;
}

interface UseMenuDataResult {
  items: MenuItem[];
  loading: boolean;
  error: Error | null;
  page: number;
  pageSize: number;
  total: number | null;
  setPage: (page: number) => void;
}

export function useMenuData(
  category: string,
  initialPage = 1,
  initialPageSize = 20
): UseMenuDataResult {
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);
  const fetcher = useCallback((url: string) => fetch(url).then(res => res.json()), []);
  const { data, error, isLoading } = useSWR(
    `/api/menu?category=${encodeURIComponent(category)}&page=${page}&page_size=${pageSize}`,
    fetcher,
    { revalidateOnFocus: true }
  );

  return {
    items: data?.items || [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error : new Error("Unknown error")) : null,
    page,
    pageSize,
    total: data?.total ?? null,
    setPage,
  };
}
