import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';

export default function NameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { updateState } = useAppState();
  const [name, setName] = useState('');
  const titleAnim = useRef(new Animated.Value(0)).current;
  const inputAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.timing(titleAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
      Animated.delay(100),
      Animated.timing(inputAnim, { toValue: 1, duration: 500, useNativeDriver: Platform.OS !== 'web' }),
    ]).start(() => {
      setTimeout(() => inputRef.current?.focus(), 100);
    });
  }, []);

  const handleContinue = useCallback(() => {
    if (!name.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateState({ userName: name.trim() });
    router.push('/onboarding/consider' as any);
  }, [name, updateState, router]);

  const slideUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  });

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.content}>
            <Animated.Text style={[styles.preTitle, slideUp(titleAnim)]}>
              First things first,
            </Animated.Text>
            <Animated.Text style={[styles.headline, slideUp(titleAnim)]} numberOfLines={1} adjustsFontSizeToFit>
              What should we call you?
            </Animated.Text>

            <Animated.View style={[styles.inputWrap, slideUp(inputAnim)]}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={Colors.border}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                testID="name-input"
              />
              <View style={styles.inputLine} />
            </Animated.View>
          </View>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <PrimaryButton
              title="Continue"
              onPress={handleContinue}
              disabled={!name.trim()}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  inner: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center' as const,
  },
  preTitle: {
    fontFamily: Fonts.body,
    fontSize: 18,
    color: Colors.mediumGray,
    marginBottom: 8,
  },
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: Colors.navy,
    marginBottom: 48,
  },
  inputWrap: {
    marginBottom: 20,
  },
  input: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.navy,
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  inputLine: {
    height: 2,
    backgroundColor: Colors.blue,
    borderRadius: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
