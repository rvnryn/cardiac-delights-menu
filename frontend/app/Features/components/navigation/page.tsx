"use client";

import Link from "next/link";
import { routes } from "@/app/routes/routes";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const categories = [
    { name: "Rice Toppings", path: routes.RiceToppings },
    { name: "Sizzlers", path: routes.Sizzlers },
    { name: "Soups & Noodles", path: routes.SoupsNoodles },
    { name: "Desserts", path: routes.Dessert },
    { name: "Beverages", path: routes.Beverages },
    { name: "Extras", path: routes.Extra },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const isActiveRoute = (path: string) => pathname === path;

  return (
    <>
      <nav 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'backdrop-blur-md shadow-strong' 
            : 'shadow-medium'
        }`}
        style={{ backgroundColor: '#fec401' }}
      >
        <div className="container-fluid">
          <div className="flex items-center justify-between py-3 lg:py-4">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-all duration-200 focus-ring rounded-lg p-1"
            >
              <div className="relative">
                <Image 
                  src="/cardiac_logo.png" 
                  alt="Cardiac Arrest Menu Logo" 
                  width={40} 
                  height={40}
                  className="rounded-full w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 transition-transform duration-200 hover:scale-105"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-fluid-lg lg:text-fluid-xl leading-tight" style={{ color: '#1e1e1e' }}>
                  Cardiac Arrest
                </span>
                <span className="text-fluid-xs leading-tight hidden sm:block" style={{ color: '#1e1e1e' }}>
                  Menu
                </span>
              </div>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-2">
              {categories.map((item, i) => (
                <Link 
                  key={i} 
                  href={item.path} 
                  className={`relative font-medium px-3 xl:px-4 py-2 rounded-xl transition-all duration-200 text-fluid-sm xl:text-fluid-base hover:bg-black/10 focus-ring ${
                    isActiveRoute(item.path) 
                      ? 'bg-black/10' 
                      : 'hover:bg-black/5'
                  }`}
                  style={{ color: '#1e1e1e' }}
                >
                  {item.name}
                  {isActiveRoute(item.path) && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: '#1e1e1e' }}></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-black/10 transition-all duration-200 focus-ring"
              style={{ color: '#1e1e1e' }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
            >
              <div className="relative w-6 h-6">
                <span 
                  className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? 'rotate-45 top-3' : 'top-1'
                  }`}
                />
                <span 
                  className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 top-3 ${
                    isMenuOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span 
                  className={`absolute block w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? '-rotate-45 top-3' : 'top-5'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />
        </div>
      )}

      {/* Mobile Menu */}
      <div 
        className={`fixed top-[73px] left-0 right-0 z-50 lg:hidden transition-all duration-300 ${
          isMenuOpen 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="backdrop-blur-md border-t border-black/20" style={{ backgroundColor: 'rgba(254, 196, 1, 0.95)' }}>
          <div className="container-fluid py-4">
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
              {categories.map((item, i) => (
                <Link 
                  key={i} 
                  href={item.path} 
                  className={`flex items-center gap-3 font-medium px-4 py-3 rounded-xl transition-all duration-200 text-fluid-sm focus-ring ${
                    isActiveRoute(item.path)
                      ? 'bg-black/20 shadow-medium'
                      : 'hover:bg-black/10'
                  }`}
                  style={{ color: '#1e1e1e' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span>{item.name}</span>
                  {isActiveRoute(item.path) && (
                    <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#1e1e1e' }}></div>
                  )}
                </Link>
              ))}
            </div>
            
            {/* Mobile Menu Footer */}
            <div className="mt-6 pt-4 border-t border-black/20 text-center">
              <p className="text-fluid-xs" style={{ color: 'rgba(30, 30, 30, 0.7)' }}>
                Authentic Filipino flavors that will make your heart skip a beat!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
