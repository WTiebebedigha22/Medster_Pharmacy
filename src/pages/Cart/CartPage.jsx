import React, { useState, useEffect } from "react";
import styles from "./CartPage.module.css";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPlus,
  faMinus,
  faShoppingCart,
  faTruck,
  faClock,
  faShieldAlt,
  faArrowLeft,
  faTag,
  faGift,
  faLock,
  faHeart,
  faPrescription,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, increaseQty, decreaseQty, removeFromCart, clearCart } =
    useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [savedItems, setSavedItems] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    return sum + Number(item.price) * Number(item.qty);
  }, 0);

  const deliveryFee = subtotal > 50000 ? 0 : 1500;
  const discount = promoApplied ? subtotal * 0.1 : 0; // 10% discount
  const total = subtotal + deliveryFee - discount;

  // Check if cart qualifies for free delivery
  const freeDeliveryThreshold = 50000;
  const amountToFreeDelivery = freeDeliveryThreshold - subtotal;

  // Handle promo code
  const applyPromo = () => {
    if (promoCode.toUpperCase() === "PHARMA10") {
      setPromoApplied(true);
      setPromoDiscount(subtotal * 0.1);
      setPromoError("");
    } else if (promoCode.toUpperCase() === "WELCOME20") {
      setPromoApplied(true);
      setPromoDiscount(subtotal * 0.2);
      setPromoError("");
    } else {
      setPromoError("Invalid promo code. Try PHARMA10 or WELCOME20");
      setPromoApplied(false);
      setPromoDiscount(0);
    }
  };

  const removePromo = () => {
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoCode("");
  };

  // Mock recommended products
  useEffect(() => {
    setRecommendedProducts([
      {
        id: 101,
        name: "Vitamin D3 2000IU",
        price: 3500,
        image: "/images/products/vitamin_d.jpg",
        rating: 4.7,
      },
      {
        id: 102,
        name: "Omega-3 Fish Oil",
        price: 4500,
        image: "/images/products/omega_3.jpg",
        rating: 4.8,
      },
      {
        id: 103,
        name: "Magnesium Supplement",
        price: 3900,
        image: "/images/products/magnesium.jpg",
        rating: 4.6,
      },
    ]);
  }, []);

  const handleAddToSaved = (itemId) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (item) {
      setSavedItems([...savedItems, item]);
      removeFromCart(itemId);
    }
  };

  const handleMoveToCart = (item) => {
    // Add to cart logic here
    console.log("Added to cart:", item);
  };

  return (
    <div className={styles.cartPage}>
      <div className={styles.cartContainer}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <FontAwesomeIcon icon={faArrowLeft} />
            Continue Shopping
          </button>
          <h1 className={styles.title}>
            <FontAwesomeIcon icon={faShoppingCart} />
            Your Cart
            <span className={styles.itemCount}>
              {cartItems.reduce((total, item) => total + item.qty, 0)} items
            </span>
          </h1>
        </div>

        {/* Cart Progress */}
        {cartItems.length > 0 && (
          <div className={styles.cartProgress}>
            <div className={styles.progressSteps}>
              <div className={`${styles.step} ${styles.active}`}>
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepLabel}>Cart</span>
              </div>
              <div className={styles.stepLine}></div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepLabel}>Checkout</span>
              </div>
              <div className={styles.stepLine}></div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <span className={styles.stepLabel}>Confirmation</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.content}>
          {/* LEFT — CART ITEMS */}
          <div className={styles.itemsSection}>
            {cartItems.length === 0 ? (
              <div className={styles.emptyCart}>
                <div className={styles.emptyIcon}>
                  <FontAwesomeIcon icon={faShoppingCart} />
                </div>
                <h2>Your cart is empty</h2>
                <p>Browse our products and add items to your cart</p>
                <div className={styles.emptyActions}>
                  <Link to="/products" className={styles.browseBtn}>
                    Browse Products
                  </Link>
                  <Link to="/prescription" className={styles.prescriptionBtn}>
                    <FontAwesomeIcon icon={faPrescription} />
                    Upload Prescription
                  </Link>
                </div>
                <div className={styles.featuredCategories}>
                  <span>Popular categories:</span>
                  <Link to="/products?category=vitamins">💊 Vitamins</Link>
                  <Link to="/products?category=devices">📱 Health Devices</Link>
                  <Link to="/products?category=baby">👶 Baby Care</Link>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Header Actions */}
                <div className={styles.cartActions}>
                  <span className={styles.itemCountLabel}>
                    {cartItems.reduce((total, item) => total + item.qty, 0)}{" "}
                    items in cart
                  </span>
                  <button className={styles.clearCartBtn} onClick={clearCart}>
                    <FontAwesomeIcon icon={faTrash} />
                    Clear Cart
                  </button>
                </div>

                {/* Free Delivery Progress */}
                {subtotal < freeDeliveryThreshold && (
                  <div className={styles.deliveryProgress}>
                    <div className={styles.deliveryMessage}>
                      <FontAwesomeIcon icon={faTruck} />
                      <span>
                        Add ₦{amountToFreeDelivery.toLocaleString()} more to
                        qualify for
                        <strong> FREE delivery</strong>
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${(subtotal / freeDeliveryThreshold) * 100}%`,
                        }}
                      />
                    </div>
                    <span className={styles.progressPercentage}>
                      {Math.round((subtotal / freeDeliveryThreshold) * 100)}%
                      towards free delivery
                    </span>
                  </div>
                )}

                {/* Cart Items */}
                {cartItems.map((item) => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.itemImageContainer}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className={styles.itemImage}
                        onError={(e) => {
                          e.target.src = "/images/placeholder.jpg";
                        }}
                      />
                      {item.badge && (
                        <span className={styles.itemBadge}>{item.badge}</span>
                      )}
                    </div>

                    <div className={styles.itemInfo}>
                      <div className={styles.itemHeader}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        {item.category && (
                          <span className={styles.itemCategory}>
                            {item.category}
                          </span>
                        )}
                      </div>

                      <div className={styles.itemDetails}>
                        <p className={styles.itemPrice}>
                          ₦{Number(item.price).toLocaleString()}
                          {item.oldPrice && (
                            <span className={styles.oldPrice}>
                              ₦{Number(item.oldPrice).toLocaleString()}
                            </span>
                          )}
                          {item.discount && (
                            <span className={styles.discountBadge}>
                              Save {item.discount}%
                            </span>
                          )}
                        </p>

                        <div className={styles.quantityControls}>
                          <button
                            onClick={() => decreaseQty(item.id)}
                            className={styles.qtyBtn}
                            disabled={item.qty <= 1}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <span className={styles.qtyNumber}>{item.qty}</span>
                          <button
                            onClick={() => increaseQty(item.id)}
                            className={styles.qtyBtn}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      </div>

                      <div className={styles.itemActions}>
                        <button
                          className={styles.removeBtn}
                          onClick={() => removeFromCart(item.id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                          Remove
                        </button>
                        <button
                          className={styles.saveBtn}
                          onClick={() => handleAddToSaved(item.id)}
                        >
                          <FontAwesomeIcon icon={faHeart} />
                          Save for Later
                        </button>
                      </div>
                    </div>

                    <div className={styles.itemTotal}>
                      <span className={styles.totalLabel}>Total</span>
                      <span className={styles.totalAmount}>
                        ₦
                        {(
                          Number(item.price) * Number(item.qty)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Saved Items */}
                {savedItems.length > 0 && (
                  <div className={styles.savedItems}>
                    <h4>Saved for Later</h4>
                    <div className={styles.savedGrid}>
                      {savedItems.map((item) => (
                        <div key={item.id} className={styles.savedItem}>
                          <img src={item.image} alt={item.name} />
                          <span>{item.name}</span>
                          <p>₦{Number(item.price).toLocaleString()}</p>
                          <button onClick={() => handleMoveToCart(item)}>
                            Move to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div className={styles.recommendations}>
                  <h4>
                    <FontAwesomeIcon icon={faGift} />
                    Frequently Bought Together
                  </h4>
                  <div className={styles.recommendGrid}>
                    {recommendedProducts.map((product) => (
                      <div key={product.id} className={styles.recommendItem}>
                        <img src={product.image} alt={product.name} />
                        <h5>{product.name}</h5>
                        <div className={styles.rating}>
                          {"★".repeat(Math.floor(product.rating))}
                          <span>{product.rating}</span>
                        </div>
                        <p className={styles.recPrice}>
                          ₦{product.price.toLocaleString()}
                        </p>
                        <button className={styles.addRecBtn}>
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          {cartItems.length > 0 && (
            <div className={styles.summary}>
              <div className={styles.summaryCard}>
                <h2>Order Summary</h2>

                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>

                <div className={styles.summaryRow}>
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className={styles.freeBadge}>FREE</span>
                    ) : (
                      `₦${deliveryFee.toLocaleString()}`
                    )}
                  </span>
                </div>

                {discount > 0 && (
                  <div className={styles.summaryRow}>
                    <span className={styles.discountText}>
                      <FontAwesomeIcon icon={faTag} />
                      Discount
                    </span>
                    <span className={styles.discountAmount}>
                      -₦{discount.toLocaleString()}
                    </span>
                  </div>
                )}

                <hr className={styles.divider} />

                <div className={styles.summaryTotal}>
                  <span className={styles.totalLabel}>Total</span>
                  <span className={styles.totalAmount}>
                    ₦{total.toLocaleString()}
                  </span>
                </div>

                {/* Promo Code */}
                <div className={styles.promoSection}>
                  {promoApplied ? (
                    <div className={styles.promoApplied}>
                      <span className={styles.promoSuccess}>
                        <FontAwesomeIcon icon={faCheckCircle} />
                        Promo applied successfully!
                      </span>
                      <button
                        className={styles.removePromoBtn}
                        onClick={removePromo}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className={styles.promoInput}>
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className={styles.promoField}
                      />
                      <button
                        onClick={applyPromo}
                        className={styles.applyPromoBtn}
                        disabled={!promoCode}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <span className={styles.promoError}>{promoError}</span>
                  )}
                  <p className={styles.promoHint}>
                    Try: PHARMA10 (10% off) or WELCOME20 (20% off)
                  </p>
                </div>

                {/* Checkout Button */}
                <button
                  className={styles.checkoutBtn}
                  onClick={() => navigate("/checkout")}
                  disabled={cartItems.length === 0}
                >
                  <FontAwesomeIcon icon={faLock} />
                  Proceed to Checkout
                </button>

                <div className={styles.securityInfo}>
                  <FontAwesomeIcon icon={faShieldAlt} />
                  <span>Your payment is secure and encrypted</span>
                </div>

                <div className={styles.paymentMethods}>
                  <span>We accept:</span>
                  <div className={styles.paymentIcons}>
                    <span>💳</span>
                    <span>🏦</span>
                    <span>📱</span>
                    <span>💵</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className={styles.deliveryInfo}>
                  <div className={styles.deliveryOption}>
                    <FontAwesomeIcon icon={faTruck} />
                    <div>
                      <strong>Standard Delivery</strong>
                      <p>3-5 business days</p>
                    </div>
                  </div>
                  <div className={styles.deliveryOption}>
                    <FontAwesomeIcon icon={faClock} />
                    <div>
                      <strong>Express Delivery</strong>
                      <p>1-2 business days (+₦2,500)</p>
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className={styles.trustBadges}>
                  <span>✅ 100% Authentic</span>
                  <span>🔒 Secure Payment</span>
                  <span>🚚 Free Returns</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
