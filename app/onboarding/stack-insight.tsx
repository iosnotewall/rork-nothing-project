import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { PRODUCTS } from '@/constants/products';
import { GOALS } from '@/constants/content';
import PrimaryButton from '@/components/PrimaryButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StackInsightScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { products, goal, userName } = useAppState();

  const selectedProducts = PRODUCTS.filter(p => products.includes(p.id));
  const selectedGoal = GOALS.find(g => g.id === goal);
  const productCount = selectedProducts.length;

  const fadeIn = useRef(new Animated.Value(0)).current;
  const pillsAnim = useRef(new Animated.Value(0)).current;
  const countAnim = useRef(new Animated.Value(0)).current;
  const insightAnim = useRef(new Animated.Value(0)).current;
  const questionAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const pillAnims = useRef(selectedProducts.map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';

    Animated.sequence([
      Animated.delay(300),
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(400),
      Animated.timing(pillsAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
      Animated.stagger(100, pillAnims.map(a =>
        Animated.spring(a, { toValue: 1, damping: 12, stiffness: 180, useNativeDriver: useNative })
      )),
      Animated.delay(300),
      Animated.timing(countAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(600),
      Animated.timing(insightAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(400),
      Animated.timing(questionAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(300),
      Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: useNative }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 2000, useNativeDriver: useNative }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: useNative }),
      ])
    ).start();

    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 2200);
  }, []);

  const fadeSlide = (anim: Animated.Value, dist = 16) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [dist, 0] }) }],
  });

  const goalLabel = selectedGoal?.label?.toLowerCase() ?? 'your health';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.topSection, fadeSlide(fadeIn)]}>
          <Text style={styles.eyebrow}>YOUR STACK</Text>
          <Text style={styles.headline}>
            {userName ? `${userName}, you` : 'You'}'ve built a{'\n'}serious routine.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.pillsSection, { opacity: pillsAnim, transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.pillsGrid}>
            {selectedProducts.slice(0, 6).map((product, index) => (
              <Animated.View
                key={product.id}
                style={[
                  styles.pill,
                  {
                    opacity: pillAnims[index] ?? new Animated.Value(1),
                    transform: [{
                      scale: (pillAnims[index] ?? new Animated.Value(1)).interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 1],
                      }),
                    }],
                  },
                ]}
              >
                <View style={[styles.pillDot, { backgroundColor: product.color }]} />
                <Text style={styles.pillLabel} numberOfLines={1}>{product.name}</Text>
              </Animated.View>
            ))}
            {selectedProducts.length > 6 && (
              <View style={styles.pill}>
                <Text style={styles.pillMore}>+{selectedProducts.length - 6} more</Text>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View style={[styles.countCard, fadeSlide(countAnim)]}>
          <Text style={styles.countNumber}>{productCount}</Text>
          <View style={styles.countTextWrap}>
            <Text style={styles.countLabel}>
              supplement{productCount !== 1 ? 's' : ''} targeting
            </Text>
            <Text style={styles.countGoal}>{goalLabel}</Text>
          </View>
        </Animated.View>

        <Animated.View style={[styles.insightSection, fadeSlide(insightAnim)]}>
          <Text style={styles.insightText}>
            That's a powerful combination.{'\n'}
            <Text style={styles.insightMuted}>But only if you actually take them.</Text>
          </Text>
        </Animated.View>

        <Animated.View style={[styles.questionSection, fadeSlide(questionAnim)]}>
          <View style={styles.dividerLine} />
          <Text style={styles.questionText}>
            So what's stopping you?
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton title="Let's find out" onPress={() => router.push('/onboarding/friction' as any)} variant="white" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1D2F',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center' as const,
  },
  topSection: {
    marginBottom: 28,
  },
  eyebrow: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 2.5,
    marginBottom: 14,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.white,
    lineHeight: 38,
    letterSpacing: -0.3,
  },
  pillsSection: {
    marginBottom: 24,
  },
  pillsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
  },
  pill: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pillLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    maxWidth: SCREEN_WIDTH * 0.35,
  },
  pillMore: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  countCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(74,144,217,0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(74,144,217,0.2)',
    padding: 18,
    gap: 16,
    marginBottom: 32,
  },
  countNumber: {
    fontFamily: Fonts.heading,
    fontSize: 42,
    color: Colors.blue,
    lineHeight: 48,
    letterSpacing: -1,
  },
  countTextWrap: {
    flex: 1,
  },
  countLabel: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 20,
  },
  countGoal: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 16,
    color: Colors.white,
    marginTop: 2,
  },
  insightSection: {
    marginBottom: 28,
  },
  insightText: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.white,
    lineHeight: 32,
    letterSpacing: -0.2,
  },
  insightMuted: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: 'rgba(255,255,255,0.4)',
  },
  questionSection: {
    alignItems: 'flex-start' as const,
  },
  dividerLine: {
    width: 32,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 1,
    marginBottom: 16,
  },
  questionText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 17,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
