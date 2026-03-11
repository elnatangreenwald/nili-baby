import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  Animated,
  TouchableOpacity,
} from 'react-native';
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

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
  onLogout,
}) => {
  const [baby, setBaby] = useState<any>(null);
  const [feedingInterval, setFeedingInterval] = useState('180');
  const [targetAmount, setTargetAmount] = useState('120');
  const [shareEmail, setShareEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadBaby();
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
      Alert.alert('✓ נשמר', 'ההגדרות עודכנו בהצלחה');
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
      Alert.alert('✓ הצלחה', 'התינוק שותף בהצלחה');
      setShareEmail('');
      loadBaby();
    } catch (error: any) {
      Alert.alert('שגיאה', error.response?.data?.error || 'לא הצלחנו לשתף');
    } finally {
      setSharing(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('התנתקות', 'האם להתנתק?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'התנתק',
        style: 'destructive',
        onPress: async () => {
          await storage.clearAll();
          onLogout();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>⚙️</Text>
        <Text style={styles.loadingText}>טוען הגדרות...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View style={styles.header}>
          <Text style={styles.headerIcon}>⚙️</Text>
          <Text style={styles.headerTitle}>הגדרות</Text>
        </View>

        <SettingsSection icon="🍼" title="הגדרות האכלה">
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>מרווח בין האכלות</Text>
              <Text style={styles.settingHint}>דקות</Text>
            </View>
            <View style={styles.settingInputContainer}>
              <TextInput
                style={styles.settingInput}
                value={feedingInterval}
                onChangeText={setFeedingInterval}
                keyboardType="number-pad"
                placeholder="180"
              />
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>כמות יעד</Text>
              <Text style={styles.settingHint}>מ"ל</Text>
            </View>
            <View style={styles.settingInputContainer}>
              <TextInput
                style={styles.settingInput}
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="number-pad"
                placeholder="120"
              />
            </View>
          </View>

          <Button
            title="💾 שמור הגדרות"
            onPress={handleSave}
            loading={saving}
            style={styles.saveButton}
          />
        </SettingsSection>

        <SettingsSection icon="👥" title="שיתוף עם בן/בת זוג">
          {baby?.users && baby.users.length > 1 && (
            <View style={styles.sharedWith}>
              <Text style={styles.sharedLabel}>משותף עם:</Text>
              {baby.users.map((u: any) => (
                <View key={u.user.id} style={styles.sharedUserRow}>
                  <Text style={styles.sharedUserIcon}>👤</Text>
                  <View style={styles.sharedUserInfo}>
                    <Text style={styles.sharedUserName}>{u.user.name}</Text>
                    <Text style={styles.sharedUserEmail}>{u.user.email}</Text>
                  </View>
                </View>
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
            icon="📧"
          />

          <Button
            title="🔗 שתף"
            onPress={handleShare}
            loading={sharing}
            variant="secondary"
          />
        </SettingsSection>

        <SettingsSection icon="👶" title="ניהול תינוקות">
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AddBaby')}
          >
            <Text style={styles.menuIcon}>➕</Text>
            <Text style={styles.menuText}>הוסף תינוק</Text>
            <Text style={styles.menuArrow}>←</Text>
          </TouchableOpacity>
        </SettingsSection>

        <SettingsSection icon="🚪" title="חשבון">
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>התנתק</Text>
          </TouchableOpacity>
        </SettingsSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Nili Baby v1.0.0</Text>
          <Text style={styles.footerSubtext}>עם אהבה לכל ההורים 💕</Text>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const SettingsSection: React.FC<{
  icon: string;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <Card style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </Card>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
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
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  headerIcon: {
    fontSize: 32,
    marginLeft: spacing.sm,
  },
  headerTitle: {
    ...typography.h1,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionIcon: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  settingItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  settingLabel: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  settingHint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  settingInputContainer: {
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 100,
  },
  settingInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  saveButton: {
    marginTop: spacing.md,
  },
  sharedWith: {
    backgroundColor: colors.secondaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sharedLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  sharedUserRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  sharedUserIcon: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  sharedUserInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  sharedUserName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  sharedUserEmail: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  menuIcon: {
    fontSize: 24,
    marginLeft: spacing.md,
  },
  menuText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  menuArrow: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: '#FFF0F0',
    borderRadius: borderRadius.lg,
  },
  logoutIcon: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  logoutText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  footerSubtext: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
});
