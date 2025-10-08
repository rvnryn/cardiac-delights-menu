"use client";
import MenuPageLayout from "../components/MenuPageLayout";
import { useMemo } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";

interface MenuItem {
  dish_name: string;
  price: number;
  image_url?: string;
  description?: string;
  stock_status?: string;
  category?: string;
}

export default function RiceToppingsPage() {
  // Fetch all menu data - we'll filter client-side for better performance
  const { menu, loading, error, isValidating } = useMenu();

  const items = useMemo(() => {
    if (!menu.length) return [];

    return (menu as MenuItem[])
      .filter((item: MenuItem) =>
        item.category?.toLowerCase().includes("rice topping")
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
            Rice Toppings
          </span>
          <span className="block text-base md:text-lg text-primary-dark/70 font-medium animate-fade-in delay-100">
            Satisfy your cravings with our savory rice toppings selection
          </span>
        </>
      }
      description="Explore our variety of rice toppings, each crafted to delight your taste buds."
      items={items}
      sections={[
        {
          title: "Rice Toppings",
          items: items,
        },
      ]}
      bottomSection={{
        title: "Order with Confidence",
        description:
          "All rice toppings are made with the freshest ingredients. Contact us for special requests!",
        badges: ["Fresh Ingredients", "Hearty Meals", "Best Value"],
      }}
      loading={loading}
      error={error}
      isValidating={isValidating}
    />
  );
}
