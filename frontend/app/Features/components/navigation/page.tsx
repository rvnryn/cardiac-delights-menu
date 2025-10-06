"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  FaUtensils,
  FaFireAlt,
  FaMugHot,
  FaIceCream,
  FaGlassWhiskey,
  FaPlusCircle,
  FaChevronRight,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import type { ReactElement } from "react";
import { routes } from "@/app/routes/routes";
import { FaBowlFood, FaBowlRice } from "react-icons/fa6";
import { MdRamenDining } from "react-icons/md";
// import { GiSizzlingPot } from "react-icons/gi";
import { GiCookingPot, GiSodaCan } from "react-icons/gi";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  type Category = {
    name: string;
    path: string;
    icon: ReactElement;
  };

  // --- constants for styles ---
  const gold = "#FFD700";

  const menuCategories: Category[] = [
    {
      name: "All Menu",
      path: routes.home,
      icon: <FaUtensils />,
    },
    {
      name: "Rice Toppings",
      path: routes.RiceToppings,
      icon: <FaBowlRice />,
    },
    {
      name: "Sizzlers",
      path: routes.Sizzlers,
      icon: <GiCookingPot />,
    },
    {
      name: "Soups & Noodles",
      path: routes.SoupsNoodles,
      icon: <MdRamenDining />,
    },
    {
      name: "Desserts",
      path: routes.Dessert,
      icon: <FaIceCream />,
    },
    {
      name: "Beverages",
      path: routes.Beverages,
      icon: <GiSodaCan />,
    },
    {
      name: "Extras",
      path: routes.Extra,
      icon: <FaPlusCircle />,
    },
  ];

  // --- helper to check active route ---
  function isActiveRoute(path: string) {
    return pathname === path;
  }

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && !isMenuOpen && (
        <button
          className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-gradient-to-br from-slate-900/90 via-black/90 to-gray-800/90 border border-yellow-400/20 shadow-xl hover:border-yellow-400/30 hover:shadow-yellow-400/10 backdrop-blur-lg transition-all duration-300"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
        >
          <FaBars className="text-yellow-500" size={25} />
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobile && isMenuOpen && (
        <div
          className="fixed inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/60 backdrop-blur-md z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar for desktop (lg+) */}
      <aside
        ref={sidebarRef}
        className="hidden lg:flex fixed top-0 left-0 h-screen w-64 bg-gradient-to-b from-gray-950/98 via-black/98 to-gray-950/98 backdrop-blur-xl text-yellow-100 flex-col shadow-2xl border-r border-yellow-400/20 transition-all overflow-hidden z-50"
        style={{ transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-yellow-400/20 bg-gradient-to-r from-black/60 via-black/50 to-black/60 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative overflow-hidden shadow-lgbg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-300/3">
              <Image
                src="/logo.png"
                alt="Cardiac Delights Logo"
                width={42}
                height={42}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 bg-clip-text text-transparent whitespace-nowrap tracking-wide drop-shadow-sm">
              Cardiac Delights
            </span>
          </div>
        </header>
        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-2">
          <ul className="space-y-3 px-1">
            {menuCategories.map((item: Category) => {
              const active = isActiveRoute(item.path);
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`w-full flex items-center rounded-xl cursor-pointer group relative overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 gap-3 px-4 py-3.5 justify-start
                      ${
                        active
                          ? "bg-gradient-to-r from-yellow-500/15 via-yellow-400/10 to-yellow-300/8 text-yellow-200 font-semibold shadow-lg border border-yellow-500/25 backdrop-blur-sm"
                          : "text-yellow-100/75 hover:bg-gradient-to-r hover:from-gray-800/50 hover:via-gray-700/35 hover:to-gray-600/15 hover:text-yellow-300 border border-transparent hover:border-yellow-500/15 hover:backdrop-blur-sm"
                      }
                    `}
                    aria-current={active ? "page" : undefined}
                  >
                    {/* Icon */}
                    <span
                      className={`relative flex items-center justify-center w-6 h-6 text-lg ${
                        active
                          ? "text-yellow-300/90 drop-shadow-md"
                          : "text-yellow-100/60 group-hover:text-yellow-300/80 group-hover:drop-shadow-sm"
                      }`}
                    >
                      {item.icon}
                      {active && (
                        <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-yellow-300/80 to-yellow-400/80 rounded-full shadow-md shadow-yellow-400/30 animate-pulse"></span>
                      )}
                    </span>
                    {/* Label */}
                    <span className="font-medium tracking-wide text-base whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                      {item.name}
                    </span>
                    {/* Chevron */}
                    {active && (
                      <FaChevronRight
                        size={14}
                        className="text-yellow-400 drop-shadow-sm ml-auto"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Sidebar for mobile/tablet (drawer) */}
      <aside
        ref={sidebarRef}
        className={`lg:hidden fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-gray-950/98 via-black/98 to-gray-950/98 backdrop-blur-xl text-yellow-100 flex flex-col shadow-2xl border-r border-yellow-400/20 transition-all overflow-hidden z-50
          ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ transition: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-5 py-4 border-b border-yellow-400/20 bg-gradient-to-r from-black/60 via-black/50 to-black/60 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative rounded-xl overflow-hidden shadow-lg  bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-300/3">
              <Image
                src="/logo.png"
                alt="Cardiac Delights Logo"
                width={42}
                height={42}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-200 bg-clip-text text-transparent whitespace-nowrap tracking-wide drop-shadow-sm">
              Cardiac Delights
            </span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-yellow-200 hover:text-yellow-400 transition-all duration-300 p-2 rounded-lg hover:bg-yellow-400/10 focus:outline-none focus:ring-2 focus:ring-yellow-400/50"
            aria-label="Close menu"
          >
            <FaTimes size={20} />
          </button>
        </header>
        {/* Navigation Items and Footer (reuse) */}
        <nav className="flex-1 overflow-y-auto py-6 px-2">
          <ul className="space-y-3 px-1">
            {menuCategories.map((item: Category) => {
              const active = isActiveRoute(item.path);
              return (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    className={`w-full flex items-center rounded-xl cursor-pointer group relative overflow-hidden transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 gap-3 px-4 py-3.5 justify-start
                      ${
                        active
                          ? "bg-gradient-to-r from-yellow-500/15 via-yellow-400/10 to-yellow-300/8 text-yellow-200 font-semibold shadow-lg border border-yellow-500/25 backdrop-blur-sm"
                          : "text-yellow-100/75 hover:bg-gradient-to-r hover:from-gray-800/50 hover:via-gray-700/35 hover:to-gray-600/15 hover:text-yellow-300 border border-transparent hover:border-yellow-500/15 hover:backdrop-blur-sm"
                      }
                    `}
                    aria-current={active ? "page" : undefined}
                  >
                    {/* Icon */}
                    <span
                      className={`relative flex items-center justify-center w-6 h-6 text-lg ${
                        active
                          ? "text-yellow-300/90 drop-shadow-md"
                          : "text-yellow-100/60 group-hover:text-yellow-300/80 group-hover:drop-shadow-sm"
                      }`}
                    >
                      {item.icon}
                      {active && (
                        <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-gradient-to-r from-yellow-300/80 to-yellow-400/80 rounded-full shadow-md shadow-yellow-400/30 animate-pulse"></span>
                      )}
                    </span>
                    {/* Label */}
                    <span className="font-medium tracking-wide text-base whitespace-nowrap overflow-hidden text-ellipsis flex-1">
                      {item.name}
                    </span>
                    {/* Chevron */}
                    {active && (
                      <FaChevronRight
                        size={14}
                        className="text-yellow-400 drop-shadow-sm ml-auto"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <footer className="py-4 border-t border-yellow-400/20 bg-gradient-to-r from-black/60 via-black/50 to-black/60 backdrop-blur-xl">
          <div className="flex justify-center px-1">
            <a
              href="/privacy-policy"
              target="_self"
              className="text-xs text-yellow-300 hover:text-yellow-400 underline transition-colors duration-200 py-2 text-center w-full"
            >
              Privacy Policy
            </a>
          </div>
        </footer>
      </aside>
    </>
  );
}
