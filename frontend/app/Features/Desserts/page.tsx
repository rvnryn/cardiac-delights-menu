"use client";
import MenuPageLayout from "../components/MenuPageLayout";
import { useMemo } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";

export default function DessertsPage() {
  const { menu, loading, error } = useMenu();

  const items = useMemo(
    () =>
      menu
        .filter((item) => item.category === "Desserts")
        .sort((a, b) => a.dish_name.localeCompare(b.dish_name))
        .map((item) => ({
          name: item.dish_name,
          price: item.price,
          image: item.image_url || "/fallback-image.png",
          description: item.description || "No description available.",
        })),
    [menu]
  );

  return (
    <MenuPageLayout
      title={
        <>
          <span className="block text-3xl md:text-4xl font-extrabold text-primary-dark mb-2 tracking-tight animate-fade-in">
            Desserts
          </span>
          <span className="block text-base md:text-lg text-primary-dark/70 font-medium animate-fade-in delay-100">
            Sweet treats to end your meal
          </span>
        </>
      }
      description="Indulge in our delightful dessert selection, crafted to satisfy your sweet cravings."
      items={items}
      sections={[
        {
          title: "All Desserts",
          items: items,
        },
      ]}
      bottomSection={{
        title: "Order with Confidence",
        description:
          "All desserts are made with the freshest ingredients. Contact us for special requests!",
        badges: ["Fresh Ingredients", "Homemade", "Best Value"],
      }}
      loading={loading}
      error={error}
    />
  );
}
