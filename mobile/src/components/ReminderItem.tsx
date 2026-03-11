import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../utils/theme';

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

export const ReminderItem: React.FC<ReminderItemProps> = ({
  reminder,
  onToggle,
  onDelete,
}) => {
  return (
    <View style={[styles.container, !reminder.isActive && styles.containerInactive]}>
      <View style={styles.content}>
        <Text style={[styles.title, !reminder.isActive && styles.titleInactive]}>
          {reminder.title}
        </Text>
        <Text style={styles.time}>{reminder.dailyTime}</Text>
      </View>
      
      <View style={styles.actions}>
        <Switch
          value={reminder.isActive}
          onValueChange={(value) => onToggle(reminder.id, value)}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={reminder.isActive ? colors.primary : colors.textLight}
        />
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => onDelete(reminder.id)}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
  },
  containerInactive: {
    opacity: 0.6,
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
  titleInactive: {
    color: colors.textLight,
  },
  time: {
    ...typography.bodySmall,
    color: colors.primary,
    marginTop: spacing.xs,
    textAlign: 'right',
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
  },
});
