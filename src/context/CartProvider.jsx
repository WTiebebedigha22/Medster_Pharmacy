import React, { createContext, useEffect, useState } from "react";

export const __CartContext = createContext(null);

const CART_KEY = "medsterpharmacy_cart_v1";

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setCartItems(parsed);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const increaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item))
    );
  };

  const decreaseQty = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const value = { cartItems, addToCart, removeFromCart, increaseQty, decreaseQty, clearCart };

  return <__CartContext.Provider value={value}>{children}</__CartContext.Provider>;
};

export default CartProvider;


