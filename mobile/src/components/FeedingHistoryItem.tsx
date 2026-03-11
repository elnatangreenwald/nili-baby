import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const typeLabel = feeding.type === 'BREASTFEEDING' ? 'הנקה' : 'תמ"ל';
  const typeIcon = feeding.type === 'BREASTFEEDING' ? '🤱' : '🍼';
  const typeColor = feeding.type === 'BREASTFEEDING' ? '#FFB74D' : '#4FC3F7';

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${typeColor}20` }]}>
          <Text style={styles.icon}>{typeIcon}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.type}>{typeLabel}</Text>
              <View style={[styles.typeBadge, { backgroundColor: `${typeColor}30` }]}>
                <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                  {feeding.type === 'BREASTFEEDING' ? 'הנקה' : 'בקבוק'}
                </Text>
              </View>
            </View>
            <Text style={styles.time}>{formatTime(feeding.time)}</Text>
          </View>

          <View style={styles.details}>
            {feeding.amountMl !== null && (
              <View style={styles.amountContainer}>
                <Text style={styles.amountValue}>{feeding.amountMl}</Text>
                <Text style={styles.amountUnit}>מ"ל</Text>
              </View>
            )}
            <View style={styles.relativeContainer}>
              <Text style={styles.relativeIcon}>🕐</Text>
              <Text style={styles.relative}>{formatRelativeTime(feeding.time)}</Text>
            </View>
          </View>

          {feeding.user && (
            <View style={styles.recordedByRow}>
              <Text style={styles.recordedByIcon}>👤</Text>
              <Text style={styles.recordedBy}>נרשם ע"י {feeding.user.name}</Text>
            </View>
          )}
        </View>

        {onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(feeding.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  touchable: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  type: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  time: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  details: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  amountContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 2,
  },
  amountUnit: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  relativeContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  relativeIcon: {
    fontSize: 12,
    marginLeft: spacing.xs,
  },
  relative: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  recordedByRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  recordedByIcon: {
    fontSize: 12,
    marginLeft: spacing.xs,
  },
  recordedBy: {
    ...typography.caption,
    color: colors.textLight,
  },
  deleteButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  deleteIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
});
