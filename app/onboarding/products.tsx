import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Animated, Easing, Platform, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Search, Plus, X, Pill } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import OnboardingScreen from '@/components/OnboardingScreen';
import { useAppState } from '@/hooks/useAppState';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import { PRODUCTS, Product } from '@/constants/products';

interface CustomSupplement {
  id: string;
  name: string;
  tagline: string;
  color: string;
  isCustom: boolean;
}

export default function ProductsScreen() {
  const router = useRouter();
  const { updateState } = useAppState();
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [customSupplements, setCustomSupplements] = useState<CustomSupplement[]>([]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const customInputRef = useRef<TextInput>(null);

  const addRowAnim = useRef(new Animated.Value(1)).current;
  const customFormAnim = useRef(new Animated.Value(0)).current;
  const rowAnims = useRef(PRODUCTS.map(() => new Animated.Value(0))).current;
  const customAnimsRef = useRef<Record<string, Animated.Value>>({});

  useEffect(() => {
    const animations = PRODUCTS.map((_, i) =>
      Animated.timing(rowAnims[i], {
        toValue: 1,
        duration: 350,
        delay: i * 40,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    Animated.parallel(animations).start();
  }, []);

  const allProducts = useMemo(() => {
    const customs: (Product & { isCustom?: boolean })[] = customSupplements.map(c => ({
      ...c,
      goals: [],
      isCustom: true,
    }));
    return [...customs, ...PRODUCTS];
  }, [customSupplements]);

  const filtered = useMemo(() => {
    if (query.trim().length === 0) return allProducts;
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.tagline.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, allProducts]);

  const toggleProduct = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }, []);

  const showCustomForm = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsAddingCustom(true);
    setCustomName(query.trim());

    Animated.parallel([
      Animated.timing(addRowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(customFormAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      customInputRef.current?.focus();
    });
  }, [query, addRowAnim, customFormAnim]);

  const hideCustomForm = useCallback(() => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(customFormAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(addRowAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setIsAddingCustom(false);
      setCustomName('');
    });
  }, [customFormAnim, addRowAnim]);

  const addCustomSupplement = useCallback(() => {
    const trimmed = customName.trim();
    if (!trimmed) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const customColors = ['#7B8FC4', '#D4A853', '#C4857A', '#5A8A6F', '#8B6BB8', '#4A90D9'];
    const colorIndex = customSupplements.length % customColors.length;

    const newSupplement: CustomSupplement = {
      id: `custom_${Date.now()}`,
      name: trimmed,
      tagline: 'Custom supplement',
      color: customColors[colorIndex],
      isCustom: true,
    };

    const entryAnim = new Animated.Value(0);
    customAnimsRef.current[newSupplement.id] = entryAnim;

    setCustomSupplements(prev => [newSupplement, ...prev]);
    setSelected(prev => [...prev, newSupplement.id]);
    setQuery('');

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(entryAnim, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.back(1.3)),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }, 50);

    Animated.parallel([
      Animated.timing(customFormAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(addRowAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setIsAddingCustom(false);
      setCustomName('');
    });
  }, [customName, customSupplements, customFormAnim, addRowAnim]);

  const removeCustom = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCustomSupplements(prev => prev.filter(c => c.id !== id));
    setSelected(prev => prev.filter(s => s !== id));
  }, []);

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
      <Text style={styles.headline}>Which supplements{'\n'}do you take?</Text>

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

      {!isAddingCustom && (
        <Animated.View style={{ opacity: addRowAnim, transform: [{ scale: addRowAnim }] }}>
          <TouchableOpacity
            onPress={showCustomForm}
            style={styles.addCustomRow}
            activeOpacity={0.7}
            testID="add-custom-supplement"
          >
            <View style={styles.addIconWrap}>
              <Plus size={16} color={Colors.blue} strokeWidth={2.5} />
            </View>
            <View style={styles.addTextWrap}>
              <Text style={styles.addTitle}>
                {query.trim() ? `Add "${query.trim()}"` : 'Add custom supplement'}
              </Text>
              <Text style={styles.addSubtitle}>Not on the list? Add yours</Text>
            </View>
            <View style={styles.addArrow}>
              <Plus size={14} color={Colors.blue} strokeWidth={2} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {isAddingCustom && (
        <Animated.View
          style={[
            styles.customFormWrap,
            {
              opacity: customFormAnim,
              transform: [{
                scale: customFormAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              }],
            },
          ]}
        >
          <View style={styles.customFormInner}>
            <View style={styles.customInputRow}>
              <Pill size={16} color={Colors.blue} strokeWidth={2} />
              <TextInput
                ref={customInputRef}
                style={styles.customInput}
                placeholder="e.g. Ashwagandha, Zinc…"
                placeholderTextColor={Colors.border}
                value={customName}
                onChangeText={setCustomName}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={addCustomSupplement}
                testID="custom-supplement-input"
              />
            </View>
            <View style={styles.customActions}>
              <TouchableOpacity onPress={hideCustomForm} style={styles.customCancelBtn} activeOpacity={0.7}>
                <Text style={styles.customCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={addCustomSupplement}
                style={[styles.customAddBtn, !customName.trim() && styles.customAddBtnDisabled]}
                activeOpacity={0.7}
                disabled={!customName.trim()}
              >
                <Text style={[styles.customAddText, !customName.trim() && styles.customAddTextDisabled]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      <ScrollView
        style={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.map((product, index) => {
          const isSelected = selected.includes(product.id);
          const isCustom = 'isCustom' in product && (product as CustomSupplement).isCustom === true;
          const animIndex = !isCustom ? index : -1;

          const rowContent: React.ReactNode = (
            <TouchableOpacity
              key={product.id}
              onPress={() => toggleProduct(product.id)}
              style={[styles.productRow, index < filtered.length - 1 && styles.productBorder]}
              activeOpacity={0.7}
              testID={`product-${product.id}`}
            >
              <View style={[styles.productDot, { backgroundColor: product.color }]}>
                {isCustom ? <Pill size={8} color={Colors.white} strokeWidth={2.5} /> : null}
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productTagline}>
                  {product.tagline}
                  {isCustom ? ' · Custom' : ''}
                </Text>
              </View>
              {isCustom ? (
                <TouchableOpacity
                  onPress={() => removeCustom(product.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.removeBtn}
                >
                  <X size={12} color={Colors.mediumGray} strokeWidth={2.5} />
                </TouchableOpacity>
              ) : null}
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && <Check size={14} color={Colors.white} strokeWidth={2.5} />}
              </View>
            </TouchableOpacity>
          );

          if (isCustom) {
            const entryAnim = customAnimsRef.current[product.id];
            if (entryAnim) {
              return (
                <Animated.View
                  key={product.id}
                  style={{
                    opacity: entryAnim,
                    transform: [{
                      translateY: entryAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    }],
                  }}
                >
                  {rowContent}
                </Animated.View>
              );
            }
            return <View key={product.id}>{rowContent}</View>;
          }

          if (animIndex >= 0) {
            const adjustedIndex = index - customSupplements.length;
            const safeIndex = adjustedIndex >= 0 && adjustedIndex < rowAnims.length ? adjustedIndex : 0;
            return (
              <Animated.View
                key={product.id}
                style={{
                  opacity: rowAnims[safeIndex],
                  transform: [{
                    translateY: rowAnims[safeIndex].interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  }],
                }}
              >
                {rowContent}
              </Animated.View>
            );
          }

          return <View key={product.id}>{rowContent}</View>;
        })}

        {filtered.length === 0 && !isAddingCustom && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No match found</Text>
            <Text style={styles.emptyHint}>Tap the button above to add it</Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  headline: {
    fontFamily: Fonts.heading,
    fontSize: 28,
    color: Colors.navy,
    lineHeight: 36,
    marginTop: 8,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  searchWrap: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.softBlue,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
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
  addCustomRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: Colors.blueBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.blue + '30',
    borderStyle: 'dashed' as const,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    gap: 12,
  },
  addIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.blue + '15',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  addTextWrap: {
    flex: 1,
  },
  addTitle: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 14,
    color: Colors.blue,
    lineHeight: 18,
  },
  addSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: Colors.blue + '80',
    marginTop: 1,
  },
  addArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.blue + '12',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  customFormWrap: {
    marginBottom: 14,
  },
  customFormInner: {
    backgroundColor: Colors.blueBg,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.blue,
    overflow: 'hidden' as const,
    shadowColor: Colors.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  customInputRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blue + '20',
    backgroundColor: Colors.white,
  },
  customInput: {
    flex: 1,
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: Colors.navy,
    paddingVertical: 0,
  },
  customActions: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  customCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  customCancelText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.mediumGray,
  },
  customAddBtn: {
    paddingHorizontal: 22,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.blue,
  },
  customAddBtnDisabled: {
    backgroundColor: Colors.border,
  },
  customAddText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 14,
    color: Colors.white,
  },
  customAddTextDisabled: {
    color: Colors.mediumGray,
  },
  list: {
    flex: 1,
  },
  productRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingVertical: 14,
    gap: 12,
  },
  productBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  productDot: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 15,
    color: Colors.navy,
  },
  productTagline: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
    marginTop: 1,
  },
  removeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
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
  emptyWrap: {
    paddingVertical: 40,
    alignItems: 'center' as const,
    gap: 4,
  },
  emptyEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: 15,
    color: Colors.navy,
  },
  emptyHint: {
    fontFamily: Fonts.body,
    fontSize: 13,
    color: Colors.mediumGray,
  },
});
