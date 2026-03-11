import { useState, useCallback } from 'react';
import { feedingApi } from '../services/api';
import { storage } from '../utils/storage';

interface Feeding {
  id: string;
  time: string;
  type: 'BREASTFEEDING' | 'FORMULA';
  amountMl: number | null;
  user?: { id: string; name: string };
}

interface FeedingStats {
  totalFeedings: number;
  totalAmount: number;
  avgAmount: number;
  breastfeedings: number;
  formulaFeedings: number;
  days: number;
}

export const useFeeding = () => {
  const [feedings, setFeedings] = useState<Feeding[]>([]);
  const [lastFeeding, setLastFeeding] = useState<Feeding | null>(null);
  const [nextFeedingTime, setNextFeedingTime] = useState<Date | null>(null);
  const [stats, setStats] = useState<FeedingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeedings = useCallback(async (limit = 50) => {
    setLoading(true);
    setError(null);
    try {
      const babyId = await storage.getSelectedBaby();
      if (!babyId) throw new Error('No baby selected');

      const res = await feedingApi.getAll(babyId, limit);
      setFeedings(res.data.feedings);
    } catch (err: any) {
      setError(err.message || 'Failed to load feedings');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLastFeeding = useCallback(async () => {
    try {
      const babyId = await storage.getSelectedBaby();
      if (!babyId) return;

      const res = await feedingApi.getLast(babyId);
      setLastFeeding(res.data.lastFeeding);
      setNextFeedingTime(res.data.nextFeedingTime ? new Date(res.data.nextFeedingTime) : null);
    } catch (err: any) {
      console.error('Error loading last feeding:', err);
    }
  }, []);

  const loadStats = useCallback(async (days = 7) => {
    try {
      const babyId = await storage.getSelectedBaby();
      if (!babyId) return;

      const res = await feedingApi.getStats(babyId, days);
      setStats(res.data);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    }
  }, []);

  const recordFeeding = useCallback(async (
    type: 'BREASTFEEDING' | 'FORMULA',
    amountMl?: number,
    notes?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const babyId = await storage.getSelectedBaby();
      if (!babyId) throw new Error('No baby selected');

      await feedingApi.create({
        babyId,
        type,
        amountMl,
        notes,
      });

      await loadLastFeeding();
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to record feeding');
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadLastFeeding]);

  const deleteFeeding = useCallback(async (id: string) => {
    try {
      await feedingApi.delete(id);
      setFeedings(prev => prev.filter(f => f.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to delete feeding');
      return false;
    }
  }, []);

  return {
    feedings,
    lastFeeding,
    nextFeedingTime,
    stats,
    loading,
    error,
    loadFeedings,
    loadLastFeeding,
    loadStats,
    recordFeeding,
    deleteFeeding,
  };
};
