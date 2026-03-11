import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography, shadows, borderRadius } from '../utils/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { authApi } from '../services/api';
import { storage } from '../utils/storage';

const { width, height } = Dimensions.get('window');

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

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formSlide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggleMode = () => {
    Animated.sequence([
      Animated.timing(formSlide, {
        toValue: isLogin ? -20 : 20,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(formSlide, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsLogin(!isLogin);
    setError('');
  };

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      setError('נא למלא את כל השדות');
      return;
    }

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
    <View style={styles.container}>
      <View style={styles.topDecoration}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
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
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🍼</Text>
              <Text style={styles.babyEmoji}>👶</Text>
            </View>
            <Text style={styles.title}>Nili Baby</Text>
            <Text style={styles.subtitle}>ניהול גידול התינוק שלך</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: formSlide }],
              },
            ]}
          >
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, isLogin && styles.activeTab]}
                onPress={() => !isLogin && toggleMode()}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>
                  התחברות
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, !isLogin && styles.activeTab]}
                onPress={() => isLogin && toggleMode()}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>
                  הרשמה
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {!isLogin && (
                <Input
                  label="שם מלא"
                  value={name}
                  onChangeText={setName}
                  placeholder="הכנס את שמך"
                  autoCapitalize="words"
                  icon="👤"
                />
              )}

              <Input
                label="אימייל"
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon="📧"
              />

              <Input
                label="סיסמה"
                value={password}
                onChangeText={setPassword}
                placeholder="לפחות 6 תווים"
                secureTextEntry
                icon="🔒"
              />

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.error}>{error}</Text>
                </View>
              ) : null}

              <Button
                title={isLogin ? 'התחבר' : 'צור חשבון'}
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitButton}
                size="large"
              />

              {isLogin && (
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>שכחת סיסמה?</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <Text style={styles.footerText}>
              {isLogin ? 'עדיין אין לך חשבון?' : 'כבר יש לך חשבון?'}
            </Text>
            <TouchableOpacity onPress={toggleMode}>
              <Text style={styles.footerLink}>
                {isLogin ? 'הרשם עכשיו' : 'התחבר'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -50,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: 80,
    left: -30,
  },
  circle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: 20,
    right: 50,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: height * 0.08,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoEmoji: {
    fontSize: 50,
    marginRight: 8,
  },
  babyEmoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  formContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.lg,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  tabContainer: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  form: {
    padding: spacing.lg,
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
    color: colors.error,
    flex: 1,
    textAlign: 'right',
  },
  submitButton: {
    marginTop: spacing.md,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
