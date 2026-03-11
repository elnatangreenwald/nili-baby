import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, typography, borderRadius, fonts } from '../utils/theme';

interface FeedingSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  maxValue?: number;
  targetValue?: number;
}

export const FeedingSlider: React.FC<FeedingSliderProps> = ({
  value,
  onValueChange,
  maxValue = 200,
  targetValue = 120,
}) => {
  const percentage =
    targetValue > 0 ? Math.round((value / targetValue) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>כמות שנאכלה</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>מ"ל</Text>
        </View>
      </View>

      <Slider
        style={styles.slider}
        value={value}
        onValueChange={onValueChange}
        minimumValue={0}
        maximumValue={maxValue}
        step={5}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
      />

      <View style={styles.footer}>
        <Text style={styles.minLabel}>0</Text>
        <View style={styles.targetContainer}>
          <Text
            style={[
              styles.percentage,
              percentage >= 100 && styles.percentageSuccess,
            ]}
          >
            {percentage}% מהיעד
          </Text>
        </View>
        <Text style={styles.maxLabel}>{maxValue}</Text>
      </View>

      {targetValue > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(percentage, 100)}%` },
                percentage >= 100 && styles.progressSuccess,
              ]}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  valueContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 36,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  unit: {
    ...typography.body,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  footer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  minLabel: {
    ...typography.caption,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  maxLabel: {
    ...typography.caption,
    fontFamily: fonts.regular,
    color: colors.textLight,
  },
  targetContainer: {
    alignItems: 'center',
  },
  percentage: {
    ...typography.bodySmall,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  percentageSuccess: {
    color: colors.success,
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressSuccess: {
    backgroundColor: colors.success,
  },
});
