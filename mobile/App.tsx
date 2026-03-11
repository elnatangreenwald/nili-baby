import React, { useState, useEffect } from 'react';
import { StatusBar, I18nManager, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'בית',
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
          headerTitle: 'Nili Baby',
        }}
      />
      <Tab.Screen
        name="Reminders"
        component={RemindersScreen}
        options={{
          title: 'תזכורות',
          tabBarIcon: ({ color }) => <TabIcon icon="⏰" color={color} />,
          headerTitle: 'תזכורות',
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          title: 'תורים',
          tabBarIcon: ({ color }) => <TabIcon icon="📅" color={color} />,
          headerTitle: 'תורים',
        }}
      />
      <Tab.Screen
        name="Settings"
        options={{
          title: 'הגדרות',
          tabBarIcon: ({ color }) => <TabIcon icon="⚙️" color={color} />,
          headerTitle: 'הגדרות',
        }}
      >
        {(props) => <SettingsScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const TabIcon = ({ icon, color }: { icon: string; color: string }) => (
  <React.Fragment>{icon}</React.Fragment>
);

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    soundService.init();
    
    return () => {
      soundService.cleanup();
    };
  }, []);

  const checkAuth = async () => {
    const token = await storage.getToken();
    setIsLoggedIn(!!token);
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
    checkAuth();
  };

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <SplashScreen onFinish={handleSplashFinish} />
      </SafeAreaProvider>
    );
  }

  if (isLoggedIn === null) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.white,
            headerTitleStyle: {
              fontWeight: '600',
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
