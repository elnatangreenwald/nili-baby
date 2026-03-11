import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../utils/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authApi } from '../services/api';
import { storage } from '../utils/storage';

interface LoginScreenProps {
  navigation: any;
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await authApi.login({ email, password });
      } else {
        response = await authApi.register({ email, password, name });
      }

      const { user, token } = response.data;
      await storage.setToken(token);
      await storage.setUser(user);
      onLogin();
    } catch (err: any) {
      setError(err.response?.data?.error || 'אירעה שגיאה, נסה שוב');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>👶</Text>
          <Text style={styles.title}>Nili Baby</Text>
          <Text style={styles.subtitle}>ניהול גידול התינוק שלך</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {isLogin ? 'התחברות' : 'הרשמה'}
          </Text>

          {!isLogin && (
            <Input
              label="שם"
              value={name}
              onChangeText={setName}
              placeholder="השם שלך"
              autoCapitalize="words"
            />
          )}

          <Input
            label="אימייל"
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="סיסמה"
            value={password}
            onChangeText={setPassword}
            placeholder="לפחות 6 תווים"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title={isLogin ? 'התחבר' : 'הרשם'}
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />

          <Button
            title={isLogin ? 'אין לך חשבון? הרשם' : 'יש לך חשבון? התחבר'}
            onPress={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            variant="outline"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
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
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.lg,
  },
  formTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  error: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  submitButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
});
