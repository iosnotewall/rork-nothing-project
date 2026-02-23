import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Search } from 'lucide-react-native';
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
  const [query, setQuery] = useState('');

  const toggleProduct = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }, []);

  const filtered = useMemo(() =>
    query.trim().length === 0
      ? PRODUCTS
      : PRODUCTS.filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.tagline.toLowerCase().includes(query.toLowerCase())
        ),
  [query]);

  return (
    <OnboardingScreen
      step={3}
      totalSteps={9}
      ctaText="These are mine"
      ctaEnabled={selected.length > 0}
      onCta={() => {
        updateState({ products: selected });
        router.push('/onboarding/stack-insight' as any);
      }}
    >
      <Text style={styles.headline}>Which supplements do you take?</Text>

      <View style={styles.searchWrap}>
        <Search size={16} color={Colors.mediumGray} strokeWidth={2} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search supplements…"
          placeholderTextColor={Colors.mediumGray}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
          testID="product-search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <View style={styles.clearDot}>
              <Text style={styles.clearX}>✕</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filtered.map((product, index) => {
          const isSelected = selected.includes(product.id);
          return (
            <TouchableOpacity
              key={product.id}
              onPress={() => toggleProduct(product.id)}
              style={[styles.productRow, index < filtered.length - 1 && styles.productBorder]}
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
        {filtered.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No supplements found</Text>
          </View>
        )}
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.softBlue,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.navy,
    paddingVertical: 0,
  },
  clearDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  clearX: {
    fontSize: 9,
    color: Colors.mediumGray,
    fontFamily: Fonts.bodySemiBold,
    lineHeight: 11,
  },
  emptyWrap: {
    paddingVertical: 32,
    alignItems: 'center' as const,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: 15,
    color: Colors.mediumGray,
  },
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
