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
      <header className="py-fluid-lg lg:py-fluid-xl">
        <div className="container-fluid">
          <div className="text-center mb-fluid-xl animate-fade-in">
            <h1 className="text-fluid-4xl md:text-fluid-5xl lg:text-fluid-6xl font-extrabold leading-tight mb-fluid-md drop-shadow-lg text-black">
              {title}
            </h1>
            <div className="flex justify-center mb-fluid-md" aria-hidden>
              <div className="w-[50%] h-1 rounded-full bg-black shadow-[0_0_15px_rgba(234,179,8,0.8)]"></div>
            </div>
            <p className="text-fluid-lg md:text-fluid-xl text-black/90 max-w-3xl mx-auto leading-relaxed mb-fluid-md">
              {description}
            </p>
          </div>
        </div>
      </header>
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-30 flex justify-center px-2"></div>
      <div className="w-full py-4 flex flex-col gap-4 mt-8 md:flex-row md:items-center md:justify-between px-6 bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md border-y border-yellow-900/20 rounded-2xl shadow-xl ring-1 ring-yellow-900/10">
        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto items-center">
          {/* Search */}
          <label className="relative col-span-2 w-5xl flex items-center group">
            <span className="sr-only">Search menu</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes…"
              className="text-black w-full rounded-xl bg-white/95 px-5 py-2.5 pr-14 text-base shadow-inner border border-yellow-900/10 focus:ring-2 focus:ring-yellow-500 transition"
              aria-label="Search menu"
              autoComplete="off"
            />
            <span className="absolute right-4 flex items-center gap-1">
              <span className="text-xl text-yellow-900">
                <MdSearch />
              </span>
            </span>
          </label>

          {/* Sort & Density */}
          <div className="flex items-center w-sm justify-between gap-2 sm:justify-end">
            <label className="relative">
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
                className="text-yellow-900 rounded-xl bg-white/95 px-4 py-2 text-base border border-yellow-900/10 shadow-sm focus:ring-2 focus:ring-yellow-500 transition"
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

      {/* Content */}
      <section
        className="container-fluid py-8"
        aria-live="polite"
        aria-busy={false}
      >
        <h2 className="sr-only">{sectionList[activeSection]?.title}</h2>
        <MenuGrid
          items={filteredItems}
          currencyFmt={currencyFmt}
          dense={dense}
        />
      </section>

      {/* Bottom Section */}
      <footer className="w-full pb-16 mt-12 flex justify-center">
        <div className="text-center animate-fade-in w-full max-w-2xl px-2">
          <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-4">
              {bottomSection.title}
            </h3>
            <p className="text-base text-white/80 leading-relaxed mb-6">
              {bottomSection.description}
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {bottomSection.badges.map((badge, index) => (
                <span
                  key={index}
                  className="bg-gradient-to-br from-yellow-500/95 to-yellow-600/95 text-black px-4 py-2 rounded-full text-sm font-medium shadow border border-white/10"
                >
                  {badge}
                </span>
              ))}
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
      <div className="grid place-items-center py-20 text-center">
        <div className="max-w-md">
          <p className="text-lg font-semibold text-black">No matching items</p>
          <p className="text-black/70 text-sm">
            Try clearing filters or using a different search term.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul
      className={`grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 px-2 md:px-0 ${
        dense ? "sm:grid-cols-3 xl:grid-cols-5 gap-3" : ""
      }`}
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
    // ...existing code...
    <article
      ref={cardRef}
      className="group bg-gradient-to-br from-gray-900/95 to-black/95 rounded-3xl overflow-hidden shadow-lg ring-1 ring-black/5 transition-all duration-300 focus-within:ring-2 focus-within:ring-black/20 supports-[prefers-reduced-motion:no-preference]:hover:shadow-2xl supports-[prefers-reduced-motion:no-preference]:hover:-translate-y-0.5"
      tabIndex={-1}
      aria-label={item.name}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-black/5 text-white">
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
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-500 supports-[prefers-reduced-motion:no-preference]:group-hover:scale-105"
          priority={index < 4}
          onLoadingComplete={() => setLoaded(true)}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/0 to-transparent pointer-events-none"
          aria-hidden
        />

        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <div
            className="rounded-full bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur px-3 py-1.5 text-sm font-semibold shadow border border-black/10"
            aria-label={`Price ${price}`}
          >
            {price}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 md:p-6 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-lg md:text-xl text-white leading-tight">
            <span className="line-clamp-2">{item.name}</span>
          </h3>
        </div>
        <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
          {item.description}
        </p>

        {/* Tags */}
        {item.tags?.length ? (
          <ul
            className="mt-1 flex flex-wrap gap-2"
            aria-label="Item attributes"
          >
            {item.tags.map((t) => (
              <li
                key={t}
                className="text-xs rounded-full bg-black/5 text-white
                /70 px-2 py-1 border border-black/10"
              >
                {t}
              </li>
            ))}
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
