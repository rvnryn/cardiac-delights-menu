"use client";
import {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  memo,
} from "react";
import Image from "next/image";
import { MdClose, MdSearch } from "react-icons/md";

interface MenuItem {
  name: string;
  price: number;
  image: string;
  description: string;
  stockStatus?: string;
  tags?: string[];
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

export default memo(function MenuPageLayout({
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
  // ---------- UI state ----------
  const [activeSection, setActiveSection] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<
    "featured" | "priceAsc" | "priceDesc" | "alpha"
  >("featured");
  const [dense, setDense] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Debounce search query for better performance
  const debouncedQuery = useDebounce(query, 300);

  // Memoize currency formatter to prevent recreation
  const currencyFmt = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency }),
    [locale, currency]
  );

  // ---------- Data model (sections or single list) ----------
  const sectionList = useMemo(() => {
    if (sections?.length) return sections;
    return [{ title: "All Items", items }];
  }, [sections, items]);

  // Derive all unique tags for quick filtering - only when items change
  const allTags = useMemo(() => {
    const set = new Set<string>();
    sectionList.forEach((s) =>
      s.items.forEach((it) => it.tags?.forEach((t) => set.add(t)))
    );
    return Array.from(set).sort();
  }, [sectionList]);

  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync with hash (deep-linking to sections)
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace("#", ""));
    if (!hash) return;
    const idx = sectionList.findIndex((s) => slugify(s.title) === hash);
    if (idx >= 0) setActiveSection(idx);
  }, [sectionList]);

  useEffect(() => {
    const nextHash = slugify(sectionList[activeSection]?.title || "");
    if (!nextHash) return;
    history.replaceState(null, "", `#${encodeURIComponent(nextHash)}`);
  }, [activeSection, sectionList]);

  // ---------- Filtering + sorting ----------
  const filteredItems = useMemo(() => {
    const base = sectionList[activeSection]?.items || [];
    const q = debouncedQuery.trim().toLowerCase();

    let res = base.filter((it) => {
      const inText =
        !q ||
        it.name.toLowerCase().includes(q) ||
        it.description?.toLowerCase().includes(q);
      const hasTags =
        selectedTags.length === 0 ||
        selectedTags.every((t) => it.tags?.includes(t));
      return inText && hasTags;
    });

    switch (sortKey) {
      case "priceAsc":
        res = [...res].sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        res = [...res].sort((a, b) => b.price - a.price);
        break;
      case "alpha":
        res = [...res].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // "featured" – leave original order
        break;
    }

    return res;
  }, [sectionList, activeSection, debouncedQuery, selectedTags, sortKey]);

  // ---------- Handlers ----------
  const toggleTag = useCallback(
    (tag: string) =>
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      ),
    []
  );

  // Memoized section change handler
  const handleSectionChange = useCallback((index: number) => {
    setActiveSection(index);
  }, []);

  // Memoized filter handlers
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleSortChange = useCallback(
    (value: "featured" | "priceAsc" | "priceDesc" | "alpha") => {
      setSortKey(value);
    },
    []
  );

  // ---------- Render ----------
  // Memoize total count calculation
  const totalCount = useMemo(
    () => sectionList.reduce((sum, s) => sum + (s.items?.length || 0), 0),
    [sectionList]
  );

  if (loading) {
    return (
      <div className="min-h-screen lg:ml-64 pt-20 lg:pt-0 flex items-center justify-center">
        <div className="bg-black/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-yellow-200/50 max-w-md w-full mx-auto">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                <svg
                  className="animate-spin h-8 w-8 text-white"
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
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full blur opacity-30 animate-pulse"></div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white">Loading Menu</h3>
              <div className="space-y-2">
                <p className="text-white font-medium">
                  {items.length > 0
                    ? "Updating menu..."
                    : "Fetching the latest dishes"}
                </p>
                <p className="text-sm text-white">
                  {items.length > 0
                    ? "Showing cached items"
                    : "Please wait a moment..."}
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full animate-pulse transition-all duration-300"></div>
            </div>

            {/* Show item count if we have cached data */}
            {items.length > 0 && (
              <p className="text-sm text-yellow-200">
                {items.length} items available
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen lg:ml-64 flex items-center justify-center">
        <div className="bg-black/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-red-200/50 max-w-md w-full mx-auto">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <svg
                  className="h-8 w-8 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full blur opacity-30"></div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white">
                Something Went Wrong
              </h3>
              <div className="space-y-2">
                <p className="text-white font-medium">Unable to load menu</p>
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-200 shadow-lg"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
              <button
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200 shadow-lg"
                onClick={() => window.history.back()}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen lg:ml-64 pt-20 lg:pt-0">
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-orange-500 text-white px-4 py-3 text-center text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>📱 Offline Mode - Showing your saved menu items</span>
            <button
              onClick={() => window.location.reload()}
              className="ml-3 px-3 py-1 bg-white text-orange-500 rounded-md text-xs font-semibold hover:bg-gray-100 transition-colors"
            >
              Reconnect
            </button>
          </div>
        </div>
      )}
      {/* Update Indicator */}
      {isValidating && !loading && (
        <div className="bg-blue-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            <span>🔄 Updating menu...</span>
          </div>
        </div>
      )}{" "}
      {/* Page Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 sm:mb-6 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight mb-3 sm:mb-4 drop-shadow-lg text-black">
              {title}
            </h1>
            <div className="flex justify-center mb-3 sm:mb-4" aria-hidden>
              <div className="w-24 sm:w-32 md:w-40 lg:w-48 h-1 rounded-full bg-black shadow-[0_0_15px_rgba(234,179,8,0.8)]"></div>
            </div>
            <p className="text-lg sm:text-xl md:text-2xl text-black/90 max-w-4xl mx-auto leading-relaxed px-4">
              {description}
            </p>
          </div>
        </div>
      </header>
      {/* Sticky Toolbar - Mobile First Design */}
      <div className="top-0 z-30 px-4 sm:px-6 lg:px-8 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-md border border-yellow-900/20 rounded-2xl shadow-xl p-3 sm:p-4">
            {/* Search Bar - Full Width */}
            <div className="mb-3">
              <label className="relative w-full flex items-center group">
                <span className="sr-only">Search menu</span>
                <input
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  placeholder="Search dishes…"
                  className="w-full rounded-xl bg-white/95 px-4 sm:px-5 py-3 pr-12 sm:pr-14 text-base text-black shadow-inner border border-yellow-900/10 focus:ring-2 focus:ring-yellow-500 transition"
                  aria-label="Search menu"
                  autoComplete="off"
                />
                <span className="absolute right-3 sm:right-4 flex items-center">
                  <MdSearch className="text-xl text-yellow-900" />
                </span>
              </label>
            </div>

            {/* Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <label className="relative flex-1 sm:max-w-xs">
                <span className="sr-only">Sort</span>
                <select
                  value={sortKey}
                  onChange={(e) =>
                    handleSortChange(
                      e.target.value as
                        | "featured"
                        | "priceAsc"
                        | "priceDesc"
                        | "alpha"
                    )
                  }
                  className="w-full text-yellow-900 rounded-xl bg-white/95 px-3 sm:px-4 py-2.5 text-sm sm:text-base border border-yellow-900/10 shadow-sm focus:ring-2 focus:ring-yellow-500 transition"
                >
                  <option value="featured">Featured</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                  <option value="alpha">Alphabetical</option>
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <section
        className="px-4 sm:px-6 lg:px-8 pt-4 pb-8"
        aria-live="polite"
        aria-busy={false}
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="sr-only">{sectionList[activeSection]?.title}</h2>
          <MenuGrid
            items={filteredItems}
            currencyFmt={currencyFmt}
            dense={dense}
          />
        </div>
      </section>
      {/* Bottom Section */}
      <footer className="px-4 sm:px-6 lg:px-8 pb-16 mt-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center animate-fade-in">
            <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm rounded-2xl p-6 sm:p-8 flex flex-col items-center shadow-lg">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                {bottomSection.title}
              </h3>
              <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-6 max-w-2xl">
                {bottomSection.description}
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {bottomSection.badges.map((badge, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-br from-yellow-500/95 to-yellow-600/95 text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow border border-white/10"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
});

// ---------- Subcomponents ----------
const MenuGrid = memo(function MenuGrid({
  items,
  currencyFmt,
  dense,
}: {
  items: MenuItem[];
  currencyFmt: Intl.NumberFormat;
  dense: boolean;
}) {
  if (!items.length) {
    return (
      <div className="flex items-center justify-center py-16 sm:py-20 lg:py-24">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-lg sm:text-xl font-semibold text-black mb-2">
            No matching items
          </p>
          <p className="text-black/70 text-sm sm:text-base">
            Try clearing filters or using a different search term.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul
      className="
        grid gap-2 sm:gap-4 lg:gap-6
        grid-cols-2 
        xs:grid-cols-2 
        sm:grid-cols-3 
        md:grid-cols-3 
        lg:grid-cols-3 
        xl:grid-cols-3 
        2xl:grid-cols-3
      "
      role="list"
    >
      {items.map((item, index) => (
        <li key={`${item.name}-${index}`}>
          <MenuCard item={item} index={index} currencyFmt={currencyFmt} />
        </li>
      ))}
    </ul>
  );
});

// Memoized MenuCard component for better performance
const MenuCard = memo(function MenuCard({
  item,
  index,
  currencyFmt,
}: {
  item: MenuItem;
  index: number;
  currencyFmt: Intl.NumberFormat;
}) {
  const [loaded, setLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const price = currencyFmt.format(item.price).replace("PHP", "₱");
  const cardRef = useRef<HTMLDivElement | null>(null);

  return (
    <article
      ref={cardRef}
      className="
        group bg-gradient-to-br from-gray-900/95 to-black/95 
        rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg ring-1 ring-black/5 
        transition-all duration-300 focus-within:ring-2 focus-within:ring-black/20 
        hover:shadow-2xl hover:-translate-y-1
        h-full flex flex-col
      "
      tabIndex={-1}
      aria-label={item.name}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Image - Responsive aspect ratio */}
      <div className="relative overflow-hidden aspect-[5/3] sm:aspect-[4/3] md:aspect-[4/3] lg:aspect-[7/4] bg-black/5 text-white flex-shrink-0">
        {!loaded && (
          <div
            className="absolute inset-0 animate-pulse bg-black/5"
            aria-hidden
          />
        )}
        {!imageError ? (
          <Image
            src={item.image}
            alt={`${item.name}. ${item.description}`}
            fill
            sizes="(max-width: 475px) 100vw, (max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            priority={index < 8}
            onLoad={() => setLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          // Fallback when image fails to load
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center text-white/70">
              <svg
                className="w-12 h-12 mx-auto mb-2 opacity-50"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-xs font-medium">{item.name}</p>
            </div>
          </div>
        )}
        <div
          className="absolute inset-x-0 bottom-0 h-12 sm:h-16 md:h-20 lg:h-24 bg-gradient-to-t from-black/60 via-black/0 to-transparent pointer-events-none"
          aria-hidden
        />

        {/* Price Badge */}
        <div className="absolute top-1.5 sm:top-2 md:top-3 right-1.5 sm:right-2 md:right-3">
          <div
            className="rounded-full bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur px-1.5 sm:px-2 md:px-3 py-1 sm:py-1 md:py-1.5 text-xs sm:text-sm font-semibold shadow border border-black/10 text-white"
            aria-label={`Price ${price}`}
          >
            {price}
          </div>
        </div>

        {/* Stock Status Badge */}
        {item.stockStatus && (
          <div className="absolute top-1.5 sm:top-2 md:top-3 left-1.5 sm:left-2 md:left-3">
            <div
              className={`rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium shadow border backdrop-blur transition-all duration-200 ${
                item.stockStatus === "Available" ||
                item.stockStatus === "in_stock"
                  ? "bg-green-500/90 text-white border-green-400/20"
                  : item.stockStatus === "Low Stock" ||
                    item.stockStatus === "low_stock"
                  ? "bg-yellow-500/90 text-black border-yellow-400/20"
                  : "bg-red-500/90 text-white border-red-400/20"
              }`}
              aria-label={`Stock status: ${item.stockStatus}`}
            >
              <span className="flex items-center gap-0.5">
                <span className="text-xs">
                  {item.stockStatus === "Available" ||
                  item.stockStatus === "in_stock"
                    ? "✓"
                    : item.stockStatus === "Low Stock" ||
                      item.stockStatus === "low_stock"
                    ? "⚠"
                    : "✗"}
                </span>
                <span className="hidden md:inline text-xs">
                  {item.stockStatus === "Available" ||
                  item.stockStatus === "in_stock"
                    ? "Available"
                    : item.stockStatus === "Low Stock" ||
                      item.stockStatus === "low_stock"
                    ? "Low"
                    : "Out"}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content - Flexible height */}
      <div className="p-2 sm:p-3 md:p-4 lg:p-5 flex flex-col gap-1 sm:gap-2 md:gap-3 flex-grow">
        <div className="flex items-start justify-between gap-1 sm:gap-2">
          <h3 className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-white leading-tight flex-grow">
            <span className="line-clamp-2">{item.name}</span>
          </h3>
        </div>
        <p className="text-xs sm:text-xs md:text-sm lg:text-sm text-white/70 leading-relaxed line-clamp-2 lg:line-clamp-3 flex-grow">
          {item.description}
        </p>

        {/* Tags */}
        {item.tags?.length ? (
          <ul
            className="mt-auto flex flex-wrap gap-1 sm:gap-2"
            aria-label="Item attributes"
          >
            {item.tags.slice(0, 3).map((t) => (
              <li
                key={t}
                className="text-xs rounded-full bg-black/5 text-white/70 px-2 py-1 border border-black/10"
              >
                {t}
              </li>
            ))}
            {item.tags.length > 3 && (
              <li className="text-xs text-white/50">+{item.tags.length - 3}</li>
            )}
          </ul>
        ) : null}
      </div>
    </article>
  );
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
