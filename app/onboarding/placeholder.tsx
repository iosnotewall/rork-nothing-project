import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/components/PrimaryButton';

export default function PlaceholderScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton
          title="Continue"
          onPress={() => router.push('/onboarding/notification' as any)}
          variant="white"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2E',
    justifyContent: 'flex-end',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
