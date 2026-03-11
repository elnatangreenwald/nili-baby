import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { colors, borderRadius, spacing, typography, shadows, fonts } from '../utils/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  hint,
  style,
  multiline,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  const isPassword = props.secureTextEntry;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isFocused && styles.labelFocused]}>
          {label}
        </Text>
      )}
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor },
          error && styles.inputContainerError,
          isFocused && styles.inputContainerFocused,
          multiline && styles.inputContainerMultiline,
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            style,
          ]}
          placeholderTextColor={colors.textLight}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={isPassword && !showPassword}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🔒'}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      {hint && !error && (
        <Text style={styles.hint}>{hint}</Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  labelFocused: {
    color: colors.primary,
  },
  inputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 56,
  },
  inputContainerFocused: {
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputContainerMultiline: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  icon: {
    fontSize: 20,
    marginLeft: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.body,
    fontFamily: fonts.regular,
    color: colors.text,
    textAlign: 'right',
    paddingVertical: spacing.md,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: spacing.sm,
  },
  eyeButton: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  eyeIcon: {
    fontSize: 20,
  },
  hint: {
    ...typography.caption,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  error: {
    ...typography.caption,
    fontFamily: fonts.regular,
    color: colors.error,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
});
