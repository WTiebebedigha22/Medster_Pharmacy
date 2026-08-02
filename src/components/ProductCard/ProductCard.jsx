import React from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import styles from "./ProductCard.module.css";

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();

  const { name, price, oldPrice, image, category, isRx, inStock, brand, quantity } = product;

  // Format Naira price
  const formatPrice = (val) => `₦${Number(val).toLocaleString()}`;

  // Calculate discount percentage
  const discountPercent =
    oldPrice && price < oldPrice
      ? Math.round(((oldPrice - price) / oldPrice) * 100)
      : 0;

  // Truncate long names
  const displayName = name?.length > 50 ? name.slice(0, 50) + "…" : name;

  return (
    <div className={styles.card}>
      {/* Badges */}
      <div className={styles.badges}>
        {isRx && <span className={styles.rxBadge}>Rx</span>}
        {discountPercent > 0 && (
          <span className={styles.saleBadge}>-{discountPercent}%</span>
        )}
        {!inStock && <span className={styles.oosBadge}>Out of Stock</span>}
      </div>

      {/* Image */}
      <button
        className={styles.imageBtn}
        onClick={() => navigate(`/product/${product.id}`)}
        aria-label={`View ${name}`}
      >
        <img
          className={styles.image}
          src={image}
          alt={name}
          onError={(e) => {
            e.target.src = "/images/placeholder.svg";
          }}
        />
      </button>

      <div className={styles.body}>
        {/* Meta row */}
        <div className={styles.meta}>
          <span className={styles.category}>{category}</span>
          {brand && <span className={styles.brand}>{brand}</span>}
        </div>

        {/* Name */}
        <h3 className={styles.name}>{displayName}</h3>

        {/* Price */}
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(price)}</span>
          {oldPrice && price < oldPrice && (
            <span className={styles.oldPrice}>{formatPrice(oldPrice)}</span>
          )}
        </div>

        {/* Stock indicator */}
        {inStock ? (
          <div className={styles.stockInfo}>
            <span className={styles.inStock}>
              <FontAwesomeIcon icon={faCheckCircle} /> In Stock
            </span>
            {quantity > 0 && quantity <= 5 && (
              <span className={styles.lowStock}>Only {quantity} left</span>
            )}
          </div>
        ) : (
          <div className={styles.stockInfo}>
            <span className={styles.outOfStock}>
              <FontAwesomeIcon icon={faTimesCircle} /> Out of Stock
            </span>
          </div>
        )}

        {/* Add to Cart */}
        <button
          className={`${styles.addBtn} ${!inStock ? styles.disabledBtn : ""}`}
          onClick={() => inStock && onAddToCart(product)}
          disabled={!inStock}
        >
          {inStock ? "Add to Cart" : "Notify Me"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
