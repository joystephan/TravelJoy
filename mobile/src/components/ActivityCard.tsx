import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Activity } from "../types";

interface ActivityCardProps {
  activity: Activity;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ActivityCard({
  activity,
  onEdit,
  onDelete,
}: ActivityCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.name}>{activity.name}</Text>
        {activity.description && (
          <Text style={styles.description}>{activity.description}</Text>
        )}
        <View style={styles.details}>
          <Text style={styles.category}>{activity.category}</Text>
          <Text style={styles.duration}>{activity.duration} min</Text>
          <Text style={styles.cost}>${activity.cost.toFixed(2)}</Text>
        </View>
        {activity.rating && (
          <Text style={styles.rating}>⭐ {activity.rating.toFixed(1)}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  content: {
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  category: {
    fontSize: 14,
    color: "#007AFF",
    textTransform: "capitalize",
  },
  duration: {
    fontSize: 14,
    color: "#666",
  },
  cost: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34C759",
  },
  rating: {
    fontSize: 14,
    color: "#FF9500",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
