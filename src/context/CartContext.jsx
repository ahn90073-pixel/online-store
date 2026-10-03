import { createContext, useContext, useState, useCallback } from 'react';
const CartContext = createContext(undefined);
export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
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
