"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "./Features/components/navigation/page";
import { routes } from "@/app/routes/routes";

export default function Home() {
  const menuCategories = [
    { 
      name: "Rice Toppings", 
      path: routes.RiceToppings,
      image: "/Bagnet_Silog.png",
      description: "Delicious rice meals with various toppings",
      itemCount: "9+ dishes"
    },
    { 
      name: "Sizzlers", 
      path: routes.Sizzlers,
      image: "/Triple_Bypass.png",
      description: "Hot sizzling plates served fresh",
      itemCount: "8+ dishes"
    },
    { 
      name: "Soups & Noodles", 
      path: routes.SoupsNoodles,
      image: "/PetmaLOMI.png",
      description: "Warm and comforting soup dishes",
      itemCount: "6+ dishes"
    },
    { 
      name: "Desserts", 
      path: routes.Dessert,
      image: "/Lecheng_Saging.png",
      description: "Sweet treats to end your meal",
      itemCount: "5+ desserts"
    },
    { 
      name: "Beverages", 
      path: routes.Beverages,
      image: "/House_Blend_Iced_Tea.png",
      description: "Refreshing drinks and beverages",
      itemCount: "10+ drinks"
    },
    { 
      name: "Extras", 
      path: routes.Extra,
      image: "/Garlic_Rice.png",
      description: "Additional sides and extras",
      itemCount: "7+ items"
    },
  ];

  return (
    <div className="min-h-screen bg-primary-yellow">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container-fluid py-fluid-lg">
        <div className="max-w-6xl mx-auto">
          {/* Hero Content */}
          <div className="text-center mb-fluid-xl animate-fade-in">
            <div className="space-y-fluid-sm">
              <h1 className="text-fluid-4xl md:text-fluid-5xl lg:text-fluid-6xl font-bold text-primary-dark leading-tight">
                Welcome to Our Menu
              </h1>
              
              <div className="flex justify-center">
                <div className="w-16 xs:w-20 sm:w-24 md:w-32 lg:w-40 h-1 bg-primary-dark rounded-full"></div>
              </div>
              
              <p className="text-fluid-lg md:text-fluid-xl text-primary-dark/90 max-w-4xl mx-auto leading-relaxed px-4">
                Explore our delicious categories and discover your next favorite meal. 
                Authentic Filipino flavors that will make your heart skip a beat!
              </p>
            </div>
          </div>

          {/* Menu Categories Grid */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-6xl">
            {menuCategories.map((category, index) => (
              <Link
                key={index}
                href={category.path}
                className="group block animate-slide-up focus-ring"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <article className="bg-primary-dark rounded-2xl lg:rounded-3xl overflow-hidden shadow-medium hover:shadow-strong transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 h-full">
                  {/* Image Container */}
                  <div className="relative overflow-hidden aspect-[4/3]">
                    <Image
                      src={category.image}
                      alt={`${category.name} - ${category.description}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:from-black/20 transition-all duration-300"></div>
                    
                    {/* Item Count Badge */}
                    <div className="absolute top-3 right-3 bg-primary-yellow text-primary-dark px-2 py-1 rounded-full text-xs font-semibold">
                      {category.itemCount}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 md:p-6 text-center space-y-2">
                    <h3 className="font-bold text-lg md:text-xl lg:text-2xl text-primary-yellow leading-tight">
                      {category.name}
                    </h3>

                    <p className="text-sm md:text-base text-primary-yellow/90 leading-relaxed">
                      {category.description}
                    </p>

                    {/* Call to Action */}
                    <div className="pt-2">
                      <div className="inline-flex items-center text-sm md:text-base font-semibold text-primary-yellow group-hover:translate-x-1 transition-transform duration-200">
                        View Menu
                        <svg
                          className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-fluid-xl animate-fade-in">
            <div className="bg-primary-dark/10 backdrop-blur-sm rounded-2xl p-fluid-md max-w-2xl mx-auto">
              <p className="text-fluid-lg font-medium text-primary-dark leading-relaxed">
                Click on any category to explore our full menu selection
              </p>
              <p className="text-fluid-sm text-primary-dark/80 mt-2">
                Each dish is crafted with love and authentic Filipino flavors
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
