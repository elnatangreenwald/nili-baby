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
import { AppointmentItem } from '../components/AppointmentItem';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { appointmentApi, babyApi } from '../services/api';

interface QuickAppointment {
  title: string;
  icon: string;
  color: string;
}

const QUICK_APPOINTMENTS: QuickAppointment[] = [
  { title: 'טיפת חלב', icon: '🍼', color: colors.appointmentMilkDrop },
  { title: 'רופא ילדים', icon: '👨‍⚕️', color: colors.appointmentDoctor },
  { title: 'חיסון', icon: '💉', color: colors.appointmentVaccine },
  { title: 'בדיקת שמיעה', icon: '👂', color: colors.appointmentDefault },
];

export const AppointmentsScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [baby, setBaby] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newNotes, setNewNotes] = useState('');
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

        const appointmentsResponse = await appointmentApi.getAppointments(
          currentBaby.id
        );
        setAppointments(appointmentsResponse.data);
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

  const handleDelete = async (id: string) => {
    try {
      await appointmentApi.deleteAppointment(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const handleAddAppointment = async () => {
    if (!baby || !newTitle.trim() || !newDate.trim() || !newTime.trim()) return;

    setLoading(true);
    try {
      const datetime = new Date(`${newDate}T${newTime}`);
      await appointmentApi.addAppointment({
        babyId: baby.id,
        title: newTitle.trim(),
        datetime: datetime.toISOString(),
        location: newLocation.trim() || undefined,
        notes: newNotes.trim() || undefined,
      });
      resetForm();
      setModalVisible(false);
      await loadData();
    } catch (error) {
      console.error('Error adding appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (appointment: QuickAppointment) => {
    setNewTitle(appointment.title);
    setModalVisible(true);
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewLocation('');
    setNewNotes('');
  };

  const upcomingAppointments = appointments.filter(
    (a) => new Date(a.datetime) > new Date()
  );
  const pastAppointments = appointments.filter(
    (a) => new Date(a.datetime) <= new Date()
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{upcomingAppointments.length}</Text>
            <Text style={styles.statLabel}>תורים קרובים</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.textLight }]}>
              {pastAppointments.length}
            </Text>
            <Text style={styles.statLabel}>תורים שעברו</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={appointments}
        renderItem={({ item }) => (
          <AppointmentItem appointment={item} onDelete={handleDelete} />
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
              {QUICK_APPOINTMENTS.map((appointment, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.quickAddButton,
                    { borderRightColor: appointment.color },
                  ]}
                  onPress={() => handleQuickAdd(appointment)}
                >
                  <View
                    style={[
                      styles.quickAddIcon,
                      { backgroundColor: `${appointment.color}20` },
                    ]}
                  >
                    <Text style={styles.quickAddEmoji}>{appointment.icon}</Text>
                  </View>
                  <Text style={styles.quickAddLabel}>{appointment.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>אין תורים</Text>
            <Text style={styles.emptySubtitle}>
              הוסף תורים לרופא, טיפת חלב ועוד
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
              <Text style={styles.modalTitle}>תור חדש</Text>
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setModalVisible(false);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <Input
                label="סוג התור"
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="לדוגמה: טיפת חלב"
                icon="🏥"
              />

              <Input
                label="תאריך"
                value={newDate}
                onChangeText={setNewDate}
                placeholder="YYYY-MM-DD (לדוגמה: 2026-03-15)"
                keyboardType="numbers-and-punctuation"
                icon="📅"
                hint="הזן תאריך בפורמט שנה-חודש-יום"
              />

              <Input
                label="שעה"
                value={newTime}
                onChangeText={setNewTime}
                placeholder="HH:MM (לדוגמה: 10:30)"
                keyboardType="numbers-and-punctuation"
                icon="🕐"
                hint="הזן שעה בפורמט 24 שעות"
              />

              <Input
                label="מיקום (אופציונלי)"
                value={newLocation}
                onChangeText={setNewLocation}
                placeholder="כתובת או שם המקום"
                icon="📍"
              />

              <Input
                label="הערות (אופציונלי)"
                value={newNotes}
                onChangeText={setNewNotes}
                placeholder="הערות נוספות..."
                multiline
                icon="📝"
              />

              <Button
                title="הוסף תור"
                onPress={handleAddAppointment}
                loading={loading}
                disabled={!newTitle.trim() || !newDate.trim() || !newTime.trim()}
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
    borderRightWidth: 4,
    ...shadows.sm,
  },
  quickAddIcon: {
    width: iconContainerSizes.md,
    height: iconContainerSizes.md,
    borderRadius: iconContainerSizes.md / 2,
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
    maxHeight: '90%',
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
    marginBottom: spacing.lg,
  },
});
