"use client";

import { useMemo, memo } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";
import MenuPageLayout from "@/app/Features/components/MenuPageLayout";

// Enhanced memoized title component with ultra responsive design
const MenuTitle = memo(() => (
  <>
    <span className="block text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-primary-dark mb-2 xs:mb-3 tracking-tight animate-fade-in bg-black bg-clip-text text-transparent drop-shadow-lg">
      Our Delicious Menus
    </span>
    <span className="block text-sm xs:text-base sm:text-lg md:text-xl text-primary-dark/80 font-medium animate-fade-in delay-100 max-w-2xl mx-auto leading-relaxed">
      Discover culinary perfection with every bite - from sizzling specialties
      to comforting classics
    </span>
  </>
));

MenuTitle.displayName = "MenuTitle";

type MenuItem = {
  menu_id: string | number;
  dish_name: string;
  price: number;
  image_url?: string;
  description?: string;
  stock_status?: string;
  category?: string; // Add category field
};

export default function MenuPage() {
  // Fetch only essential fields for better performance
  const { menu, loading, error, isOffline, isValidating } = useMenu(
    undefined,
    "menu_id,dish_name,price,image_url,description,stock_status,category"
  );

  // Memoize items transformation with optimized sorting
  const items = useMemo(() => {
    if (!menu.length) return [];

    console.log("📋 Raw menu data:", menu[0]); // Debug log
    console.log("📋 Stock status in raw data:", menu[0]?.stock_status); // Debug log

    return menu
      .map((item: MenuItem) => {
        const mappedItem = {
          name: item.dish_name,
          price: item.price,
          image: item.image_url || "/fallback-image.png",
          description: item.description || "No description available.",
          stockStatus: item.stock_status,
          category: item.category, // Include category in mapped item
        };
        console.log("🔄 Mapped item:", mappedItem); // Debug log
        return mappedItem;
      })
      .sort(
        (
          a: {
            name: string;
            price: number;
            image: string;
            description: string;
            stockStatus?: string;
            category?: string;
          },
          b: {
            name: string;
            price: number;
            image: string;
            description: string;
            stockStatus?: string;
            category?: string;
          }
        ) => a.name.localeCompare(b.name)
      );
  }, [menu]);

  // Show loading only if we have no data at all
  const shouldShowLoading = loading && items.length === 0;

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

  // Enhanced memoized bottom section
  const bottomSection = useMemo(
    () => ({
      title: "🌟 Order with Complete Confidence",
      description:
        "Every dish is crafted with love using the freshest, premium ingredients. Our chefs are ready to accommodate your special dietary requests and preferences!",
      badges: [
        "Farm Fresh Ingredients",
        "Lightning Fast Service",
        "Unbeatable Value",
        "Expert Chefs",
      ],
    }),
    []
  );

  return (
    <MenuPageLayout
      title={<MenuTitle />}
      description="Browse, search, and filter through our carefully curated selection of mouth-watering dishes. Each item is prepared with passion and served with pride!"
      items={items}
      sections={sections}
      bottomSection={bottomSection}
      loading={shouldShowLoading}
      error={error}
      isOffline={isOffline}
      isValidating={isValidating}
    />
  );
}
