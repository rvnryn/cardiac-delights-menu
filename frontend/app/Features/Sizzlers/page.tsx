"use client";
import MenuPageLayout from "../components/MenuPageLayout";
import { useMemo } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";

export default function SizzlersPage() {
  const { menu, loading, error, isValidating } = useMenu();

  type MenuItem = {
    dish_name: string;
    price: number;
    image_url?: string;
    description?: string;
    stock_status?: string;
    category?: string;
  };

  const items = useMemo(() => {
    if (!menu.length) return [];

    return (menu as MenuItem[])
      .filter((item: MenuItem) =>
        item.category?.toLowerCase().includes("sizzler")
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
            Sizzlers
          </span>
          <span className="block text-base md:text-lg text-primary-dark/70 font-medium animate-fade-in delay-100">
            Sizzling specialties to excite your taste buds
          </span>
        </>
      }
      description="Explore our mouthwatering sizzler dishes, served hot and full of flavor."
      items={items}
      sections={[
        {
          title: "Sizzler Dishes",
          items: items,
        },
      ]}
      bottomSection={{
        title: "Order Your Sizzler",
        description:
          "Prepared fresh and served sizzling. Ask us about our sizzler specials!",
        badges: ["Sizzling Hot", "Freshly Made", "Customer Favorites"],
      }}
      loading={loading}
      error={error}
      isValidating={isValidating}
    />
  );
}
