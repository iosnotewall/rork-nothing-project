import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import {
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { AppStateProvider } from '@/hooks/useAppState';

if (Platform.OS !== 'web') {
  try {
    SplashScreen.preventAutoHideAsync();
  } catch (e) {
    console.log('SplashScreen.preventAutoHideAsync error:', e);
  }
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
    </Stack>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.log('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errStyles.container}>
          <Text style={errStyles.title}>Something went wrong</Text>
          <Text style={errStyles.message}>{this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const errStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: '#F9F7F4' },
  title: { fontSize: 18, fontWeight: '600' as const, color: '#1A1F3C', marginBottom: 8 },
  message: { fontSize: 14, color: '#8A8A8A', textAlign: 'center' as const },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Figtree_600SemiBold,
    Figtree_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      console.log('Fonts ready:', { fontsLoaded, fontError: fontError?.message });
      if (Platform.OS !== 'web') {
        SplashScreen.hideAsync().catch((e) => {
          console.log('SplashScreen.hideAsync error:', e);
        });
      }
    }
  }, [fontsLoaded, fontError]);

  const isReady = Platform.OS === 'web' || !!fontsLoaded || !!fontError;

  if (!isReady) {
    return null;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppStateProvider>
          <RootLayoutNav />
        </AppStateProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
