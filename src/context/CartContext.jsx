import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CART_CACHE_KEY = 'online-store-cart-cache';
const CartContext = createContext(undefined);

function readCachedCart() {
  try {
    const value = JSON.parse(localStorage.getItem(CART_CACHE_KEY) || '[]');
    if (!Array.isArray(value)) return [];
    // Discard legacy demo/Firebase cart rows that have no real tenant/product identity.
    return value.filter((item) => item && item.vendorId && item.productId && Number(item.quantity) > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(readCachedCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_CACHE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.warn('[Cart] Local cache failed:', error);
    }
  }, [cartItems]);

  const addToCart = useCallback((item) => {
    setCartItems((previous) => {
      const existing = previous.find((row) => row.id === item.id);
      if (existing) {
        const max = Math.min(Number(existing.stockQuantity) || 99, 99);
        return previous.map((row) => row.id === item.id
          ? { ...row, quantity: Math.min(Number(row.quantity || 1) + 1, max) }
          : row);
      }
      if (previous.length >= 50) return previous;
      return [...previous, { ...item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setCartItems((previous) => previous.filter((item) => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    const nextQuantity = Math.floor(Number(quantity));
    if (nextQuantity <= 0) {
      setCartItems((previous) => previous.filter((item) => item.id !== id));
      return;
    }
    setCartItems((previous) => previous.map((item) => {
      if (item.id !== id) return item;
      const max = Math.min(Number(item.stockQuantity) || 99, 99);
      return { ...item, quantity: Math.min(nextQuantity, max) };
    }));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);
  const cartCount = cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
