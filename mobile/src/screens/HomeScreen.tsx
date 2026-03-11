import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
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
import { NextFeedingTimer } from '../components/NextFeedingTimer';
import { FeedingSlider } from '../components/FeedingSlider';
import { FeedingTypeSelector } from '../components/FeedingTypeSelector';
import { feedingApi, babyApi } from '../services/api';
import { storage } from '../utils/storage';
import { formatTime } from '../utils/helpers';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [baby, setBaby] = useState<any>(null);
  const [feedings, setFeedings] = useState<any[]>([]);
  const [nextFeedingTime, setNextFeedingTime] = useState<Date | null>(null);
  const [lastFeedingTime, setLastFeedingTime] = useState<Date | null>(null);
  const [feedingAmount, setFeedingAmount] = useState(0);
  const [feedingType, setFeedingType] = useState<'BREASTFEEDING' | 'FORMULA'>(
    'FORMULA'
  );
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

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
        const currentBaby = babies[0];
        setBaby(currentBaby);

        const feedingsResponse = await feedingApi.getFeedings(currentBaby.id);
        const feedingsList = feedingsResponse.data;
        setFeedings(feedingsList);

        if (feedingsList.length > 0) {
          const lastFeeding = new Date(feedingsList[0].time);
          setLastFeedingTime(lastFeeding);
          const nextFeeding = new Date(
            lastFeeding.getTime() + currentBaby.feedingIntervalHours * 60 * 60 * 1000
          );
          setNextFeedingTime(nextFeeding);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddFeeding = async () => {
    if (!baby) return;

    setLoading(true);
    try {
      await feedingApi.addFeeding({
        babyId: baby.id,
        type: feedingType,
        amountMl: feedingAmount > 0 ? feedingAmount : null,
      });
      setFeedingAmount(0);
      await loadData();
    } catch (error) {
      console.error('Error adding feeding:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'לילה טוב';
    if (hour < 12) return 'בוקר טוב';
    if (hour < 17) return 'צהריים טובים';
    if (hour < 21) return 'ערב טוב';
    return 'לילה טוב';
  };

  const getTodayStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFeedings = feedings.filter(
      (f) => new Date(f.time) >= today
    );
    const totalAmount = todayFeedings.reduce(
      (sum, f) => sum + (f.amountMl || 0),
      0
    );
    return {
      count: todayFeedings.length,
      totalAmount,
    };
  };

  const stats = getTodayStats();

  if (!baby) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyIcon}>👶</Text>
          <Text style={styles.emptyTitle}>ברוכים הבאים!</Text>
          <Text style={styles.emptySubtitle}>
            כדי להתחיל, הוסף את התינוק שלך
          </Text>
          <Button
            title="הוסף תינוק"
            onPress={() => navigation.navigate('AddBaby')}
            style={styles.addBabyButton}
            size="large"
          />
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>
                {getGreeting()}, {user?.name?.split(' ')[0] || 'הורה'}
              </Text>
              <Text style={styles.babyName}>
                מטפלים ב{baby.name} 💕
              </Text>
            </View>
            <View style={styles.babyAvatar}>
              <Text style={styles.babyAvatarEmoji}>👶</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <StatCard
              icon="🍼"
              value={stats.count.toString()}
              label="האכלות היום"
              color={colors.feedingFormula}
            />
            <StatCard
              icon="📊"
              value={`${stats.totalAmount}`}
              label='מ"ל סה"כ'
              color={colors.primary}
            />
            <StatCard
              icon="🎯"
              value={`${baby.targetAmountMl || 120}`}
              label="יעד להאכלה"
              color={colors.success}
            />
          </View>
        </View>

        <View style={styles.section}>
          <NextFeedingTimer
            nextFeedingTime={nextFeedingTime}
            lastFeedingTime={lastFeedingTime}
            reminderMinutesBefore={baby.reminderMinutesBefore}
          />
        </View>

        <View style={styles.section}>
          <Card variant="elevated" padding="lg">
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>➕</Text>
              <Text style={styles.sectionTitle}>רשום האכלה חדשה</Text>
            </View>

            <FeedingTypeSelector value={feedingType} onChange={setFeedingType} />

            <FeedingSlider
              value={feedingAmount}
              onValueChange={setFeedingAmount}
              targetValue={baby.targetAmountMl}
            />

            <Button
              title="רשום האכלה"
              onPress={handleAddFeeding}
              loading={loading}
              style={styles.addButton}
              size="large"
            />
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>⚡</Text>
            <Text style={styles.sectionTitle}>פעולות מהירות</Text>
          </View>
          <View style={styles.quickActions}>
            <QuickActionButton
              icon="📋"
              label="היסטוריה"
              onPress={() => navigation.navigate('FeedingHistory')}
              color={colors.feedingFormula}
            />
            <QuickActionButton
              icon="⏰"
              label="תזכורות"
              onPress={() => navigation.navigate('Reminders')}
              color={colors.warning}
            />
            <QuickActionButton
              icon="📅"
              label="תורים"
              onPress={() => navigation.navigate('Appointments')}
              color={colors.appointmentDoctor}
            />
            <QuickActionButton
              icon="⚙️"
              label="הגדרות"
              onPress={() => navigation.navigate('Settings')}
              color={colors.textSecondary}
            />
          </View>
        </View>

        {feedings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>🕐</Text>
                <Text style={styles.sectionTitle}>האכלות אחרונות</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('FeedingHistory')}
              >
                <Text style={styles.seeAllText}>הצג הכל</Text>
              </TouchableOpacity>
            </View>
            {feedings.slice(0, 3).map((feeding, index) => (
              <RecentFeedingItem key={feeding.id} feeding={feeding} />
            ))}
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

const StatCard: React.FC<{
  icon: string;
  value: string;
  label: string;
  color: string;
}> = ({ icon, value, label, color }) => (
  <View style={[styles.statCard, { borderTopColor: color }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QuickActionButton: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
}> = ({ icon, label, onPress, color }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.quickAction}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={[styles.quickActionIcon, { backgroundColor: `${color}20` }]}>
          <Text style={styles.quickActionEmoji}>{icon}</Text>
        </View>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const RecentFeedingItem: React.FC<{ feeding: any }> = ({ feeding }) => {
  const typeIcon = feeding.type === 'BREASTFEEDING' ? '🤱' : '🍼';
  const typeColor =
    feeding.type === 'BREASTFEEDING'
      ? colors.feedingBreastfeeding
      : colors.feedingFormula;

  return (
    <View style={styles.recentItem}>
      <View style={[styles.recentIcon, { backgroundColor: `${typeColor}20` }]}>
        <Text style={styles.recentEmoji}>{typeIcon}</Text>
      </View>
      <View style={styles.recentContent}>
        <Text style={styles.recentType}>
          {feeding.type === 'BREASTFEEDING' ? 'הנקה' : 'תמ"ל'}
        </Text>
        <Text style={styles.recentTime}>{formatTime(feeding.time)}</Text>
      </View>
      {feeding.amountMl && (
        <View style={styles.recentAmount}>
          <Text style={styles.recentAmountValue}>{feeding.amountMl}</Text>
          <Text style={styles.recentAmountUnit}>מ"ל</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'right',
  },
  babyName: {
    fontSize: 22,
    fontFamily: fonts.bold,
    color: colors.white,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  babyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  babyAvatarEmoji: {
    fontSize: 32,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    borderTopWidth: 3,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  seeAllText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  addButton: {
    marginTop: spacing.md,
  },
  quickActions: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAction: {
    width: (width - spacing.lg * 2 - spacing.sm * 3) / 4,
    alignItems: 'center',
    padding: spacing.sm,
  },
  quickActionIcon: {
    width: iconContainerSizes.lg,
    height: iconContainerSizes.lg,
    borderRadius: iconContainerSizes.lg / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 12,
    fontFamily: fonts.medium,
    color: colors.text,
    textAlign: 'center',
  },
  recentItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  recentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  recentEmoji: {
    fontSize: 22,
  },
  recentContent: {
    flex: 1,
  },
  recentType: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    color: colors.text,
    textAlign: 'right',
  },
  recentTime: {
    fontSize: 13,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  recentAmount: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  recentAmountValue: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.primary,
    marginLeft: 2,
  },
  recentAmountUnit: {
    fontSize: 11,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  addBabyButton: {
    minWidth: 200,
  },
});
