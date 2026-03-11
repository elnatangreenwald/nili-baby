import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
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
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { babyApi, userApi } from '../services/api';
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
  const [user, setUser] = useState<any>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<any[]>([]);

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
      const userData = await storage.getUser();
      setUser(userData);

      const babiesResponse = await babyApi.getBabies();
      const babies = babiesResponse.data;

      if (babies.length > 0) {
        setBaby(babies[0]);
        if (babies[0].users) {
          setSharedUsers(babies[0].users);
        }
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

  const handleShare = async () => {
    if (!baby || !shareEmail.trim()) return;

    setLoading(true);
    try {
      await babyApi.shareBaby(baby.id, shareEmail.trim());
      setShareEmail('');
      Alert.alert('הצלחה', 'הגישה שותפה בהצלחה');
      await loadData();
    } catch (error: any) {
      Alert.alert('שגיאה', error.response?.data?.error || 'שגיאה בשיתוף');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('התנתקות', 'האם אתה בטוח שברצונך להתנתק?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'התנתק',
        style: 'destructive',
        onPress: async () => {
          await storage.clear();
          onLogout();
        },
      },
    ]);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <SettingsSection title="פרטי משתמש" icon="👤">
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarEmoji}>👤</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || 'משתמש'}</Text>
              <Text style={styles.userEmail}>{user?.email || ''}</Text>
            </View>
          </View>
        </SettingsSection>

        {baby && (
          <>
            <SettingsSection title="פרטי התינוק" icon="👶">
              <SettingsRow
                icon="👶"
                label="שם"
                value={baby.name}
              />
              <SettingsRow
                icon="🎂"
                label="תאריך לידה"
                value={new Date(baby.birthDate).toLocaleDateString('he-IL')}
              />
              <SettingsRow
                icon="⏱️"
                label="מרווח האכלות"
                value={`${baby.feedingIntervalHours} שעות`}
              />
              <SettingsRow
                icon="🎯"
                label="יעד להאכלה"
                value={`${baby.targetAmountMl || 120} מ"ל`}
              />
              <SettingsRow
                icon="🔔"
                label="תזכורת לפני"
                value={`${baby.reminderMinutesBefore || 10} דקות`}
              />
            </SettingsSection>

            <SettingsSection title="שיתוף גישה" icon="👥">
              <Text style={styles.shareDescription}>
                שתף גישה לתינוק עם בן/בת זוג או מטפלת
              </Text>

              <Input
                label="אימייל לשיתוף"
                value={shareEmail}
                onChangeText={setShareEmail}
                placeholder="הכנס אימייל"
                keyboardType="email-address"
                autoCapitalize="none"
                icon="📧"
              />

              <Button
                title="שתף גישה"
                onPress={handleShare}
                loading={loading}
                disabled={!shareEmail.trim()}
                variant="secondary"
                style={styles.shareButton}
              />

              {sharedUsers.length > 0 && (
                <View style={styles.sharedUsersSection}>
                  <Text style={styles.sharedUsersTitle}>משתמשים עם גישה</Text>
                  {sharedUsers.map((sharedUser, index) => (
                    <View key={index} style={styles.sharedUserItem}>
                      <View style={styles.sharedUserAvatar}>
                        <Text style={styles.sharedUserEmoji}>👤</Text>
                      </View>
                      <View style={styles.sharedUserInfo}>
                        <Text style={styles.sharedUserName}>
                          {sharedUser.name}
                        </Text>
                        <Text style={styles.sharedUserEmail}>
                          {sharedUser.email}
                        </Text>
                      </View>
                      {sharedUser.id === user?.id && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>אתה</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </SettingsSection>
          </>
        )}

        <SettingsSection title="פעולות" icon="⚡">
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddBaby')}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>➕</Text>
            </View>
            <Text style={styles.actionLabel}>הוסף תינוק</Text>
            <Text style={styles.actionArrow}>‹</Text>
          </TouchableOpacity>
        </SettingsSection>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>התנתק</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Nili Baby v1.0</Text>
          <Text style={styles.footerSubtext}>עם אהבה לכל ההורים החדשים 💕</Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

const SettingsSection: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <Card variant="default" padding="md">
      {children}
    </Card>
  </View>
);

const SettingsRow: React.FC<{
  icon: string;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <View style={styles.settingsRow}>
    <View style={styles.settingsRowLeft}>
      <Text style={styles.settingsRowIcon}>{icon}</Text>
      <Text style={styles.settingsRowLabel}>{label}</Text>
    </View>
    <Text style={styles.settingsRowValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionIcon: {
    fontSize: 20,
    marginLeft: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  userInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  userAvatar: {
    width: iconContainerSizes.lg,
    height: iconContainerSizes.lg,
    borderRadius: iconContainerSizes.lg / 2,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  userAvatarEmoji: {
    fontSize: 28,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    ...typography.body,
    fontFamily: fonts.bold,
    color: colors.text,
    textAlign: 'right',
  },
  userEmail: {
    ...typography.bodySmall,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  settingsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingsRowLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  settingsRowIcon: {
    fontSize: 18,
    marginLeft: spacing.sm,
  },
  settingsRowLabel: {
    ...typography.body,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  settingsRowValue: {
    ...typography.body,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  shareDescription: {
    ...typography.bodySmall,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  shareButton: {
    marginTop: spacing.sm,
  },
  sharedUsersSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sharedUsersTitle: {
    ...typography.bodySmall,
    fontFamily: fonts.semiBold,
    color: colors.text,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  sharedUserItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  sharedUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  sharedUserEmoji: {
    fontSize: 20,
  },
  sharedUserInfo: {
    flex: 1,
  },
  sharedUserName: {
    ...typography.bodySmall,
    fontFamily: fonts.semiBold,
    color: colors.text,
    textAlign: 'right',
  },
  sharedUserEmail: {
    ...typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  youBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  youBadgeText: {
    fontSize: 10,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  actionButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  actionEmoji: {
    fontSize: 20,
  },
  actionLabel: {
    flex: 1,
    ...typography.body,
    fontFamily: fonts.medium,
    color: colors.text,
    textAlign: 'right',
  },
  actionArrow: {
    fontSize: 24,
    color: colors.textLight,
    fontFamily: fonts.regular,
  },
  logoutSection: {
    marginTop: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F0',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error,
  },
  logoutIcon: {
    fontSize: 20,
    marginLeft: spacing.sm,
  },
  logoutText: {
    ...typography.body,
    fontFamily: fonts.semiBold,
    color: colors.error,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
  },
  footerText: {
    ...typography.bodySmall,
    fontFamily: fonts.medium,
    color: colors.textLight,
  },
  footerSubtext: {
    ...typography.caption,
    fontFamily: fonts.regular,
    color: colors.textLight,
    marginTop: spacing.xs,
  },
});
