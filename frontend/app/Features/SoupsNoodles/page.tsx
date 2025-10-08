"use client";
import MenuPageLayout from "../components/MenuPageLayout";
import { useMemo } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";

export default function SoupsNoodlesPage() {
  const { menu, loading, error } = useMenu();

  const items = useMemo(() => {
    console.log(
      "🍜 Processing Soups & Noodles menu:",
      menu.length,
      "total items"
    );
    const filtered = menu
      .filter((item) => {
        console.log(`🔍 Item: ${item.dish_name}, Category: "${item.category}"`);
        return (
          item.category === "Soup & Noodles" ||
          item.category === "Soups & Noodles"
        );
      })
      .sort((a, b) => a.dish_name.localeCompare(b.dish_name))
      .map((item) => ({
        name: item.dish_name,
        price: item.price,
        image: item.image_url || "/fallback-image.png",
        description: item.description || "No description available.",
      }));

    console.log("✅ Soups & Noodles filtered items:", filtered.length);
    return filtered;
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
