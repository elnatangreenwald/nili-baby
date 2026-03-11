import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { formatTime, formatRelativeTime } from '../utils/helpers';

interface FeedingHistoryItemProps {
  feeding: {
    id: string;
    time: string;
    type: 'BREASTFEEDING' | 'FORMULA';
    amountMl: number | null;
    user?: { name: string };
  };
  onDelete?: (id: string) => void;
}

export const FeedingHistoryItem: React.FC<FeedingHistoryItemProps> = ({
  feeding,
  onDelete,
}) => {
  const typeLabel = feeding.type === 'BREASTFEEDING' ? 'הנקה' : 'תמ"ל';
  const typeIcon = feeding.type === 'BREASTFEEDING' ? '🤱' : '🍼';

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{typeIcon}</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.type}>{typeLabel}</Text>
          <Text style={styles.time}>{formatTime(feeding.time)}</Text>
        </View>
        
        <View style={styles.details}>
          {feeding.amountMl !== null && (
            <Text style={styles.amount}>{feeding.amountMl} מ"ל</Text>
          )}
          <Text style={styles.relative}>{formatRelativeTime(feeding.time)}</Text>
        </View>
        
        {feeding.user && (
          <Text style={styles.recordedBy}>נרשם ע"י {feeding.user.name}</Text>
        )}
      </View>
      
      {onDelete && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => onDelete(feeding.id)}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  type: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  time: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  details: {
    flexDirection: 'row-reverse',
    marginTop: spacing.xs,
    gap: spacing.md,
  },
  amount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  relative: {
    ...typography.caption,
    color: colors.textLight,
  },
  recordedBy: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  deleteIcon: {
    fontSize: 18,
  },
});
