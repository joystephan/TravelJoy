import axios from "axios";
import redisClient from "../config/redis";

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface Language {
  code: string;
  name: string;
}

interface Timezone {
  name: string;
  offset: string;
}

interface CountryInfo {
  name: {
    common: string;
    official: string;
  };
  code: string;
  capital: string[];
  region: string;
  subregion: string;
  population: number;
  area: number;
  currencies: Currency[];
  languages: Language[];
  timezones: Timezone[];
  coordinates: {
    lat: number;
    lon: number;
  };
  flags: {
    png: string;
    svg: string;
  };
  borders: string[];
  callingCode: string[];
  tld: string[];
}

interface TravelAdvisory {
  country: string;
  safetyLevel: "low" | "moderate" | "high" | "extreme";
  recommendations: string[];
  healthInfo: string[];
  visaRequired: boolean;
}

class CountriesService {
  private baseUrl = "https://restcountries.com/v3.1";
  private cacheExpiry = 604800; // 7 days in seconds (country data rarely changes)

  /**
   * Get country information by country code
   */
  async getCountryByCode(countryCode: string): Promise<CountryInfo | null> {
    const cacheKey = `countries:code:${countryCode.toUpperCase()}`;

    // Check cache first
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/alpha/${countryCode.toUpperCase()}`
      );

      if (!response.data || response.data.length === 0) {
        return null;
      }

      const countryInfo = this.mapCountryInfo(response.data[0]);

      // Cache the result
      await this.saveToCache(cacheKey, countryInfo);

      return countryInfo;
    } catch (error) {
      console.error("REST Countries API error:", error);
      throw new Error("Failed to fetch country information");
    }
  }

  /**
   * Get country information by country name
   */
  async getCountryByName(countryName: string): Promise<CountryInfo | null> {
    const cacheKey = `countries:name:${countryName.toLowerCase()}`;

    // Check cache first
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/name/${encodeURIComponent(countryName)}`
      );

      if (!response.data || response.data.length === 0) {
        return null;
      }

      // Return the first match (most relevant)
      const countryInfo = this.mapCountryInfo(response.data[0]);

      // Cache the result
      await this.saveToCache(cacheKey, countryInfo);

      return countryInfo;
    } catch (error) {
      console.error("REST Countries API error:", error);
      throw new Error("Failed to fetch country information");
    }
  }

  /**
   * Get multiple countries by region
   */
  async getCountriesByRegion(region: string): Promise<CountryInfo[]> {
    const cacheKey = `countries:region:${region.toLowerCase()}`;

    // Check cache first
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/region/${encodeURIComponent(region)}`
      );

      const countries = response.data.map((country: any) =>
        this.mapCountryInfo(country)
      );

      // Cache the result
      await this.saveToCache(cacheKey, countries);

      return countries;
    } catch (error) {
      console.error("REST Countries API error:", error);
      throw new Error("Failed to fetch countries by region");
    }
  }

  /**
   * Get currency information for a country
   */
  async getCurrencyInfo(countryCode: string): Promise<Currency[]> {
    const country = await this.getCountryByCode(countryCode);
    return country?.currencies || [];
  }

  /**
   * Get timezone information for a country
   */
  async getTimezoneInfo(countryCode: string): Promise<Timezone[]> {
    const country = await this.getCountryByCode(countryCode);
    return country?.timezones || [];
  }

  /**
   * Get language information for a country
   */
  async getLanguageInfo(countryCode: string): Promise<Language[]> {
    const country = await this.getCountryByCode(countryCode);
    return country?.languages || [];
  }

  /**
   * Generate travel advisory information
   * Note: This is a basic implementation. In production, integrate with official travel advisory APIs
   */
  async getTravelAdvisory(countryCode: string): Promise<TravelAdvisory> {
    const country = await this.getCountryByCode(countryCode);

    if (!country) {
      throw new Error("Country not found");
    }

    // Basic travel advisory based on region and available data
    const advisory: TravelAdvisory = {
      country: country.name.common,
      safetyLevel: this.estimateSafetyLevel(country),
      recommendations: this.generateRecommendations(country),
      healthInfo: this.generateHealthInfo(country),
      visaRequired: true, // Default to true for safety
    };

    return advisory;
  }

  /**
   * Get comprehensive travel information for a destination
   */
  async getTravelInfo(countryCode: string): Promise<{
    country: CountryInfo;
    advisory: TravelAdvisory;
    practicalInfo: {
      bestTimeToVisit: string;
      averageCosts: string;
      transportation: string;
    };
  }> {
    const [country, advisory] = await Promise.all([
      this.getCountryByCode(countryCode),
      this.getTravelAdvisory(countryCode),
    ]);

    if (!country) {
      throw new Error("Country not found");
    }

    return {
      country,
      advisory,
      practicalInfo: {
        bestTimeToVisit: this.getBestTimeToVisit(country),
        averageCosts: this.getAverageCosts(country),
        transportation: this.getTransportationInfo(country),
      },
    };
  }

  /**
   * Map REST Countries API response to CountryInfo
   */
  private mapCountryInfo(data: any): CountryInfo {
    // Extract currencies
    const currencies: Currency[] = data.currencies
      ? Object.entries(data.currencies).map(([code, curr]: [string, any]) => ({
          code,
          name: curr.name,
          symbol: curr.symbol || "",
        }))
      : [];

    // Extract languages
    const languages: Language[] = data.languages
      ? Object.entries(data.languages).map(([code, name]: [string, any]) => ({
          code,
          name,
        }))
      : [];

    // Extract timezones
    const timezones: Timezone[] = data.timezones
      ? data.timezones.map((tz: string) => ({
          name: tz,
          offset: tz.match(/UTC([+-]\d{2}:\d{2})/)?.[1] || "",
        }))
      : [];

    return {
      name: {
        common: data.name.common,
        official: data.name.official,
      },
      code: data.cca2,
      capital: data.capital || [],
      region: data.region,
      subregion: data.subregion || "",
      population: data.population,
      area: data.area,
      currencies,
      languages,
      timezones,
      coordinates: {
        lat: data.latlng?.[0] || 0,
        lon: data.latlng?.[1] || 0,
      },
      flags: {
        png: data.flags.png,
        svg: data.flags.svg,
      },
      borders: data.borders || [],
      callingCode: data.idd?.root
        ? [data.idd.root + (data.idd.suffixes?.[0] || "")]
        : [],
      tld: data.tld || [],
    };
  }

  /**
   * Estimate safety level based on region and available data
   * Note: This is a simplified estimation. Use official travel advisory APIs in production
   */
  private estimateSafetyLevel(
    country: CountryInfo
  ): "low" | "moderate" | "high" | "extreme" {
    // This is a placeholder implementation
    // In production, integrate with official travel advisory APIs
    const safeRegions = ["Europe", "Americas", "Oceania"];
    const moderateRegions = ["Asia"];

    if (safeRegions.includes(country.region)) {
      return "low";
    } else if (moderateRegions.includes(country.region)) {
      return "moderate";
    }

    return "moderate"; // Default to moderate
  }

  /**
   * Generate travel recommendations
   */
  private generateRecommendations(country: CountryInfo): string[] {
    const recommendations: string[] = [];

    recommendations.push(
      `Check visa requirements for ${country.name.common} before traveling.`
    );
    recommendations.push(
      `Local currency: ${country.currencies.map((c) => c.name).join(", ")}`
    );
    recommendations.push(
      `Languages spoken: ${country.languages.map((l) => l.name).join(", ")}`
    );

    if (country.timezones.length > 0) {
      recommendations.push(
        `Timezone: ${country.timezones[0].name} (${country.timezones[0].offset})`
      );
    }

    return recommendations;
  }

  /**
   * Generate health information
   */
  private generateHealthInfo(country: CountryInfo): string[] {
    return [
      "Consult your doctor about required vaccinations before traveling.",
      "Consider travel insurance that covers medical emergencies.",
      "Research local healthcare facilities at your destination.",
    ];
  }

  /**
   * Get best time to visit based on region
   */
  private getBestTimeToVisit(country: CountryInfo): string {
    // Simplified recommendations based on region
    const recommendations: { [key: string]: string } = {
      Europe: "May to September (Spring and Summer)",
      Asia: "November to March (Dry season in most areas)",
      Africa: "June to October (Dry season)",
      Americas: "Varies by location - Spring and Fall generally best",
      Oceania: "December to February (Summer)",
    };

    return (
      recommendations[country.region] ||
      "Research specific destination for best travel times"
    );
  }

  /**
   * Get average costs information
   */
  private getAverageCosts(country: CountryInfo): string {
    // This is a placeholder - in production, integrate with cost of living APIs
    return "Costs vary by city and travel style. Research specific destinations for accurate budgeting.";
  }

  /**
   * Get transportation information
   */
  private getTransportationInfo(country: CountryInfo): string {
    return `Public transportation, taxis, and ride-sharing services are commonly available in ${country.name.common}. Research local options for your specific destination.`;
  }

  /**
   * Cache helper methods
   */
  private async getFromCache(key: string): Promise<any | null> {
    try {
      const cached = await redisClient.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  private async saveToCache(key: string, data: any): Promise<void> {
    try {
      await redisClient.set(key, JSON.stringify(data), "EX", this.cacheExpiry);
    } catch (error) {
      console.error("Cache save error:", error);
    }
  }
}

export default new CountriesService();
