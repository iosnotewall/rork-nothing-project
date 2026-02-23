import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
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
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  const [barWidth, setBarWidth] = useState(0);

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
      Animated.timing(flipAnim, { toValue: 1, duration: 700, useNativeDriver: useNative }),
      Animated.delay(400),
      Animated.timing(barAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
      Animated.delay(200),
      Animated.timing(resultAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(300),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 3800);

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.7, duration: 1500, useNativeDriver: useNative }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1500, useNativeDriver: useNative }),
      ])
    ).start();
  }, []);

  const fadeSlide = (anim: Animated.Value, dist = 18) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  const currentBarWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (SCREEN_WIDTH - 80) * (consistencyPct / 100)],
  });

  const fullBarWidth = barAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0, 0, SCREEN_WIDTH - 80],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.problemSection, fadeSlide(problemAnim)]}>
          <Text style={styles.problemText}>{reframe.problem}</Text>
        </Animated.View>

        <Animated.View style={[styles.statCard, fadeSlide(statAnim)]}>
          <View style={styles.statDot} />
          <Text style={styles.statText}>{reframe.stat}</Text>
        </Animated.View>

        <Animated.View style={[styles.divider, { opacity: lineAnim, transform: [{ scaleX: lineAnim }] }]} />

        <Animated.View style={[styles.flipSection, fadeSlide(flipAnim)]}>
          <Text style={styles.flipText}>{reframe.flip}</Text>
        </Animated.View>

        <View style={styles.barSection}>
          <Animated.View style={{ opacity: barAnim }}>
            <Text style={styles.barLabel}>Your consistency today</Text>
            <View style={styles.barTrack}>
              <Animated.View style={[styles.barFillCurrent, { width: currentBarWidth }]} />
            </View>
            <View style={styles.barNumbers}>
              <Text style={styles.barPct}>{consistencyPct}%</Text>
              <Text style={styles.barWaste}>{wastePct}% wasted</Text>
            </View>
          </Animated.View>

          <Animated.View style={[{ marginTop: 20 }, { opacity: barAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0, 0, 1] }) }]}>
            <Text style={styles.barLabelGreen}>With Volera</Text>
            <View style={styles.barTrack}>
              <Animated.View style={[styles.barFillFull, { width: fullBarWidth }]}>
                <Animated.View style={[styles.barGlow, { opacity: glowAnim }]} />
              </Animated.View>
            </View>
            <View style={styles.barNumbers}>
              <Text style={styles.barPctGreen}>100%</Text>
              <Text style={styles.barNone}>0% wasted</Text>
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.resultSection, fadeSlide(resultAnim)]}>
          <Text style={styles.resultText}>
            Every supplement you own{'\n'}finally doing its job.
          </Text>
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
    backgroundColor: '#0B1A2E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center' as const,
  },
  problemSection: {
    marginBottom: 20,
  },
  problemText: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.white,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  statCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,77,77,0.1)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 28,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4D4D',
  },
  statText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 20,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 28,
  },
  flipSection: {
    marginBottom: 32,
  },
  flipText: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: '#4A90D9',
    lineHeight: 34,
    letterSpacing: -0.2,
  },
  barSection: {
    marginBottom: 32,
  },
  barLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase' as const,
  },
  barLabelGreen: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: 'rgba(62,175,108,0.7)',
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase' as const,
  },
  barTrack: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    overflow: 'hidden' as const,
  },
  barFillCurrent: {
    height: 12,
    backgroundColor: '#E8A838',
    borderRadius: 6,
  },
  barFillFull: {
    height: 12,
    backgroundColor: '#3EAF6C',
    borderRadius: 6,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  barGlow: {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
  },
  barNumbers: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginTop: 6,
  },
  barPct: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    color: '#E8A838',
  },
  barWaste: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(255,77,77,0.6)',
  },
  barPctGreen: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    color: '#3EAF6C',
  },
  barNone: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(62,175,108,0.5)',
  },
  resultSection: {
    paddingHorizontal: 4,
  },
  resultText: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
