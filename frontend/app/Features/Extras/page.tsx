"use client";
import MenuPageLayout from "../components/MenuPageLayout";
import { useMemo } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";

export default function ExtrasPage() {
  const { menu, loading, error } = useMenu();

  const items = useMemo(() => {
    if (!menu.length) return [];

    return menu
      .filter((item) => item.category?.toLowerCase().includes("extra"))
      .map((item) => ({
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
            Extras
          </span>
          <span className="block text-base md:text-lg text-primary-dark/70 font-medium animate-fade-in delay-100">
            Complete your meal with our delicious extras
          </span>
        </>
      }
      description="Choose from a variety of rice, sauces, and more to complement your meal."
      items={items}
      bottomSection={{
        title: "Enhance Your Experience",
        description:
          "Our extras are freshly prepared to make every meal special. Let us know if you have special requests!",
        badges: ["Freshly Made", "Customizable", "Perfect Pairings"],
      }}
      loading={loading}
      error={error}
    />
  );
}
