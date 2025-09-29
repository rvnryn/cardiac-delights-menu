"use client";
import MenuPageLayout from "../components/MenuPageLayout";
import { useMemo } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";

export default function BeveragesPage() {
  const { menu, loading, error } = useMenu();

  const items = useMemo(
    () =>
      menu
        .filter((item) => item.category === "Beverages")
        .sort((a, b) => a.dish_name.localeCompare(b.dish_name))
        .map((item) => ({
          name: item.dish_name,
          price: item.price,
          image: item.image_url || "/fallback-image.png",
          description: "No description available.",
        })),
    [menu]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-yellow">
        <div className="text-center text-gray-500 py-12">Loading menu...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-yellow">
        <div className="text-center text-red-500 py-12">{error}</div>
      </div>
    );
  }

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
    />
  );
}
