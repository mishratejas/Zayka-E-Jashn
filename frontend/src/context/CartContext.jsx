import { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

const TAX_RATE = 0.05; // 5% GST

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart") || "[]"); } catch { return []; }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.itemId === item._id);
      if (existing) {
        toast.success("Quantity updated 🛒");
        return prev.map((i) => i.itemId === item._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      toast.success(`${item.name} added to cart! 🍽️`);
      return [...prev, {
        itemId:   item._id,
        name:     item.name,
        price:    item.price,
        quantity: 1,
        image:    item.image,
        category: item.category,
      }];
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    setItems((prev) => prev.filter((i) => i.itemId !== itemId));
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity < 1) { removeItem(itemId); return; }
    if (quantity > 20) { toast.error("Maximum 20 items allowed"); return; }
    setItems((prev) => prev.map((i) => i.itemId === itemId ? { ...i, quantity } : i));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem("cart");
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax      = subtotal * TAX_RATE;
  const total    = subtotal + tax;
  const count    = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, count, subtotal, tax, total, TAX_RATE,
      addItem, removeItem, updateQuantity, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
