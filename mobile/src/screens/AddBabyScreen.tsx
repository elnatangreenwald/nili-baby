import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
  fonts,
} from '../utils/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { babyApi } from '../services/api';

const { width, height } = Dimensions.get('window');

interface AddBabyScreenProps {
  navigation: any;
}

export const AddBabyScreen: React.FC<AddBabyScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [feedingInterval, setFeedingInterval] = useState('3');
  const [targetAmount, setTargetAmount] = useState('120');
  const [reminderMinutes, setReminderMinutes] = useState('10');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

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
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('נא להזין שם');
      return;
    }
    if (!birthDate.trim()) {
      setError('נא להזין תאריך לידה');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await babyApi.addBaby({
        name: name.trim(),
        birthDate: new Date(birthDate).toISOString(),
        feedingIntervalHours: parseFloat(feedingInterval) || 3,
        targetAmountMl: parseInt(targetAmount) || 120,
        reminderMinutesBefore: parseInt(reminderMinutes) || 10,
      });
      navigation.goBack();
    } catch (err: any) {
      setError(err.response?.data?.error || 'אירעה שגיאה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.backgroundDecoration}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                { transform: [{ translateY: bounceAnim }] },
              ]}
            >
              <Text style={styles.babyIcon}>👶</Text>
            </Animated.View>
            <Text style={styles.title}>הוספת תינוק</Text>
            <Text style={styles.subtitle}>הזן את פרטי התינוק שלך</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Card variant="elevated" padding="lg">
              <Input
                label="שם התינוק"
                value={name}
                onChangeText={setName}
                placeholder="הכנס שם"
                icon="👶"
              />

              <Input
                label="תאריך לידה"
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="YYYY-MM-DD (לדוגמה: 2026-01-15)"
                keyboardType="numbers-and-punctuation"
                icon="🎂"
                hint="הזן תאריך בפורמט שנה-חודש-יום"
              />

              <Input
                label="מרווח בין האכלות (שעות)"
                value={feedingInterval}
                onChangeText={setFeedingInterval}
                placeholder="3"
                keyboardType="numeric"
                icon="⏱️"
              />

              <Input
                label='יעד כמות להאכלה (מ"ל)'
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="120"
                keyboardType="numeric"
                icon="🎯"
              />

              <Input
                label="תזכורת לפני האכלה (דקות)"
                value={reminderMinutes}
                onChangeText={setReminderMinutes}
                placeholder="10"
                keyboardType="numeric"
                icon="🔔"
              />

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}

              <Button
                title="הוסף תינוק"
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitButton}
                size="large"
              />
            </Card>
          </Animated.View>

          <Animated.View
            style={[styles.featuresSection, { opacity: fadeAnim }]}
          >
            <Text style={styles.featuresTitle}>מה תקבל?</Text>
            <View style={styles.featuresGrid}>
              <FeatureItem icon="🍼" text="מעקב האכלות" />
              <FeatureItem icon="⏰" text="תזכורות חכמות" />
              <FeatureItem icon="📊" text="סטטיסטיקות" />
              <FeatureItem icon="👥" text="שיתוף עם בן/בת זוג" />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const FeatureItem: React.FC<{ icon: string; text: string }> = ({
  icon,
  text,
}) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primaryLight,
    opacity: 0.3,
    top: -50,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.secondaryLight,
    opacity: 0.4,
    top: 50,
    left: -30,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  babyIcon: {
    fontSize: 56,
  },
  title: {
    ...typography.h1,
    fontFamily: fonts.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  formContainer: {
    marginBottom: spacing.lg,
  },
  errorContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorIcon: {
    fontSize: 16,
    marginLeft: spacing.xs,
  },
  error: {
    ...typography.bodySmall,
    fontFamily: fonts.regular,
    color: colors.error,
    flex: 1,
    textAlign: 'right',
  },
  submitButton: {
    marginTop: spacing.md,
  },
  featuresSection: {
    marginTop: spacing.md,
  },
  featuresTitle: {
    ...typography.h3,
    fontFamily: fonts.semiBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  featuresGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    ...shadows.sm,
  },
  featureIcon: {
    fontSize: 18,
    marginLeft: spacing.xs,
  },
  featureText: {
    ...typography.bodySmall,
    fontFamily: fonts.medium,
    color: colors.text,
  },
});
