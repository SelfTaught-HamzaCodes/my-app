import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { getOnboardingDone } from '../data/storage';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator();

/**
 * Root navigator: shows either onboarding (first time) or the main tab app.
 * We read the onboarding flag from storage once on mount, then show the right initial screen.
 */
export default function RootNavigator() {
  const [isOnboardingDone, setIsOnboardingDone] = useState(null);

  useEffect(() => {
    getOnboardingDone().then(setIsOnboardingDone);
  }, []);

  if (isOnboardingDone === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6E7F5F" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isOnboardingDone ? 'Main' : 'Onboarding'}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F4EFE7' },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4EFE7',
  },
});
