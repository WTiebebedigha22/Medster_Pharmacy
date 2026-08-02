import React, { useMemo } from "react";
import styles from "./FilterBar.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBoxOpen,
  faCheckCircle,
  faTimes,
  faFilter,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

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
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Name: A to Z", value: "name_asc" },
  { label: "Name: Z to A", value: "name_desc" },
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
  categoryIcons = {},
  categoryCounts = {},
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

  const countFor = (cat) =>
    cat === "All" ? totalProducts : categoryCounts[cat] || 0;

  return (
    <div className={styles.sidebar}>
      {/* Search */}
      <div className={styles.searchWrap}>
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
        <input
          className={styles.search}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search medicines..."
        />
      </div>

      {/* Categories */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>
          <FontAwesomeIcon icon={faFilter} />
          Categories
        </h4>
        <div className={styles.catList}>
          <button
            className={`${styles.catItem} ${category === "All" ? styles.activeCat : ""}`}
            onClick={() => setCategory("All")}
          >
            <FontAwesomeIcon icon={faBoxOpen} className={styles.catIcon} />
            <span className={styles.catName}>All Products</span>
            <span className={styles.catCount}>{totalProducts}</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.catItem} ${category === cat ? styles.activeCat : ""}`}
              onClick={() => setCategory(cat === category ? "All" : cat)}
            >
              <FontAwesomeIcon icon={categoryIcons[cat] || faBoxOpen} className={styles.catIcon} />
              <span className={styles.catName}>{cat}</span>
              <span className={styles.catCount}>{countFor(cat)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Price</h4>
        <div className={styles.radioList}>
          {PRICE_RANGES.map((r) => (
            <label key={r.label} className={styles.radioItem}>
              <input
                type="radio"
                name="price"
                checked={(priceRange || "all") === (r.label === "All Prices" ? "all" : r.label)}
                onChange={() => setPriceRange(r.label === "All Prices" ? "all" : r.label)}
              />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Brand</h4>
        <label className={styles.selectWrap}>
          <select
            className={styles.select}
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
          <FontAwesomeIcon icon={faChevronDown} className={styles.selectChevron} />
        </label>
      </div>

      {/* Sort */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Sort By</h4>
        <label className={styles.selectWrap}>
          <select
            className={styles.select}
            value={sortBy || ""}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <FontAwesomeIcon icon={faChevronDown} className={styles.selectChevron} />
        </label>
      </div>

      {/* Availability */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Availability</h4>
        <div className={styles.checkList}>
          <label className={styles.checkItem}>
            <input
              type="checkbox"
              checked={showInStockOnly}
              onChange={(e) => setShowInStockOnly(e.target.checked)}
            />
            <FontAwesomeIcon icon={faCheckCircle} />
            <span>In Stock Only</span>
          </label>
          <label className={styles.checkItem}>
            <input
              type="checkbox"
              checked={showRxOnly}
              onChange={(e) => setShowRxOnly(e.target.checked)}
            />
            <span>Prescription only (Rx)</span>
          </label>
        </div>
      </div>

      {/* Active filter count + clear */}
      {activeFilters > 0 && (
        <div className={styles.activeRow}>
          <span className={styles.activeBadge}>
            {activeFilters} filter{activeFilters > 1 ? "s" : ""} active
          </span>
          <button className={styles.clearBtn} onClick={clearAllFilters}>
            <FontAwesomeIcon icon={faTimes} /> Clear all
          </button>
        </div>
      )}

      {/* Results count */}
      <div className={styles.resultsCount}>
        Showing <strong>{filteredCount}</strong> of {totalProducts} products
      </div>
    </div>
  );
};

export default FilterBar;

