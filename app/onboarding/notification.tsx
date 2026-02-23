import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { NOTIFICATION_EXAMPLES } from '@/constants/content';

export default function NotificationScreen() {
  const router = useRouter();
  const { goal, updateState } = useAppState();
  const bellAnim = useRef(new Animated.Value(0)).current;
  const bubbleAnim = useRef(new Animated.Value(0)).current;

  const notifExample = NOTIFICATION_EXAMPLES[goal] || NOTIFICATION_EXAMPLES.energy;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bellAnim, { toValue: 1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(bellAnim, { toValue: -1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(bellAnim, { toValue: 1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(bellAnim, { toValue: -1, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(bellAnim, { toValue: 0, duration: 100, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    Animated.spring(bubbleAnim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      damping: 18,
      stiffness: 150,
      delay: 600,
    }).start();
  }, [bellAnim, bubbleAnim]);

  const handleEnable = useCallback(async () => {
    if (Platform.OS !== 'web') {
      try {
        const { default: Notifications } = await import('expo-notifications');
        const { status } = await Notifications.requestPermissionsAsync();
        updateState({ notificationsEnabled: status === 'granted' });
      } catch (e) {
        console.log('Notification permission error:', e);
        updateState({ notificationsEnabled: false });
      }
    } else {
      updateState({ notificationsEnabled: true });
    }
    router.push('/onboarding/trajectory' as any);
  }, [updateState, router]);

  const handleSkip = useCallback(() => {
    updateState({ notificationsEnabled: false });
    router.push('/onboarding/trajectory' as any);
  }, [updateState, router]);

  const bellRotation = bellAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  return (
    <OnboardingScreen
      step={9}
      totalSteps={9}
      ctaText="Enable reminders"
      onCta={handleEnable}
      secondaryAction={{ text: 'Skip for now', onPress: handleSkip }}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.bellWrap, { transform: [{ rotate: bellRotation }] }]}>
          <View style={styles.bellCircle}>
            <Bell size={40} color={Colors.navy} strokeWidth={1.5} />
          </View>
        </Animated.View>

        <Text style={styles.headline}>Now let's make sure you never miss a day.</Text>
        <Text style={styles.subline}>
          One smart nudge daily — not spam, a reason to show up.
        </Text>

        <Animated.View
          style={[
            styles.notifBubble,
            {
              opacity: bubbleAnim,
              transform: [{
                translateY: bubbleAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
              }],
            },
          ]}
        >
          <View style={styles.notifHeader}>
            <View style={styles.notifLogo}>
              <Text style={styles.notifLogoText}>V</Text>
            </View>
            <Text style={styles.notifAppName}>Velora</Text>
            <Text style={styles.notifTime}>now</Text>
          </View>
          <Text style={styles.notifTitle}>{notifExample}</Text>
          <Text style={styles.notifSub}>Tap to check in.</Text>
        </Animated.View>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 12,
  },
  bellWrap: {
    marginBottom: 24,
  },
  bellCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.blueBg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    color: Colors.navy,
    textAlign: 'center' as const,
    lineHeight: 32,
    marginBottom: 10,
  },
  subline: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.mediumGray,
    textAlign: 'center' as const,
    lineHeight: 22,
    maxWidth: 280,
    marginBottom: 28,
  },
  notifBubble: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    width: '100%',
  },
  notifHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
    gap: 8,
  },
  notifLogo: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.blue,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  notifLogoText: {
    fontFamily: Fonts.heading,
    fontSize: 10,
    color: Colors.white,
  },
  notifAppName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 12,
    color: Colors.darkGray,
    flex: 1,
  },
  notifTime: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.mediumGray,
  },
  notifTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.navy,
    marginBottom: 4,
  },
  notifSub: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
  },
});
