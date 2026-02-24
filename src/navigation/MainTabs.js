import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import ReflectScreen from '../screens/reflect/ReflectScreen';
import JourneyStack from './JourneyStack';
import GrowthScreen from '../screens/growth/GrowthScreen';
import IntentionsScreen from '../screens/intentions/IntentionsScreen';

const Tab = createBottomTabNavigator();

/** Bottom tabs: Reflect (home), Journey, Growth, Intentions. Tab bar and icons use theme colors. */
export default function MainTabs() {
  const { colors, isDark } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.tabBar, borderTopColor: colors.tabBarBorder },
        tabBarActiveTintColor: isDark ? '#FFFFFF' : colors.accent,
        tabBarInactiveTintColor: isDark ? '#504D49' : colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Reflect: 'home',
            Journey: 'star',
            Growth: 'bar-chart',
            Intentions: 'settings',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Reflect"
        component={ReflectScreen}
        options={{ title: 'Reflect', headerShown: false }}
      />
      <Tab.Screen
        name="Journey"
        component={JourneyStack}
        options={{ title: 'Journey', headerShown: false }}
      />
      <Tab.Screen
        name="Growth"
        component={GrowthScreen}
        options={{ title: 'Growth', headerShown: false }}
      />
      <Tab.Screen
        name="Intentions"
        component={IntentionsScreen}
        options={{ title: 'Intentions', headerShown: false }}
      />
    </Tab.Navigator>
  );
}
