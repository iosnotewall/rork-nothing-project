import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

export default function ConsiderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName } = useAppState();
  const textAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.push('/onboarding/missed-doses' as any);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Animated.View
        style={[
          styles.center,
          {
            opacity: textAnim,
            transform: [{
              scale: textAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.92, 1],
              }),
            }],
          },
        ]}
      >
        <Text style={styles.text}>
          ever feel like you bought{'\n'}all these supplements that{'\n'}are doing nothing?
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 40,
  },
  text: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
});
