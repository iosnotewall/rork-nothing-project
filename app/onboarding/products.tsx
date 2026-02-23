import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { PRODUCTS } from '@/constants/products';

export default function ProductsScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleProduct = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }, []);

  return (
    <OnboardingScreen
      step={2}
      totalSteps={9}
      ctaText="These are mine"
      ctaEnabled={selected.length > 0}
      onCta={() => {
        updateState({ products: selected });
        router.push('/onboarding/friction' as any);
      }}
    >
      <Text style={styles.headline}>Which supplements do you take?</Text>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {PRODUCTS.map((product, index) => {
          const isSelected = selected.includes(product.id);
          return (
            <TouchableOpacity
              key={product.id}
              onPress={() => toggleProduct(product.id)}
              style={[styles.productRow, index < PRODUCTS.length - 1 && styles.productBorder]}
              activeOpacity={0.7}
              testID={`product-${product.id}`}
            >
              <View style={[styles.productDot, { backgroundColor: product.color }]} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productTagline}>{product.tagline}</Text>
              </View>
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Check size={14} color={Colors.white} strokeWidth={2.5} />}
              </View>
            </TouchableOpacity>
          );
        })}
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
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  productRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 16,
    gap: 14,
  },
  productBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  productDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: Colors.navy,
  },
  productTagline: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkboxSelected: {
    backgroundColor: Colors.navy,
    borderColor: Colors.navy,
  },
});
