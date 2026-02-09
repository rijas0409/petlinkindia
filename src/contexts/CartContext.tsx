import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import { generateProducts } from "@/lib/shopData";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper to find product details by ID across all pet types
const findProduct = (productId: string) => {
  const allPetTypes = ["dog", "cat", "birds", "fish", "rabbit", "hamster", "guinea-pig", "turtle", "white-mouse"];
  const allCategories = ["food", "treats", "toys", "accessories", "grooming", "health"];
  for (const pet of allPetTypes) {
    for (const cat of allCategories) {
      const products = generateProducts(pet, cat);
      const found = products.find((p) => p.id === productId);
      if (found) return found;
    }
  }
  // Also check best-seller IDs (they are re-mapped)
  return null;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (productId: string) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        toast.success("Quantity updated in cart");
        return prev.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      const product = findProduct(productId);
      if (product) {
        toast.success("Added to cart");
        return [...prev, { id: productId, name: product.name, price: product.price, image: product.image, quantity: 1 }];
      }
      // Fallback for best-seller or unknown IDs — store with productId
      toast.success("Added to cart");
      return [...prev, { id: productId, name: "Product", price: 0, image: "", quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeItem, cartCount: cartItems.reduce((s, i) => s + i.quantity, 0) }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
