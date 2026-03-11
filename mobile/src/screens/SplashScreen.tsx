import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../utils/theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const bottleRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(bottleRotate, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(bottleRotate, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 2 }
      ),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const bottleRotation = bottleRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '15deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />
      <View style={styles.backgroundCircle3} />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Animated.Text
            style={[
              styles.bottleIcon,
              { transform: [{ rotate: bottleRotation }] },
            ]}
          >
            🍼
          </Animated.Text>
          <Text style={styles.babyIcon}>👶</Text>
        </View>

        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }}
        >
          <Text style={styles.title}>Nili Baby</Text>
          <Text style={styles.subtitle}>מערכת ניהול תינוקות</Text>
        </Animated.View>

        <View style={styles.features}>
          <FeatureItem icon="🍼" text="ניהול האכלות" delay={0} />
          <FeatureItem icon="⏰" text="תזכורות" delay={200} />
          <FeatureItem icon="📅" text="תורים" delay={400} />
        </View>
      </Animated.View>

      <Animated.Text style={[styles.footer, { opacity: fadeAnim }]}>
        עם אהבה לכל ההורים החדשים 💕
      </Animated.Text>
    </View>
  );
};

const FeatureItem: React.FC<{ icon: string; text: string; delay: number }> = ({
  icon,
  text,
  delay,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000 + delay);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.featureItem,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  backgroundCircle1: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -width * 0.5,
    left: -width * 0.25,
  },
  backgroundCircle2: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    bottom: -width * 0.4,
    right: -width * 0.3,
  },
  backgroundCircle3: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: height * 0.3,
    left: -width * 0.2,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  bottleIcon: {
    fontSize: 60,
    marginRight: 10,
  },
  babyIcon: {
    fontSize: 80,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 40,
  },
  features: {
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 30,
    marginVertical: 8,
    minWidth: 180,
  },
  featureIcon: {
    fontSize: 24,
    marginLeft: 12,
  },
  featureText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
