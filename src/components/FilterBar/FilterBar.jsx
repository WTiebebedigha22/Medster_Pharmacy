import React from "react";
import styles from "./FilterBar.module.css";

const FilterBar = ({
  categories,
  category,
  setCategory,
  search,
  setSearch,
  showRxOnly,
  setShowRxOnly,
}) => {
  return (
    <div className={styles.bar}>
      <div className={styles.searchWrap}>
        <input
          className={styles.search}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search medicines, brands, categories..."
        />
      </div>

      <div className={styles.controls}>
        <select
          className={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All categories</option>
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
  );
};

export default FilterBar;

