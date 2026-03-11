import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, Modal, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { AppointmentItem } from '../components/AppointmentItem';
import { appointmentApi } from '../services/api';
import { storage } from '../utils/storage';

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
    Alert.alert(
      'מחיקת תור',
      'האם למחוק את התור?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              await appointmentApi.delete(id);
              setAppointments(appointments.filter(a => a.id !== id));
            } catch (error) {
              Alert.alert('שגיאה', 'לא הצלחנו למחוק');
            }
          },
        },
      ]
    );
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

      setAppointments([...appointments, res.data.appointment].sort(
        (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
      ));
      
      setModalVisible(false);
      resetForm();
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
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppointmentItem
            appointment={item}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>תורים</Text>
            <Button
              title="+ הוסף"
              onPress={() => setModalVisible(true)}
              size="small"
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>אין תורים קרובים</Text>
            <Text style={styles.emptySubtext}>הוסף תור חדש:</Text>
            <View style={styles.quickButtons}>
              <Button
                title="טיפת חלב"
                onPress={() => handleQuickAdd('טיפת חלב')}
                variant="outline"
                size="small"
                style={styles.quickButton}
              />
              <Button
                title="רופא ילדים"
                onPress={() => handleQuickAdd('רופא ילדים')}
                variant="outline"
                size="small"
                style={styles.quickButton}
              />
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
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>תור חדש</Text>
              
              <Input
                label="כותרת"
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="לדוגמה: טיפת חלב"
              />
              
              <Input
                label="תאריך (YYYY-MM-DD)"
                value={newDate}
                onChangeText={setNewDate}
                placeholder="2024-03-15"
                keyboardType="numbers-and-punctuation"
              />
              
              <Input
                label="שעה (HH:MM)"
                value={newTime}
                onChangeText={setNewTime}
                placeholder="10:00"
                keyboardType="numbers-and-punctuation"
              />
              
              <Input
                label="מיקום (אופציונלי)"
                value={newLocation}
                onChangeText={setNewLocation}
                placeholder="כתובת או שם המקום"
              />
              
              <Input
                label="הערות (אופציונלי)"
                value={newNotes}
                onChangeText={setNewNotes}
                placeholder="הערות נוספות"
                multiline
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
  quickButtons: {
    flexDirection: 'row-reverse',
    gap: spacing.md,
  },
  quickButton: {
    minWidth: 120,
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
