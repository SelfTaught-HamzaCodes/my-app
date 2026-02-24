import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import JourneyScreen from '../screens/journey/JourneyScreen';
import DetailScreen from '../screens/journey/DetailScreen';

const Stack = createNativeStackNavigator();

/** Journey tab: list of reflections + detail screen when you tap one. Headers are hidden; screens draw their own. */
export default function JourneyStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#F4EFE7' },
        headerTintColor: '#2F2F2F',
        contentStyle: { backgroundColor: '#F4EFE7' },
      }}
    >
      <Stack.Screen
        name="JourneyList"
        component={JourneyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
