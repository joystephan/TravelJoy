import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { getUserFriendlyMessage, APIError } from "../utils/apiErrorHandler";

interface ErrorMessageProps {
  error: APIError | Error | string;
  onRetry?: () => void;
  style?: any;
}

export default function ErrorMessage({
  error,
  onRetry,
  style,
}: ErrorMessageProps) {
  const getMessage = () => {
    if (typeof error === "string") {
      return error;
    }
    if ("code" in error) {
      return getUserFriendlyMessage(error as APIError);
    }
    return error.message || "An error occurred";
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.message}>{getMessage()}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFE69C",
    alignItems: "center",
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#856404",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
