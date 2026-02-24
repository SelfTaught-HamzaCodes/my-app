import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_600SemiBold,
  CormorantGaramond_400Regular,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { PlayfairDisplay_600SemiBold } from '@expo-google-fonts/playfair-display';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { rescheduleFromStorage } from './src/services/reminderNotifications';
import RootNavigator from './src/navigation/RootNavigator';

/** Wraps the app with theme and status bar; on mount, restores the daily reminder if the user had it on. */
function AppContent() {
  const { isDark } = useTheme();
  useEffect(() => {
    rescheduleFromStorage();
  }, []);
  return (
    <View style={styles.root}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_400Regular,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlayfairDisplay_600SemiBold,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6E7F5F" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4EFE7',
  },
});
