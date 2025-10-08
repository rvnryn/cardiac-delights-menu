"use client";
import MenuPageLayout from "../components/MenuPageLayout";
import { useMemo } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";

export default function BeveragesPage() {
  const { menu, loading, error } = useMenu();

  type MenuItem = {
    dish_name: string;
    category: string;
    price: number;
    image_url?: string;
    description?: string;
  };

  const items = useMemo(() => {
    console.log("🥤 Processing Beverages menu:", menu.length, "total items");
    const filtered = menu
      .filter((item: MenuItem) => {
        console.log(`🔍 Item: ${item.dish_name}, Category: "${item.category}"`);
        return item.category === "Beverage" || item.category === "Beverages";
      })
      .sort((a: MenuItem, b: MenuItem) => a.dish_name.localeCompare(b.dish_name))
      .map((item: MenuItem) => ({
        name: item.dish_name,
        price: item.price,
        image: item.image_url || "/fallback-image.png",
        description: item.description || "No description available.",
      }));

    console.log("✅ Beverages filtered items:", filtered.length);
    return filtered;
  }, [menu]);

  return (
    <MenuPageLayout
      title={
        <>
          <span className="block text-3xl md:text-4xl font-extrabold text-primary-dark mb-2 tracking-tight animate-fade-in">
            Beverages
          </span>
          <span className="block text-base md:text-lg text-primary-dark/70 font-medium animate-fade-in delay-100">
            Quench your thirst with our refreshing drinks
          </span>
        </>
      }
      description="Explore our selection of beverages, perfect for any meal."
      items={items}
      sections={[
        {
          title: "All Beverages",
          items: items,
        },
      ]}
      bottomSection={{
        title: "Order with Confidence",
        description:
          "All beverages are served chilled and made with quality ingredients. Contact us for special requests!",
        badges: ["Chilled Drinks", "Fresh Flavors", "Best Value"],
      }}
      loading={loading}
      error={error}
    />
  );
}
