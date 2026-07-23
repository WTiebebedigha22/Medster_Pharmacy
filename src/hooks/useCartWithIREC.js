import { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';

export const useCartWithIREC = () => {
  const { cartItems, addToCart, removeFromCart, increaseQty, decreaseQty, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Calculate totals
    const count = cartItems.reduce((sum, item) => sum + (item.qty || 0), 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + (Number(item.price) * (item.qty || 0)), 0);
    
    setItemCount(count);
    setTotal(totalPrice);
  }, [cartItems]);

  const addProductToCart = useCallback(async (productId, quantity = 1) => {
    setLoading(true);
    try {
      // Fetch latest product data from IREC
      const product = await api.getProduct(productId);
      
      if (product && product.inStock) {
        for (let i = 0; i < quantity; i++) {
          addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            isRx: product.isRx,
            inStock: product.inStock,
          });
        }
        return { success: true };
      } else {
        return { success: false, error: 'Product out of stock' };
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [addToCart]);

  const updateCartItemQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      const current = cartItems.find(item => item.id === productId);
      if (current) {
        if (quantity > current.qty) {
          increaseQty(productId);
        } else if (quantity < current.qty) {
          decreaseQty(productId);
        }
      }
    }
  }, [removeFromCart, increaseQty, decreaseQty, cartItems]);

  return {
    cartItems,
    loading,
    total,
    itemCount,
    addProductToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
  };
};