import AsyncStorage from '@react-native-async-storage/async-storage';

const WISHLIST_KEY = 'user_wishlist';

export interface WishlistItem {
  id: string;
  destination: string;
  country: string;
  price: number;
  rating: number;
  imageUrl?: string;
  addedAt: number; // timestamp
}

class WishlistService {
  /**
   * Get all wishlist items
   */
  async getWishlist(): Promise<WishlistItem[]> {
    try {
      const wishlistJson = await AsyncStorage.getItem(WISHLIST_KEY);
      if (wishlistJson) {
        return JSON.parse(wishlistJson);
      }
      return [];
    } catch (error) {
      console.error('Failed to get wishlist:', error);
      return [];
    }
  }

  /**
   * Add item to wishlist
   */
  async addToWishlist(item: Omit<WishlistItem, 'addedAt'>): Promise<void> {
    try {
      const wishlist = await this.getWishlist();
      
      // Check if item already exists
      const exists = wishlist.some((wishItem) => wishItem.id === item.id);
      if (exists) {
        return; // Already in wishlist
      }

      const newItem: WishlistItem = {
        ...item,
        addedAt: Date.now(),
      };

      wishlist.push(newItem);
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      throw error;
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(itemId: string): Promise<void> {
    try {
      const wishlist = await this.getWishlist();
      const filtered = wishlist.filter((item) => item.id !== itemId);
      await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      throw error;
    }
  }

  /**
   * Check if item is in wishlist
   */
  async isInWishlist(itemId: string): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.some((item) => item.id === itemId);
    } catch (error) {
      console.error('Failed to check wishlist:', error);
      return false;
    }
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(): Promise<void> {
    try {
      await AsyncStorage.removeItem(WISHLIST_KEY);
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      throw error;
    }
  }
}

export const wishlistService = new WishlistService();

