import React, { useEffect, useMemo, useState, useCallback } from "react";
import styles from "./Shop.module.css";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/ProductCard/ProductCard";
import FilterBar from "../../components/FilterBar/FilterBar";
import { api } from "../../lib/api";

// Map of category -> emoji/icon for visual display
const CATEGORY_ICONS = {
  "Injections & Infusions": "💉",
  "Tablets & Capsules": "💊",
  "Syrups & Suspensions": "🧪",
  "Creams & Ointments": "🧴",
  "Eye, Ear & Nasal Drops": "👁️",
  "Oral Care": "🪥",
  "Contraceptives": "🛡️",
  "Vitamins & Supplements": "💪",
  "Pain Relief": "🤕",
  "Antibiotics & Anti-infectives": "🦠",
  "Medical Supplies": "🏥",
  "Diagnostic Tests": "🔬",
  "Food & Beverages": "🍽️",
  "Personal Care": "🧖",
  "Cough & Cold Syrups": "🤧",
  "Antacids & Digestive Health": "🏪",
  "Cardiovascular Health": "❤️",
  "Diabetes Care": "🩸",
  "Fertility & Sexual Health": "👶",
  "Antimalarials": "🦟",
  "Feminine Care": "👩",
  "Respiratory": "🫁",
  "First Aid": "🚑",
  "General Health": "🌟",
};

const ITEMS_PER_PAGE = 20;

const Shop = () => {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showRxOnly, setShowRxOnly] = useState(false);
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [brand, setBrand] = useState("");

  // Pagination
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.getProducts();
        if (!cancelled) setProducts(res.products || []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Extract all brands and categories from products
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(set).sort();
  }, [products]);

  // Price range helper
  const isInPriceRange = useCallback((price, range) => {
    if (range === "all") return true;
    const ranges = {
      "Under ₦1,000": () => price < 1000,
      "₦1,000 - ₦5,000": () => price >= 1000 && price <= 5000,
      "₦5,000 - ₦10,000": () => price > 5000 && price <= 10000,
      "₦10,000 - ₦50,000": () => price > 10000 && price <= 50000,
      "₦50,000+": () => price > 50000,
    };
    return ranges[range] ? ranges[range]() : true;
  }, []);

  // Apply all filters & sorting
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let result = products.filter((p) => {
      const matchesCategory =
        category === "All" ? true : p.category === category;
      const matchesRx = showRxOnly ? p.isRx === true : true;
      const matchesSearch =
        q.length === 0
          ? true
          : [p.name, p.brand, p.category, p.sku || ""].some((v) =>
              String(v).toLowerCase().includes(q)
            );
      const matchesPriceRange = isInPriceRange(p.price, priceRange);
      const matchesStock = showInStockOnly ? p.inStock : true;
      const matchesBrand = brand ? p.brand === brand : true;

      return (
        matchesCategory &&
        matchesRx &&
        matchesSearch &&
        matchesPriceRange &&
        matchesStock &&
        matchesBrand
      );
    });

    // Apply sorting
    if (sortBy) {
      switch (sortBy) {
        case "price_asc":
          result.sort((a, b) => a.price - b.price);
          break;
        case "price_desc":
          result.sort((a, b) => b.price - a.price);
          break;
        case "name_asc":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "name_desc":
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case "stock":
          result.sort((a, b) => (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0));
          break;
        default:
          break;
      }
    }

    return result;
  }, [products, search, category, showRxOnly, priceRange, sortBy, showInStockOnly, brand, isInPriceRange]);

  const visibleProducts = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filtered.length));
  };

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [search, category, showRxOnly, priceRange, sortBy, showInStockOnly, brand]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <div>
          <h1>Shop Medicines & Health Products</h1>
          <p>
            {loading
              ? "Loading product catalog..."
              : `${products.length} products across ${categories.length} categories`}
          </p>
        </div>
      </header>

      <div className={styles.container}>
        {/* Category Quick Links */}
        <div className={styles.categoryGrid}>
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryPill} ${
                category === cat ? styles.activeCat : ""
              }`}
              onClick={() => setCategory(cat === category ? "All" : cat)}
            >
              <span>{CATEGORY_ICONS[cat] || "📦"}</span>
              <span>{cat}</span>
              <span className={styles.pillCount}>
                {products.filter((p) => p.category === cat).length}
              </span>
            </button>
          ))}
          {categories.length > 8 && (
            <button
              className={`${styles.categoryPill} ${
                category === "All" ? styles.activeCat : ""
              }`}
              onClick={() => setCategory("All")}
            >
              <span>📋</span>
              <span>All ({products.length})</span>
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <FilterBar
          categories={categories}
          category={category}
          setCategory={setCategory}
          search={search}
          setSearch={setSearch}
          showRxOnly={showRxOnly}
          setShowRxOnly={setShowRxOnly}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showInStockOnly={showInStockOnly}
          setShowInStockOnly={setShowInStockOnly}
          brand={brand}
          setBrand={setBrand}
          brands={brands}
          totalProducts={products.length}
          filteredCount={filtered.length}
        />

        {/* Product Grid */}
        <div className={styles.grid}>
          {loading ? (
            <div className={styles.empty}>
              <div className={styles.spinner}></div>
              <p>Loading products...</p>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔍</span>
              <h3>No products match your filters</h3>
              <p>Try adjusting or clearing your filters</p>
              <button
                className={styles.resetBtn}
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setShowRxOnly(false);
                  setPriceRange("all");
                  setSortBy("");
                  setShowInStockOnly(false);
                  setBrand("");
                }}
              >
                ✕ Clear all filters
              </button>
            </div>
          ) : (
            <>
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
              {filtered.length > visibleCount && (
                <div className={styles.loadMoreWrap}>
                  <button className={styles.loadMore} onClick={handleLoadMore}>
                    Show More ({filtered.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Category Pages Section */}
      <section className={styles.catSection}>
        <div className={styles.container}>
          <h2 className={styles.catSectionTitle}>Browse by Category</h2>
          <div className={styles.browseGrid}>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat).length;
              const icon = CATEGORY_ICONS[cat] || "📦";
              const catSlug = cat
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              const imagePath = `/images/categories/${catSlug}.svg`;

              return (
                <div
                  key={cat}
                  className={styles.browseCard}
                  onClick={() => {
                    setCategory(cat);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <div className={styles.browseImage}>
                    <img
                      src={imagePath}
                      alt={cat}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <span className={styles.browseIcon}>{icon}</span>
                  </div>
                  <div className={styles.browseInfo}>
                    <h4>{cat}</h4>
                    <span className={styles.browseCount}>{count} products</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Shop;

