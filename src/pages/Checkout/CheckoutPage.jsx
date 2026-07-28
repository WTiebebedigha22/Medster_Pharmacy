import React, { useMemo, useState } from "react";
import styles from "./CheckoutPage.module.css";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faUniversity,
  faMobileAlt,
  faTruck,
  faShieldAlt,
  faCheckCircle,
  faExclamationCircle,
faArrowLeft,
  faLock,
  faMapMarkerAlt,
  faPhone,
  faUser,
  faSpinner,
  faShoppingCart,
} from "@fortawesome/free-solid-svg-icons";

// Paystack public key from env
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "";

// Payment method definitions
const PAYMENT_METHODS = [
  {
    id: "card",
    name: "Card Payment",
    icon: faCreditCard,
    description: "Pay with debit/credit card (Visa, Mastercard, Verve)",
    color: "#1a73e8",
  },
  {
    id: "transfer",
    name: "Bank Transfer",
    icon: faUniversity,
    description: "Pay via bank transfer to our Medster account",
    color: "#0d7c3f",
  },
  {
    id: "ussd",
    name: "USSD",
    icon: faMobileAlt,
    description: "Pay using USSD code on any network",
    color: "#e67e22",
  },
  {
    id: "pay_on_delivery",
    name: "Pay on Delivery",
    icon: faTruck,
    description: "Pay cash when your order is delivered",
    color: "#8e44ad",
  },
];

const DELIVERY_OPTIONS = [
  {
    id: "standard",
    name: "Standard Delivery",
    fee: 1500,
    days: "3-5 business days",
    icon: "🚚",
  },
  {
    id: "express",
    name: "Express Delivery",
    fee: 4000,
    days: "1-2 business days",
    icon: "⚡",
  },
];

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state
  const [shipping, setShipping] = useState({
    fullName: user?.user_metadata?.full_name || user?.full_name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [deliveryOption, setDeliveryOption] = useState("standard");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Bank transfer details
  const bankDetails = {
    bank: "GTBank",
    accountName: "Medster Pharmacy Ltd",
    accountNumber: "0123456789",
  };

  // Calculated totals
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0),
    [cartItems]
  );

  const deliveryFee = useMemo(() => {
    const option = DELIVERY_OPTIONS.find((d) => d.id === deliveryOption);
    return option ? option.fee : 1500;
  }, [deliveryOption]);

  const total = subtotal + deliveryFee;

  // Update shipping field
  const updateShipping = (field, value) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!shipping.fullName.trim()) errors.fullName = "Full name is required";
    if (!shipping.phone.trim()) errors.phone = "Phone number is required";
    else if (!/^(\+?234|0)[0-9]{10}$/.test(shipping.phone.replace(/\s/g, "")))
      errors.phone = "Enter a valid Nigerian phone number (e.g., 08012345678)";
    if (!shipping.address.trim()) errors.address = "Delivery address is required";
    if (!shipping.city.trim()) errors.city = "City is required";
    if (!shipping.state.trim()) errors.state = "State is required";
    if (!agreedToTerms) errors.terms = "You must agree to the terms and conditions";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Load Paystack script
  const loadPaystackScript = () => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load payment gateway. Please try again."));
      document.body.appendChild(script);
    });
  };

// Handle Paystack popup
  const handlePaystackPayment = () => {
    return loadPaystackScript().then(() => {
      return new Promise((resolve, reject) => {
        const handler = window.PaystackPop.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email: user?.email || `${shipping.fullName.replace(/\s/g, "").toLowerCase()}@customer.medster.com`,
          amount: Math.round(total * 100),
          currency: "NGN",
          ref: `MED-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          metadata: {
            customer_name: shipping.fullName,
            customer_phone: shipping.phone,
            delivery_address: `${shipping.address}, ${shipping.city}, ${shipping.state}`,
          },
          callback: function (response) {
            resolve({
              reference: response.reference,
              status: "success",
              transactionId: response.transaction,
            });
          },
          onClose: function () {
            reject(new Error("Payment was cancelled"));
          },
        });
        handler.openIframe();
      });
    });
  };

  // Save order
  const saveOrder = async (paymentRef = null, paymentStatus = "awaiting_payment") => {
    const orderNumber = `MED-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const orderData = {
      order_number: orderNumber,
      status: paymentMethod === "pay_on_delivery" ? "pending" : paymentStatus,
      subtotal,
      delivery_fee: deliveryFee,
      discount: 0,
      tax: 0,
      total,
      currency: "NGN",
      payment_method: paymentMethod,
      paystack_reference: paymentRef,
      shipping_address: shipping,
      delivery_option: deliveryOption,
      items: cartItems.map((i) => ({
        product_id: i.id,
        product_name: i.name,
        price: Number(i.price),
        quantity: Number(i.qty),
        subtotal: Number(i.price) * Number(i.qty),
        image: i.image || null,
      })),
      user_id: user?.id || null,
      created_at: new Date().toISOString(),
    };

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Try server API first
      if (token) {
        const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
        const response = await fetch(`${API_BASE}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shippingAddressId: null,
            paymentMethod,
            notes: shipping.notes,
            deliveryOption,
          }),
        });

        if (response.ok) {
          return await response.json();
        }
      }

      // Fallback: Insert directly into Supabase
      const { data, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (error) {
        // If table doesn't exist or insert fails, save locally
        console.warn("Supabase insert failed, saving locally:", error.message);
        const localOrders = JSON.parse(localStorage.getItem("medster_orders") || "[]");
        localOrders.unshift(orderData);
        localStorage.setItem("medster_orders", JSON.stringify(localOrders));
        return { order: orderData, local: true };
      }

      return { order: data };
    } catch (err) {
      console.warn("Order save failed, using local storage:", err.message);
      const localOrders = JSON.parse(localStorage.getItem("medster_orders") || "[]");
      localOrders.unshift(orderData);
      localStorage.setItem("medster_orders", JSON.stringify(localOrders));
      return { order: orderData, local: true };
    }
  };

  // Handle place order
  const placeOrder = async () => {
    if (!validateForm()) return;
    if (cartItems.length === 0) {
      setError("Your cart is empty");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Save the order
      const orderResult = await saveOrder(null, "awaiting_payment");
      const orderId = orderResult?.order?.id || orderResult?.order?.order_number;

      // Step 2: Handle payment based on method
      if (paymentMethod === "card") {
        // Process card payment via Paystack
        setError(null);
        const paymentResult = await handlePaystackPayment();

        // Update order with payment reference
        if (orderId && !orderResult?.local) {
          await supabase
            .from("orders")
            .update({
              paystack_reference: paymentResult.reference,
              status: "paid",
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);
        }
      } else if (paymentMethod === "transfer") {
        // For bank transfer, order stays as awaiting_payment
        // User will make transfer manually
      }

      // Step 3: Clear cart
      clearCart();

      // Step 4: Show success & redirect
      setSuccess(
        paymentMethod === "pay_on_delivery"
          ? "Your order has been placed! Pay on delivery."
          : paymentMethod === "transfer"
          ? "Your order has been placed! Please complete bank transfer to confirm."
          : "Payment successful! Your order is being processed."
      );

      setTimeout(() => {
        navigate("/orders");
      }, 3000);
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If cart is empty
  if (cartItems.length === 0 && !success) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyCart}>
<div className={styles.emptyIcon}>
            <FontAwesomeIcon icon={faShoppingCart} />
          </div>
          <h2>Your cart is empty</h2>
          <p>Add some products to your cart before checking out</p>
          <button className={styles.primaryBtn} onClick={() => navigate("/shop")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Left Column - Forms */}
        <div className={styles.left}>
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => navigate("/cart")}>
              <FontAwesomeIcon icon={faArrowLeft} /> Back to Cart
            </button>
            <h1>Checkout</h1>
          </div>

          {/* Success Message */}
          {success && (
            <div className={styles.successBanner}>
              <FontAwesomeIcon icon={faCheckCircle} className={styles.successIcon} />
              <div>
                <h3>Order Placed Successfully!</h3>
                <p>{success}</p>
                <p className={styles.redirectMsg}>Redirecting to your orders...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !success && (
            <div className={styles.errorBanner}>
              <FontAwesomeIcon icon={faExclamationCircle} />
              <span>{error}</span>
              <button onClick={() => setError(null)} className={styles.dismissBtn}>×</button>
            </div>
          )}

          {!success && (
            <>
              {/* Section 1: Delivery Address */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <h2>Delivery Address</h2>
                </div>

                <div className={styles.grid}>
                  <div className={`${styles.field} ${formErrors.fullName ? styles.fieldError : ""}`}>
                    <label>Full Name *</label>
                    <div className={styles.inputWrapper}>
                      <FontAwesomeIcon icon={faUser} className={styles.inputIcon} />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={shipping.fullName}
                        onChange={(e) => updateShipping("fullName", e.target.value)}
                      />
                    </div>
                    {formErrors.fullName && <span className={styles.errorText}>{formErrors.fullName}</span>}
                  </div>

                  <div className={`${styles.field} ${formErrors.phone ? styles.fieldError : ""}`}>
                    <label>Phone Number *</label>
                    <div className={styles.inputWrapper}>
                      <FontAwesomeIcon icon={faPhone} className={styles.inputIcon} />
                      <input
                        type="tel"
                        placeholder="080 1234 5678"
                        value={shipping.phone}
                        onChange={(e) => updateShipping("phone", e.target.value)}
                      />
                    </div>
                    {formErrors.phone && <span className={styles.errorText}>{formErrors.phone}</span>}
                  </div>

                  <div className={`${styles.field} ${styles.fullWidth} ${formErrors.address ? styles.fieldError : ""}`}>
                    <label>Delivery Address *</label>
                    <div className={styles.inputWrapper}>
                      <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.inputIcon} />
                      <input
                        type="text"
                        placeholder="123 Main Street, Ikoyi"
                        value={shipping.address}
                        onChange={(e) => updateShipping("address", e.target.value)}
                      />
                    </div>
                    {formErrors.address && <span className={styles.errorText}>{formErrors.address}</span>}
                  </div>

                  <div className={`${styles.field} ${formErrors.city ? styles.fieldError : ""}`}>
                    <label>City *</label>
                    <input
                      type="text"
                      placeholder="Lagos"
                      value={shipping.city}
                      onChange={(e) => updateShipping("city", e.target.value)}
                    />
                    {formErrors.city && <span className={styles.errorText}>{formErrors.city}</span>}
                  </div>

                  <div className={`${styles.field} ${formErrors.state ? styles.fieldError : ""}`}>
                    <label>State *</label>
                    <select
                      value={shipping.state}
                      onChange={(e) => updateShipping("state", e.target.value)}
                    >
                      <option value="">Select State</option>
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {formErrors.state && <span className={styles.errorText}>{formErrors.state}</span>}
                  </div>

                  <div className={`${styles.field} ${styles.fullWidth}`}>
                    <label>Delivery Notes (Optional)</label>
                    <textarea
                      placeholder="E.g., Leave at the gate, call before delivery..."
                      value={shipping.notes}
                      onChange={(e) => updateShipping("notes", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery Method */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faTruck} />
                  <h2>Delivery Method</h2>
                </div>

                <div className={styles.deliveryOptions}>
                  {DELIVERY_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className={`${styles.deliveryCard} ${deliveryOption === option.id ? styles.deliveryCardActive : ""}`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={option.id}
                        checked={deliveryOption === option.id}
                        onChange={(e) => setDeliveryOption(e.target.value)}
                      />
                      <span className={styles.deliveryIcon}>{option.icon}</span>
                      <div className={styles.deliveryInfo}>
                        <strong>{option.name}</strong>
                        <span className={styles.deliveryDays}>{option.days}</span>
                      </div>
                      <span className={styles.deliveryFee}>
                        {option.fee === 0 ? "Free" : `₦${option.fee.toLocaleString()}`}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Section 3: Payment Method */}
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <FontAwesomeIcon icon={faCreditCard} />
                  <h2>Payment Method</h2>
                </div>

                <div className={styles.paymentOptions}>
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`${styles.paymentCard} ${paymentMethod === method.id ? styles.paymentCardActive : ""}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <FontAwesomeIcon icon={method.icon} className={styles.paymentIcon} style={{ color: method.color }} />
                      <div className={styles.paymentInfo}>
                        <strong>{method.name}</strong>
                        <span className={styles.paymentDesc}>{method.description}</span>
                      </div>
                      {paymentMethod === method.id && (
                        <FontAwesomeIcon icon={faCheckCircle} className={styles.paymentSelected} />
                      )}
                    </label>
                  ))}
                </div>

                {/* Payment Instructions */}
                {paymentMethod === "transfer" && (
                  <div className={styles.paymentInstructions}>
                    <h4><FontAwesomeIcon icon={faUniversity} /> Bank Transfer Details</h4>
                    <div className={styles.bankDetails}>
                      <div className={styles.bankRow}>
                        <span>Bank:</span>
                        <strong>{bankDetails.bank}</strong>
                      </div>
                      <div className={styles.bankRow}>
                        <span>Account Name:</span>
                        <strong>{bankDetails.accountName}</strong>
                      </div>
                      <div className={styles.bankRow}>
                        <span>Account Number:</span>
                        <strong className={styles.accountNumber}>{bankDetails.accountNumber}</strong>
                      </div>
                    </div>
                    <p className={styles.instructionNote}>
                      After payment, your order will be processed once the transfer is confirmed.
                      Use your order number as the payment reference.
                    </p>
                  </div>
                )}

                {paymentMethod === "ussd" && (
                  <div className={styles.paymentInstructions}>
                    <h4><FontAwesomeIcon icon={faMobileAlt} /> USSD Payment</h4>
                    <p className={styles.instructionNote}>
                      After placing your order, you will receive a USSD code via SMS.
                      Dial the code on your phone to complete payment.
                    </p>
                  </div>
                )}

                {paymentMethod === "pay_on_delivery" && (
                  <div className={styles.paymentInstructions}>
                    <h4><FontAwesomeIcon icon={faTruck} /> Pay on Delivery</h4>
                    <p className={styles.instructionNote}>
                      Pay cash to our delivery agent when your order arrives.
                      Please have the exact amount ready.
                    </p>
                  </div>
                )}
              </div>

              {/* Terms & Place Order */}
              <div className={styles.termsSection}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span>
                    I agree to the{" "}
                    <Link to="/terms" target="_blank">Terms & Conditions</Link> and{" "}
                    <Link to="/privacy" target="_blank">Privacy Policy</Link>
                  </span>
                </label>
                {formErrors.terms && <span className={styles.errorText}>{formErrors.terms}</span>}
              </div>

              <button
                className={`${styles.placeOrderBtn} ${loading ? styles.btnLoading : ""}`}
                onClick={placeOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin />
                    Processing...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faLock} />
                    Place Order - ₦{total.toLocaleString()}
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div className={styles.right}>
          <div className={styles.summary}>
            <h2>Order Summary</h2>

            {/* Cart Items */}
            <div className={styles.cartItems}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.summaryItem}>
                  <img
                    src={item.image || "/images/placeholder.svg"}
                    alt={item.name}
                    className={styles.summaryItemImg}
                    onError={(e) => { e.target.src = "/images/placeholder.svg"; }}
                  />
                  <div className={styles.summaryItemInfo}>
                    <p className={styles.summaryItemName}>{item.name}</p>
                    <span className={styles.summaryItemQty}>Qty: {item.qty}</span>
                  </div>
                  <span className={styles.summaryItemPrice}>
                    ₦{(Number(item.price) * Number(item.qty)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <hr className={styles.divider} />

            {/* Totals */}
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Delivery Fee</span>
              <span className={deliveryFee === 0 ? styles.freeBadge : ""}>
                {deliveryFee === 0 ? "FREE" : `₦${deliveryFee.toLocaleString()}`}
              </span>
            </div>

            <hr className={styles.divider} />

            <div className={styles.grandTotal}>
              <span>Total</span>
              <span className={styles.totalAmount}>₦{total.toLocaleString()}</span>
            </div>

            {/* Payment Method Badge */}
            <div className={styles.paymentBadge}>
              <FontAwesomeIcon icon={faLock} />
              <span>Pay via {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.name || "Card"}</span>
            </div>

            {/* Trust Badges */}
            <div className={styles.trustBadges}>
              <div className={styles.trustItem}>
                <FontAwesomeIcon icon={faShieldAlt} />
                <span>Secure Payment</span>
              </div>
              <div className={styles.trustItem}>
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>100% Authentic</span>
              </div>
              <div className={styles.trustItem}>
                <FontAwesomeIcon icon={faTruck} />
                <span>Free Returns</span>
              </div>
            </div>

            {/* Support */}
            <div className={styles.supportInfo}>
              <p>Need help? <Link to="/contact-us">Contact Support</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
