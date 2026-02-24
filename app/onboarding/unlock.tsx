import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions, LayoutChangeEvent } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Shield, Zap } from 'lucide-react-native';
import { useAppState } from '@/hooks/useAppState';
import { Fonts } from '@/constants/fonts';
import { FRICTION_OPTIONS } from '@/constants/content';
import PrimaryButton from '@/components/PrimaryButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FRICTION_REFRAMES: Record<string, { problem: string; flip: string; stat: string }> = {
  busy: {
    problem: 'Busy mornings steal your consistency',
    flip: 'What if it took less than 10 seconds?',
    stat: '83% of missed doses happen before 9am',
  },
  forget: {
    problem: 'Forgetting isn\'t a willpower problem',
    flip: 'What if you never had to remember?',
    stat: 'The average person forgets 3 out of 7 doses per week',
  },
  routine: {
    problem: 'Without a routine, supplements become optional',
    flip: 'What if it became automatic?',
    stat: 'People with routines are 4x more consistent',
  },
  motivation: {
    problem: 'Motivation fades. Systems don\'t.',
    flip: 'What if you didn\'t need motivation?',
    stat: '90% of people lose motivation within 2 weeks',
  },
  unsure: {
    problem: 'Hard to stay consistent when you can\'t see it working',
    flip: 'What if you could actually track progress?',
    stat: 'Results take 21+ days of consistency to feel',
  },
};

const DEFAULT_REFRAME = {
  problem: 'Life gets in the way of consistency',
  flip: 'What if consistency happened automatically?',
  stat: 'Most people waste 40%+ of their supplements',
};

export default function UnlockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { friction, missedDoses } = useAppState();

  const reframe = FRICTION_REFRAMES[friction] ?? DEFAULT_REFRAME;
  const daysPerWeek = missedDoses ?? 3;
  const consistencyPct = Math.round((daysPerWeek / 7) * 100);
  const wastePct = 100 - consistencyPct;

  const problemAnim = useRef(new Animated.Value(0)).current;
  const statAnim = useRef(new Animated.Value(0)).current;
  const lineAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const barAnim = useRef(new Animated.Value(0)).current;
  const resultAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const restContentAnim = useRef(new Animated.Value(0)).current;

  const [typedText, setTypedText] = useState<string>('');
  const [typewriterDone, setTypewriterDone] = useState<boolean>(false);
  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [trackWidth, setTrackWidth] = useState<number>(SCREEN_WIDTH - 80);

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) {
      setTrackWidth(w);
    }
  }, []);

  const startTypewriter = useCallback((text: string) => {
    let i = 0;
    const speed = 45;
    const tick = () => {
      if (i <= text.length) {
        setTypedText(text.slice(0, i));
        i++;
        typewriterRef.current = setTimeout(tick, speed);
      } else {
        setTypewriterDone(true);
      }
    };
    tick();
  }, []);

  useEffect(() => {
    const useNative = Platform.OS !== 'web';

    Animated.sequence([
      Animated.delay(400),
      Animated.timing(problemAnim, { toValue: 1, duration: 700, useNativeDriver: useNative }),
      Animated.delay(300),
      Animated.timing(statAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(800),
      Animated.timing(lineAnim, { toValue: 1, duration: 300, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(flipAnim, { toValue: 1, duration: 100, useNativeDriver: useNative }),
    ]).start();

    const typewriterDelay = 400 + 700 + 300 + 500 + 800 + 300 + 200 + 100;
    const typewriterTimeout = setTimeout(() => {
      startTypewriter(reframe.flip);
    }, typewriterDelay);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: useNative }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 2000, useNativeDriver: useNative }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 2500, useNativeDriver: false }),
    ).start();

    return () => {
      clearTimeout(typewriterTimeout);
      if (typewriterRef.current) clearTimeout(typewriterRef.current);
    };
  }, []);

  useEffect(() => {
    if (!typewriterDone) return;
    const useNative = Platform.OS !== 'web';

    Animated.sequence([
      Animated.delay(300),
      Animated.timing(restContentAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(barAnim, { toValue: 1, duration: 1400, useNativeDriver: false }),
      Animated.delay(200),
      Animated.timing(resultAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(300),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 500);
  }, [typewriterDone]);

  const fadeSlide = (anim: Animated.Value, dist = 18) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  const currentBarWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, trackWidth * (consistencyPct / 100)],
  });

  const fullBarWidth = barAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, trackWidth],
  });

  const shimmerLeft = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, trackWidth + 60],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bgGlow} />

      <View style={styles.content}>
        <Animated.View style={[styles.problemSection, fadeSlide(problemAnim)]}>
          <Text style={styles.problemText}>{reframe.problem}</Text>
        </Animated.View>

        <Animated.View style={[styles.statCard, fadeSlide(statAnim)]}>
          <View style={styles.statIconWrap}>
            <Shield size={14} color="#FF6B6B" strokeWidth={2.5} />
          </View>
          <Text style={styles.statText}>{reframe.stat}</Text>
        </Animated.View>

        <Animated.View style={[styles.divider, { opacity: lineAnim, transform: [{ scaleX: lineAnim }] }]} />

        <Animated.View style={[styles.flipSection, { opacity: flipAnim }]}>
          <Text style={styles.flipText}>
            {typedText}
            {!typewriterDone && <Text style={styles.cursor}>|</Text>}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.barSection, fadeSlide(restContentAnim)]}>
          <Animated.View style={{ opacity: barAnim }}>
            <Text style={styles.barLabel}>YOUR CONSISTENCY TODAY</Text>
            <View style={styles.barTrack} onLayout={onTrackLayout}>
              <Animated.View style={[styles.barFillCurrent, { width: currentBarWidth }]}>
                <View style={styles.barFillInner} />
              </Animated.View>
            </View>
            <View style={styles.barNumbers}>
              <Text style={styles.barPct}>{consistencyPct}%</Text>
              <Text style={styles.barWaste}>{wastePct}% wasted</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.voleraBarWrap, { opacity: barAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] }) }]}>
            <View style={styles.voleraLabelRow}>
              <Zap size={12} color="#34D399" strokeWidth={2.5} />
              <Text style={styles.barLabelGreen}>WITH VOLERA</Text>
            </View>
            <View style={styles.barTrack}>
              <Animated.View style={[styles.barFillFull, { width: fullBarWidth }]}>
                <Animated.View style={[styles.shimmer, { left: shimmerLeft }]} />
              </Animated.View>
            </View>
            <View style={styles.barNumbers}>
              <Text style={styles.barPctGreen}>100%</Text>
              <Text style={styles.barNone}>0% wasted</Text>
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.resultSection, fadeSlide(resultAnim)]}>
          <Animated.View style={[styles.resultCard, { opacity: pulseAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.85, 1, 0.85] }) }]}>
            <Text style={styles.resultText}>
              Every supplement you own{'\n'}finally doing its job.
            </Text>
          </Animated.View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton title="Show me what changes" onPress={() => router.push('/onboarding/trajectory' as any)} variant="white" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070F1C',
  },
  bgGlow: {
    position: 'absolute' as const,
    top: -100,
    left: SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 0.7,
    height: 300,
    borderRadius: 200,
    backgroundColor: 'rgba(52, 211, 153, 0.04)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center' as const,
  },
  problemSection: {
    marginBottom: 18,
  },
  problemText: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: '#F1F5F9',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  statCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,107,107,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.12)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 28,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,107,107,0.12)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  statText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 20,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 28,
  },
  flipSection: {
    marginBottom: 36,
  },
  flipText: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: '#FFFFFF',
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  cursor: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: 'rgba(255,255,255,0.5)',
  },
  barSection: {
    marginBottom: 28,
  },
  barLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  barLabelGreen: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: 'rgba(52,211,153,0.7)',
    letterSpacing: 1.2,
  },
  voleraBarWrap: {
    marginTop: 24,
  },
  voleraLabelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    marginBottom: 10,
  },
  barTrack: {
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 7,
    overflow: 'hidden' as const,
  },
  barFillCurrent: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F59E0B',
    overflow: 'hidden' as const,
  },
  barFillInner: {
    flex: 1,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  barFillFull: {
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34D399',
    overflow: 'hidden' as const,
  },
  shimmer: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    width: 50,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 7,
  },
  barNumbers: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: 8,
  },
  barPct: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 15,
    color: '#F59E0B',
  },
  barWaste: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(255,107,107,0.5)',
  },
  barPctGreen: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 15,
    color: '#34D399',
  },
  barNone: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(52,211,153,0.45)',
  },
  resultSection: {
    paddingHorizontal: 0,
  },
  resultCard: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(52,211,153,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.1)',
  },
  resultText: {
    fontFamily: Fonts.heading,
    fontSize: 19,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 28,
    letterSpacing: -0.2,
    textAlign: 'center' as const,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
