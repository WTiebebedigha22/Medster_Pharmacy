import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./ProductPage.module.css";
import { useCart } from "../../context/CartContext";
import { api } from "../../lib/api";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  const [products, setProducts] = useState([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.getProducts();
        if (!cancelled) setProducts(res.products || []);
      } catch {
        if (!cancelled) setProducts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);

  if (!product) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <h1>Product not found</h1>
          <button className={styles.btn} onClick={() => navigate("/shop")}>
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    navigate("/cart");
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.gallery}>
          <img className={styles.image} src={product.image} alt={product.name} />
        </div>

        <div className={styles.details}>
          <div className={styles.badges}>
            <span className={styles.category}>{product.category}</span>
            {product.isRx && <span className={styles.rx}>Rx</span>}
          </div>

          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.brand}>Brand: {product.brand}</p>
          <p className={styles.desc}>{product.description}</p>

          <div className={styles.priceRow}>
            <span className={styles.price}>
              ₦{Number(product.price).toLocaleString()}
            </span>
          </div>

          <div className={styles.qtyRow}>
            <button
              className={styles.qtyBtn}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className={styles.qty}>{qty}</span>
            <button
              className={styles.qtyBtn}
              onClick={() => setQty((q) => q + 1)}
            >
              +
            </button>
          </div>

          <button className={styles.addBtn} onClick={handleAdd}>
            Add to Cart
          </button>

          <div className={styles.note}>
            {product.isRx
              ? "Rx products may require prescription verification."
              : "Non-Rx products available for immediate order."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;


