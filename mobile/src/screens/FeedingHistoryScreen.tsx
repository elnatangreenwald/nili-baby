import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography } from '../utils/theme';
import { FeedingHistoryItem } from '../components/FeedingHistoryItem';
import { Card } from '../components/Card';
import { feedingApi } from '../services/api';
import { storage } from '../utils/storage';

export const FeedingHistoryScreen: React.FC = () => {
  const [feedings, setFeedings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const babyId = await storage.getSelectedBaby();
      if (!babyId) return;

      const [feedingsRes, statsRes] = await Promise.all([
        feedingApi.getAll(babyId, 50),
        feedingApi.getStats(babyId, 7),
      ]);

      setFeedings(feedingsRes.data.feedings);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading feedings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleDelete = async (id: string) => {
    Alert.alert(
      'מחיקת האכלה',
      'האם למחוק את ההאכלה?',
      [
        { text: 'ביטול', style: 'cancel' },
        {
          text: 'מחק',
          style: 'destructive',
          onPress: async () => {
            try {
              await feedingApi.delete(id);
              setFeedings(feedings.filter(f => f.id !== id));
              loadData();
            } catch (error) {
              Alert.alert('שגיאה', 'לא הצלחנו למחוק');
            }
          },
        },
      ]
    );
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

  return (
    <View style={styles.container}>
      {stats && (
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>סטטיסטיקות (7 ימים אחרונים)</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalFeedings}</Text>
              <Text style={styles.statLabel}>האכלות</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.avgAmount}</Text>
              <Text style={styles.statLabel}>ממוצע מ"ל</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.breastfeedings}</Text>
              <Text style={styles.statLabel}>הנקות</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.formulaFeedings}</Text>
              <Text style={styles.statLabel}>תמ"ל</Text>
            </View>
          </View>
        </Card>
      )}

      <FlatList
        data={feedings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FeedingHistoryItem
            feeding={item}
            onDelete={handleDelete}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍼</Text>
            <Text style={styles.emptyText}>עדיין אין האכלות</Text>
          </View>
        }
      />
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
  statsCard: {
    margin: spacing.md,
    marginBottom: 0,
  },
  statsTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  list: {
    padding: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
