"use client";
import React, {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import { useMenuSales } from "../../lib/useMenuSales";
import Image from "next/image";
import {
  MdClose,
  MdSearch,
  MdFilterList,
  MdClear,
  MdTune,
  MdRestaurant,
  MdStar,
  MdLocationOn,
  MdPhone,
  MdAccessTime,
} from "react-icons/md";
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiClock,
  FiMapPin,
} from "react-icons/fi";
import { HiSparkles, HiTrendingUp } from "react-icons/hi";

interface MenuItem {
  sales?: number;
  isHot?: boolean;
  name: string;
  price: number;
  image: string;
  description: string;
  category?: string;
  stockStatus?: string;
  tags?: string[];
  // New badge properties
  isVegetarian?: boolean;
  isSpicy?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  isChefSpecial?: boolean;
  spicyLevel?: number; // 1-3 for mild, medium, hot
}

interface MenuPageLayoutProps {
  title: ReactNode;
  description: string;
  items: MenuItem[];
  sections?: { title: string; items: MenuItem[] }[];
  bottomSection: {
    title: string;
    description: string;
    badges: string[];
  };
  locale?: string;
  currency?: string;
  loading?: boolean;
  error?: string | null;
  isOffline?: boolean;
  isValidating?: boolean; // New prop for showing update indicator
}

const categoryOrder = [
  "Bagnet Meals",
  "Sizzlers",
  "Unli Rice w/ Bone Marrow",
  "Soups w/ Bone Marrow",
  "Combo",
  "For Sharing",
  "Noodles",
  "Desserts",
  "Sides",
  "Drinks"
];

// Debounce hook for search optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Memoized MenuCard component for better performance with enhanced UI
const MenuCard = memo(function MenuCard({
  item,
  index,
  currencyFmt,
  onItemClick,
}: {
  item: MenuItem;
  index: number;
  currencyFmt: Intl.NumberFormat;
  onItemClick?: (item: MenuItem) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const price = currencyFmt ? currencyFmt.format(item.price).replace("PHP", "₱") : `₱${item.price}`;
  const cardRef = useRef<HTMLDivElement | null>(null);

  return (
    <article
      ref={cardRef}
      className="group relative bg-gradient-to-br from-gray-900/95 to-black/95 rounded-3xl overflow-hidden shadow-xl ring-2 ring-yellow-500/10 transition-all duration-500 ease-out focus-within:ring-4 focus-within:ring-yellow-400/30 hover:shadow-2xl hover:shadow-yellow-500/20 hover:-translate-y-3 hover:scale-[1.02] h-full flex flex-col border border-yellow-900/20"
      tabIndex={-1}
      aria-label={item.name}
      style={{ animationDelay: `${index * 40}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 rounded-3xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500" aria-hidden />

      {/* Image - Responsive aspect ratio */}
      <div className="relative overflow-hidden aspect-[5/3] sm:aspect-[4/3] md:aspect-[4/3] lg:aspect-[7/4] bg-black/10 text-white flex-shrink-0">
        {/* Skeleton loader with shimmer effect */}
        {!loaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer bg-[length:200%_100%]" aria-hidden />
        )}
        {!imageError ? (
          <Image
            src={item.image && typeof item.image === 'string' && item.image.trim() !== '' ? item.image : '/images/fallback/no-image.png'}
            alt={`${item.name}. ${item.description}`}
            fill
            sizes="(max-width: 475px) 100vw, (max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
            className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
            priority={index < 8}
            onLoad={() => setLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-900">
            <span className="text-red-500 text-lg">Image not available</span>
          </div>
        )}

        {/* Stock Status Badge - Top Right */}
        {item.stockStatus && (
          <div className="absolute top-2 right-2 z-10">
            <div className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-lg backdrop-blur-sm flex items-center gap-1.5 ${
              item.stockStatus.toLowerCase().includes('in stock') || item.stockStatus.toLowerCase().includes('available')
                ? 'bg-green-500/95 text-white border border-green-300/40'
                : item.stockStatus.toLowerCase().includes('low stock')
                ? 'bg-orange-500/95 text-white border border-orange-300/40 animate-pulse'
                : 'bg-red-500/95 text-white border border-red-300/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                item.stockStatus.toLowerCase().includes('in stock') || item.stockStatus.toLowerCase().includes('available')
                  ? 'bg-green-200'
                  : item.stockStatus.toLowerCase().includes('low stock')
                  ? 'bg-orange-200 animate-pulse'
                  : 'bg-red-200'
              }`}></span>
              <span>{item.stockStatus}</span>
            </div>
          </div>
        )}

        {/* Dietary/Special Badges - Bottom Left */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1.5 max-w-[calc(100%-4rem)]">
          {item.isVegetarian && (
            <div className="px-2 py-1 bg-green-500/95 text-white rounded-full text-[10px] font-bold shadow-lg border border-green-300/40 backdrop-blur-sm flex items-center gap-1" title="Vegetarian">
              <span>🌱</span>
              <span className="hidden sm:inline">Veg</span>
            </div>
          )}
          {item.isSpicy && (
            <div className="px-2 py-1 bg-red-500/95 text-white rounded-full text-[10px] font-bold shadow-lg border border-red-300/40 backdrop-blur-sm flex items-center gap-1" title={`Spicy Level: ${item.spicyLevel || 1}`}>
              <span>🌶️</span>
              {item.spicyLevel && (
                <span className="hidden sm:inline">{'🌶️'.repeat(Math.min(item.spicyLevel, 3))}</span>
              )}
            </div>
          )}
          {item.isBestSeller && (
            <div className="px-2 py-1 bg-yellow-500/95 text-black rounded-full text-[10px] font-bold shadow-lg border border-yellow-300/40 backdrop-blur-sm flex items-center gap-1" title="Best Seller">
              <span>⭐</span>
              <span className="hidden sm:inline">Best</span>
            </div>
          )}
          {item.isNew && (
            <div className="px-2 py-1 bg-blue-500/95 text-white rounded-full text-[10px] font-bold shadow-lg border border-blue-300/40 backdrop-blur-sm flex items-center gap-1 animate-pulse" title="New Item">
              <span>🆕</span>
              <span className="hidden sm:inline">New</span>
            </div>
          )}
          {item.isChefSpecial && (
            <div className="px-2 py-1 bg-purple-500/95 text-white rounded-full text-[10px] font-bold shadow-lg border border-purple-300/40 backdrop-blur-sm flex items-center gap-1" title="Chef's Special">
              <span>👨‍🍳</span>
              <span className="hidden sm:inline">Chef</span>
            </div>
          )}
        </div>

        {/* New: Hover overlay with quick actions */}
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="transform transition-all duration-300 scale-90 group-hover:scale-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onItemClick?.(item);
              }}
              className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-full shadow-xl hover:shadow-2xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 flex items-center gap-2"
              aria-label={`View details for ${item.name}`}
            >
              <MdRestaurant className="text-lg" />
              <span>View Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content - Enhanced with better spacing */}
      <div className="p-4 sm:p-5 md:p-6 lg:p-7 flex flex-col gap-2 sm:gap-2.5 md:gap-3 flex-grow relative">
        {/* Decorative element */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" aria-hidden />

        <div className="flex items-start justify-between gap-2">
          <h3 className="font-extrabold text-base sm:text-lg md:text-xl lg:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 to-yellow-200 leading-tight flex-grow drop-shadow-md group-hover:from-yellow-200 group-hover:to-yellow-100 transition-all duration-300">
            <span className="line-clamp-2">{item.name}</span>
          </h3>
        </div>

        <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/80 leading-relaxed line-clamp-2 lg:line-clamp-3 flex-grow group-hover:text-white transition-colors duration-300">
          {item.description}
        </p>

        {/* Tags - Enhanced design */}
        {item.tags?.length ? (
          <ul
            className="mt-auto flex flex-wrap gap-1.5 sm:gap-2"
            aria-label="Item attributes"
          >
            {item.tags.slice(0, 3).map((t, idx) => (
              <li
                key={t}
                className="text-[10px] sm:text-xs rounded-full bg-gradient-to-r from-yellow-600/80 to-yellow-700/80 text-yellow-50 px-2.5 sm:px-3 py-1 sm:py-1.5 border border-yellow-500/40 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 font-medium"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {t}
              </li>
            ))}
            {item.tags.length > 3 && (
              <li className="text-[10px] sm:text-xs text-yellow-300/80 px-2 py-1 font-semibold">
                +{item.tags.length - 3} more
              </li>
            )}
          </ul>
        ) : null}

        {/* Rating stars */}
        <div className="flex items-center gap-1 mt-1" aria-label="Rating">
          {[...Array(5)].map((_, i) => (
            <MdStar key={i} className="text-yellow-400 text-xs sm:text-sm" />
          ))}
          <span className="text-xs text-white/60 ml-1">(4.5)</span>
        </div>
      </div>

      {/* HOT badge for top sales items */}
      {item.isHot && (
        <div className="absolute top-2 right-2 bg-gradient-to-br from-red-500 to-pink-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12 animate-bounce-gentle z-20">
          HOT!
        </div>
      )}
    </article>
  );
});

// Skeleton Card Component for Loading State
const SkeletonCard = memo(function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="bg-gradient-to-br from-gray-900/95 to-black/95 rounded-3xl overflow-hidden shadow-xl ring-2 ring-yellow-500/10 h-full flex flex-col border border-yellow-900/20 animate-pulse"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Image skeleton */}
      <div className="relative overflow-hidden aspect-[5/3] sm:aspect-[4/3] md:aspect-[4/3] lg:aspect-[7/4] bg-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-shimmer bg-[length:200%_100%]" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 sm:p-5 md:p-6 lg:p-7 flex flex-col gap-3 flex-grow">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-6 sm:h-7 bg-gray-800 rounded-lg w-3/4"></div>
          <div className="h-6 sm:h-7 bg-gray-800 rounded-lg w-1/2"></div>
        </div>

        {/* Description skeleton */}
        <div className="space-y-2 flex-grow">
          <div className="h-4 bg-gray-800 rounded w-full"></div>
          <div className="h-4 bg-gray-800 rounded w-5/6"></div>
          <div className="h-4 bg-gray-800 rounded w-4/6"></div>
        </div>

        {/* Tags skeleton */}
        <div className="flex gap-2">
          <div className="h-7 bg-gray-800 rounded-full w-16"></div>
          <div className="h-7 bg-gray-800 rounded-full w-20"></div>
          <div className="h-7 bg-gray-800 rounded-full w-14"></div>
        </div>

        {/* Rating skeleton */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-800 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
});

const MenuGrid = memo(function MenuGrid({
  items,
  currencyFmt,
  dense,
  animateResults,
  onItemClick,
  loading,
}: {
  items: MenuItem[];
  currencyFmt: Intl.NumberFormat;
  dense: boolean;
  animateResults?: boolean;
  onItemClick?: (item: MenuItem) => void;
  loading?: boolean;
}) {
  // Show skeleton loaders during loading
  if (loading) {
    return (
      <ul className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
        {Array.from({ length: 12 }, (_, i) => (
          <li key={i}>
            <SkeletonCard index={i} />
          </li>
        ))}
      </ul>
    );
  }

  if (!items.length) {
    return (
      <div className="flex items-center justify-center py-20 sm:py-24 lg:py-32">
        <div className="text-center max-w-2xl mx-auto px-4 animate-scale-in">
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500/20 via-yellow-600/20 to-orange-500/20 flex items-center justify-center animate-float">
                <FiFilter className="w-16 h-16 text-yellow-600" />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full opacity-20 blur-2xl" aria-hidden />
            </div>
          </div>

          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 mb-4">
            No dishes found
          </h3>

          <p className="text-black/70 text-lg sm:text-xl leading-relaxed mb-8 max-w-xl mx-auto">
            We couldn't find any dishes matching your criteria. Try adjusting your
            filters or search terms to discover more delicious options!
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="group px-5 py-3 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 hover:from-yellow-500/30 hover:to-yellow-600/30 text-yellow-900 rounded-2xl text-sm font-semibold border border-yellow-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-default">
              <span className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                Try different keywords
              </span>
            </div>
            <div className="group px-5 py-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 text-blue-900 rounded-2xl text-sm font-semibold border border-blue-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-default">
              <span className="flex items-center gap-2">
                <span className="text-lg">🗂️</span>
                Change category
              </span>
            </div>
            <div className="group px-5 py-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 text-purple-900 rounded-2xl text-sm font-semibold border border-purple-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-default">
              <span className="flex items-center gap-2">
                <span className="text-lg">🧹</span>
                Clear filters
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-300 ${
        animateResults ? "opacity-75 scale-[0.98]" : "opacity-100 scale-100"
      }`}
    >
      <ul
        className="grid gap-3 sm:gap-4 md:gap-5 lg:gap-6 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 transition-all duration-300"
        role="list"
      >
        {items.map((item, index) => (
          <li
            key={`${item.name}-${index}`}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <MenuCard
              item={item}
              index={index}
              currencyFmt={currencyFmt}
              onItemClick={onItemClick}
            />
          </li>
        ))}
      </ul>
    </div>
  );
});

function MenuPageLayout({
  title,
  description,
  items,
  sections,
  bottomSection,
  locale = "en-PH",
  currency = "PHP",
  loading = false,
  error = null,
  isOffline = false,
  isValidating = false,
}: MenuPageLayoutProps) {
  // Map backend fields to frontend fields
  const { sales: salesData } = useMenuSales();
  const mappedItems = items.map((item: any) => {
    const salesEntry = salesData?.find((s: any) => s.item_name === (item.dish_name || item.name));
    return {
      name: item.dish_name || item.name || '',
      price: item.price,
      image: item.image_url || item.image || '',
      description: item.description || '',
      category: item.category,
      stockStatus: item.stock_status || item.stockStatus,
      tags: item.tags || [],
      isVegetarian: item.isVegetarian,
      isSpicy: item.isSpicy,
      isBestSeller: item.isBestSeller,
      isNew: item.isNew,
      isChefSpecial: item.isChefSpecial,
      spicyLevel: item.spicyLevel,
      sales: salesEntry?.total_sales || 0,
    };
  });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high" | "sales">("name");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
  const cats = Array.from(new Set(mappedItems.map(item => item.category).filter(Boolean)));
  const orderedCats = categoryOrder.filter(cat => cats.includes(cat));
  const remainingCats = cats.filter(cat => !categoryOrder.includes(cat));
  return ["all", ...orderedCats, ...remainingCats];
}, [mappedItems]);

  // Get price range from items
  const itemPriceRange = useMemo(() => {
    if (mappedItems.length === 0) return [0, 1000];
    const prices = mappedItems.map(item => item.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [mappedItems]);

  // Initialize price range only when items change, and only if needed
  useEffect(() => {
    const newRange = itemPriceRange as [number, number];
    if (priceRange[0] !== newRange[0] || priceRange[1] !== newRange[1]) {
      setPriceRange(newRange);
    }
  }, [items]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = mappedItems;

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply price filter
    filtered = filtered.filter(
      item => item.price >= priceRange[0] && item.price <= priceRange[1]
    );

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "sales":
          return (b.sales ?? 0) - (a.sales ?? 0);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return sorted;
  }, [mappedItems, debouncedSearch, selectedCategory, priceRange, sortBy]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, priceRange, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // Mark top 3 sales items as hot if sorting by sales
  const paginatedItems = React.useMemo(() => {
    const items = filteredAndSortedItems.slice(startIndex, endIndex);
    if (sortBy === "sales") {
      return items.map((item, idx) => ({ ...item, isHot: idx < 3 }));
    }
    return items;
  }, [filteredAndSortedItems, startIndex, endIndex, sortBy]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange(itemPriceRange as [number, number]);
    setSortBy("name");
  }, [itemPriceRange]);

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || sortBy !== "name";

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen pt-20 lg:pt-0 flex items-center justify-center px-4">
        <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-yellow-500/20 max-w-md w-full mx-auto animate-scale-in">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 flex items-center justify-center shadow-2xl animate-glow-pulse">
                <MdRestaurant className="h-10 w-10 text-black animate-float" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full blur-xl opacity-40 animate-pulse" aria-hidden />
            </div>

            <div className="space-y-3">
              <h3 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400">
                Loading Menu
              </h3>
              <div className="space-y-2">
                <p className="text-white/90 font-medium text-lg">
                  Preparing delicious dishes for you
                </p>
                <p className="text-sm text-white/60">
                  This won't take long...
                </p>
              </div>
            </div>

            {/* Enhanced progress bar */}
            <div className="w-full bg-gray-800/50 rounded-full h-2.5 overflow-hidden backdrop-blur-sm border border-yellow-500/20">
              <div className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full animate-shimmer bg-[length:200%_100%]" aria-hidden />
            </div>

            {/* Loading dots animation */}
            <div className="flex gap-2" aria-hidden>
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-red-500/20 max-w-md w-full mx-auto animate-scale-in">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-2xl">
                <svg
                  className="h-10 w-10 text-white animate-bounce"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-red-400">{error}</h3>
            <p className="text-white/80">Sorry, something went wrong. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8 md:mb-10 animate-slide-up">
        <div className="text-center mb-8">
          {title}
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-md rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-2xl border border-yellow-500/20">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MdSearch className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
            </div>
            <input
              type="text"
              placeholder="Search dishes, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 sm:pl-12 pr-12 py-3 sm:py-4 bg-black/50 border-2 border-yellow-500/30 rounded-xl sm:rounded-2xl text-white placeholder-white/50 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all duration-200 text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-yellow-400 hover:text-yellow-300 transition-colors"
                aria-label="Clear search"
              >
                <MdClear className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="mb-4 overflow-x-auto scrollbar-hide -mx-2 px-2">
            <div className="flex gap-2 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 text-sm sm:text-base whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/30 scale-105"
                      : "bg-black/50 text-white/80 hover:bg-yellow-500/20 hover:text-yellow-300 border border-yellow-500/20"
                  }`}
                >
                  {cat === "all" ? "All Dishes" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Toggle and Sort */}
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 border border-yellow-500/30 text-sm sm:text-base"
            >
              <MdTune className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-yellow-400 text-black rounded-full text-xs font-bold">
                  Active
                </span>
              )}
            </button>

            <div className="flex items-center gap-2 flex-1">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 bg-black/50 border-2 border-yellow-500/30 rounded-xl sm:rounded-2xl text-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all duration-200 text-sm sm:text-base"
              >
                <option value="name">Sort: A-Z</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="sales">Sort: Best Sellers</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 sm:px-5 py-2.5 sm:py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl sm:rounded-2xl font-semibold transition-all duration-200 border border-red-500/30 flex items-center gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <MdClear className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Price Range Filter (Collapsible) */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-yellow-500/20 animate-slide-up">
              <label className="block text-white font-semibold mb-3 text-sm sm:text-base">
                Price Range: ₱{priceRange[0]} - ₱{priceRange[1]}
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="range"
                  min={itemPriceRange[0]}
                  max={itemPriceRange[1]}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="flex-1 accent-yellow-400"
                />
                <input
                  type="range"
                  min={itemPriceRange[0]}
                  max={itemPriceRange[1]}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="flex-1 accent-yellow-400"
                />
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-yellow-500/20">
            <p className="text-white/80 text-sm sm:text-base">
              Showing <span className="font-bold text-yellow-400">{filteredAndSortedItems.length}</span> of{" "}
              <span className="font-bold text-yellow-400">{mappedItems.length}</span> dishes
              {isValidating && (
                <span className="ml-2 inline-flex items-center gap-1.5 text-yellow-300 text-xs sm:text-sm">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  Updating...
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <MenuGrid
        items={paginatedItems}
        currencyFmt={new Intl.NumberFormat(locale, { style: 'currency', currency })}
        dense={false}
        animateResults={isValidating}
        onItemClick={setSelectedItem}
        loading={loading && items.length === 0}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center items-center gap-2 animate-slide-up">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl sm:rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-500 hover:to-yellow-600 hover:text-black transition-all duration-300 border border-yellow-500/20 text-sm sm:text-base"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 text-sm sm:text-base ${
                    currentPage === pageNum
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-500/30"
                      : "bg-gradient-to-r from-gray-900 to-black text-white border border-yellow-500/20 hover:border-yellow-400"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-gray-900 to-black text-white rounded-xl sm:rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-500 hover:to-yellow-600 hover:text-black transition-all duration-300 border border-yellow-500/20 text-sm sm:text-base"
          >
            Next
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-gradient-to-br from-gray-900 to-black rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/20 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-black/80 hover:bg-yellow-500 text-white hover:text-black rounded-full flex items-center justify-center transition-all duration-300 shadow-lg"
                aria-label="Close modal"
              >
                <MdClose className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>

              {/* Image */}
              <div className="relative w-full aspect-video bg-black">
                <Image
                  src={selectedItem.image || '/images/fallback/no-image.png'}
                  alt={selectedItem.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-400 mb-4">
                  {selectedItem.name}
                </h2>

                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedItem.isVegetarian && (
                    <span className="px-3 py-1 bg-green-500/90 text-white rounded-full text-sm font-bold">
                      🌱 Vegetarian
                    </span>
                  )}
                  {selectedItem.isSpicy && (
                    <span className="px-3 py-1 bg-red-500/90 text-white rounded-full text-sm font-bold">
                      🌶️ Spicy
                    </span>
                  )}
                  {selectedItem.isBestSeller && (
                    <span className="px-3 py-1 bg-yellow-500/90 text-black rounded-full text-sm font-bold">
                      ⭐ Best Seller
                    </span>
                  )}
                  {selectedItem.isNew && (
                    <span className="px-3 py-1 bg-blue-500/90 text-white rounded-full text-sm font-bold">
                      🆕 New
                    </span>
                  )}
                  {selectedItem.isChefSpecial && (
                    <span className="px-3 py-1 bg-purple-500/90 text-white rounded-full text-sm font-bold">
                      👨‍🍳 Chef's Special
                    </span>
                  )}
                  {selectedItem.stockStatus && (
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      selectedItem.stockStatus === 'In Stock'
                        ? 'bg-green-500/90 text-white'
                        : 'bg-red-500/90 text-white'
                    }`}>
                      {selectedItem.stockStatus}
                    </span>
                  )}
                </div>

                <p className="text-white/90 text-lg leading-relaxed mb-6">
                  {selectedItem.description}
                </p>

                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-yellow-400 font-bold mb-2">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-yellow-600/80 text-yellow-50 rounded-full text-sm border border-yellow-500/40"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-yellow-500/20">
                  <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                    ₱{selectedItem.price}
                  </div>
                  <button className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-200 text-base sm:text-lg">
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {isOffline && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl border border-orange-300/50 animate-slide-up flex items-center gap-2 z-40">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-semibold">Offline Mode - Showing cached data</span>
        </div>
      )}
    </div>
  );
}

function slugify(s: string): string {
  return s.trim().replace(/\s+/g, "-");
}

export default memo(MenuPageLayout);
