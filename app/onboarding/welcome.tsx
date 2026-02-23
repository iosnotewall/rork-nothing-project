import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Easing, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowRight } from 'lucide-react-native';
import { Fonts } from '@/constants/fonts';

const NAVY = '#0B1A2E';
const MUTED = '#8A919E';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const advancedRef = useRef(false);

  const heyAnim = useRef(new Animated.Value(0)).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  const advance = () => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/slap' as any);
  };

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);

    Animated.sequence([
      Animated.delay(300),
      Animated.timing(heyAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web', easing }),
      Animated.delay(200),
      Animated.timing(footerAnim, { toValue: 1, duration: 350, useNativeDriver: Platform.OS !== 'web', easing }),
    ]).start();
  }, []);

  const fadeSlide = (anim: Animated.Value, distance = 10) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [distance, 0],
        extrapolate: 'clamp' as const,
      }),
    }],
  });

  return (
    <Pressable style={{ flex: 1 }} onPress={advance}>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          <View style={styles.headingBlock}>
            <Animated.Text style={[styles.heading, fadeSlide(heyAnim)]}>
              hey
            </Animated.Text>
          </View>
        </View>

        <Animated.View style={[styles.footer, { opacity: footerAnim }]}>
          <Text style={styles.tapText}>tap to continue</Text>
          <ArrowRight size={18} color={MUTED} strokeWidth={2.5} />
        </Animated.View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 120,
    gap: 40,
  },
  headingBlock: {
    gap: 2,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 32,
    color: NAVY,
    lineHeight: 42,
    letterSpacing: -0.3,
  },
  footer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    paddingHorizontal: 28,
    paddingBottom: 20,
    gap: 8,
  },
  tapText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 16,
    color: MUTED,
    letterSpacing: 0.3,
  },
});
