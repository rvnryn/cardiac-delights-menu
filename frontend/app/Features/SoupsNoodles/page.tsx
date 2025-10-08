"use client";
import MenuPageLayout from "../components/MenuPageLayout";
import { useMemo } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";

type MenuItem = {
  dish_name: string;
  price: number;
  image_url?: string;
  description?: string;
  stock_status?: string;
  category?: string;
};

export default function SoupsNoodlesPage() {
  const { menu, loading, error } = useMenu();

  const items = useMemo(() => {
    if (!menu.length) return [];

    return (menu as MenuItem[])
      .filter(
        (item: MenuItem) =>
          item.category?.toLowerCase().includes("soup") ||
          item.category?.toLowerCase().includes("noodle")
      )
      .map((item: MenuItem) => ({
        name: item.dish_name,
        price: item.price,
        image: item.image_url || "/fallback-image.png",
        description: item.description || "No description available.",
        stockStatus: item.stock_status,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [menu]);

  return (
    <MenuPageLayout
      title={
        <>
          <span className="block text-3xl md:text-4xl font-extrabold text-primary-dark mb-2 tracking-tight animate-fade-in">
            Soups & Noodles
          </span>
          <span className="block text-base md:text-lg text-primary-dark/70 font-medium animate-fade-in delay-100">
            Warm up with our hearty soups and noodle dishes
          </span>
        </>
      }
      description="Enjoy our selection of comforting soups and flavorful noodle creations."
      items={items}
      sections={[
        {
          title: "Soups & Noodles",
          items: items,
        },
      ]}
      bottomSection={{
        title: "Order with Confidence",
        description:
          "All soups and noodles are made fresh to order. Contact us for special requests!",
        badges: ["Fresh Ingredients", "Hearty Portions", "Authentic Flavors"],
      }}
      loading={loading}
      error={error}
    />
  );
}
