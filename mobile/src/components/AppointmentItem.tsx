import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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

export const AppointmentItem: React.FC<AppointmentItemProps> = ({
  appointment,
  onPress,
  onDelete,
}) => {
  const isUpcoming = new Date(appointment.datetime) > new Date();
  const isMilkDrop = appointment.title.includes('טיפת חלב');

  return (
    <TouchableOpacity 
      style={[styles.container, isMilkDrop && styles.containerMilkDrop]}
      onPress={() => onPress?.(appointment.id)}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{isMilkDrop ? '🍼' : '🏥'}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{appointment.title}</Text>
        <Text style={styles.datetime}>{formatDateTime(appointment.datetime)}</Text>
        
        {appointment.location && (
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location}>{appointment.location}</Text>
          </View>
        )}
        
        {appointment.notes && (
          <Text style={styles.notes} numberOfLines={2}>{appointment.notes}</Text>
        )}
        
        {isUpcoming && (
          <View style={styles.timeLeftBadge}>
            <Text style={styles.timeLeftText}>{getTimeUntil(appointment.datetime)}</Text>
          </View>
        )}
      </View>
      
      {onDelete && (
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => onDelete(appointment.id)}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  containerMilkDrop: {
    borderRightWidth: 4,
    borderRightColor: colors.primary,
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
  title: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  datetime: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  locationRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  locationIcon: {
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  location: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  notes: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  timeLeftBadge: {
    backgroundColor: colors.primaryLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-end',
    marginTop: spacing.sm,
  },
  timeLeftText: {
    ...typography.caption,
    color: colors.primaryDark,
    fontWeight: '500',
  },
  deleteButton: {
    padding: spacing.xs,
  },
  deleteIcon: {
    fontSize: 18,
  },
});
