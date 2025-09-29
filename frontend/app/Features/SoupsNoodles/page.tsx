"use client";
import MenuPageLayout from "../components/MenuPageLayout";
import { useMemo } from "react";
import { useMenu } from "@/app/Features/components/hook/use-menu";

export default function SoupsNoodlesPage() {
  const { menu, loading, error } = useMenu();

  const items = useMemo(
    () =>
      menu
        .filter((item) => item.category === "Soup & Noodles")
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
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-600/95 to-yellow-700/95">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-8 w-8 text-primary-dark mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          <span className="text-lg text-primary-dark font-semibold animate-pulse">
            Loading menu...
          </span>
          <span className="text-sm text-primary-dark/70 mt-2">
            Please wait while we fetch the latest dishes.
          </span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <svg
            className="h-8 w-8 text-red-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              className="opacity-25"
            ></circle>
            <path
              fill="currentColor"
              d="M12 8v4m0 4h.01"
              className="opacity-75"
            ></path>
          </svg>
          <span className="text-lg text-red-600 font-semibold">
            Oops! Something went wrong.
          </span>
          <span className="text-sm text-red-500/70 mt-2">{error}</span>
          <button
            className="mt-4 px-4 py-2 bg-primary-dark text-white rounded hover:bg-primary-dark/80 transition"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
    />
  );
}
