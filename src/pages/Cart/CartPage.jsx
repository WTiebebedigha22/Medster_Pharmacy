import React from "react";
import styles from "./CartPage.module.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, increaseQty, decreaseQty, removeFromCart } = useCart();

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + Number(item.price) * Number(item.qty);
  }, 0);

  const deliveryFee = subtotal > 50000 ? 0 : 1500;
  const total = subtotal + deliveryFee;

  return (
    <div className={styles.cartPage}>
      <h1 className={styles.title}>Your Cart</h1>

      <div className={styles.content}>
        {/* LEFT — CART ITEMS */}
        <div className={styles.itemsSection}>
          {cartItems.length === 0 ? (
            <p className={styles.empty}>Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <img
                  src={item.image}
                  alt={item.name}
                  className={styles.itemImage}
                />

                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemPrice}>
                    ₦{Number(item.price).toLocaleString()}
                  </p>

                  <div className={styles.quantityControls}>
                    <button onClick={() => decreaseQty(item.id)}>-</button>
                    <span>{item.qty}</span>
                    <button onClick={() => increaseQty(item.id)}>+</button>
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>

                <div className={styles.itemTotal}>
                  ₦{(Number(item.price) * Number(item.qty)).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT — ORDER SUMMARY */}
        <div className={styles.summary}>
          <h2>Order Summary</h2>

          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>₦{subtotal.toLocaleString()}</span>
          </div>

          <div className={styles.summaryRow}>
            <span>Delivery Fee</span>
            <span>
              {deliveryFee === 0 ? "Free" : `₦${deliveryFee.toLocaleString()}`}
            </span>
          </div>

          <hr />

          <div className={styles.summaryTotal}>
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>

          <button
            className={styles.checkoutBtn}
            onClick={() => navigate("/checkout")}
            disabled={cartItems.length === 0}
            style={cartItems.length === 0 ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

