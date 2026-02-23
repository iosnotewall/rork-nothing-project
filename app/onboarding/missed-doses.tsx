import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

const OPTIONS = [
  {
    id: 'one-two',
    label: '1–2 days a week',
    desc: 'I forget more than I remember',
    emoji: '😬',
    value: 2,
  },
  {
    id: 'three-four',
    label: '3–4 days a week',
    desc: 'I try but life gets in the way',
    emoji: '🎲',
    value: 4,
  },
  {
    id: 'five-six',
    label: '5–6 days a week',
    desc: 'Pretty good, just slip sometimes',
    emoji: '💪',
    value: 6,
  },
  {
    id: 'every-day',
    label: 'Every single day',
    desc: 'Locked in, never miss',
    emoji: '🔥',
    value: 7,
  },
];

export default function MissedDosesScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string | null>(null);

  const scaleAnims = useRef(OPTIONS.map(() => new Animated.Value(1))).current;

  const handleSelect = useCallback((id: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
    Animated.sequence([
      Animated.spring(scaleAnims[index], { toValue: 0.96, useNativeDriver: Platform.OS !== 'web', speed: 50, bounciness: 0 }),
      Animated.spring(scaleAnims[index], { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 15, stiffness: 200 }),
    ]).start();
  }, [scaleAnims]);

  const handleContinue = useCallback(() => {
    if (selected === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const option = OPTIONS.find(o => o.id === selected);
    if (!option) return;

    updateState({ missedDoses: option.value });

    router.push('/onboarding/impact' as any);
  }, [selected, updateState, router]);

  return (
    <OnboardingScreen step={1} totalSteps={9} ctaText="Continue" ctaEnabled={selected !== null} onCta={handleContinue}>
      <Text style={styles.eyebrow}>be honest</Text>
      <Text style={styles.headline}>How often do you actually take your supplements?</Text>

      <View style={styles.optionsWrap}>
        {OPTIONS.map((option, index) => {
          const isSelected = selected === option.id;
          return (
            <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnims[index] }] }}>
              <TouchableOpacity
                onPress={() => handleSelect(option.id, index)}
                style={[styles.optionCard, isSelected && styles.optionSelected]}
                activeOpacity={0.7}
                testID={`missed-doses-${option.id}`}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelActive]}>
                    {option.label}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    marginTop: 8,
    marginBottom: 10,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.navy,
    lineHeight: 34,
    marginBottom: 24,
  },
  optionsWrap: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 16,
  },
  optionSelected: {
    borderColor: Colors.navy,
    borderWidth: 2,
    backgroundColor: Colors.softBlue,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.navy,
  },
  optionLabelActive: {
    color: Colors.navy,
  },
  optionDesc: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  optionDescActive: {
    color: Colors.darkGray,
  },
});
