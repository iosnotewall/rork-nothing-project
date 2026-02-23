import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { FRICTION_OPTIONS } from '@/constants/content';

export default function FrictionScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string>('');
  const scaleAnims = useRef(FRICTION_OPTIONS.map(() => new Animated.Value(1))).current;

  const handleSelect = useCallback((id: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
    Animated.sequence([
      Animated.spring(scaleAnims[index], { toValue: 0.96, useNativeDriver: Platform.OS !== 'web', speed: 50, bounciness: 0 }),
      Animated.spring(scaleAnims[index], { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 15, stiffness: 200 }),
    ]).start();
  }, [scaleAnims]);

  const handleContinue = useCallback(() => {
    updateState({ friction: selected });
    router.push('/onboarding/unlock' as any);
  }, [selected, updateState, router]);

  return (
    <OnboardingScreen step={5} totalSteps={9} ctaText="That's my struggle" ctaEnabled={!!selected} onCta={handleContinue}>
      <Text style={styles.headline}>What gets in the way of taking them?</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.options}>
          {FRICTION_OPTIONS.map((option, index) => {
            const isSelected = selected === option.id;
            return (
              <Animated.View key={option.id} style={{ transform: [{ scale: scaleAnims[index] }] }}>
                <TouchableOpacity
                  onPress={() => handleSelect(option.id, index)}
                  style={[styles.optionCard, isSelected && styles.optionSelected]}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{option.emoji}</Text>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>{option.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.navy,
    lineHeight: 34,
    marginTop: 8,
    marginBottom: 20,
  },
  options: {
    gap: 12,
    paddingBottom: 20,
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
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.navy,
    flex: 1,
  },
  optionLabelSelected: {
    color: Colors.navy,
  },
});
