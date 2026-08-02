import React, { useEffect, useMemo, useState, useCallback } from "react";
import styles from "./Shop.module.css";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/ProductCard/ProductCard";
import FilterBar from "../../components/FilterBar/FilterBar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSyringe,
  faPills,
  faPrescriptionBottle,
  faJar,
  faEye,
  faTooth,
  faPersonDotsFromLine,
  faDumbbell,
  faTablets,
  faBacteria,
  faBriefcaseMedical,
  faMicroscope,
  faUtensils,
  faPersonRays,
  faLungs,
  faSpoon,
  faHeartPulse,
  faDroplet,
  faBaby,
  faStar,
  faBandAid,
  faPersonDress,
  faBoxOpen,
  faSearch,
  faTimes,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { api } from "../../lib/api";

// Map of category -> FontAwesome icon for visual display
const CATEGORY_ICONS = {
  "Injections & Infusions": faSyringe,
  "Tablets & Capsules": faPills,
  "Syrups & Suspensions": faPrescriptionBottle,
  "Creams & Ointments": faJar,
  "Eye, Ear & Nasal Drops": faEye,
  "Oral Care": faTooth,
  "Contraceptives": faPersonDotsFromLine,
  "Vitamins & Supplements": faDumbbell,
  "Pain Relief": faTablets,
  "Antibiotics & Anti-infectives": faBacteria,
  "Medical Supplies": faBriefcaseMedical,
  "Diagnostic Tests": faMicroscope,
  "Food & Beverages": faUtensils,
  "Personal Care": faPersonRays,
  "Cough & Cold Syrups": faLungs,
  "Antacids & Digestive Health": faSpoon,
  "Cardiovascular Health": faHeartPulse,
  "Diabetes Care": faDroplet,
  "Fertility & Sexual Health": faBaby,
  "Antimalarials": faBacteria,
  "Feminine Care": faPersonDress,
  "Respiratory": faLungs,
  "First Aid": faBandAid,
  "General Health": faStar,
};

const ITEMS_PER_PAGE = 12;

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
  const [currentPage, setCurrentPage] = useState(1);

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

  // Accurate per-category product counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      if (p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    });
    return counts;
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  // Clamp current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, showRxOnly, priceRange, sortBy, showInStockOnly, brand]);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Build pagination page list with ellipsis
  const pageList = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    const sorted = Array.from(pages)
      .filter((p) => p >= 1 && p <= totalPages)
      .sort((a, b) => a - b);
    const withGaps = [];
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) {
        withGaps.push("…");
      }
      withGaps.push(p);
    });
    return withGaps;
  }, [currentPage, totalPages]);

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
        <div className={styles.shopLayout}>
          {/* Sidebar — Categories & Filters */}
          <aside className={styles.sidebar}>
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
              categoryIcons={CATEGORY_ICONS}
              categoryCounts={categoryCounts}
            />
          </aside>

          {/* Content — Toolbar + Grid + Pagination */}
          <div className={styles.content}>
            {/* Results toolbar */}
            {!loading && (
              <div className={styles.toolbar}>
                <div className={styles.resultsInfo}>
                  {filtered.length === 0 ? (
                    <strong>No results</strong>
                  ) : (
                    <>
                      Showing{" "}
                      <strong>
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                        {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                      </strong>{" "}
                      of <strong>{filtered.length}</strong> products
                    </>
                  )}
                  {category !== "All" && (
                    <span className={styles.toolbarCat}>{category}</span>
                  )}
                </div>
                <div className={styles.toolbarSort}>
                  <label htmlFor="sortSelect">Sort:</label>
                  <select
                    id="sortSelect"
                    value={sortBy || ""}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="">Default</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                    <option value="stock">In Stock First</option>
                  </select>
                </div>
              </div>
            )}

            {/* Product Grid */}
            <div className={styles.grid}>
              {loading ? (
                <div className={styles.empty}>
                  <div className={styles.spinner}></div>
                  <p>Loading products...</p>
                </div>
              ) : visibleProducts.length === 0 ? (
                <div className={styles.empty}>
                  <FontAwesomeIcon icon={faSearch} className={styles.emptyIcon} />
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
                    <FontAwesomeIcon icon={faTimes} /> Clear all filters
                  </button>
                </div>
              ) : (
                visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {!loading && filtered.length > ITEMS_PER_PAGE && (
              <nav className={styles.pagination} aria-label="Product pages">
                <button
                  className={styles.pageBtn}
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                {pageList.map((p, idx) =>
                  p === "…" ? (
                    <span key={`gap-${idx}`} className={styles.pageGap}>
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={`${styles.pageBtn} ${
                        p === currentPage ? styles.pageActive : ""
                      }`}
                      onClick={() => goToPage(p)}
                      aria-current={p === currentPage ? "page" : undefined}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  className={styles.pageBtn}
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Category Pages Section */}
      <section className={styles.catSection}>
        <div className={styles.container}>
          <h2 className={styles.catSectionTitle}>Browse by Category</h2>
          <div className={styles.browseGrid}>
            {categories.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const icon = CATEGORY_ICONS[cat] || faBoxOpen;
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
                    <span className={styles.browseIcon}>
                      <FontAwesomeIcon icon={icon} />
                    </span>
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

