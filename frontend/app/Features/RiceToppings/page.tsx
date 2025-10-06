"use client";
import MenuPageLayout from "../components/MenuPageLayout";
import { useMemo } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";

export default function RiceToppingsPage() {
  const { menu, loading, error } = useMenu();

  const items = useMemo(
    () =>
      menu
        .filter((item) => item.category === "Rice Toppings")
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
    />
  );
}
