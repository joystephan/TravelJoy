// TravelJoy Color Theme - Inspired by modern travel apps

// Type definition for colors
export type Colors = typeof lightColors;

// Light mode colors
export const lightColors = {
  // Primary Colors (Turquoise/Teal theme from inspiration)
  primary: "#50C9C3",
  primaryDark: "#3DA39E",
  primaryLight: "#7FD9D5",

  // Accent Colors
  accent: "#FF6B6B",
  accentOrange: "#FFA726",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  info: "#2196F3",

  // Neutral Colors
  white: "#FFFFFF",
  black: "#000000",
  background: "#F5F7FA",
  surface: "#FFFFFF",

  // Text Colors
  textPrimary: "#2C3E50",
  textSecondary: "#7F8C8D",
  textLight: "#95A5A6",
  textDark: "#1A252F",

  // Gray Scale
  gray50: "#F9FAFB",
  gray100: "#F3F4F6",
  gray200: "#E5E7EB",
  gray300: "#D1D5DB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  gray600: "#4B5563",
  gray700: "#374151",
  gray800: "#1F2937",
  gray900: "#111827",

  // Card & Shadow
  cardBackground: "#FFFFFF",
  cardShadow: "rgba(0, 0, 0, 0.08)",
  overlay: "rgba(0, 0, 0, 0.5)",

  // Status Colors
  online: "#4CAF50",
  offline: "#9E9E9E",

  // Rating Colors
  ratingGold: "#FFD700",
};

// Dark mode colors
export const darkColors = {
  // Primary Colors (same for dark mode)
  primary: "#50C9C3",
  primaryDark: "#3DA39E",
  primaryLight: "#7FD9D5",

  // Accent Colors (same for dark mode)
  accent: "#FF6B6B",
  accentOrange: "#FFA726",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  info: "#2196F3",

  // Neutral Colors (inverted for dark mode)
  white: "#1A1A1A",
  black: "#FFFFFF",
  background: "#121212",
  surface: "#1E1E1E",

  // Text Colors (inverted for dark mode)
  textPrimary: "#E5E5E5",
  textSecondary: "#B0B0B0",
  textLight: "#808080",
  textDark: "#FFFFFF",

  // Gray Scale (inverted for dark mode)
  gray50: "#2A2A2A",
  gray100: "#333333",
  gray200: "#404040",
  gray300: "#4D4D4D",
  gray400: "#666666",
  gray500: "#808080",
  gray600: "#999999",
  gray700: "#B3B3B3",
  gray800: "#CCCCCC",
  gray900: "#E5E5E5",

  // Card & Shadow
  cardBackground: "#1E1E1E",
  cardShadow: "rgba(0, 0, 0, 0.3)",
  overlay: "rgba(0, 0, 0, 0.7)",

  // Status Colors (same for dark mode)
  online: "#4CAF50",
  offline: "#666666",

  // Rating Colors (same for dark mode)
  ratingGold: "#FFD700",
};

// Default export for backward compatibility (light mode)
export const colors = lightColors;

export const gradients = {
  primary: ["#50C9C3", "#3DA39E"],
  sunset: ["#FF6B6B", "#FFA726"],
  ocean: ["#2196F3", "#00BCD4"],
  purple: ["#9C27B0", "#E91E63"],
};

export default colors;
