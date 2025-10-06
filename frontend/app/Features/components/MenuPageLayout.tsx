"use client";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { MdClose, MdSearch } from "react-icons/md";

interface MenuItem {
  name: string;
  price: number;
  image: string;
  description: string;
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
}

export default function MenuPageLayout({
  title,
  description,
  items,
  sections,
  bottomSection,
  locale = "en-PH",
  currency = "PHP",
  loading = false,
  error = null,
}: MenuPageLayoutProps) {
  const currencyFmt = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency }),
    [locale, currency]
  );

  // ---------- Data model (sections or single list) ----------
  const sectionList = useMemo(() => {
    if (sections?.length) return sections;
    return [{ title: "All Items", items }];
  }, [sections, items]);

  // Derive all unique tags for quick filtering
  const allTags = useMemo(() => {
    const set = new Set<string>();
    sectionList.forEach((s) =>
      s.items.forEach((it) => it.tags?.forEach((t) => set.add(t)))
    );
    return Array.from(set).sort();
  }, [sectionList]);

  // ---------- UI state ----------
  const [activeSection, setActiveSection] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<
    "featured" | "priceAsc" | "priceDesc" | "alpha"
  >("featured");
  const [dense, setDense] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    const q = query.trim().toLowerCase();

    let res = base.filter((it) => {
      const inText =
        !q ||
        it.name.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q);
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
  }, [sectionList, activeSection, query, selectedTags, sortKey]);

  // ---------- Handlers ----------
  const toggleTag = (tag: string) =>
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  // ---------- Render ----------
  const totalCount = useMemo(
    () => sectionList.reduce((sum, s) => sum + (s.items?.length || 0), 0),
    [sectionList]
  );

  if (loading) {
    return (
      <main className="min-h-screen lg:ml-64 flex items-center justify-center bg-primary-yellow">
        <div className="text-center text-gray-500 py-12">Loading menu...</div>
      </main>
    );
  }
  if (error) {
    return (
      <main className="min-h-screen lg:ml-64 flex items-center justify-center bg-primary-yellow">
        <div className="text-center text-red-500 py-12">{error}</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen lg:ml-64">
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
      <div className="sticky top-0 z-30 px-4 sm:px-6 lg:px-8 pb-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-md border border-yellow-900/20 rounded-2xl shadow-xl p-3 sm:p-4">
            {/* Search Bar - Full Width */}
            <div className="mb-3">
              <label className="relative w-full flex items-center group">
                <span className="sr-only">Search menu</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
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
                    setSortKey(
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
}

// ---------- Subcomponents ----------
function MenuGrid({
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
        grid gap-4 sm:gap-6 lg:gap-8
        grid-cols-1 
        xs:grid-cols-2 
        sm:grid-cols-2 
        md:grid-cols-3 
        lg:grid-cols-4 
        xl:grid-cols-5 
        2xl:grid-cols-6
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
}

function MenuCard({
  item,
  index,
  currencyFmt,
}: {
  item: MenuItem;
  index: number;
  currencyFmt: Intl.NumberFormat;
}) {
  const [loaded, setLoaded] = useState(false);
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
      {/* Image - Consistent aspect ratio */}
      <div className="relative overflow-hidden aspect-[4/3] bg-black/5 text-white flex-shrink-0">
        {!loaded && (
          <div
            className="absolute inset-0 animate-pulse bg-black/5"
            aria-hidden
          />
        )}
        <Image
          src={item.image}
          alt={`${item.name}. ${item.description}`}
          fill
          sizes="(max-width: 475px) 100vw, (max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          priority={index < 8}
          onLoad={() => setLoaded(true)}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-16 sm:h-20 md:h-24 bg-gradient-to-t from-black/60 via-black/0 to-transparent pointer-events-none"
          aria-hidden
        />

        {/* Price Badge */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <div
            className="rounded-full bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-semibold shadow border border-black/10 text-white"
            aria-label={`Price ${price}`}
          >
            {price}
          </div>
        </div>
      </div>

      {/* Content - Flexible height */}
      <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col gap-2 sm:gap-3 flex-grow">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <h3 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl text-white leading-tight flex-grow">
            <span className="line-clamp-2">{item.name}</span>
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-white/70 leading-relaxed line-clamp-3 flex-grow">
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
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
