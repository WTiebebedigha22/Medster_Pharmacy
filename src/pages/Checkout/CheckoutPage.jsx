import React, { useMemo, useState } from "react";
import styles from "./CheckoutPage.module.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { api } from "../../lib/api";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0),
    [cartItems]
  );

  const deliveryFee = subtotal > 50000 ? 0 : 1500;
  const total = subtotal + deliveryFee;

  const placeOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simple placeholders; wire real inputs later
      const shipping = {
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        notes: "",
      };

      const res = await api.createOrder({
        items: cartItems.map((i) => ({
          productId: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          image: i.image,
          category: i.category,
          brand: i.brand,
        })),
        shipping,
        paymentMethod: "CARD",
      });

      // clear cart
      cartItems.forEach((i) => removeFromCart(i.id));

      if (res?.order?.id) navigate(`/orders`);
    } catch (e) {
      setError(e?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.left}>
          <h1>Checkout</h1>
          {cartItems.length === 0 ? (
            <div className={styles.notice}>
              Your cart is empty.{" "}
              <button className={styles.linkBtn} onClick={() => navigate("/shop")}>
                Shop now
              </button>
            </div>
          ) : (
            <>
              <div className={styles.section}>
                <h2>Shipping Details</h2>
                <div className={styles.grid}>
                  <input className={styles.input} placeholder="Full name" />
                  <input className={styles.input} placeholder="Phone number" />
                  <input className={styles.input} placeholder="Address" />
                  <input className={styles.input} placeholder="City" />
                  <input className={styles.input} placeholder="State" />
                  <input className={styles.input} placeholder="Delivery notes (optional)" />
                </div>
              </div>

              <div className={styles.section}>
                <h2>Payment</h2>
                <div className={styles.grid}>
                  <input
                    className={styles.input}
                    placeholder="Payment method (placeholder)"
                  />
                </div>
                <div className={styles.smallText}>
                  Payment processing is demo-only.
                </div>
              </div>

              {error && <div className={styles.smallText} style={{ color: "#b00020" }}>{error}</div>}

              <button
                className={styles.placeOrderBtn}
                onClick={placeOrder}
                disabled={loading}
                style={loading ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
              >
                {loading ? "Placing order…" : "Place Order"}
              </button>
            </>
          )}
        </div>

        <div className={styles.right}>
          <div className={styles.summary}>
            <h2>Order Summary</h2>
            <div className={styles.row}>
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className={styles.row}>
              <span>Delivery Fee</span>
              <span>
                {deliveryFee === 0 ? "Free" : `₦${deliveryFee.toLocaleString()}`}
              </span>
            </div>
            <hr />
            <div className={styles.totalRow}>
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;


