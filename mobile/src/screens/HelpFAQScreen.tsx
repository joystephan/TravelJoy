import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors, spacing, borderRadius, shadows, typography } from "../theme";

interface HelpFAQScreenProps {
  navigation: any;
}

const FAQ_ITEMS = [
  {
    question: "How do I create a trip?",
    answer:
      "Tap the 'Create Trip' button on the Explore screen, enter your destination, dates, and preferences. Our AI will generate a personalized itinerary for you.",
  },
  {
    question: "Can I edit my trip itinerary?",
    answer:
      "Yes! Open your trip from 'My Trips', tap on any activity, and you can edit or delete it. You can also add new activities to your itinerary.",
  },
  {
    question: "How does the AI trip planning work?",
    answer:
      "Our AI analyzes your travel preferences, destination, and dates to create a customized itinerary with activities, restaurants, and attractions that match your interests.",
  },
  {
    question: "Can I save multiple trips?",
    answer:
      "Absolutely! You can create and save as many trips as you want. All your trips are saved in the 'My Trips' section.",
  },
  {
    question: "How do I update my travel preferences?",
    answer:
      "Go to Settings > Travel Preferences to customize your activity types, food preferences, transport preferences, and schedule style.",
  },
  {
    question: "What subscription plans are available?",
    answer:
      "We offer Free, Basic, and Premium plans. Check the Subscription screen to see features and pricing for each plan.",
  },
];

export default function HelpFAQScreen({ navigation }: HelpFAQScreenProps) {
  const [expandedItems, setExpandedItems] = React.useState<number[]>([]);

  const toggleItem = (index: number) => {
    if (expandedItems.includes(index)) {
      setExpandedItems(expandedItems.filter((i) => i !== index));
    } else {
      setExpandedItems([...expandedItems, index]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Help & FAQ</Text>
          <Text style={styles.subtitle}>
            Find answers to commonly asked questions
          </Text>
        </View>

        <View style={styles.content}>
          {FAQ_ITEMS.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.questionContainer}
                onPress={() => toggleItem(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.question}>{item.question}</Text>
                <Text style={styles.expandIcon}>
                  {expandedItems.includes(index) ? "−" : "+"}
                </Text>
              </TouchableOpacity>
              {expandedItems.includes(index) && (
                <View style={styles.answerContainer}>
                  <Text style={styles.answer}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>
            If you can't find the answer you're looking for, feel free to contact
            our support team.
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate("ContactSupport")}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body1,
    color: colors.textSecondary,
  },
  content: {
    paddingHorizontal: spacing.md,
  },
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: "hidden",
    ...shadows.sm,
  },
  questionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.md,
  },
  question: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: "600",
    flex: 1,
    marginRight: spacing.sm,
  },
  expandIcon: {
    ...typography.h2,
    color: colors.primary,
    fontWeight: "bold",
  },
  answerContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  answer: {
    ...typography.body2,
    color: colors.textSecondary,
    lineHeight: 22,
    paddingTop: spacing.md,
  },
  contactSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    ...shadows.sm,
  },
  contactTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  contactText: {
    ...typography.body2,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  contactButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  contactButtonText: {
    ...typography.button,
    color: colors.white,
  },
  bottomSpacing: {
    height: spacing.xl,
  },
});

