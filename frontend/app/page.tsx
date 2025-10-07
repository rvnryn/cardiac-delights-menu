"use client";

import { useMemo, memo } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";
import MenuPageLayout from "@/app/Features/components/MenuPageLayout";

// Memoized title component to prevent re-renders
const MenuTitle = memo(() => (
  <>
    <span className="block text-3xl md:text-4xl font-extrabold text-primary-dark mb-2 tracking-tight animate-fade-in">
      Our Menus
    </span>
    <span className="block text-base md:text-lg text-primary-dark/70 font-medium animate-fade-in delay-100">
      Taste the best of Cardiac Delights
    </span>
  </>
));

MenuTitle.displayName = "MenuTitle";

export default function MenuPage() {
  // Fetch only essential fields for better performance
  const { menu, loading, error, isOffline } = useMenu(
    undefined,
    "menu_id,dish_name,price,image_url,description"
  );

  // Memoize items transformation with optimized sorting
  const items = useMemo(() => {
    if (!menu.length) return [];

    return menu
      .map((item) => ({
        name: item.dish_name,
        price: item.price,
        image: item.image_url || "/fallback-image.png",
        description: item.description || "No description available.",
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [menu]);

  // Memoize sections to prevent recreation
  const sections = useMemo(
    () => [
      {
        title: "All Dishes",
        items: items,
      },
    ],
    [items]
  );

  // Memoize bottom section
  const bottomSection = useMemo(
    () => ({
      title: "Order with Confidence",
      description:
        "All dishes are made with the freshest ingredients. Contact us for special requests!",
      badges: ["Fresh Ingredients", "Fast Service", "Best Value"],
    }),
    []
  );

  return (
    <MenuPageLayout
      title={<MenuTitle />}
      description="Discover our delicious offerings, freshly prepared and always satisfying."
      items={items}
      sections={sections}
      bottomSection={bottomSection}
      loading={loading}
      error={error}
      isOffline={isOffline}
    />
  );
}
