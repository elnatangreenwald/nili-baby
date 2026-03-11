import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Modal,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  fonts,
  iconContainerSizes,
} from '../utils/theme';
import { ReminderItem } from '../components/ReminderItem';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { reminderApi, babyApi } from '../services/api';

interface QuickReminder {
  title: string;
  icon: string;
  defaultTime: string;
}

const QUICK_REMINDERS: QuickReminder[] = [
  { title: 'מדידת חום', icon: '🌡️', defaultTime: '08:00' },
  { title: 'ויטמין D', icon: '☀️', defaultTime: '09:00' },
  { title: 'טיפות ברזל', icon: '💊', defaultTime: '12:00' },
  { title: 'אמבטיה', icon: '🛁', defaultTime: '19:00' },
];

export const RemindersScreen: React.FC = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [baby, setBaby] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    try {
      const babiesResponse = await babyApi.getBabies();
      const babies = babiesResponse.data;

      if (babies.length > 0) {
        const currentBaby = babies[0];
        setBaby(currentBaby);

        const remindersResponse = await reminderApi.getReminders(currentBaby.id);
        setReminders(remindersResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await reminderApi.updateReminder(id, { isActive });
      await loadData();
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await reminderApi.deleteReminder(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const handleAddReminder = async () => {
    if (!baby || !newTitle.trim() || !newTime.trim()) return;

    setLoading(true);
    try {
      await reminderApi.addReminder({
        babyId: baby.id,
        title: newTitle.trim(),
        dailyTime: newTime,
      });
      setNewTitle('');
      setNewTime('');
      setModalVisible(false);
      await loadData();
    } catch (error) {
      console.error('Error adding reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (reminder: QuickReminder) => {
    if (!baby) return;

    setLoading(true);
    try {
      await reminderApi.addReminder({
        babyId: baby.id,
        title: reminder.title,
        dailyTime: reminder.defaultTime,
      });
      await loadData();
    } catch (error) {
      console.error('Error adding reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeReminders = reminders.filter((r) => r.isActive);
  const inactiveReminders = reminders.filter((r) => !r.isActive);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeReminders.length}</Text>
            <Text style={styles.statLabel}>פעילות</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.textLight }]}>
              {inactiveReminders.length}
            </Text>
            <Text style={styles.statLabel}>מושבתות</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={reminders}
        renderItem={({ item }) => (
          <ReminderItem
            reminder={item}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.quickAddSection}>
            <Text style={styles.sectionTitle}>הוספה מהירה</Text>
            <View style={styles.quickAddGrid}>
              {QUICK_REMINDERS.map((reminder, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickAddButton}
                  onPress={() => handleQuickAdd(reminder)}
                  disabled={loading}
                >
                  <View style={styles.quickAddIcon}>
                    <Text style={styles.quickAddEmoji}>{reminder.icon}</Text>
                  </View>
                  <Text style={styles.quickAddLabel}>{reminder.title}</Text>
                  <Text style={styles.quickAddTime}>{reminder.defaultTime}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⏰</Text>
            <Text style={styles.emptyTitle}>אין תזכורות</Text>
            <Text style={styles.emptySubtitle}>
              הוסף תזכורות יומיות לטיפול בתינוק
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>תזכורת חדשה</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <Input
                label="שם התזכורת"
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="לדוגמה: מדידת חום"
                icon="📝"
              />

              <Input
                label="שעה יומית"
                value={newTime}
                onChangeText={setNewTime}
                placeholder="HH:MM (לדוגמה: 08:00)"
                keyboardType="numbers-and-punctuation"
                icon="🕐"
                hint="הזן שעה בפורמט 24 שעות"
              />

              <Button
                title="הוסף תזכורת"
                onPress={handleAddReminder}
                loading={loading}
                disabled={!newTitle.trim() || !newTime.trim()}
                style={styles.addButton}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  quickAddSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'right',
  },
  quickAddGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAddButton: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickAddIcon: {
    width: iconContainerSizes.md,
    height: iconContainerSizes.md,
    borderRadius: iconContainerSizes.md / 2,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickAddEmoji: {
    fontSize: 24,
  },
  quickAddLabel: {
    fontSize: 14,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  quickAddTime: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  fabIcon: {
    fontSize: 32,
    color: colors.white,
    fontFamily: fonts.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  addButton: {
    marginTop: spacing.md,
  },
});
