import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { babyApi } from '../services/api';
import { storage } from '../utils/storage';

interface SettingsScreenProps {
  navigation: any;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation, onLogout }) => {
  const [baby, setBaby] = useState<any>(null);
  const [feedingInterval, setFeedingInterval] = useState('180');
  const [targetAmount, setTargetAmount] = useState('120');
  const [shareEmail, setShareEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    loadBaby();
  }, []);

  const loadBaby = async () => {
    try {
      const babyId = await storage.getSelectedBaby();
      if (!babyId) return;

      const res = await babyApi.getOne(babyId);
      setBaby(res.data.baby);
      setFeedingInterval(res.data.baby.feedingIntervalMinutes.toString());
      setTargetAmount(res.data.baby.targetAmountMl.toString());
    } catch (error) {
      console.error('Error loading baby:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!baby) return;

    const interval = parseInt(feedingInterval);
    const amount = parseInt(targetAmount);

    if (isNaN(interval) || interval < 30 || interval > 480) {
      Alert.alert('שגיאה', 'מרווח האכלות חייב להיות בין 30 ל-480 דקות');
      return;
    }

    if (isNaN(amount) || amount < 10 || amount > 500) {
      Alert.alert('שגיאה', 'כמות יעד חייבת להיות בין 10 ל-500 מ"ל');
      return;
    }

    setSaving(true);
    try {
      await babyApi.update(baby.id, {
        feedingIntervalMinutes: interval,
        targetAmountMl: amount,
      });
      Alert.alert('נשמר', 'ההגדרות עודכנו בהצלחה');
    } catch (error) {
      Alert.alert('שגיאה', 'לא הצלחנו לשמור');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!baby || !shareEmail.trim()) {
      Alert.alert('שגיאה', 'נא להזין אימייל');
      return;
    }

    setSharing(true);
    try {
      await babyApi.share(baby.id, shareEmail);
      Alert.alert('הצלחה', 'התינוק שותף בהצלחה');
      setShareEmail('');
      loadBaby();
    } catch (error: any) {
      Alert.alert('שגיאה', error.response?.data?.error || 'לא הצלחנו לשתף');
    } finally {
      setSharing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'התנתקות',
      'האם להתנתק?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'התנתק',
          style: 'destructive',
          onPress: async () => {
            await storage.clearAll();
            onLogout();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>הגדרות האכלה</Text>
      
      <Card style={styles.card}>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>מרווח בין האכלות (דקות)</Text>
          <TextInput
            style={styles.settingInput}
            value={feedingInterval}
            onChangeText={setFeedingInterval}
            keyboardType="number-pad"
            placeholder="180"
          />
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>כמות יעד (מ"ל)</Text>
          <TextInput
            style={styles.settingInput}
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="number-pad"
            placeholder="120"
          />
        </View>

        <Button
          title="שמור הגדרות"
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />
      </Card>

      <Text style={styles.sectionTitle}>שיתוף עם בן/בת זוג</Text>
      
      <Card style={styles.card}>
        {baby?.users && baby.users.length > 1 && (
          <View style={styles.sharedWith}>
            <Text style={styles.sharedLabel}>משותף עם:</Text>
            {baby.users.map((u: any) => (
              <Text key={u.user.id} style={styles.sharedUser}>
                {u.user.name} ({u.user.email})
              </Text>
            ))}
          </View>
        )}

        <Input
          label="אימייל של בן/בת הזוג"
          value={shareEmail}
          onChangeText={setShareEmail}
          placeholder="partner@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Button
          title="שתף"
          onPress={handleShare}
          loading={sharing}
          variant="secondary"
        />
      </Card>

      <Card style={styles.card}>
        <Button
          title="התנתק"
          onPress={handleLogout}
          variant="outline"
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
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
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'right',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  settingLabel: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  settingInput: {
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    minWidth: 80,
  },
  saveButton: {
    marginTop: spacing.sm,
  },
  sharedWith: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.md,
  },
  sharedLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
  sharedUser: {
    ...typography.body,
    color: colors.text,
    textAlign: 'right',
  },
});
