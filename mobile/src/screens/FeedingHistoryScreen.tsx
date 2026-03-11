import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Animated,
  TouchableOpacity,
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
} from '../utils/theme';
import { FeedingHistoryItem } from '../components/FeedingHistoryItem';
import { feedingApi, babyApi } from '../services/api';

const { width } = Dimensions.get('window');

export const FeedingHistoryScreen: React.FC = () => {
  const [feedings, setFeedings] = useState<any[]>([]);
  const [baby, setBaby] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'BREASTFEEDING' | 'FORMULA'>('all');

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
      const babiesResponse = await babyApi.getBabies();
      const babies = babiesResponse.data;

      if (babies.length > 0) {
        const currentBaby = babies[0];
        setBaby(currentBaby);

        const feedingsResponse = await feedingApi.getFeedings(currentBaby.id);
        setFeedings(feedingsResponse.data);
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

  const handleDelete = async (id: string) => {
    try {
      await feedingApi.deleteFeeding(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting feeding:', error);
    }
  };

  const filteredFeedings = filter === 'all'
    ? feedings
    : feedings.filter((f) => f.type === filter);

  const getTodayStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayFeedings = feedings.filter(
      (f) => new Date(f.time) >= today
    );
    const breastfeedings = todayFeedings.filter(
      (f) => f.type === 'BREASTFEEDING'
    ).length;
    const formulas = todayFeedings.filter((f) => f.type === 'FORMULA').length;
    const totalAmount = todayFeedings.reduce(
      (sum, f) => sum + (f.amountMl || 0),
      0
    );
    return { total: todayFeedings.length, breastfeedings, formulas, totalAmount };
  };

  const stats = getTodayStats();

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const animValue = new Animated.Value(0);
    Animated.timing(animValue, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();

    return (
      <Animated.View
        style={{
          opacity: animValue,
          transform: [
            {
              translateX: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <FeedingHistoryItem feeding={item} onDelete={handleDelete} />
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>סה"כ היום</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.feedingBreastfeeding }]}>
              {stats.breastfeedings}
            </Text>
            <Text style={styles.statLabel}>הנקות</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.feedingFormula }]}>
              {stats.formulas}
            </Text>
            <Text style={styles.statLabel}>בקבוקים</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.success }]}>
              {stats.totalAmount}
            </Text>
            <Text style={styles.statLabel}>מ"ל</Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          <FilterButton
            label="הכל"
            isActive={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterButton
            label="הנקה"
            isActive={filter === 'BREASTFEEDING'}
            onPress={() => setFilter('BREASTFEEDING')}
            color={colors.feedingBreastfeeding}
          />
          <FilterButton
            label='תמ"ל'
            isActive={filter === 'FORMULA'}
            onPress={() => setFilter('FORMULA')}
            color={colors.feedingFormula}
          />
        </View>
      </View>

      <FlatList
        data={filteredFeedings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>אין האכלות עדיין</Text>
            <Text style={styles.emptySubtitle}>
              האכלות שתרשום יופיעו כאן
            </Text>
          </View>
        }
      />
    </Animated.View>
  );
};

const FilterButton: React.FC<{
  label: string;
  isActive: boolean;
  onPress: () => void;
  color?: string;
}> = ({ label, isActive, onPress, color }) => (
  <TouchableOpacity
    style={[
      styles.filterButton,
      isActive && styles.filterButtonActive,
      isActive && color && { backgroundColor: `${color}20`, borderColor: color },
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.filterButtonText,
        isActive && styles.filterButtonTextActive,
        isActive && color && { color },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  filterRow: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
