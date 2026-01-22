import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Dimensions,
} from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { spacing, borderRadius, shadows, typography } from "../theme";

interface DestinationSuggestion {
  display_name: string;
  place_id: number;
  lat: string;
  lon: string;
}

interface DestinationSearchInputProps {
  value: string;
  onChange: (destination: string) => void;
  placeholder?: string;
  style?: any;
}

export default function DestinationSearchInput({
  value,
  onChange,
  placeholder = "Search for a destination...",
  style,
}: DestinationSearchInputProps) {
  const { colors, mode } = useTheme();
  const [searchText, setSearchText] = useState(value);
  const [suggestions, setSuggestions] = useState<DestinationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inputLayout, setInputLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<TextInput>(null);
  const inputContainerRef = useRef<View>(null);

  // Check if query contains meaningful text (not just numbers or special chars)
  const isValidSearchQuery = (query: string): boolean => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return false;
    
    // Reject queries that are only numbers
    if (/^\d+$/.test(trimmed)) return false;
    
    // Reject queries that are only special characters
    if (/^[^a-zA-Z0-9\s]+$/.test(trimmed)) return false;
    
    // Require at least one letter
    if (!/[a-zA-Z]/.test(trimmed)) return false;
    
    return true;
  };

  // Sync searchText with value prop when it changes externally
  useEffect(() => {
    if (value !== searchText) {
      setSearchText(value);
    }
  }, [value]);

  // Clear error when user starts typing
  useEffect(() => {
    if (searchText.trim().length > 0) {
      setErrorMessage(null);
    }
  }, [searchText]);

  // Check if a result matches the search query well
  const isRelevantResult = (item: any, query: string): boolean => {
    const queryLower = query.toLowerCase().trim();
    const originalNameLower = item.original_name.toLowerCase();
    const displayNameLower = item.display_name.toLowerCase();
    
    // If query contains only numbers, reject all results
    if (/^\d+$/.test(queryLower)) {
      return false;
    }
    
    // Extract meaningful words from query (ignore numbers and special chars)
    const queryWords = queryLower
      .split(/\s+/)
      .filter(w => w.length > 0 && /[a-zA-Z]/.test(w)); // Only words with letters
    
    if (queryWords.length === 0) {
      return false; // No meaningful words in query
    }
    
    // Check if significant words from query appear in the result
    const matchingWords = queryWords.filter(word => {
      if (word.length < 2) return false; // Ignore very short words
      return originalNameLower.includes(word) || displayNameLower.includes(word);
    });
    
    // Require at least 50% of meaningful words to match (or at least 1 word for short queries)
    const minMatches = queryWords.length <= 2 ? 1 : Math.ceil(queryWords.length * 0.5);
    if (matchingWords.length < minMatches) {
      return false;
    }
    
    // For very short queries (2-3 chars), require the query to appear at the start
    if (queryLower.length <= 3 && /^[a-zA-Z]+$/.test(queryLower)) {
      const firstPart = originalNameLower.split(',')[0].trim();
      return firstPart.startsWith(queryLower);
    }
    
    return true;
  };

  const searchDestinations = async (query: string) => {
    // Don't search if we're selecting
    if (isSelecting) {
      return;
    }

    const trimmedQuery = query.trim();
    
    // Validate query before searching
    if (!isValidSearchQuery(trimmedQuery)) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      setErrorMessage(null);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      // Use LocationIQ API (same as backend) for better reliability
      const apiKey = "pk.44c3f34a6e224bb5d8f41044718dc07d";
      const url = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(trimmedQuery)}&format=json&limit=20&addressdetails=1`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMsg = "Unable to find this location. Please try a different search.";
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMsg = `Location not found: "${trimmedQuery}". Please check the spelling or try a different location.`;
          }
        } catch (e) {
          // Use default message if parsing fails
        }
        
        setErrorMessage(errorMsg);
        setSuggestions([]);
        setShowSuggestions(false);
        setLoading(false);
        return;
      }

      const data: DestinationSuggestion[] = await response.json();
      
      if (!Array.isArray(data)) {
        console.error("Invalid API response:", data);
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Filter and sort suggestions with stronger validation
      const filtered = data
        .map((item) => {
          const originalName = item.display_name;
          return {
            ...item,
            // Extract city/country for better display
            display_name: formatDisplayName(originalName),
            // Keep original for reference
            original_name: originalName,
          };
        })
        .filter((item: any) => {
          // Must have proper city/country format (at least 2 parts)
          const parts = item.original_name.split(",");
          if (parts.length < 2) return false;
          
          // Must be relevant to the search query
          if (!isRelevantResult(item, trimmedQuery)) return false;
          
          // Filter out results that are too generic or administrative
          const lowerName = item.original_name.toLowerCase();
          const genericTerms = [
            'administrative', 'region', 'state', 'province', 'county',
            'district', 'area', 'zone', 'territory', 'division'
          ];
          const isGeneric = genericTerms.some(term => lowerName.includes(term));
          if (isGeneric && parts.length < 3) return false; // Allow if it's a specific place
          
          return true;
        })
        // Remove duplicates based on formatted display name
        .filter((item: any, index: number, self: any[]) =>
          index === self.findIndex((t: any) => t.display_name === item.display_name)
        )
        // Sort by relevance (exact matches first, then alphabetical)
        .sort((a: any, b: any) => {
          const queryLower = trimmedQuery.toLowerCase();
          const aLower = a.display_name.toLowerCase();
          const bLower = b.display_name.toLowerCase();
          
          // Prioritize exact start matches
          const aStarts = aLower.startsWith(queryLower);
          const bStarts = bLower.startsWith(queryLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          // Then alphabetical
          return a.display_name.localeCompare(b.display_name);
        })
        .slice(0, 10) // Limit to top 10 results
        .map((item: any) => ({
          display_name: item.display_name,
          place_id: item.place_id,
          lat: item.lat,
          lon: item.lon,
        }));

      console.log("Setting suggestions:", filtered.length, "items");
      setSuggestions(filtered);
      
      if (filtered.length === 0) {
        // No results found
        setErrorMessage(`No destinations found for "${trimmedQuery}". Please try a different search.`);
        setShowSuggestions(false);
      } else {
        // Clear any previous error
        setErrorMessage(null);
        // Only show suggestions if we have results AND we're not selecting
        if (!isSelecting) {
          // Ensure input layout is measured
          if (inputContainerRef.current && inputLayout.width === 0) {
            inputContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
              setInputLayout({ x: pageX, y: pageY, width, height });
            });
          }
          setShowSuggestions(true);
        }
      }
      setSelectedIndex(-1);
    } catch (error: any) {
      console.error("Error searching destinations:", error);
      console.error("Error details:", error.message, error.stack);
      setSuggestions([]);
      setShowSuggestions(false);
      setErrorMessage("Unable to search destinations. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format display name to show city, country format
  const formatDisplayName = (fullName: string): string => {
    const parts = fullName.split(",").map((p) => p.trim());
    if (parts.length >= 2) {
      // Return "City, Country" format
      return `${parts[0]}, ${parts[parts.length - 1]}`;
    }
    return fullName;
  };

  const handleSelectDestination = (suggestion: DestinationSuggestion) => {
    // Set flag to prevent re-searching BEFORE updating text
    setIsSelecting(true);
    
    // Clear any pending debounce timers
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
    
    // Close suggestions immediately
    setShowSuggestions(false);
    setSuggestions([]);
    setLoading(false);
    
    // Update the text and value
    // This will trigger useEffect, but isSelecting flag will prevent search
    setSearchText(suggestion.display_name);
    onChange(suggestion.display_name);
    
    // Blur the input
    inputRef.current?.blur();
    
    // Clear the selecting flag after a longer delay to ensure state has settled
    // and prevent any race conditions
    setTimeout(() => {
      setIsSelecting(false);
    }, 1000);
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);
    // Clear error when user types
    setErrorMessage(null);
    // Hide suggestions while typing (wait for enter key)
    setShowSuggestions(false);
    // If user clears the input, clear the selected destination
    if (!text.trim()) {
      onChange("");
      setSuggestions([]);
    }
  };

  const handleInputLayout = (event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    inputContainerRef.current?.measure((fx, fy, fwidth, fheight, px, py) => {
      setInputLayout({ x: px, y: py, width: fwidth || width, height: fheight || height });
    });
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Measure input position for modal placement (for when suggestions do appear)
    if (inputContainerRef.current) {
      inputContainerRef.current.measure((x, y, width, height, pageX, pageY) => {
        setInputLayout({ x: pageX, y: pageY, width, height });
      });
    }
    // DO NOT show suggestions on focus - only show after typing
    // Don't trigger search on focus either - wait for user to type
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Don't hide suggestions on blur - let them stay visible
    // Only hide if user is selecting (handled in handleSelectDestination)
    // This allows suggestions to remain visible after keyboard is dismissed
  };

  const styles = createStyles(colors);

  const screenHeight = Dimensions.get("window").height;
  const modalTop = inputLayout.y + inputLayout.height + spacing.xs;

  return (
    <View style={[styles.container, style]} collapsable={false}>
      <View 
        ref={inputContainerRef}
        style={styles.inputContainer}
        collapsable={false}
        onLayout={handleInputLayout}
      >
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          value={searchText}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={() => {
            // When user presses "done" on keyboard, trigger search
            const trimmed = searchText.trim();
            if (trimmed.length >= 2 && isValidSearchQuery(trimmed) && !isSelecting) {
              searchDestinations(trimmed);
            } else if (trimmed.length >= 2) {
              // If we already have suggestions, show them
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }
            inputRef.current?.blur();
          }}
          returnKeyType="search"
          autoCapitalize="words"
          autoCorrect={false}
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.loader}
          />
        )}
      </View>

      {/* Error Message */}
      {errorMessage && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <Modal
        visible={showSuggestions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuggestions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSuggestions(false)}
        >
          <View
            style={[
              styles.suggestionsContainer,
              {
                top: modalTop,
                left: inputLayout.x,
                width: inputLayout.width || Dimensions.get("window").width - spacing.md * 2,
                maxHeight: Math.min(300, screenHeight - modalTop - spacing.md),
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {suggestions.length > 0 ? (
              <ScrollView
                style={styles.suggestionsList}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
              >
                {suggestions.map((item) => (
                  <TouchableOpacity
                    key={item.place_id.toString()}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectDestination(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionText}>{item.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : searchText.length >= 2 && !loading ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  No destinations found. Try a different search.
                </Text>
              </View>
            ) : null}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      position: "relative",
      zIndex: 1000,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.gray50,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.gray200,
    },
    input: {
      flex: 1,
      ...typography.body1,
      color: colors.textPrimary,
      padding: 0,
    },
    loader: {
      marginLeft: spacing.sm,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    suggestionsContainer: {
      position: "absolute",
      backgroundColor: colors.surface || colors.white,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.gray200,
      ...shadows.lg,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    suggestionsList: {
      maxHeight: 300,
    },
    suggestionItem: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.gray100,
    },
    suggestionText: {
      ...typography.body2,
      color: colors.textPrimary,
    },
    noResultsContainer: {
      padding: spacing.md,
      alignItems: "center",
    },
    noResultsText: {
      ...typography.caption,
      color: colors.textSecondary,
      textAlign: "center",
    },
    errorContainer: {
      marginTop: spacing.xs,
      padding: spacing.sm,
      backgroundColor: colors.gray100,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.error,
      borderLeftWidth: 3,
    },
    errorText: {
      ...typography.caption,
      color: colors.error,
      textAlign: "left",
      fontSize: 13,
    },
  });
