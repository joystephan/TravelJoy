import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { spacing, borderRadius, typography } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

interface CategoryChipProps {
  label: string;
  icon?: string;
  selected?: boolean;
  onPress: () => void;
  variant?: 'horizontal' | 'vertical';
}

export default function CategoryChip({
  label,
  icon,
  selected = false,
  onPress,
  variant = 'horizontal',
}: CategoryChipProps) {
  const { colors } = useTheme();
  const isVertical = variant === 'vertical';
  const styles = createStyles(colors);
  
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isVertical && styles.chipVertical,
        selected && styles.chipSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <Text style={[
          styles.icon,
          isVertical ? styles.iconVertical : styles.iconHorizontal,
        ]}>
          {icon}
        </Text>
      )}
      <Text
        style={[
          styles.label,
          isVertical && styles.labelVertical,
          selected && styles.labelSelected,
        ]}
        numberOfLines={isVertical ? undefined : 1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.gray200,
    flex: 1,
    marginHorizontal: spacing.xs,
    justifyContent: 'center',
  },
  chipVertical: {
    flexDirection: 'column',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    minHeight: 60,
    width: '48%',
    maxWidth: '48%',
    flex: 0,
    marginHorizontal: 0,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  icon: {
    fontSize: 16,
  },
  iconHorizontal: {
    marginRight: spacing.xs,
  },
  iconVertical: {
    fontSize: 20,
    marginBottom: 4,
  },
  label: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  labelVertical: {
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
  },
  labelSelected: {
    color: colors.white,
  },
});



