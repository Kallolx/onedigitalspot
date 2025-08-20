import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: string;
  productName: string;
  productImage?: string;
  label?: string; // specific variant name
  price: number;
  quantity: number;
  productType?: string;
  // Game-specific information
  gameInfo?: {
    playerId?: string;
    zoneId?: string;
    uuid?: string;
  };
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "cart_items_v1";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch (e) {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }, [items]);

  const count = items.reduce((s, it) => s + it.quantity, 0);

  const addItem = (item: Omit<CartItem, "id">) => {
    // If same productName + label exists, increment quantity and merge game info
    setItems((prev) => {
      const existing = prev.find(
        (p) => p.productName === item.productName && p.label === item.label
      );
      if (existing) {
        return prev.map((p) =>
          p.id === existing.id
            ? { 
                ...p, 
                quantity: p.quantity + item.quantity,
                // Keep the existing game info or update with new info if provided
                gameInfo: item.gameInfo || p.gameInfo
              }
            : p
        );
      }
      const newItem: CartItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        ...item,
      };
      return [newItem, ...prev];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, quantity } : p))
        .filter((p) => p.quantity > 0)
    );
  };

  const clear = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ items, count, open, setOpen, addItem, removeItem, updateQuantity, clear }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export default CartContext;
