import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Modal, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ReminderItem } from '../components/ReminderItem';
import { reminderApi } from '../services/api';
import { storage } from '../utils/storage';

const DEFAULT_REMINDERS = [
  { title: 'מדידת חום', time: '08:00' },
  { title: 'ויטמין D', time: '09:00' },
  { title: 'ויטמין ברזל', time: '12:00' },
];

export const RemindersScreen: React.FC = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReminders = async () => {
    try {
      const babyId = await storage.getSelectedBaby();
      if (!babyId) return;

      const res = await reminderApi.getAll(babyId);
      setReminders(res.data.reminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [])
  );

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await reminderApi.update(id, { isActive });
      setReminders(reminders.map(r => 
        r.id === id ? { ...r, isActive } : r
      ));
    } catch (error) {
      Alert.alert('שגיאה', 'לא הצלחנו לעדכן');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      'מחיקת תזכורת',
      'האם למחוק את התזכורת?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              await reminderApi.delete(id);
              setReminders(reminders.filter(r => r.id !== id));
            } catch (error) {
              Alert.alert('שגיאה', 'לא הצלחנו למחוק');
            }
          },
        },
      ]
    );
  };

  const handleAddReminder = async () => {
    if (!newTitle.trim() || !newTime.trim()) {
      Alert.alert('שגיאה', 'נא למלא את כל השדות');
      return;
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newTime)) {
      Alert.alert('שגיאה', 'פורמט שעה לא תקין (HH:MM)');
      return;
    }

    setSubmitting(true);
    try {
      const babyId = await storage.getSelectedBaby();
      if (!babyId) return;

      const res = await reminderApi.create({
        babyId,
        title: newTitle,
        dailyTime: newTime,
      });

      setReminders([...reminders, res.data.reminder]);
      setModalVisible(false);
      setNewTitle('');
      setNewTime('');
    } catch (error) {
      Alert.alert('שגיאה', 'לא הצלחנו להוסיף תזכורת');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddDefault = async (item: { title: string; time: string }) => {
    setSubmitting(true);
    try {
      const babyId = await storage.getSelectedBaby();
      if (!babyId) return;

      const res = await reminderApi.create({
        babyId,
        title: item.title,
        dailyTime: item.time,
      });

      setReminders([...reminders, res.data.reminder]);
    } catch (error) {
      Alert.alert('שגיאה', 'לא הצלחנו להוסיף תזכורת');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReminderItem
            reminder={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>תזכורות יומיות</Text>
            <Button
              title="+ הוסף"
              onPress={() => setModalVisible(true)}
              size="small"
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⏰</Text>
            <Text style={styles.emptyText}>אין תזכורות</Text>
            <Text style={styles.emptySubtext}>הוסף תזכורות מהירות:</Text>
            <View style={styles.defaultReminders}>
              {DEFAULT_REMINDERS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.defaultItem}
                  onPress={() => handleAddDefault(item)}
                >
                  <Text style={styles.defaultTitle}>{item.title}</Text>
                  <Text style={styles.defaultTime}>{item.time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>תזכורת חדשה</Text>
            
            <Input
              label="שם התזכורת"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="לדוגמה: ויטמין D"
            />
            
            <Input
              label="שעה (HH:MM)"
              value={newTime}
              onChangeText={setNewTime}
              placeholder="09:00"
              keyboardType="numbers-and-punctuation"
            />

            <View style={styles.modalActions}>
              <Button
                title="ביטול"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="הוסף"
                onPress={handleAddReminder}
                loading={submitting}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  defaultReminders: {
    width: '100%',
  },
  defaultItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  defaultTitle: {
    ...typography.body,
    color: colors.text,
  },
  defaultTime: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
