import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
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
        <Text style={styles.noDataText}>עדיין לא נרשמה האכלה</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isUrgent && styles.containerUrgent]}>
      <View style={styles.header}>
        <Text style={styles.icon}>⏰</Text>
        <Text style={styles.title}>האכלה הבאה</Text>
      </View>
      
      <Text style={[styles.timeLeft, isUrgent && styles.timeLeftUrgent]}>
        {timeLeft}
      </Text>
      
      <Text style={styles.scheduledTime}>
        בשעה {formatTime(nextFeedingTime)}
      </Text>
      
      {lastFeedingTime && (
        <Text style={styles.lastFeeding}>
          האכלה אחרונה: {formatTime(lastFeedingTime)}
        </Text>
      )}
      
      {isUrgent && (
        <View style={styles.urgentBadge}>
          <Text style={styles.urgentText}>הגיע הזמן להתכונן!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  containerUrgent: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  timeLeft: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
    marginVertical: spacing.sm,
  },
  timeLeftUrgent: {
    color: colors.primaryDark,
  },
  scheduledTime: {
    ...typography.body,
    color: colors.textSecondary,
  },
  lastFeeding: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  noDataText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  urgentBadge: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  urgentText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
