import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
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

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [baby, setBaby] = useState<any>(null);
  const [lastFeeding, setLastFeeding] = useState<any>(null);
  const [nextFeedingTime, setNextFeedingTime] = useState<Date | null>(null);
  const [feedingAmount, setFeedingAmount] = useState(0);
  const [feedingType, setFeedingType] = useState<'BREASTFEEDING' | 'FORMULA'>('FORMULA');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      const res = await feedingApi.getLast(babyId);
      setLastFeeding(res.data.lastFeeding);
      setNextFeedingTime(res.data.nextFeedingTime ? new Date(res.data.nextFeedingTime) : null);
      setFeedingAmount(res.data.settings?.targetAmountMl || 120);
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

      Alert.alert('נרשם בהצלחה', 'האכלה נרשמה');
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
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

  if (!baby) {
    return (
      <View style={styles.noBabyContainer}>
        <Text style={styles.noBabyIcon}>👶</Text>
        <Text style={styles.noBabyTitle}>ברוכים הבאים!</Text>
        <Text style={styles.noBabyText}>הוסף את התינוק שלך כדי להתחיל</Text>
        <Button
          title="הוסף תינוק"
          onPress={() => navigation.navigate('AddBaby')}
          style={styles.addBabyButton}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <View style={styles.babyInfo}>
          <Text style={styles.babyName}>{baby.name}</Text>
          <Text style={styles.babyAge}>{calculateAge(baby.birthDate)}</Text>
        </View>
        <Text style={styles.headerIcon}>👶</Text>
      </View>

      <NextFeedingTimer
        nextFeedingTime={nextFeedingTime}
        lastFeedingTime={lastFeeding?.time}
      />

      <Card style={styles.feedingCard}>
        <Text style={styles.cardTitle}>רישום האכלה</Text>
        
        <FeedingTypeSelector
          value={feedingType}
          onChange={setFeedingType}
        />

        {feedingType === 'FORMULA' && (
          <FeedingSlider
            value={feedingAmount}
            onValueChange={setFeedingAmount}
            targetValue={baby.targetAmountMl}
            maxValue={250}
          />
        )}

        <Button
          title="סמן האכלה"
          onPress={handleRecordFeeding}
          loading={submitting}
          size="large"
          style={styles.recordButton}
        />
      </Card>

      <View style={styles.quickActions}>
        <Button
          title="היסטוריה"
          onPress={() => navigation.navigate('FeedingHistory')}
          variant="outline"
          size="small"
          style={styles.quickAction}
        />
        <Button
          title="הגדרות"
          onPress={() => navigation.navigate('Settings')}
          variant="outline"
          size="small"
          style={styles.quickAction}
        />
      </View>
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
  noBabyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  noBabyIcon: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  noBabyTitle: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  noBabyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  addBabyButton: {
    minWidth: 200,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  babyInfo: {
    alignItems: 'flex-end',
  },
  babyName: {
    ...typography.h2,
    color: colors.text,
  },
  babyAge: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  headerIcon: {
    fontSize: 48,
  },
  feedingCard: {
    marginTop: spacing.lg,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  recordButton: {
    marginTop: spacing.md,
  },
  quickActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
  },
});
