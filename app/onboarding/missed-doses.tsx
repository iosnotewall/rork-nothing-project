import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Modal, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, ChevronRight } from 'lucide-react-native';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OPTIONS = [
  {
    id: 'one-two' as const,
    label: '1-2 days a week',
    desc: 'I forget more than I remember',
    value: 2,
  },
  {
    id: 'three-four' as const,
    label: '3-4 days a week',
    desc: 'I try but life gets in the way',
    value: 4,
  },
  {
    id: 'five-six' as const,
    label: '5-6 days a week',
    desc: 'Pretty good, just slip sometimes',
    value: 6,
  },
  {
    id: 'every-day' as const,
    label: 'Every single day',
    desc: 'Locked in, never miss',
    value: 7,
  },
];

export default function MissedDosesScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string | null>(null);
  const [showHonestyModal, setShowHonestyModal] = useState(false);
  const modalAnim = useRef(new Animated.Value(0)).current;

  const scaleAnims = useRef(OPTIONS.map(() => new Animated.Value(1))).current;

  const openModal = useCallback(() => {
    setShowHonestyModal(true);
    Animated.spring(modalAnim, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 18, stiffness: 140 }).start();
  }, [modalAnim]);

  const closeModal = useCallback((chosenId: string) => {
    Animated.timing(modalAnim, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start(() => {
      setShowHonestyModal(false);
      setSelected(chosenId);
    });
  }, [modalAnim]);

  const handleSelect = useCallback((id: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (id === 'every-day') {
      openModal();
      return;
    }

    setSelected(id);
    Animated.sequence([
      Animated.spring(scaleAnims[index], { toValue: 0.96, useNativeDriver: Platform.OS !== 'web', speed: 50, bounciness: 0 }),
      Animated.spring(scaleAnims[index], { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 15, stiffness: 200 }),
    ]).start();
  }, [scaleAnims, openModal]);

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
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <Modal visible={showHonestyModal} transparent animationType="none" statusBarTranslucent>
        <Animated.View style={[styles.modalOverlay, { opacity: modalAnim }]}>
          <TouchableOpacity style={styles.modalOverlayTouch} activeOpacity={1} onPress={() => setShowHonestyModal(false)} />
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) }] }]}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Be honest with yourself</Text>
              <TouchableOpacity style={styles.sheetClose} onPress={() => setShowHonestyModal(false)} activeOpacity={0.7}>
                <X size={18} color={Colors.mediumGray} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetBody}>
              Most people overestimate their consistency. Even forgetting once a week means your supplements aren't building up properly in your system.
            </Text>

            <Text style={styles.sheetPrompt}>How often do you really take them?</Text>

            <View style={styles.sheetOptions}>
              <TouchableOpacity style={styles.sheetOption} onPress={() => closeModal('five-six')} activeOpacity={0.6}>
                <Text style={styles.sheetOptionText}>Almost every day, maybe miss one</Text>
                <ChevronRight size={16} color={Colors.mediumGray} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetOption} onPress={() => closeModal('three-four')} activeOpacity={0.6}>
                <Text style={styles.sheetOptionText}>I skip a couple days a week</Text>
                <ChevronRight size={16} color={Colors.mediumGray} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sheetOption, styles.sheetOptionLast]} onPress={() => closeModal('every-day')} activeOpacity={0.6}>
                <Text style={styles.sheetOptionText}>Truly every single day</Text>
                <ChevronRight size={16} color={Colors.mediumGray} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </Animated.View>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end' as const,
  },
  modalOverlayTouch: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
    paddingHorizontal: 24,
    maxWidth: SCREEN_WIDTH,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center' as const,
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  sheetTitle: {
    fontFamily: Fonts.heading,
    fontSize: 20,
    color: Colors.navy,
    flex: 1,
  },
  sheetClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.lightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginLeft: 12,
  },
  sheetBody: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.darkGray,
    lineHeight: 22,
    marginBottom: 22,
  },
  sheetPrompt: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.mediumGray,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 10,
  },
  sheetOptions: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    overflow: 'hidden' as const,
  },
  sheetOption: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  sheetOptionLast: {
    borderBottomWidth: 0,
  },
  sheetOptionText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.navy,
    flex: 1,
  },
});
