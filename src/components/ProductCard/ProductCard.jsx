import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ProductCard.module.css";

const ProductCard = ({ product, onAddToCart }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <button
        className={styles.imageBtn}
        onClick={() => navigate(`/product/${product.id}`)}
        aria-label={`View ${product.name}`}
      >
        <img className={styles.image} src={product.image} alt={product.name} />
      </button>

      <div className={styles.body}>
        <div className={styles.meta}>
          <span className={styles.category}>{product.category}</span>
          {product.isRx && <span className={styles.rx}>Rx</span>}
        </div>

        <h3 className={styles.name}>{product.name}</h3>

        <p className={styles.desc}>{product.description}</p>

        <div className={styles.bottom}>
          <div className={styles.price}>₦{Number(product.price).toLocaleString()}</div>
          <button className={styles.addBtn} onClick={() => onAddToCart(product)}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

