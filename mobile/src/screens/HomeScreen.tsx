import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, shadows, borderRadius } from '../utils/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { NextFeedingTimer } from '../components/NextFeedingTimer';
import { FeedingSlider } from '../components/FeedingSlider';
import { FeedingTypeSelector } from '../components/FeedingTypeSelector';
import { feedingApi, babyApi } from '../services/api';
import { storage } from '../utils/storage';
import { calculateAge } from '../utils/helpers';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [baby, setBaby] = useState<any>(null);
  const [lastFeeding, setLastFeeding] = useState<any>(null);
  const [nextFeedingTime, setNextFeedingTime] = useState<Date | null>(null);
  const [feedingAmount, setFeedingAmount] = useState(120);
  const [feedingType, setFeedingType] = useState<'BREASTFEEDING' | 'FORMULA'>('FORMULA');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [baby]);

  const loadData = async () => {
    try {
      const babyId = await storage.getSelectedBaby();

      if (!babyId) {
        const babiesRes = await babyApi.getAll();
        if (babiesRes.data.babies.length > 0) {
          const firstBaby = babiesRes.data.babies[0];
          await storage.setSelectedBaby(firstBaby.id);
          setBaby(firstBaby);
          await loadFeedingData(firstBaby.id);
        }
      } else {
        const babyRes = await babyApi.getOne(babyId);
        setBaby(babyRes.data.baby);
        await loadFeedingData(babyId);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFeedingData = async (babyId: string) => {
    try {
      const [lastRes, statsRes] = await Promise.all([
        feedingApi.getLast(babyId),
        feedingApi.getStats(babyId),
      ]);
      setLastFeeding(lastRes.data.lastFeeding);
      setNextFeedingTime(lastRes.data.nextFeedingTime ? new Date(lastRes.data.nextFeedingTime) : null);
      setFeedingAmount(lastRes.data.settings?.targetAmountMl || 120);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading feeding data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRecordFeeding = async () => {
    if (!baby) return;

    setSubmitting(true);
    try {
      await feedingApi.create({
        babyId: baby.id,
        type: feedingType,
        amountMl: feedingType === 'FORMULA' ? feedingAmount : undefined,
      });

      Alert.alert('🎉 נרשם בהצלחה!', 'האכלה נרשמה במערכת', [
        { text: 'מעולה', style: 'default' },
      ]);
      await loadFeedingData(baby.id);
    } catch (error) {
      Alert.alert('שגיאה', 'לא הצלחנו לרשום את ההאכלה');
    } finally {
      setSubmitting(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={styles.loadingContent}>
          <Text style={styles.loadingEmoji}>👶</Text>
          <Text style={styles.loadingText}>טוען...</Text>
        </Animated.View>
      </View>
    );
  }

  if (!baby) {
    return (
      <View style={styles.noBabyContainer}>
        <View style={styles.noBabyDecoration} />
        <Animated.View
          style={[
            styles.noBabyContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.noBabyIcon}>👶</Text>
          <Text style={styles.noBabyTitle}>ברוכים הבאים!</Text>
          <Text style={styles.noBabyText}>
            הוסף את התינוק שלך כדי להתחיל לעקוב אחרי האכלות, תזכורות ותורים
          </Text>
          <Button
            title="➕ הוסף תינוק"
            onPress={() => navigation.navigate('AddBaby')}
            style={styles.addBabyButton}
            size="large"
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.babyInfo}>
            <Text style={styles.greeting}>שלום! 👋</Text>
            <Text style={styles.babyName}>{baby.name}</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.babyAge}>{calculateAge(baby.birthDate)}</Text>
            </View>
          </View>
          <View style={styles.avatarContainer}>
            <Text style={styles.headerIcon}>👶</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <NextFeedingTimer
          nextFeedingTime={nextFeedingTime}
          lastFeedingTime={lastFeeding?.time}
        />
      </Animated.View>

      {stats && (
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.statsTitle}>סטטיסטיקות היום</Text>
          <View style={styles.statsRow}>
            <StatCard
              icon="🍼"
              value={stats.todayCount || 0}
              label="האכלות"
              color="#FF69B4"
            />
            <StatCard
              icon="💧"
              value={`${stats.todayTotalMl || 0} מ"ל`}
              label="סה״כ"
              color="#4FC3F7"
            />
            <StatCard
              icon="📊"
              value={`${stats.averageAmountMl || 0} מ"ל`}
              label="ממוצע"
              color="#81C784"
            />
          </View>
        </Animated.View>
      )}

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Card style={styles.feedingCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🍼</Text>
            <Text style={styles.cardTitle}>רישום האכלה</Text>
          </View>

          <FeedingTypeSelector value={feedingType} onChange={setFeedingType} />

          {feedingType === 'FORMULA' && (
            <FeedingSlider
              value={feedingAmount}
              onValueChange={setFeedingAmount}
              targetValue={baby.targetAmountMl}
              maxValue={250}
            />
          )}

          <Button
            title="✓ סמן האכלה"
            onPress={handleRecordFeeding}
            loading={submitting}
            size="large"
            style={styles.recordButton}
          />
        </Card>
      </Animated.View>

      <View style={styles.quickActions}>
        <QuickActionButton
          icon="📋"
          label="היסטוריה"
          onPress={() => navigation.navigate('FeedingHistory')}
        />
        <QuickActionButton
          icon="⏰"
          label="תזכורות"
          onPress={() => navigation.navigate('Reminders')}
        />
        <QuickActionButton
          icon="📅"
          label="תורים"
          onPress={() => navigation.navigate('Appointments')}
        />
        <QuickActionButton
          icon="⚙️"
          label="הגדרות"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>
    </ScrollView>
  );
};

const StatCard: React.FC<{
  icon: string;
  value: string | number;
  label: string;
  color: string;
}> = ({ icon, value, label, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const QuickActionButton: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
}> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.quickActionButton} onPress={onPress}>
    <View style={styles.quickActionIcon}>
      <Text style={styles.quickActionEmoji}>{icon}</Text>
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
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
  loadingContent: {
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 60,
    marginBottom: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  noBabyContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  noBabyDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  noBabyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  noBabyIcon: {
    fontSize: 100,
    marginBottom: spacing.lg,
  },
  noBabyTitle: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  noBabyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  addBabyButton: {
    minWidth: 200,
  },
  header: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  headerContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  babyInfo: {
    alignItems: 'flex-end',
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  babyName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  ageBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  babyAge: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '500',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 50,
  },
  statsContainer: {
    marginBottom: spacing.lg,
  },
  statsTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  feedingCard: {
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardIcon: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
  },
  recordButton: {
    marginTop: spacing.md,
  },
  quickActions: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  quickActionButton: {
    width: (width - spacing.md * 2 - spacing.sm * 3) / 4,
    alignItems: 'center',
    padding: spacing.sm,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  quickActionEmoji: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
