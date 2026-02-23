import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, Easing, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Zap, Moon, Brain, Leaf, Flame, Heart, Dumbbell, Shield, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { GOALS } from '@/constants/content';

const ICON_MAP: Record<string, React.ElementType> = {
  Zap, Moon, Brain, Leaf, Flame, Heart, Dumbbell, Shield,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 14;
const CARD_WIDTH = (SCREEN_WIDTH - 40 - CARD_GAP) / 2;
const ROW_COUNT = Math.ceil(GOALS.length / 2);

export default function GoalScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string>('');

  const scaleAnims = useRef(GOALS.map(() => new Animated.Value(1))).current;
  const rowOpacity = useRef(Array.from({ length: ROW_COUNT }, () => new Animated.Value(0))).current;
  const rowSlide = useRef(Array.from({ length: ROW_COUNT }, () => new Animated.Value(30))).current;
  const selectionAnims = useRef(GOALS.map(() => new Animated.Value(0))).current;
  const checkAnims = useRef(GOALS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = Array.from({ length: ROW_COUNT }, (_, rowIndex) =>
      Animated.parallel([
        Animated.timing(rowOpacity[rowIndex], {
          toValue: 1,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(rowSlide[rowIndex], {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    Animated.stagger(120, animations).start();
  }, []);

  const handleSelect = useCallback((goalId: string, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const prevIndex = GOALS.findIndex(g => g.id === selected);
    if (prevIndex >= 0 && prevIndex !== index) {
      Animated.parallel([
        Animated.timing(selectionAnims[prevIndex], {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(checkAnims[prevIndex], {
          toValue: 0,
          duration: 150,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }

    setSelected(goalId);

    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.93,
        duration: 80,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        damping: 10,
        stiffness: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(selectionAnims[index], {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(checkAnims[index], {
        toValue: 1,
        damping: 12,
        stiffness: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [selected, scaleAnims, selectionAnims, checkAnims]);

  const handleContinue = useCallback(() => {
    updateState({ goal: selected });
    router.push('/onboarding/products' as any);
  }, [selected, updateState, router]);

  const rows: (typeof GOALS[number])[][] = [];
  for (let i = 0; i < GOALS.length; i += 2) {
    rows.push(GOALS.slice(i, i + 2) as any);
  }

  return (
    <OnboardingScreen step={2} totalSteps={9} ctaText="This is my goal" ctaEnabled={!!selected} onCta={handleContinue}>
      <Text style={styles.headline}>What's your main{'\n'}health goal?</Text>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {rows.map((row, rowIndex) => (
          <Animated.View
            key={rowIndex}
            style={[
              styles.row,
              {
                opacity: rowOpacity[rowIndex],
                transform: [{ translateY: rowSlide[rowIndex] }],
              },
            ]}
          >
            {row.map((goal) => {
              const globalIndex = GOALS.findIndex(g => g.id === goal.id);
              const IconComponent = ICON_MAP[goal.icon];
              const isSelected = selected === goal.id;
              const categoryColor = Colors.category[goal.id] || Colors.navy;

              const bgColor = selectionAnims[globalIndex].interpolate({
                inputRange: [0, 1],
                outputRange: [Colors.white, categoryColor + '12'],
              });

              const borderColor = selectionAnims[globalIndex].interpolate({
                inputRange: [0, 1],
                outputRange: [Colors.border, categoryColor],
              });

              const borderWidth = selectionAnims[globalIndex].interpolate({
                inputRange: [0, 1],
                outputRange: [1, 2.5],
              });

              return (
                <Animated.View
                  key={goal.id}
                  style={{
                    width: CARD_WIDTH,
                    transform: [{ scale: scaleAnims[globalIndex] }],
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleSelect(goal.id, globalIndex)}
                    activeOpacity={0.8}
                    testID={`goal-${goal.id}`}
                  >
                    <Animated.View
                      style={[
                        styles.card,
                        {
                          backgroundColor: bgColor,
                          borderColor: borderColor,
                          borderWidth: borderWidth,
                        },
                      ]}
                    >
                      <View style={styles.cardTop}>
                        <View style={[styles.iconCircle, { backgroundColor: categoryColor + '18' }]}>
                          {IconComponent && <IconComponent size={24} color={categoryColor} strokeWidth={2.2} />}
                        </View>
                        <Animated.View
                          style={[
                            styles.checkBadge,
                            {
                              backgroundColor: categoryColor,
                              opacity: checkAnims[globalIndex],
                              transform: [{
                                scale: checkAnims[globalIndex].interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.3, 1],
                                }),
                              }],
                            },
                          ]}
                        >
                          <Check size={12} color={Colors.white} strokeWidth={3} />
                        </Animated.View>
                      </View>
                      <Text style={[styles.cardLabel, isSelected && { color: categoryColor }]} numberOfLines={2}>
                        {goal.label}
                      </Text>
                      <Text style={styles.cardSub} numberOfLines={2}>{goal.sub}</Text>
                    </Animated.View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </Animated.View>
        ))}
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.navy,
    lineHeight: 38,
    marginTop: 8,
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
    gap: CARD_GAP,
  },
  row: {
    flexDirection: 'row' as const,
    gap: CARD_GAP,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingTop: 16,
    paddingBottom: 18,
    paddingHorizontal: 16,
    minHeight: 148,
    justifyContent: 'flex-start' as const,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  checkBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  cardLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 16,
    color: Colors.navy,
    lineHeight: 21,
    letterSpacing: -0.1,
  },
  cardSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    lineHeight: 17,
  },
});
