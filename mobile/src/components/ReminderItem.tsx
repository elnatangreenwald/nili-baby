import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Animated,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';

interface ReminderItemProps {
  reminder: {
    id: string;
    title: string;
    dailyTime: string;
    isActive: boolean;
  };
  onToggle: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
}

const getReminderIcon = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('חום') || lowerTitle.includes('מדידת')) return '🌡️';
  if (lowerTitle.includes('ויטמין d') || lowerTitle.includes('שמש')) return '☀️';
  if (lowerTitle.includes('ברזל') || lowerTitle.includes('ויטמין')) return '💊';
  if (lowerTitle.includes('אמבטיה') || lowerTitle.includes('רחצה')) return '🛁';
  if (lowerTitle.includes('שינה') || lowerTitle.includes('לישון')) return '😴';
  if (lowerTitle.includes('משחק')) return '🧸';
  return '⏰';
};

export const ReminderItem: React.FC<ReminderItemProps> = ({
  reminder,
  onToggle,
  onDelete,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const icon = getReminderIcon(reminder.title);

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
    <Animated.View
      style={[
        styles.container,
        !reminder.isActive && styles.containerInactive,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchable}
      >
        <View
          style={[
            styles.iconContainer,
            !reminder.isActive && styles.iconContainerInactive,
          ]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.content}>
          <Text
            style={[styles.title, !reminder.isActive && styles.titleInactive]}
          >
            {reminder.title}
          </Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeIcon}>🕐</Text>
            <Text
              style={[styles.time, !reminder.isActive && styles.timeInactive]}
            >
              {reminder.dailyTime}
            </Text>
            <Text style={styles.dailyLabel}>יומי</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Switch
            value={reminder.isActive}
            onValueChange={(value) => onToggle(reminder.id, value)}
            trackColor={{ false: colors.border, true: `${colors.primary}50` }}
            thumbColor={reminder.isActive ? colors.primary : colors.textLight}
            ios_backgroundColor={colors.border}
          />

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(reminder.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  containerInactive: {
    opacity: 0.7,
  },
  touchable: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  iconContainerInactive: {
    backgroundColor: colors.background,
  },
  icon: {
    fontSize: 26,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  titleInactive: {
    color: colors.textSecondary,
  },
  timeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  timeIcon: {
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  time: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  timeInactive: {
    color: colors.textSecondary,
  },
  dailyLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  deleteIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
});
