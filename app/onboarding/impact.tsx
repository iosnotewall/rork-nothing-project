import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

export default function ImpactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userName, missedDoses } = useAppState();

  const daysPerWeek = missedDoses ?? 3;
  const missedPerWeek = 7 - daysPerWeek;
  const missedPerYear = missedPerWeek * 52;
  const weeksLost = Math.round(missedPerYear / 7);
  const monthsLost = Math.round(weeksLost / 4.3);

  const line1Anim = useRef(new Animated.Value(0)).current;
  const line2Anim = useRef(new Animated.Value(0)).current;
  const line3Anim = useRef(new Animated.Value(0)).current;
  const line4Anim = useRef(new Animated.Value(0)).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;
  const dividerAnim = useRef(new Animated.Value(0)).current;

  const [counterVal, setCounterVal] = useState(0);
  const counterAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = counterAnim.addListener(({ value }) => {
      setCounterVal(Math.round(value));
    });

    Animated.sequence([
      Animated.delay(300),
      Animated.timing(line1Anim, { toValue: 1, duration: 450, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(counterAnim, { toValue: missedPerYear, duration: 1200, useNativeDriver: false }),
        Animated.timing(line2Anim, { toValue: 1, duration: 450, useNativeDriver: Platform.OS !== 'web' }),
      ]),
      Animated.delay(400),
      Animated.timing(dividerAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
      Animated.delay(100),
      Animated.timing(line3Anim, { toValue: 1, duration: 450, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(400),
      Animated.timing(line4Anim, { toValue: 1, duration: 450, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(300),
      Animated.timing(ctaAnim, { toValue: 1, duration: 350, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 1500);

    return () => counterAnim.removeListener(listener);
  }, []);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  });

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/onboarding/shock' as any);
  };

  const dividerWidth = dividerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.textBlock}>
          <Animated.Text style={[styles.nameLine, fadeSlide(line1Anim)]}>
            <Text style={styles.nameHighlight}>{userName || 'friend'}</Text>
            <Text style={styles.headingText}>, you'll miss about</Text>
          </Animated.Text>

          <Animated.View style={[styles.dosesRow, fadeSlide(line2Anim)]}>
            <Text style={styles.bigNumber}>{counterVal}</Text>
            <Text style={styles.dosesLabel}> doses</Text>
            <Text style={styles.headingText}> this year</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.divider, { width: dividerWidth }]} />

        <View style={styles.statsBlock}>
          <Animated.Text style={[styles.statLine, fadeSlide(line3Anim)]}>
            that's <Text style={styles.accentBlue}>{weeksLost} weeks</Text> of lost progress
          </Animated.Text>

          <Animated.Text style={[styles.statLine, fadeSlide(line4Anim)]}>
            or <Text style={styles.accentBlue}>{monthsLost} months</Text> your body could've{`\n`}been improving...
          </Animated.Text>
        </View>

        <Animated.Text style={[styles.ghostLine, fadeSlide(ctaAnim)]}>
          what if you never missed again?
        </Animated.Text>
      </View>

      <Animated.View style={[styles.footer, { opacity: ctaAnim, paddingBottom: Math.max(insets.bottom, 24) }]}>
        <TouchableOpacity
          onPress={handleContinue}
          style={styles.ctaRow}
          activeOpacity={0.7}
          testID="impact-continue"
        >
          <Text style={styles.ctaText}>tap to continue</Text>
          <ArrowRight size={18} color={Colors.blue} strokeWidth={2.5} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center' as const,
    gap: 24,
  },
  textBlock: {
    gap: 6,
  },
  nameLine: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
  nameHighlight: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.gold,
    lineHeight: 42,
  },
  headingText: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.white,
    lineHeight: 42,
  },
  dosesRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    alignItems: 'baseline' as const,
  },
  bigNumber: {
    fontFamily: Fonts.heading,
    fontSize: 48,
    color: Colors.gold,
    lineHeight: 56,
  },
  dosesLabel: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.gold,
    lineHeight: 42,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  statsBlock: {
    gap: 12,
  },
  statLine: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 22,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 32,
  },
  accentBlue: {
    color: Colors.blue,
  },
  ghostLine: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 32,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 28,
  },
  ctaRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-end' as const,
    gap: 8,
    paddingVertical: 12,
  },
  ctaText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.45)',
  },
});
