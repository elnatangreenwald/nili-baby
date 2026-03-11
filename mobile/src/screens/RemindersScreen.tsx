import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ReminderItem } from '../components/ReminderItem';
import { reminderApi } from '../services/api';
import { storage } from '../utils/storage';

const { width } = Dimensions.get('window');

const DEFAULT_REMINDERS = [
  { title: 'מדידת חום', time: '08:00', icon: '🌡️' },
  { title: 'ויטמין D', time: '09:00', icon: '☀️' },
  { title: 'ויטמין ברזל', time: '12:00', icon: '💊' },
  { title: 'אמבטיה', time: '19:00', icon: '🛁' },
];

export const RemindersScreen: React.FC = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [reminders]);

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
      setReminders(reminders.map((r) => (r.id === id ? { ...r, isActive } : r)));
    } catch (error) {
      Alert.alert('שגיאה', 'לא הצלחנו לעדכן');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('מחיקת תזכורת', 'האם למחוק את התזכורת?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          try {
            await reminderApi.delete(id);
            setReminders(reminders.filter((r) => r.id !== id));
          } catch (error) {
            Alert.alert('שגיאה', 'לא הצלחנו למחוק');
          }
        },
      },
    ]);
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
      Alert.alert('✓ נוסף', `התזכורת "${item.title}" נוספה בהצלחה`);
    } catch (error) {
      Alert.alert('שגיאה', 'לא הצלחנו להוסיף תזכורת');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>⏰</Text>
        <Text style={styles.loadingText}>טוען תזכורות...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <ReminderItem
              reminder={item}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          </Animated.View>
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerIcon}>⏰</Text>
                <View>
                  <Text style={styles.title}>תזכורות יומיות</Text>
                  <Text style={styles.subtitle}>
                    {reminders.filter((r) => r.isActive).length} פעילות
                  </Text>
                </View>
              </View>
              <Button
                title="➕ הוסף"
                onPress={() => setModalVisible(true)}
                size="small"
              />
            </View>
          </Animated.View>
        }
        ListEmptyComponent={
          <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
            <Text style={styles.emptyIcon}>⏰</Text>
            <Text style={styles.emptyTitle}>אין תזכורות</Text>
            <Text style={styles.emptyText}>הוסף תזכורות מהירות:</Text>
            <View style={styles.defaultReminders}>
              {DEFAULT_REMINDERS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.defaultItem}
                  onPress={() => handleAddDefault(item)}
                  disabled={submitting}
                >
                  <Text style={styles.defaultIcon}>{item.icon}</Text>
                  <View style={styles.defaultInfo}>
                    <Text style={styles.defaultTitle}>{item.title}</Text>
                    <Text style={styles.defaultTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.addIcon}>➕</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>⏰</Text>
              <Text style={styles.modalTitle}>תזכורת חדשה</Text>
            </View>

            <Input
              label="שם התזכורת"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="לדוגמה: ויטמין D"
              icon="📝"
            />

            <Input
              label="שעה (HH:MM)"
              value={newTime}
              onChangeText={setNewTime}
              placeholder="09:00"
              keyboardType="numbers-and-punctuation"
              icon="🕐"
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
  loadingEmoji: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 40,
    marginLeft: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  defaultReminders: {
    width: '100%',
  },
  defaultItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  defaultIcon: {
    fontSize: 32,
    marginLeft: spacing.md,
  },
  defaultInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  defaultTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  defaultTime: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  addIcon: {
    fontSize: 20,
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
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  modalIcon: {
    fontSize: 32,
    marginLeft: spacing.sm,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
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
