import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../utils/theme';

type FeedingType = 'BREASTFEEDING' | 'FORMULA';

interface FeedingTypeSelectorProps {
  value: FeedingType;
  onChange: (type: FeedingType) => void;
}

export const FeedingTypeSelector: React.FC<FeedingTypeSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>סוג האכלה</Text>
      <View style={styles.options}>
        <TouchableOpacity
          style={[styles.option, value === 'BREASTFEEDING' && styles.optionSelected]}
          onPress={() => onChange('BREASTFEEDING')}
        >
          <Text style={styles.optionIcon}>🤱</Text>
          <Text style={[styles.optionText, value === 'BREASTFEEDING' && styles.optionTextSelected]}>
            הנקה
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.option, value === 'FORMULA' && styles.optionSelected]}
          onPress={() => onChange('FORMULA')}
        >
          <Text style={styles.optionIcon}>🍼</Text>
          <Text style={[styles.optionText, value === 'FORMULA' && styles.optionTextSelected]}>
            תמ"ל
          </Text>
        </TouchableOpacity>
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
    color: colors.text,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  options: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  option: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  optionIcon: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  optionText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
});
