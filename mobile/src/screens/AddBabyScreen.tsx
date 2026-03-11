import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { babyApi } from '../services/api';
import { storage } from '../utils/storage';

interface AddBabyScreenProps {
  navigation: any;
}

export const AddBabyScreen: React.FC<AddBabyScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);

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
      Alert.alert('מזל טוב!', `${name} נוספה בהצלחה`, [
        { text: 'המשך', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('שגיאה', 'לא הצלחנו להוסיף את התינוק');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.icon}>👶</Text>
        <Text style={styles.title}>הוספת תינוק</Text>
        <Text style={styles.subtitle}>הזן את פרטי התינוק שלך</Text>
      </View>

      <Card style={styles.form}>
        <Input
          label="שם התינוק"
          value={name}
          onChangeText={setName}
          placeholder="לדוגמה: נילי"
          autoCapitalize="words"
        />

        <Input
          label="תאריך לידה (YYYY-MM-DD)"
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="2024-01-15"
          keyboardType="numbers-and-punctuation"
        />

        <Button
          title="הוסף תינוק"
          onPress={handleSubmit}
          loading={loading}
          size="large"
          style={styles.submitButton}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 64,
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
  },
  submitButton: {
    marginTop: spacing.md,
  },
});
