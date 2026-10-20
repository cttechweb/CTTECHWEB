import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Product, ServiceItem, WishlistItem } from "../types";

interface WishlistContextType {
  wishlist: WishlistItem[];
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (item: { type: "product" | "service"; product?: Product; service?: ServiceItem }) => boolean;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
}

const defaultWishlistContext: WishlistContextType = {
  wishlist: [],
  isInWishlist: () => false,
  toggleWishlist: () => false,
  removeFromWishlist: () => {},
  clearWishlist: () => {},
};

const WishlistContext = createContext<WishlistContextType>(defaultWishlistContext);

export const WishlistProvider: React.FC<{ children: React.ReactNode; onShowToast?: (message: string) => void }> = ({ 
  children,
  onShowToast 
}) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load wishlist for current user from localStorage
  useEffect(() => {
    if (user?.uid) {
      const storageKey = `ct_wishlist_${user.uid}`;
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const normalized = parsed.map((it: any) => ({
              ...it,
              name: it.product?.name || it.service?.title || it.name || it.title || "Item",
              title: it.service?.title || it.product?.name || it.title || it.name || "Item",
              image: it.product?.image || it.service?.image || it.image || "",
              category: it.product?.category || it.service?.category || it.category || "",
              description: it.product?.description || it.service?.description || it.description || "",
              price: it.product?.price ?? it.price ?? 0,
              brand: it.product?.brand || it.brand || "",
            }));
            setWishlist(normalized);
          } else {
            setWishlist([]);
          }
        } else {
          setWishlist([]);
        }
      } catch (e) {
        console.error("Failed to load wishlist from localStorage", e);
        setWishlist([]);
      }
    } else {
      setWishlist([]);
    }
  }, [user?.uid]);

  // Save wishlist to localStorage whenever it changes
  const saveWishlist = (items: WishlistItem[]) => {
    setWishlist(items);
    if (user?.uid) {
      const storageKey = `ct_wishlist_${user.uid}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save wishlist to localStorage", e);
      }
    }
  };

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.id === id);
  };

  const toggleWishlist = (item: { type: "product" | "service"; product?: Product; service?: ServiceItem }): boolean => {
    if (!user) {
      if (onShowToast) {
        onShowToast("Please sign in to save items to your wishlist.");
      }
      window.location.hash = "#/login";
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    const id = item.product?.id || item.service?.id;
    if (!id) return false;

    const itemName = item.product?.name || item.service?.title || "Item";
    const exists = isInWishlist(id);

    if (exists) {
      const updated = wishlist.filter((w) => w.id !== id);
      saveWishlist(updated);
      if (onShowToast) onShowToast(`Removed "${itemName}" from your wishlist.`);
      return false;
    } else {
      const newItem: WishlistItem = {
        id,
        type: item.type,
        product: item.product,
        service: item.service,
        addedAt: new Date().toISOString(),
        name: item.product?.name || item.service?.title || "Item",
        title: item.service?.title || item.product?.name || "Item",
        image: item.product?.image || item.service?.image || "",
        category: item.product?.category || item.service?.category || "",
        description: item.product?.description || item.service?.description || "",
        price: item.product?.price ?? 0,
        brand: item.product?.brand || "",
      };
      const updated = [newItem, ...wishlist];
      saveWishlist(updated);
      if (onShowToast) onShowToast(`Added "${itemName}" to your wishlist.`);
      return true;
    }
  };

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter((item) => item.id !== id);
    saveWishlist(updated);
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  return context || defaultWishlistContext;
};
