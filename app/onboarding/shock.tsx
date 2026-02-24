import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';

export default function ShockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [count, setCount] = useState(0);

  const topAnim = useRef(new Animated.Value(0)).current;
  const counterValue = useRef(new Animated.Value(0)).current;
  const butAnim = useRef(new Animated.Value(0)).current;
  const feelingAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = counterValue.addListener(({ value }) => {
      setCount(Math.round(value));
    });

    Animated.sequence([
      Animated.delay(400),
      Animated.timing(topAnim, { toValue: 1, duration: 600, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(500),
      Animated.timing(butAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(200),
      Animated.timing(counterValue, { toValue: 57, duration: 1600, useNativeDriver: false }),
      Animated.delay(600),
      Animated.timing(feelingAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(300),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 2400);

    return () => counterValue.removeListener(listener);
  }, []);

  const fadeSlide = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 48 }]}>
      <View style={styles.content}>

        <Animated.View style={[styles.payingBlock, fadeSlide(topAnim)]}>
          <Text style={styles.payingLine}>You're paying for</Text>
          <Text style={styles.hundredPct}>100%</Text>
        </Animated.View>

        <Animated.View style={[styles.butBlock, fadeSlide(butAnim)]}>
          <Text style={styles.butLine}>but you're only getting</Text>
          <Text style={styles.counterPct}>{count}%</Text>
        </Animated.View>

        <Animated.View style={[styles.feelingWrap, fadeSlide(feelingAnim)]}>
          <View style={styles.accentLine} />
          <Text style={styles.feelingText}>
            No wonder you don't feel{'\n'}the way you should.
          </Text>
        </Animated.View>

      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton title="Let's fix that" onPress={() => router.push('/onboarding/goal' as any)} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center' as const,
    gap: 6,
  },
  payingBlock: {
    marginBottom: 8,
  },
  payingLine: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.mediumGray,
    marginBottom: 2,
  },
  hundredPct: {
    fontFamily: Fonts.heading,
    fontSize: 72,
    color: Colors.navy,
    letterSpacing: -2,
    lineHeight: 80,
    opacity: 0.28,
  },
  butBlock: {
    marginBottom: 40,
  },
  butLine: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.mediumGray,
    marginBottom: 2,
  },
  counterPct: {
    fontFamily: Fonts.heading,
    fontSize: 88,
    color: Colors.warning,
    letterSpacing: -3,
    lineHeight: 96,
  },
  feelingWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 14,
  },
  accentLine: {
    width: 3,
    height: 44,
    backgroundColor: Colors.warning,
    borderRadius: 2,
    opacity: 0.7,
  },
  feelingText: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.navy,
    lineHeight: 28,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
