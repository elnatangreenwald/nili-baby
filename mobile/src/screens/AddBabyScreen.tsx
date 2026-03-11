import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../utils/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { babyApi } from '../services/api';
import { storage } from '../utils/storage';

const { height } = Dimensions.get('window');

interface AddBabyScreenProps {
  navigation: any;
}

export const AddBabyScreen: React.FC<AddBabyScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('שגיאה', 'נא להזין שם');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(birthDate)) {
      Alert.alert('שגיאה', 'פורמט תאריך לא תקין (YYYY-MM-DD)');
      return;
    }

    setLoading(true);
    try {
      const res = await babyApi.create({
        name,
        birthDate,
      });

      await storage.setSelectedBaby(res.data.baby.id);
      Alert.alert('🎉 מזל טוב!', `${name} נוספה בהצלחה למערכת`, [
        { text: 'יאללה!', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('שגיאה', 'לא הצלחנו להוסיף את התינוק');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.decoration}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: bounceAnim }],
          },
        ]}
      >
        <Text style={styles.icon}>👶</Text>
        <Text style={styles.title}>הוספת תינוק</Text>
        <Text style={styles.subtitle}>הזן את פרטי התינוק שלך</Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        }}
      >
        <Card style={styles.form}>
          <View style={styles.formHeader}>
            <Text style={styles.formIcon}>📝</Text>
            <Text style={styles.formTitle}>פרטי התינוק</Text>
          </View>

          <Input
            label="שם התינוק"
            value={name}
            onChangeText={setName}
            placeholder="לדוגמה: נילי"
            autoCapitalize="words"
            icon="👶"
          />

          <Input
            label="תאריך לידה"
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
            icon="📅"
          />

          <View style={styles.hint}>
            <Text style={styles.hintIcon}>💡</Text>
            <Text style={styles.hintText}>
              הזן את התאריך בפורמט: שנה-חודש-יום{'\n'}
              לדוגמה: 2026-01-15
            </Text>
          </View>

          <Button
            title="🎉 הוסף תינוק"
            onPress={handleSubmit}
            loading={loading}
            size="large"
            style={styles.submitButton}
          />
        </Card>
      </Animated.View>

      <Animated.View style={[styles.features, { opacity: fadeAnim }]}>
        <Text style={styles.featuresTitle}>מה תוכל לעשות:</Text>
        <View style={styles.featuresList}>
          <FeatureItem icon="🍼" text="לעקוב אחרי האכלות" />
          <FeatureItem icon="⏰" text="לקבל תזכורות" />
          <FeatureItem icon="📅" text="לנהל תורים" />
          <FeatureItem icon="👥" text="לשתף עם בן/בת זוג" />
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const FeatureItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
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
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  decoration: {
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
    backgroundColor: colors.secondaryLight,
    top: -100,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.secondaryLight,
    top: 50,
    left: -50,
    opacity: 0.5,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  formHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  formIcon: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  formTitle: {
    ...typography.h3,
    color: colors.text,
  },
  hint: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    backgroundColor: colors.secondaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  hintIcon: {
    fontSize: 20,
    marginLeft: spacing.sm,
  },
  hintText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
    lineHeight: 22,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
  features: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  featuresTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  featuresList: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  featureIcon: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.text,
  },
});
