/**
 * Pricing and rating helper utility
 * Provides consistent pricing and rating logic across services
 */

// Country pricing tiers
const EXPENSIVE_COUNTRIES = ["Switzerland", "Norway", "Iceland", "Denmark"];
const MODERATE_COUNTRIES = ["USA", "UK", "France", "Germany", "Japan"];
const AFFORDABLE_COUNTRIES = ["Thailand", "Vietnam", "India", "Mexico"];

/**
 * Get base price multiplier for a country
 * @param country Country name
 * @returns Price multiplier
 */
export function getCountryPriceMultiplier(country?: string): number {
  if (!country) return 1.0;

  if (EXPENSIVE_COUNTRIES.includes(country)) {
    return 2.2;
  } else if (MODERATE_COUNTRIES.includes(country)) {
    return 1.3;
  } else if (AFFORDABLE_COUNTRIES.includes(country)) {
    return 0.45;
  }

  return 1.0; // Default multiplier
}

/**
 * Get hotel type price multiplier
 * @param name Hotel name
 * @returns Price multiplier
 */
export function getHotelTypeMultiplier(name: string): number {
  const nameLower = name.toLowerCase();

  if (
    nameLower.includes("resort") ||
    nameLower.includes("spa") ||
    nameLower.includes("luxury")
  ) {
    return 1.8;
  } else if (nameLower.includes("budget") || nameLower.includes("hostel")) {
    return 0.5;
  }

  return 1.0; // Default multiplier
}

/**
 * Generate realistic hotel price
 * @param country Country name
 * @param hotelName Hotel name
 * @param basePrice Base price (default: 100)
 * @returns Calculated price
 */
export function generateHotelPrice(
  country?: string,
  hotelName: string = "",
  basePrice: number = 100
): number {
  const countryMultiplier = getCountryPriceMultiplier(country);
  const typeMultiplier = getHotelTypeMultiplier(hotelName);

  const calculatedPrice = basePrice * countryMultiplier * typeMultiplier;
  const variation = calculatedPrice * 0.3;
  const finalPrice =
    calculatedPrice + (Math.random() * variation * 2 - variation);

  return Math.floor(finalPrice);
}

/**
 * Get base rating for hotel type
 * @param name Hotel name
 * @returns Base rating
 */
export function getHotelTypeBaseRating(name: string): number {
  const nameLower = name.toLowerCase();

  if (nameLower.includes("resort") || nameLower.includes("spa")) {
    return 4.3;
  } else if (nameLower.includes("luxury") || nameLower.includes("premium")) {
    return 4.6;
  } else if (nameLower.includes("budget") || nameLower.includes("hostel")) {
    return 3.4;
  }

  return 3.8; // Default rating
}

/**
 * Generate realistic hotel rating
 * @param hotelName Hotel name
 * @returns Rating (1-5)
 */
export function generateHotelRating(hotelName: string): number {
  const baseRating = getHotelTypeBaseRating(hotelName);
  const variation = Math.random() * 0.5 - 0.25;
  const rating = baseRating + variation;

  return Math.round(rating * 10) / 10;
}

/**
 * Extract star rating from OSM tags
 * @param tags OSM tags object
 * @returns Star rating (1-5) or undefined
 */
export function extractStarRating(tags: any): number | undefined {
  if (tags?.stars) {
    const stars = parseInt(tags.stars);
    if (!isNaN(stars) && stars >= 1 && stars <= 5) {
      return stars;
    }
  }
  return undefined;
}

