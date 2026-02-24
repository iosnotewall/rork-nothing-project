import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOALS } from '@/constants/content';

export default function PlanReadyScreen() {
  const router = useRouter();
  const { userName, goal } = useAppState();
  const goalData = GOALS.find(g => g.id === goal);

  const readyAnim = useRef(new Animated.Value(0)).current;
  const dateAnim = useRef(new Animated.Value(0)).current;
  const hookAnim = useRef(new Animated.Value(0)).current;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 30);
  const dateStr = targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.sequence([
      Animated.timing(readyAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(300),
      Animated.spring(dateAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 14, stiffness: 120 }),
      Animated.delay(500),
      Animated.timing(hookAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, []);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  });

  return (
    <OnboardingScreen step={8} totalSteps={9} ctaText="I'm ready" onCta={() => router.push('/onboarding/paywall' as any)}>
      <View style={styles.center}>
        <Animated.Text style={[styles.readyLabel, fadeSlide(readyAnim)]}>
          Your protocol is ready{userName ? `, ${userName}` : ''}.
        </Animated.Text>

        <Animated.View style={[styles.dateCard, fadeSlide(dateAnim)]}>
          <Text style={styles.dateLabel}>YOUR TARGET</Text>
          <Text style={styles.dateValue}>{dateStr}</Text>
          <View style={styles.dateDivider} />
          <Text style={styles.dateGoal}>
            By this date, you'll feel {goalData?.feeling || 'the difference'} — consistently.
          </Text>
        </Animated.View>

        <Animated.Text style={[styles.hook, fadeSlide(hookAnim)]}>
          But only if you show up.
        </Animated.Text>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  readyLabel: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.navy,
    textAlign: 'center' as const,
    lineHeight: 36,
    marginBottom: 32,
  },
  dateCard: {
    backgroundColor: '#0B1A2E',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: 'center' as const,
    marginBottom: 32,
    width: '100%',
  },
  dateLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  dateValue: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.white,
  },
  dateDivider: {
    width: 32,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: 14,
  },
  dateGoal: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  hook: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    color: Colors.darkGray,
    textAlign: 'center' as const,
  },
});
