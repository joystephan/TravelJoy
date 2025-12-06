import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { wishlistService, WishlistItem } from '../services/wishlistService';

interface WishlistContextType {
  wishlist: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (item: Omit<WishlistItem, 'addedAt'>) => Promise<void>;
  removeFromWishlist: (itemId: string) => Promise<void>;
  isInWishlist: (itemId: string) => boolean;
  refreshWishlist: () => Promise<void>;
  clearWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWishlist = async () => {
    try {
      setIsLoading(true);
      const items = await wishlistService.getWishlist();
      setWishlist(items);
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const addToWishlist = async (item: Omit<WishlistItem, 'addedAt'>) => {
    try {
      await wishlistService.addToWishlist(item);
      await loadWishlist();
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      await wishlistService.removeFromWishlist(itemId);
      await loadWishlist();
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      throw error;
    }
  };

  const isInWishlist = (itemId: string): boolean => {
    return wishlist.some((item) => item.id === itemId);
  };

  const refreshWishlist = async () => {
    await loadWishlist();
  };

  const clearWishlist = async () => {
    try {
      await wishlistService.clearWishlist();
      await loadWishlist();
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      throw error;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

