import React, { useMemo } from "react";
import styles from "./FilterBar.module.css";

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₦1,000", min: 0, max: 1000 },
  { label: "₦1,000 - ₦5,000", min: 1000, max: 5000 },
  { label: "₦5,000 - ₦10,000", min: 5000, max: 10000 },
  { label: "₦10,000 - ₦50,000", min: 10000, max: 50000 },
  { label: "₦50,000+", min: 50000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Name: A → Z", value: "name_asc" },
  { label: "Name: Z → A", value: "name_desc" },
  { label: "In Stock First", value: "stock" },
];

const FilterBar = ({
  categories,
  category,
  setCategory,
  search,
  setSearch,
  showRxOnly,
  setShowRxOnly,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  showInStockOnly,
  setShowInStockOnly,
  brand,
  setBrand,
  brands,
  totalProducts,
  filteredCount,
}) => {
  // Active filter count for badge
  const activeFilters = useMemo(() => {
    let count = 0;
    if (category !== "All") count++;
    if (showRxOnly) count++;
    if (priceRange && priceRange !== "all") count++;
    if (sortBy) count++;
    if (showInStockOnly) count++;
    if (brand) count++;
    return count;
  }, [category, showRxOnly, priceRange, sortBy, showInStockOnly, brand]);

  const clearAllFilters = () => {
    setCategory("All");
    setShowRxOnly(false);
    setPriceRange("all");
    setSortBy("");
    setShowInStockOnly(false);
    setBrand("");
  };

  return (
    <div className={styles.wrapper}>
      {/* Search + Primary Controls */}
      <div className={styles.bar}>
        <div className={styles.searchWrap}>
          <input
            className={styles.search}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search medicines, brands, categories..."
          />
        </div>

        <div className={styles.controls}>
          <select
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">📋 All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label className={styles.rxToggle}>
            <input
              type="checkbox"
              checked={showRxOnly}
              onChange={(e) => setShowRxOnly(e.target.checked)}
            />
            <span>Rx only</span>
          </label>
        </div>
      </div>

      {/* Secondary Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Price</label>
          <select
            className={styles.filterSelect}
            value={priceRange || "all"}
            onChange={(e) => setPriceRange(e.target.value)}
          >
            <option value="all">All Prices</option>
            {PRICE_RANGES.slice(1).map((r) => (
              <option key={r.label} value={r.label}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Brand</label>
          <select
            className={styles.filterSelect}
            value={brand || ""}
            onChange={(e) => setBrand(e.target.value)}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Sort</label>
          <select
            className={styles.filterSelect}
            value={sortBy || ""}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterCheck}>
            <input
              type="checkbox"
              checked={showInStockOnly}
              onChange={(e) => setShowInStockOnly(e.target.checked)}
            />
            <span>✅ In Stock Only</span>
          </label>
        </div>

        {activeFilters > 0 && (
          <button className={styles.clearBtn} onClick={clearAllFilters}>
            ✕ Clear ({activeFilters})
          </button>
        )}
      </div>

      {/* Results count */}
      <div className={styles.resultsCount}>
        Showing <strong>{filteredCount}</strong> of {totalProducts} products
        {activeFilters > 0 && (
          <span className={styles.filterBadge}>
            {activeFilters} filter{activeFilters > 1 ? "s" : ""} active
          </span>
        )}
      </div>
    </div>
  );
};

export default FilterBar;

