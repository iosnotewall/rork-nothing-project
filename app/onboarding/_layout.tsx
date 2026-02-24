import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
      <Stack.Screen name="slap" options={{ animation: 'fade' }} />
      <Stack.Screen name="bridge" options={{ animation: 'fade' }} />
      <Stack.Screen name="name" options={{ animation: 'fade' }} />
      <Stack.Screen name="consider" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="missed-doses" options={{ animation: 'fade' }} />
      <Stack.Screen name="impact" options={{ animation: 'fade' }} />
      <Stack.Screen name="goal" options={{ animation: 'fade' }} />
      <Stack.Screen name="products" options={{ animation: 'fade' }} />
      <Stack.Screen name="stack-insight" options={{ animation: 'fade' }} />
      <Stack.Screen name="friction" options={{ animation: 'fade' }} />
      <Stack.Screen name="unlock" options={{ animation: 'fade' }} />
      <Stack.Screen name="trajectory" options={{ animation: 'fade' }} />
      <Stack.Screen name="placeholder" options={{ animation: 'fade' }} />
      <Stack.Screen name="notification" options={{ animation: 'fade' }} />
      <Stack.Screen name="loading" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="plan-ready" options={{ animation: 'fade' }} />
      <Stack.Screen name="paywall" options={{ animation: 'fade' }} />
    </Stack>
  );
}
