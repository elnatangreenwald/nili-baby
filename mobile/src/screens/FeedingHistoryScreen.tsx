import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, shadows, borderRadius } from '../utils/theme';
import { FeedingHistoryItem } from '../components/FeedingHistoryItem';
import { feedingApi } from '../services/api';
import { storage } from '../utils/storage';

const { width } = Dimensions.get('window');

export const FeedingHistoryScreen: React.FC = () => {
  const [feedings, setFeedings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [stats]);

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
    Alert.alert('מחיקת האכלה', 'האם למחוק את ההאכלה?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: async () => {
          try {
            await feedingApi.delete(id);
            setFeedings(feedings.filter((f) => f.id !== id));
            loadData();
          } catch (error) {
            Alert.alert('שגיאה', 'לא הצלחנו למחוק');
          }
        },
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>🍼</Text>
        <Text style={styles.loadingText}>טוען היסטוריה...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={feedings}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }}
          >
            <FeedingHistoryItem feeding={item} onDelete={handleDelete} />
          </Animated.View>
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          stats && (
            <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
              <View style={styles.statsHeader}>
                <Text style={styles.statsIcon}>📊</Text>
                <Text style={styles.statsTitle}>סטטיסטיקות (7 ימים)</Text>
              </View>
              <View style={styles.statsGrid}>
                <StatBox
                  icon="🍼"
                  value={stats.totalFeedings || 0}
                  label="האכלות"
                  color="#FF69B4"
                />
                <StatBox
                  icon="💧"
                  value={`${stats.avgAmount || 0}`}
                  label='ממוצע מ"ל'
                  color="#4FC3F7"
                />
                <StatBox
                  icon="🤱"
                  value={stats.breastfeedings || 0}
                  label="הנקות"
                  color="#FFB74D"
                />
                <StatBox
                  icon="🍶"
                  value={stats.formulaFeedings || 0}
                  label='תמ"ל'
                  color="#81C784"
                />
              </View>
            </Animated.View>
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍼</Text>
            <Text style={styles.emptyTitle}>עדיין אין האכלות</Text>
            <Text style={styles.emptyText}>
              התחל לרשום האכלות ותראה כאן את ההיסטוריה
            </Text>
          </View>
        }
      />
    </View>
  );
};

const StatBox: React.FC<{
  icon: string;
  value: string | number;
  label: string;
  color: string;
}> = ({ icon, value, label, color }) => (
  <View style={styles.statBox}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}20` }]}>
      <Text style={styles.statBoxIcon}>{icon}</Text>
    </View>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

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
  statsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  statsHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsIcon: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  statsTitle: {
    ...typography.h3,
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statBox: {
    width: (width - spacing.md * 2 - spacing.lg * 2 - spacing.sm) / 2,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statBoxIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
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
    textAlign: 'center',
  },
});
