import useSWR from "swr";

export interface MenuSales {
  item_name: string;
  total_sales: number;
}

export function useMenuSales() {
  const { data, error, isLoading } = useSWR("/api/menu/sales", (url) => fetch(url).then(res => res.json()));
  return {
    sales: data?.sales || [],
    loading: isLoading,
    error,
  };
}
