import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  fonts,
} from '../utils/theme';
import { getTimeUntil, formatTime } from '../utils/helpers';
import { soundService } from '../services/sound';

interface NextFeedingTimerProps {
  nextFeedingTime: Date | string | null;
  lastFeedingTime?: Date | string | null;
  reminderMinutesBefore?: number;
}

export const NextFeedingTimer: React.FC<NextFeedingTimerProps> = ({
  nextFeedingTime,
  lastFeedingTime,
  reminderMinutesBefore = 10,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [reminderPlayed, setReminderPlayed] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isUrgent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isUrgent]);

  useEffect(() => {
    if (!nextFeedingTime) return;

    const updateTimer = () => {
      const next = new Date(nextFeedingTime);
      const now = new Date();
      const diffMs = next.getTime() - now.getTime();
      const diffMins = Math.floor(diffMs / 60000);

      setTimeLeft(getTimeUntil(next));
      setIsUrgent(diffMins <= reminderMinutesBefore && diffMins > 0);

      if (diffMins === reminderMinutesBefore && !reminderPlayed) {
        soundService.playNotification();
        setReminderPlayed(true);
      }

      if (diffMins > reminderMinutesBefore) {
        setReminderPlayed(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000);

    return () => clearInterval(interval);
  }, [nextFeedingTime, reminderMinutesBefore, reminderPlayed]);

  if (!nextFeedingTime) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🍼</Text>
          <Text style={styles.noDataText}>עדיין לא נרשמה האכלה</Text>
          <Text style={styles.noDataSubtext}>רשום האכלה כדי לראות את הטיימר</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isUrgent && styles.containerUrgent,
        {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      <View style={styles.topSection}>
        <View style={styles.header}>
          <Text style={styles.icon}>⏰</Text>
          <Text style={styles.title}>האכלה הבאה</Text>
        </View>
        {isUrgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentBadgeText}>בקרוב!</Text>
          </View>
        )}
      </View>

      <View style={styles.timerSection}>
        <Text style={[styles.timeLeft, isUrgent && styles.timeLeftUrgent]}>
          {timeLeft}
        </Text>
        <View style={styles.scheduledRow}>
          <Text style={styles.scheduledIcon}>🕐</Text>
          <Text style={styles.scheduledTime}>
            בשעה {formatTime(nextFeedingTime)}
          </Text>
        </View>
      </View>

      {lastFeedingTime && (
        <View style={styles.lastFeedingRow}>
          <Text style={styles.lastFeedingIcon}>✓</Text>
          <Text style={styles.lastFeeding}>
            האכלה אחרונה: {formatTime(lastFeedingTime)}
          </Text>
        </View>
      )}

      {isUrgent && (
        <View style={styles.urgentAlert}>
          <Text style={styles.urgentAlertIcon}>🔔</Text>
          <Text style={styles.urgentAlertText}>הגיע הזמן להתכונן להאכלה!</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  containerUrgent: {
    backgroundColor: colors.urgentBackground,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  topSection: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  icon: {
    fontSize: 28,
    marginLeft: spacing.sm,
  },
  title: {
    ...typography.h3,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  urgentBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  urgentBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  timerSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  timeLeft: {
    ...typography.timer,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  timeLeftUrgent: {
    color: colors.urgentText,
  },
  scheduledRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  scheduledIcon: {
    fontSize: 16,
    marginLeft: spacing.xs,
  },
  scheduledTime: {
    ...typography.body,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  lastFeedingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lastFeedingIcon: {
    fontSize: 14,
    color: colors.success,
    marginLeft: spacing.xs,
  },
  lastFeeding: {
    ...typography.bodySmall,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  noDataText: {
    ...typography.body,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  noDataSubtext: {
    ...typography.bodySmall,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  urgentAlert: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  urgentAlertIcon: {
    fontSize: 18,
    marginLeft: spacing.sm,
  },
  urgentAlertText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
});
