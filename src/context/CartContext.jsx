import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadCart, saveCart } from '@/lib/firebase';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [cartLoaded, setCartLoaded] = useState(false);

    useEffect(() => {
        let active = true;
        loadCart()
            .then((items) => {
                if (active) setCartItems(items);
            })
            .catch((error) => console.warn('[Firebase] Could not load cart:', error))
            .finally(() => {
                if (active) setCartLoaded(true);
            });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (!cartLoaded) return undefined;
        const timer = setTimeout(() => {
            saveCart(cartItems).catch((error) => console.warn('[Firebase] Could not save cart:', error));
        }, 400);
        return () => clearTimeout(timer);
    }, [cartItems, cartLoaded]);

    const addToCart = useCallback((item) => {
        setCartItems((prev) => {
            const existing = prev.find((i) => i.id === item.id);
            if (existing) {
                return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
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
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
}
