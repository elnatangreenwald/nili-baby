import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';
import { formatDateTime, getTimeUntil } from '../utils/helpers';

interface AppointmentItemProps {
  appointment: {
    id: string;
    title: string;
    datetime: string;
    location?: string;
    notes?: string;
  };
  onPress?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const getAppointmentIcon = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('טיפת חלב')) return '🍼';
  if (lowerTitle.includes('רופא ילדים') || lowerTitle.includes('ילדים')) return '👨‍⚕️';
  if (lowerTitle.includes('חיסון')) return '💉';
  if (lowerTitle.includes('שמיעה')) return '👂';
  if (lowerTitle.includes('ראייה') || lowerTitle.includes('עיניים')) return '👁️';
  if (lowerTitle.includes('שיניים')) return '🦷';
  return '🏥';
};

const getAppointmentColor = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('טיפת חלב')) return colors.primary;
  if (lowerTitle.includes('חיסון')) return '#FF7043';
  if (lowerTitle.includes('רופא')) return '#4FC3F7';
  return '#81C784';
};

export const AppointmentItem: React.FC<AppointmentItemProps> = ({
  appointment,
  onPress,
  onDelete,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isUpcoming = new Date(appointment.datetime) > new Date();
  const icon = getAppointmentIcon(appointment.title);
  const accentColor = getAppointmentColor(appointment.title);

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
      style={[styles.container, { transform: [{ scale: scaleAnim }] }]}
    >
      <TouchableOpacity
        style={[styles.touchable, { borderRightColor: accentColor }]}
        onPress={() => onPress?.(appointment.id)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${accentColor}20` }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{appointment.title}</Text>
            {isUpcoming && (
              <View style={[styles.statusBadge, { backgroundColor: `${accentColor}20` }]}>
                <Text style={[styles.statusText, { color: accentColor }]}>קרוב</Text>
              </View>
            )}
          </View>

          <View style={styles.datetimeRow}>
            <Text style={styles.datetimeIcon}>📅</Text>
            <Text style={styles.datetime}>{formatDateTime(appointment.datetime)}</Text>
          </View>

          {appointment.location && (
            <View style={styles.locationRow}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.location}>{appointment.location}</Text>
            </View>
          )}

          {appointment.notes && (
            <View style={styles.notesRow}>
              <Text style={styles.notesIcon}>📝</Text>
              <Text style={styles.notes} numberOfLines={2}>
                {appointment.notes}
              </Text>
            </View>
          )}

          {isUpcoming && (
            <View style={[styles.timeLeftBadge, { backgroundColor: `${accentColor}15` }]}>
              <Text style={styles.timeLeftIcon}>⏱️</Text>
              <Text style={[styles.timeLeftText, { color: accentColor }]}>
                {getTimeUntil(appointment.datetime)}
              </Text>
            </View>
          )}
        </View>

        {onDelete && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(appointment.id)}
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
    marginBottom: spacing.md,
  },
  touchable: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderRightWidth: 4,
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
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.body,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  datetimeRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  datetimeIcon: {
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  datetime: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationIcon: {
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  location: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  notesRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  notesIcon: {
    fontSize: 12,
    marginLeft: spacing.xs,
    marginTop: 2,
  },
  notes: {
    ...typography.caption,
    color: colors.textLight,
    flex: 1,
    textAlign: 'right',
  },
  timeLeftBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  timeLeftIcon: {
    fontSize: 12,
    marginLeft: spacing.xs,
  },
  timeLeftText: {
    fontSize: 12,
    fontWeight: '600',
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
