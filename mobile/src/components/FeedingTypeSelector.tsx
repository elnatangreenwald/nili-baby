import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colors, spacing, borderRadius, typography, fonts, shadows } from '../utils/theme';

type FeedingType = 'BREASTFEEDING' | 'FORMULA';

interface FeedingTypeSelectorProps {
  value: FeedingType;
  onChange: (type: FeedingType) => void;
}

const OptionButton: React.FC<{
  type: FeedingType;
  icon: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  color: string;
}> = ({ type, icon, label, isSelected, onPress, color }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.optionWrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.option,
          isSelected && styles.optionSelected,
          isSelected && { borderColor: color, backgroundColor: `${color}15` },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Text style={styles.optionIcon}>{icon}</Text>
        </View>
        <Text
          style={[
            styles.optionText,
            isSelected && styles.optionTextSelected,
            isSelected && { color },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const FeedingTypeSelector: React.FC<FeedingTypeSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>סוג האכלה</Text>
      <View style={styles.options}>
        <OptionButton
          type="BREASTFEEDING"
          icon="🤱"
          label="הנקה"
          isSelected={value === 'BREASTFEEDING'}
          onPress={() => onChange('BREASTFEEDING')}
          color={colors.feedingBreastfeeding}
        />

        <OptionButton
          type="FORMULA"
          icon="🍼"
          label='תמ"ל'
          isSelected={value === 'FORMULA'}
          onPress={() => onChange('FORMULA')}
          color={colors.feedingFormula}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    ...typography.body,
    fontFamily: fonts.semiBold,
    color: colors.text,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  options: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  optionWrapper: {
    flex: 1,
  },
  option: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 100,
  },
  optionSelected: {
    ...shadows.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionText: {
    ...typography.body,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    fontFamily: fonts.semiBold,
  },
});
