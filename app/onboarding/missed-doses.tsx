import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, Check } from 'lucide-react-native';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

const OPTIONS = [
  {
    id: 'one-two' as const,
    label: '1-2 days a week',
    desc: 'I forget more than I remember',
    value: 2,
    pct: 21.4,
  },
  {
    id: 'three-four' as const,
    label: '3-4 days a week',
    desc: 'I try but life gets in the way',
    value: 4,
    pct: 50,
  },
  {
    id: 'five-six' as const,
    label: '5-6 days a week',
    desc: 'Pretty good, just slip sometimes',
    value: 6,
    pct: 78.5,
  },
  {
    id: 'every-day' as const,
    label: 'Every single day',
    desc: 'Locked in, never miss',
    value: 7,
    pct: 100,
  },
];

const HONESTY_OPTIONS = [
  { id: 'most-days', resolvedId: 'five-six', label: 'Most days, I slip sometimes' },
  { id: 'skip-few', resolvedId: 'three-four', label: 'I skip a few days' },
  { id: 'really-every', resolvedId: 'every-day', label: 'No really — every day' },
];

export default function MissedDosesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string | null>(null);
  const [showHonestyScreen, setShowHonestyScreen] = useState(false);
  const [honestySelected, setHonestySelected] = useState<string | null>(null);

  const screenAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const honestyOptionAnims = useRef(HONESTY_OPTIONS.map(() => new Animated.Value(0))).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  const scaleAnims = useRef(OPTIONS.map(() => new Animated.Value(1))).current;

  const animateHonestyIn = useCallback(() => {
    screenAnim.setValue(0);
    titleAnim.setValue(0);
    subtitleAnim.setValue(0);
    honestyOptionAnims.forEach(a => a.setValue(0));
    btnAnim.setValue(0);

    Animated.sequence([
      Animated.timing(screenAnim, { toValue: 1, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(titleAnim, { toValue: 1, duration: 400, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(subtitleAnim, { toValue: 1, duration: 350, useNativeDriver: Platform.OS !== 'web' }),
      Animated.stagger(80, honestyOptionAnims.map(a =>
        Animated.spring(a, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 20, stiffness: 140 })
      )),
    ]).start();
  }, [screenAnim, titleAnim, subtitleAnim, honestyOptionAnims, btnAnim]);

  const openHonestyScreen = useCallback(() => {
    setShowHonestyScreen(true);
    setHonestySelected(null);
    animateHonestyIn();
  }, [animateHonestyIn]);

  const closeHonestyScreen = useCallback((chosenResolvedId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(screenAnim, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start(() => {
      setShowHonestyScreen(false);
      setSelected(chosenResolvedId);
    });
  }, [screenAnim]);

  const dismissHonestyScreen = useCallback(() => {
    Animated.timing(screenAnim, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start(() => {
      setShowHonestyScreen(false);
    });
  }, [screenAnim]);

  const handleHonestySelect = useCallback((opt: typeof HONESTY_OPTIONS[number]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHonestySelected(opt.id);

    Animated.spring(btnAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 18, stiffness: 140 }).start();

    setTimeout(() => {
      closeHonestyScreen(opt.resolvedId);
    }, 400);
  }, [btnAnim, closeHonestyScreen]);

  const handleSelect = useCallback((id: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (id === 'every-day') {
      openHonestyScreen();
      return;
    }

    setSelected(id);
    Animated.sequence([
      Animated.spring(scaleAnims[index], { toValue: 0.96, useNativeDriver: Platform.OS !== 'web', speed: 50, bounciness: 0 }),
      Animated.spring(scaleAnims[index], { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 15, stiffness: 200 }),
    ]).start();
  }, [scaleAnims, openHonestyScreen]);

  const handleContinue = useCallback(() => {
    if (selected === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const option = OPTIONS.find(o => o.id === selected);
    if (!option) return;

    updateState({ missedDoses: option.value, missedDosesPct: option.pct });

    router.push('/onboarding/impact' as any);
  }, [selected, updateState, router]);

  const fadeSlide = (anim: Animated.Value, distance = 18) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
  });

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
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <Modal visible={showHonestyScreen} transparent animationType="none" statusBarTranslucent>
        <Animated.View style={[styles.honestyContainer, { opacity: screenAnim, paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 20) }]}>
          <View style={styles.honestyHeader}>
            <TouchableOpacity onPress={dismissHonestyScreen} style={styles.backButton} activeOpacity={0.7}>
              <ChevronLeft size={24} color={Colors.navy} />
            </TouchableOpacity>
          </View>

          <View style={styles.honestyContent}>
            <Animated.Text style={[styles.honestyEyebrow, fadeSlide(subtitleAnim, 12)]}>
              92% of people overestimate this
            </Animated.Text>
            <Animated.Text style={[styles.honestyHeadline, fadeSlide(titleAnim)]}>
              are you sure about that?
            </Animated.Text>

            <View style={styles.honestyOptions}>
              {HONESTY_OPTIONS.map((opt, i) => {
                const isChosen = honestySelected === opt.id;
                return (
                  <Animated.View key={opt.id} style={fadeSlide(honestyOptionAnims[i])}>
                    <TouchableOpacity
                      onPress={() => handleHonestySelect(opt)}
                      activeOpacity={0.8}
                      style={[
                        styles.honestyOptionCard,
                        isChosen && styles.honestyOptionCardSelected,
                      ]}
                    >
                      <Text style={[
                        styles.honestyOptionLabel,
                        isChosen && styles.honestyOptionLabelSelected,
                      ]}>
                        {opt.label}
                      </Text>
                      {isChosen && (
                        <View style={styles.checkCircle}>
                          <Check size={14} color={Colors.white} strokeWidth={3} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        </Animated.View>
      </Modal>
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
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  optionSelected: {
    borderColor: Colors.navy,
    borderWidth: 2,
    backgroundColor: Colors.softBlue,
  },
  optionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.navy,
  },
  optionLabelActive: {
    color: Colors.navy,
  },
  honestyContainer: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 24,
  },
  honestyHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  honestyContent: {
    flex: 1,
    paddingTop: 20,
  },
  honestyEyebrow: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.mediumGray,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  honestyHeadline: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.navy,
    lineHeight: 36,
    marginBottom: 36,
  },
  honestyOptions: {
    gap: 12,
  },
  honestyOptionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  honestyOptionCardSelected: {
    borderColor: Colors.blue,
    backgroundColor: '#F0F4FA',
  },
  honestyOptionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.darkGray,
    flex: 1,
  },
  honestyOptionLabelSelected: {
    color: Colors.navy,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.blue,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
