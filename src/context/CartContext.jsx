import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadCart, saveCart } from '@/lib/firebase';

const CART_CACHE_KEY = 'online-store-cart-cache';
const CartContext = createContext(undefined);

function readCachedCart() {
    try {
        const value = localStorage.getItem(CART_CACHE_KEY);
        return value ? JSON.parse(value) : [];
    } catch {
        return [];
    }
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(readCachedCart);
    const [cartLoaded, setCartLoaded] = useState(false);

    useEffect(() => {
        let active = true;
        loadCart()
            .then((items) => {
                if (active && items.length > 0) setCartItems(items);
                console.info('[Firebase] Cart loaded');
            })
            .catch((error) => console.warn('[Firebase] Cart load failed; using local cache:', error))
            .finally(() => {
                if (active) setCartLoaded(true);
            });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(CART_CACHE_KEY, JSON.stringify(cartItems));
        } catch (error) {
            console.warn('[Cart] Local cache failed:', error);
        }
        if (!cartLoaded) return undefined;
        const timer = setTimeout(() => {
            saveCart(cartItems)
                .then(() => console.info('[Firebase] Cart saved'))
                .catch((error) => console.warn('[Firebase] Cart save failed; local cache kept:', error));
        }, 400);
        return () => clearTimeout(timer);
    }, [cartItems, cartLoaded]);

    const addToCart = useCallback((item) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, item];
        });
    }, []);
    const removeFromCart = useCallback((id) => {
        setCartItems((prev) => prev.filter((i) => i.id !== id));
    }, []);
    const updateQuantity = useCallback((id, quantity) => {
        if (quantity <= 0) {
            setCartItems((prev) => prev.filter((i) => i.id !== id));
            return;
        }
        setCartItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
    }, []);
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    return (<CartContext.Provider value={{ cartItems, cartCount, addToCart, removeFromCart, updateQuantity }}>
      {children}
    </CartContext.Provider>);
}
export function useCart() {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
}
