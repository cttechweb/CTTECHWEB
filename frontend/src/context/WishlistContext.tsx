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
          setWishlist(JSON.parse(saved));
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
