import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Easing, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

const NAVY = '#0B1A2E';
const ACCENT = Colors.blue;
const MUTED = '#8A919E';

const HEADING_LINES = [
  { text: 'Velora makes your', highlight: false },
  { text: 'supplements', highlight: false },
  { text: 'actually work.', highlight: true },
];

const BODY_LINES = [
  "it's simple.",
  'every day, you track.',
  'every day, you feel the results.',
];

const LINE_READ_DELAY = 550;
const BODY_START_DELAY = 400;
const BODY_LINE_DELAY = 450;
const FADE_DURATION = 350;

export default function BridgeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const advancedRef = useRef(false);

  const headingAnims = useRef(HEADING_LINES.map(() => new Animated.Value(0))).current;
  const bodyAnims = useRef(BODY_LINES.map(() => new Animated.Value(0))).current;
  const footerAnim = useRef(new Animated.Value(0)).current;

  const advance = () => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/name' as any);
  };

  useEffect(() => {
    const easing = Easing.out(Easing.cubic);

    const headingSequence = headingAnims.flatMap((anim, i) => [
      ...(i === 0 ? [Animated.delay(300)] : [Animated.delay(LINE_READ_DELAY)]),
      Animated.timing(anim, { toValue: 1, duration: FADE_DURATION, useNativeDriver: Platform.OS !== 'web', easing }),
    ]);

    const bodySequence = bodyAnims.flatMap((anim, i) => [
      ...(i === 0 ? [Animated.delay(BODY_START_DELAY)] : [Animated.delay(BODY_LINE_DELAY)]),
      Animated.timing(anim, { toValue: 1, duration: FADE_DURATION, useNativeDriver: Platform.OS !== 'web', easing }),
    ]);

    Animated.sequence([
      ...headingSequence,
      ...bodySequence,
      Animated.delay(250),
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
            {HEADING_LINES.map((line, i) => (
              <Animated.Text
                key={i}
                style={[
                  styles.heading,
                  line.highlight && styles.headingHighlight,
                  fadeSlide(headingAnims[i]),
                ]}
              >
                {line.text}
              </Animated.Text>
            ))}
          </View>

          <View style={styles.bodyBlock}>
            {BODY_LINES.map((line, i) => (
              <Animated.Text key={i} style={[styles.body, fadeSlide(bodyAnims[i], 8)]}>
                {line}
              </Animated.Text>
            ))}
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
  headingHighlight: {
    color: ACCENT,
  },
  bodyBlock: {
    gap: 6,
  },
  body: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 19,
    color: MUTED,
    lineHeight: 30,
    letterSpacing: 0.1,
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
