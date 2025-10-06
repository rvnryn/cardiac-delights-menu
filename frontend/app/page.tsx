"use client";

import { useMemo } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";
import MenuPageLayout from "@/app/Features/components/MenuPageLayout";

export default function MenuPage() {
  const { menu, loading, error } = useMenu();

  // Map menu data to MenuPageLayout's MenuItem type
  const items = useMemo(
    () =>
      menu
        .slice()
        .sort((a, b) => a.dish_name.localeCompare(b.dish_name))
        .map((item) => ({
          name: item.dish_name,
          price: item.price,
          image: item.image_url || "/fallback-image.png",
          description: "No description available.",
        })),
    [menu]
  );

  return (
    <MenuPageLayout
      title={
        <>
          <span className="block text-3xl md:text-4xl font-extrabold text-primary-dark mb-2 tracking-tight animate-fade-in">
            Our Menus
          </span>
          <span className="block text-base md:text-lg text-primary-dark/70 font-medium animate-fade-in delay-100">
            Taste the best of Cardiac Delights
          </span>
        </>
      }
      description="Discover our delicious offerings, freshly prepared and always satisfying."
      items={items}
      sections={[
        {
          title: "All Dishes",
          items: items,
        },
      ]}
      bottomSection={{
        title: "Order with Confidence",
        description:
          "All dishes are made with the freshest ingredients. Contact us for special requests!",
        badges: ["Fresh Ingredients", "Fast Service", "Best Value"],
      }}
      loading={loading}
      error={error}
    />
  );
}
