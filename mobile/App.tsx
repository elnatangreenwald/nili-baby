import React, { useState, useEffect, useCallback } from 'react';
import { StatusBar, I18nManager, Text, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreenExpo from 'expo-splash-screen';
import {
  useFonts,
  Heebo_400Regular,
  Heebo_500Medium,
  Heebo_600SemiBold,
  Heebo_700Bold,
} from '@expo-google-fonts/heebo';

import { SplashScreen } from './src/screens/SplashScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { FeedingHistoryScreen } from './src/screens/FeedingHistoryScreen';
import { RemindersScreen } from './src/screens/RemindersScreen';
import { AppointmentsScreen } from './src/screens/AppointmentsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AddBabyScreen } from './src/screens/AddBabyScreen';

import { storage } from './src/utils/storage';
import { soundService } from './src/services/sound';
import { colors } from './src/utils/theme';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

SplashScreenExpo.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Heebo_500Medium',
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontFamily: 'Heebo_600SemiBold',
          fontSize: 18,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'בית',
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" />,
          headerTitle: 'Nili Baby',
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          title: 'תזכורות',
          tabBarIcon: ({ color }) => <TabIcon icon="⏰" />,
          headerTitle: 'תזכורות',
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          title: 'תורים',
          tabBarIcon: ({ color }) => <TabIcon icon="📅" />,
          headerTitle: 'תורים',
        }}
      />
      <Tab.Screen
        name="Settings"
        options={{
          title: 'הגדרות',
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" />,
          headerTitle: 'הגדרות',
        }}
      >
        {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const TabIcon = ({ icon }: { icon: string }) => (
  <Text style={{ fontSize: 22 }}>{icon}</Text>
);

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [appIsReady, setAppIsReady] = useState(false);

  const [fontsLoaded] = useFonts({
    Heebo_400Regular,
    Heebo_500Medium,
    Heebo_600SemiBold,
    Heebo_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        soundService.init();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();

    return () => {
      soundService.cleanup();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      await SplashScreenExpo.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  const checkAuth = async () => {
    const token = await storage.getToken();
    setIsLoggedIn(!!token);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    checkAuth();
  };

  if (!appIsReady || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  if (showSplash) {
    return (
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <SplashScreen onFinish={handleSplashFinish} />
      </SafeAreaProvider>
    );
  }

  if (isLoggedIn === null) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.white,
            headerTitleStyle: {
              fontFamily: 'Heebo_600SemiBold',
              fontSize: 18,
            },
          }}
        >
          {!isLoggedIn ? (
            <Stack.Screen name="Login" options={{ headerShown: false }}>
              {(props) => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Main" options={{ headerShown: false }}>
                {() => <TabNavigator onLogout={() => setIsLoggedIn(false)} />}
              </Stack.Screen>
              <Stack.Screen
                name="FeedingHistory"
                component={FeedingHistoryScreen}
                options={{ title: 'היסטוריית האכלות' }}
              />
              <Stack.Screen
                name="AddBaby"
                component={AddBabyScreen}
                options={{ title: 'הוספת תינוק' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
