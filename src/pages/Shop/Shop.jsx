import React, { useEffect, useMemo, useState } from "react";
import styles from "./Shop.module.css";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/ProductCard/ProductCard";
import FilterBar from "../../components/FilterBar/FilterBar";
import { api } from "../../lib/api";

const Shop = () => {
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showRxOnly, setShowRxOnly] = useState(false);

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

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean));
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchesCategory = category === "All" ? true : p.category === category;
      const matchesRx = showRxOnly ? p.isRx === true : true;
      const matchesSearch =
        q.length === 0
          ? true
          : [p.name, p.brand, p.category].some((v) =>
              String(v).toLowerCase().includes(q)
            );

      return matchesCategory && matchesRx && matchesSearch;
    });
  }, [products, search, category, showRxOnly]);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <h1>Shop Medicines & Health Products</h1>
          <p>Order essentials from our pharmacy catalog.</p>
        </div>
      </header>

      <div className={styles.container}>
        <FilterBar
          categories={categories}
          category={category}
          setCategory={setCategory}
          search={search}
          setSearch={setSearch}
          showRxOnly={showRxOnly}
          setShowRxOnly={setShowRxOnly}
        />

        <div className={styles.grid}>
          {loading ? (
            <div className={styles.empty}>Loading products…</div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>No products match your filters.</div>
          ) : (
            filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;


