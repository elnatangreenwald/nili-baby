import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { AppointmentItem } from '../components/AppointmentItem';
import { appointmentApi } from '../services/api';
import { storage } from '../utils/storage';

const QUICK_APPOINTMENTS = [
  { title: 'טיפת חלב', icon: '🏥' },
  { title: 'רופא ילדים', icon: '👨‍⚕️' },
  { title: 'חיסון', icon: '💉' },
  { title: 'בדיקת שמיעה', icon: '👂' },
];

export const AppointmentsScreen: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newNotes, setNewNotes] = useState('');
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
  }, [appointments]);

  const loadAppointments = async () => {
    try {
      const babyId = await storage.getSelectedBaby();
      if (!babyId) return;

      const res = await appointmentApi.getAll(babyId, true);
      setAppointments(res.data.appointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAppointments();
    }, [])
  );

  const handleDelete = async (id: string) => {
    Alert.alert('מחיקת תור', 'האם למחוק את התור?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          try {
            await appointmentApi.delete(id);
            setAppointments(appointments.filter((a) => a.id !== id));
          } catch (error) {
            Alert.alert('שגיאה', 'לא הצלחנו למחוק');
          }
        },
      },
    ]);
  };

  const handleAddAppointment = async () => {
    if (!newTitle.trim() || !newDate.trim() || !newTime.trim()) {
      Alert.alert('שגיאה', 'נא למלא כותרת, תאריך ושעה');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newDate)) {
      Alert.alert('שגיאה', 'פורמט תאריך לא תקין (YYYY-MM-DD)');
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

      const datetime = `${newDate}T${newTime}:00`;

      const res = await appointmentApi.create({
        babyId,
        title: newTitle,
        datetime,
        location: newLocation || undefined,
        notes: newNotes || undefined,
      });

      setAppointments(
        [...appointments, res.data.appointment].sort(
          (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
        )
      );

      setModalVisible(false);
      resetForm();
      Alert.alert('✓ נוסף', 'התור נוסף בהצלחה');
    } catch (error) {
      Alert.alert('שגיאה', 'לא הצלחנו להוסיף תור');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewLocation('');
    setNewNotes('');
  };

  const handleQuickAdd = (title: string) => {
    setNewTitle(title);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>📅</Text>
        <Text style={styles.loadingText}>טוען תורים...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <AppointmentItem appointment={item} onDelete={handleDelete} />
          </Animated.View>
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerIcon}>📅</Text>
                <View>
                  <Text style={styles.title}>תורים</Text>
                  <Text style={styles.subtitle}>
                    {appointments.length} תורים קרובים
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
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>אין תורים קרובים</Text>
            <Text style={styles.emptyText}>הוסף תור חדש:</Text>
            <View style={styles.quickButtons}>
              {QUICK_APPOINTMENTS.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickButton}
                  onPress={() => handleQuickAdd(item.title)}
                >
                  <Text style={styles.quickIcon}>{item.icon}</Text>
                  <Text style={styles.quickTitle}>{item.title}</Text>
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
          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalIcon}>📅</Text>
                <Text style={styles.modalTitle}>תור חדש</Text>
              </View>

              <Input
                label="כותרת"
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="לדוגמה: טיפת חלב"
                icon="📝"
              />

              <Input
                label="תאריך (YYYY-MM-DD)"
                value={newDate}
                onChangeText={setNewDate}
                placeholder="2026-03-15"
                keyboardType="numbers-and-punctuation"
                icon="📆"
              />

              <Input
                label="שעה (HH:MM)"
                value={newTime}
                onChangeText={setNewTime}
                placeholder="10:00"
                keyboardType="numbers-and-punctuation"
                icon="🕐"
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
                placeholder="הערות נוספות"
                multiline
                icon="📋"
              />

              <View style={styles.modalActions}>
                <Button
                  title="ביטול"
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                  variant="outline"
                  style={styles.modalButton}
                />
                <Button
                  title="הוסף"
                  onPress={handleAddAppointment}
                  loading={submitting}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </ScrollView>
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
  quickButtons: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  quickButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    width: 100,
    ...shadows.sm,
  },
  quickIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  quickTitle: {
    ...typography.bodySmall,
    color: colors.text,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalScrollContent: {
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
