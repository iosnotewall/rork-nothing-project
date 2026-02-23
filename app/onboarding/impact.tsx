import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GAUGE_SIZE = Math.min(SCREEN_WIDTH * 0.56, 240);
const STROKE_WIDTH = 10;
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const GAUGE_BG_COLOR = 'rgba(255,255,255,0.08)';

export default function ImpactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName, missedDoses } = useAppState();

  const daysPerWeek = missedDoses ?? 3;
  const consistencyPct = Math.round((daysPerWeek / 7) * 100);

  const sceneAnim = useRef(new Animated.Value(0)).current;
  const pctAnim = useRef(new Animated.Value(0)).current;
  const gaugeAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(0)).current;
  const punchAnim = useRef(new Animated.Value(0)).current;
  const moneyAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [displayPct, setDisplayPct] = useState(0);
  const [strokeDashoffset, setStrokeDashoffset] = useState(CIRCUMFERENCE);

  const gaugeColor = consistencyPct >= 70 ? '#3AAF6C' : consistencyPct >= 45 ? '#E8A838' : '#FF4D4D';

  useEffect(() => {
    const useNative = Platform.OS !== 'web';

    const pctListener = pctAnim.addListener(({ value }) => {
      setDisplayPct(Math.round(value));
    });

    const gaugeListener = gaugeAnim.addListener(({ value }) => {
      const offset = CIRCUMFERENCE - (CIRCUMFERENCE * value);
      setStrokeDashoffset(offset);
    });

    Animated.sequence([
      Animated.delay(200),
      Animated.timing(sceneAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(gaugeAnim, { toValue: consistencyPct / 100, duration: 1800, useNativeDriver: false }),
        Animated.timing(pctAnim, { toValue: consistencyPct, duration: 1800, useNativeDriver: false }),
      ]),
      Animated.parallel([
        Animated.timing(labelAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: useNative }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: useNative }),
          Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: useNative }),
          Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: useNative }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: useNative }),
        ]),
      ]),
      Animated.delay(500),
      Animated.timing(punchAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(300),
      Animated.timing(moneyAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(300),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 2600);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1500, useNativeDriver: useNative }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: useNative }),
      ])
    ).start();

    return () => {
      pctAnim.removeListener(pctListener);
      gaugeAnim.removeListener(gaugeListener);
    };
  }, []);

  const fadeSlide = (anim: Animated.Value, dist = 18) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  const handleContinue = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/trajectory' as any);
  }, [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.topSection, fadeSlide(sceneAnim)]}>
          <Text style={styles.eyebrow}>YOUR REALITY CHECK</Text>
          <Text style={styles.headline}>
            {userName || 'Your'} supplements{'\n'}are only working at
          </Text>
        </Animated.View>

        <Animated.View style={[styles.gaugeSection, { transform: [{ scale: pulseAnim }, { translateX: shakeAnim }] }]}>
          <View style={styles.gaugeContainer}>
            <Svg width={GAUGE_SIZE} height={GAUGE_SIZE} style={styles.gaugeSvg}>
              <Circle
                cx={GAUGE_SIZE / 2}
                cy={GAUGE_SIZE / 2}
                r={RADIUS}
                stroke={GAUGE_BG_COLOR}
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              <Circle
                cx={GAUGE_SIZE / 2}
                cy={GAUGE_SIZE / 2}
                r={RADIUS}
                stroke={gaugeColor}
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={`${CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${GAUGE_SIZE / 2}, ${GAUGE_SIZE / 2}`}
              />
            </Svg>
            <View style={styles.gaugeCenter}>
              <Text style={[styles.pctNumber, { color: gaugeColor }]}>{displayPct}%</Text>
              <Animated.Text style={[styles.pctLabel, { opacity: labelAnim }]}>
                effectiveness
              </Animated.Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.punchSection, fadeSlide(punchAnim)]}>
          <Text style={styles.punchLine}>
            You're paying for 100%.{'\n'}
            <Text style={[styles.punchHighlight, { color: gaugeColor }]}>
              You're only getting {consistencyPct}%.
            </Text>
          </Text>
        </Animated.View>

        <Animated.View style={[styles.moneySection, fadeSlide(moneyAnim)]}>
          <View style={[styles.moneyDot, { backgroundColor: gaugeColor }]} />
          <Text style={styles.moneyText}>
            That's {100 - consistencyPct}% of your investment wasted — every single month.
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton title="What can I do?" onPress={handleContinue} variant="white" />
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
  topSection: {
    marginBottom: 36,
  },
  eyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 2.5,
    marginBottom: 12,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.white,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  gaugeSection: {
    alignItems: 'center' as const,
    marginBottom: 40,
  },
  gaugeContainer: {
    width: GAUGE_SIZE,
    height: GAUGE_SIZE,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  gaugeSvg: {
    position: 'absolute' as const,
  },
  gaugeCenter: {
    alignItems: 'center' as const,
  },
  pctNumber: {
    fontFamily: Fonts.heading,
    fontSize: 52,
    letterSpacing: -2,
    lineHeight: 58,
  },
  pctLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  punchSection: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  punchLine: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 30,
    textAlign: 'center' as const,
  },
  punchHighlight: {
    fontFamily: Fonts.heading,
    fontSize: 20,
  },
  moneySection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  moneyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  moneyText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 20,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
