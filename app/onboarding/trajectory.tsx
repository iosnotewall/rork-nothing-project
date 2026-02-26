import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions, TouchableOpacity, Modal, Pressable } from 'react-native';
import { X, CheckCircle, Bell, BarChart3 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, Filter, FeGaussianBlur } from 'react-native-svg';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';
import { useAppState } from '@/hooks/useAppState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRAPH_HORIZONTAL_PADDING = 24;
const GRAPH_WIDTH = SCREEN_WIDTH - GRAPH_HORIZONTAL_PADDING * 2 - 32;
const GRAPH_HEIGHT = 220;

const ACCENT_COLOR = '#4A90D9';
const RED_COLOR = '#FF3B3B';

function generateUpwardPath(w: number, h: number): string {
  const sx = 16;
  const sy = h - 40;
  const ex = w - 16;
  const ey = 28;
  const c1x = w * 0.25;
  const c1y = h - 30;
  const c2x = w * 0.55;
  const c2y = 40;
  return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`;
}

function generateBumpyDownwardPath(w: number, h: number): string {
  const sx = 16;
  const sy = h - 40;

  const points = [
    { x: w * 0.08, y: h - 55 },
    { x: w * 0.13, y: h - 38 },
    { x: w * 0.18, y: h - 62 },
    { x: w * 0.24, y: h - 45 },
    { x: w * 0.30, y: h - 70 },
    { x: w * 0.36, y: h - 52 },
    { x: w * 0.42, y: h - 65 },
    { x: w * 0.48, y: h - 48 },
    { x: w * 0.54, y: h - 58 },
    { x: w * 0.60, y: h - 42 },
    { x: w * 0.66, y: h - 50 },
    { x: w * 0.72, y: h - 38 },
    { x: w * 0.78, y: h - 44 },
    { x: w * 0.84, y: h - 32 },
    { x: w * 0.90, y: h - 36 },
    { x: w * 0.95, y: h - 28 },
  ];

  let path = `M ${sx} ${sy}`;
  let prevX = sx;
  let prevY = sy;

  for (const pt of points) {
    const cpx1 = prevX + (pt.x - prevX) * 0.5;
    const cpy1 = prevY;
    const cpx2 = prevX + (pt.x - prevX) * 0.5;
    const cpy2 = pt.y;
    path += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${pt.x} ${pt.y}`;
    prevX = pt.x;
    prevY = pt.y;
  }

  return path;
}

function getPathLength(pathData: string): number {
  const segments = pathData.split(/(?=[MC])/);
  let totalLength = 0;
  let currentX = 0;
  let currentY = 0;

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (trimmed.startsWith('M')) {
      const coords = trimmed.substring(1).trim().split(/[\s,]+/).map(Number);
      currentX = coords[0];
      currentY = coords[1];
    } else if (trimmed.startsWith('C')) {
      const coords = trimmed.substring(1).trim().split(/[\s,]+/).map(Number);
      const c1x = coords[0], c1y = coords[1];
      const c2x = coords[2], c2y = coords[3];
      const ex = coords[4], ey = coords[5];

      let prevX = currentX, prevY = currentY;
      const steps = 20;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const mt = 1 - t;
        const x = mt * mt * mt * currentX + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * ex;
        const y = mt * mt * mt * currentY + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * ey;
        const dx = x - prevX;
        const dy = y - prevY;
        totalLength += Math.sqrt(dx * dx + dy * dy);
        prevX = x;
        prevY = y;
      }
      currentX = ex;
      currentY = ey;
    }
  }
  return totalLength;
}

export default function TrajectoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { missedDoses, missedDosesPct } = useAppState();

  const consistencyPct = missedDosesPct > 0 ? Math.round(missedDosesPct) : Math.round(((missedDoses ?? 3) / 7) * 100);

  const titleAnim = useRef(new Animated.Value(0)).current;
  const subtitleAnim = useRef(new Animated.Value(0)).current;
  const graphAnim = useRef(new Animated.Value(0)).current;
  const upCurveAnim = useRef(new Animated.Value(0)).current;
  const downCurveAnim = useRef(new Animated.Value(0)).current;
  const labelsAnim = useRef(new Animated.Value(0)).current;
  const bottomAnim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;

  const [upDash, setUpDash] = useState<{ length: number; offset: number }>({ length: 0, offset: 0 });
  const [downDash, setDownDash] = useState<{ length: number; offset: number }>({ length: 0, offset: 0 });
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const modalBgAnim = useRef(new Animated.Value(0)).current;
  const modalCardAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.85)).current;

  const openModal = useCallback(() => {
    setShowHowItWorks(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.timing(modalBgAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(modalCardAnim, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 260, mass: 0.8 }),
      Animated.spring(modalScaleAnim, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 260, mass: 0.8 }),
    ]).start();
  }, [modalBgAnim, modalCardAnim, modalScaleAnim]);

  const closeModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(modalBgAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(modalCardAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(modalScaleAnim, { toValue: 0.85, duration: 200, useNativeDriver: true }),
    ]).start(() => setShowHowItWorks(false));
  }, [modalBgAnim, modalCardAnim, modalScaleAnim]);

  const upPath = generateUpwardPath(GRAPH_WIDTH, GRAPH_HEIGHT);
  const downPath = generateBumpyDownwardPath(GRAPH_WIDTH, GRAPH_HEIGHT);

  const upLength = useRef(getPathLength(upPath)).current;
  const downLength = useRef(getPathLength(downPath)).current;

  useEffect(() => {
    const upListener = upCurveAnim.addListener(({ value }) => {
      const drawn = upLength * value;
      setUpDash({ length: drawn, offset: 0 });
    });
    const downListener = downCurveAnim.addListener(({ value }) => {
      const drawn = downLength * value;
      setDownDash({ length: drawn, offset: 0 });
    });

    const useNative = Platform.OS !== 'web';

    Animated.sequence([
      Animated.delay(300),
      Animated.timing(titleAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(100),
      Animated.timing(subtitleAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(graphAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(upCurveAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.sequence([
          Animated.delay(200),
          Animated.timing(downCurveAnim, { toValue: 1, duration: 1800, useNativeDriver: false }),
        ]),
      ]),
      Animated.delay(200),
      Animated.timing(labelsAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(bottomAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(btnAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
    ]).start();

    return () => {
      upCurveAnim.removeListener(upListener);
      downCurveAnim.removeListener(downListener);
    };
  }, []);

  const fadeSlide = (anim: Animated.Value, distance = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
  });

  const endPointUp = { x: GRAPH_WIDTH - 16, y: 28 };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Animated.Text style={[styles.title, fadeSlide(titleAnim)]}>
            Your New Trajectory
          </Animated.Text>

          <Animated.View style={[styles.subtitleRow, fadeSlide(subtitleAnim)]}>
            <Text style={styles.subtitle}>
              What happens when you{' '}
            </Text>
            <Text style={styles.subtitleAccent}>never miss again</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.graphContainer, { opacity: graphAnim }]}>
          <View style={styles.graphInner}>
            <View style={styles.curvesArea}>
              <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
                <Defs>
                  <LinearGradient id="blueGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <Stop offset="0%" stopColor={ACCENT_COLOR} stopOpacity="0.3" />
                    <Stop offset="100%" stopColor={ACCENT_COLOR} stopOpacity="0.8" />
                  </LinearGradient>
                </Defs>

                {/* Red glow layers */}
                <Path
                  d={downPath}
                  stroke={RED_COLOR}
                  strokeWidth={12}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${downDash.length}, ${downLength}`}
                  opacity={0.08}
                />
                <Path
                  d={downPath}
                  stroke={RED_COLOR}
                  strokeWidth={7}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${downDash.length}, ${downLength}`}
                  opacity={0.15}
                />
                <Path
                  d={downPath}
                  stroke={RED_COLOR}
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${downDash.length}, ${downLength}`}
                  opacity={0.9}
                />

                {/* Blue glow layers */}
                <Path
                  d={upPath}
                  stroke={ACCENT_COLOR}
                  strokeWidth={14}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${upDash.length}, ${upLength}`}
                  opacity={0.08}
                />
                <Path
                  d={upPath}
                  stroke={ACCENT_COLOR}
                  strokeWidth={8}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${upDash.length}, ${upLength}`}
                  opacity={0.18}
                />
                <Path
                  d={upPath}
                  stroke="url(#blueGrad)"
                  strokeWidth={3}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${upDash.length}, ${upLength}`}
                />

                {upDash.length > upLength * 0.95 && (
                  <>
                    <Circle
                      cx={endPointUp.x}
                      cy={endPointUp.y}
                      r={10}
                      fill={ACCENT_COLOR}
                      opacity={0.2}
                    />
                    <Circle
                      cx={endPointUp.x}
                      cy={endPointUp.y}
                      r={6}
                      fill={ACCENT_COLOR}
                      opacity={0.4}
                    />
                    <Circle
                      cx={endPointUp.x}
                      cy={endPointUp.y}
                      r={4}
                      fill={ACCENT_COLOR}
                    />
                  </>
                )}
              </Svg>

              <Animated.View style={[styles.labelUp, { opacity: labelsAnim }]}>
                <View style={[styles.labelDot, { backgroundColor: ACCENT_COLOR }]} />
                <Text style={[styles.labelText, { color: ACCENT_COLOR }]}>With Volera</Text>
              </Animated.View>

              <Animated.View style={[styles.labelDown, { opacity: labelsAnim }]}>
                <View style={[styles.labelDot, { backgroundColor: RED_COLOR }]} />
                <Text style={[styles.labelText, { color: RED_COLOR }]}>Without ({consistencyPct}%)</Text>
              </Animated.View>
            </View>

            <Animated.View style={[styles.xAxis, { opacity: labelsAnim }]}>
              <Text style={styles.xLabel}>Now</Text>
              <Text style={styles.xLabel}>Daily</Text>
              <Text style={styles.xLabel}>Always</Text>
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View style={[styles.bottomSection, fadeSlide(bottomAnim)]}>
          <Text style={styles.bottomTitle}>Consistency is the only variable.</Text>
          <Text style={styles.bottomSubtext}>
            Your supplements work. Volera just makes sure you never miss a day.
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton title="How it works" onPress={openModal} variant="white" />
      </Animated.View>

      {showHowItWorks && (
        <Animated.View style={[styles.modalOverlay, { opacity: modalBgAnim }]}>
          <Pressable style={styles.modalBackdrop} onPress={closeModal} />
          <Animated.View style={[styles.modalCard, { opacity: modalCardAnim, transform: [{ scale: modalScaleAnim }] }]}>
            <TouchableOpacity style={styles.modalClose} onPress={closeModal} activeOpacity={0.7}>
              <View style={styles.modalCloseCircle}>
                <X size={14} color="rgba(255,255,255,0.5)" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>

            <Text style={styles.modalLabel}>HOW VOLERA WORKS</Text>
            <Text style={styles.modalTitle}>Three steps to{"\n"}real results.</Text>

            <View style={styles.stepsContainer}>
              <View style={styles.stepRow}>
                <View style={styles.stepIconWrap}>
                  <CheckCircle size={20} color={ACCENT_COLOR} strokeWidth={2} />
                </View>
                <View style={styles.stepTextWrap}>
                  <Text style={styles.stepText}>Check in daily</Text>
                  <Text style={styles.stepSub}>10 seconds. Rate your energy, sleep & mood — that's it.</Text>
                </View>
              </View>

              <View style={styles.stepDivider} />

              <View style={styles.stepRow}>
                <View style={styles.stepIconWrap}>
                  <Bell size={20} color={ACCENT_COLOR} strokeWidth={2} />
                </View>
                <View style={styles.stepTextWrap}>
                  <Text style={styles.stepText}>Stay on track</Text>
                  <Text style={styles.stepSub}>Smart reminders built around your routine. No spam, just timing.</Text>
                </View>
              </View>

              <View style={styles.stepDivider} />

              <View style={styles.stepRow}>
                <View style={styles.stepIconWrap}>
                  <BarChart3 size={20} color={ACCENT_COLOR} strokeWidth={2} />
                </View>
                <View style={styles.stepTextWrap}>
                  <Text style={styles.stepText}>See proof in 30 days</Text>
                  <Text style={styles.stepSub}>Your personal data proves your supplements are working.</Text>
                </View>
              </View>
            </View>

            <View style={styles.modalFooterWrap}>
              <Text style={styles.modalFooterText}>
                Your supplements already work.{"\n"}Volera makes sure <Text style={styles.modalFooterBold}>you</Text> do too.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalGetStarted}
              onPress={() => { closeModal(); setTimeout(() => router.push('/onboarding/notification' as any), 300); }}
              activeOpacity={0.85}
            >
              <Text style={styles.modalGetStartedText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A2E',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topSection: {
    marginTop: 48,
    marginBottom: 32,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    color: Colors.white,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitleRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
  },
  subtitle: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 18,
    color: 'rgba(255,255,255,0.65)',
  },
  subtitleAccent: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 18,
    color: RED_COLOR,
  },
  graphContainer: {
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden' as const,
    marginBottom: 36,
  },
  graphInner: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  curvesArea: {
    height: GRAPH_HEIGHT,
    paddingHorizontal: 16,
    position: 'relative' as const,
  },
  labelUp: {
    position: 'absolute' as const,
    top: 10,
    right: 72,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(74,144,217,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(74,144,217,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  labelDown: {
    position: 'absolute' as const,
    top: 116,
    right: 15,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,59,59,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,59,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  labelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  labelText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  xAxis: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 28,
    marginTop: 8,
  },
  xLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500' as const,
  },
  bottomSection: {
    alignItems: 'center' as const,
    paddingHorizontal: 8,
  },
  bottomTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    color: Colors.white,
    textAlign: 'center' as const,
  },
  bottomSubtext: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center' as const,
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 100,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: '#0F2340',
    borderRadius: 28,
    paddingTop: 40,
    paddingBottom: 32,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: 'rgba(74,144,217,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 24,
  },
  modalClose: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    zIndex: 10,
  },
  modalCloseCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  modalLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 11,
    color: ACCENT_COLOR,
    letterSpacing: 1.5,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: Fonts.heading,
    fontSize: 26,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 32,
  },
  stepsContainer: {
    width: '100%' as const,
    marginBottom: 28,
  },
  stepRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: 16,
    paddingVertical: 4,
  },
  stepIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(74,144,217,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(74,144,217,0.2)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: 2,
  },
  stepDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 16,
    marginLeft: 56,
  },
  stepTextWrap: {
    flex: 1,
    paddingTop: 2,
  },
  stepText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  stepSub: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 19,
  },
  modalFooterWrap: {
    width: '100%' as const,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  modalFooterText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center' as const,
    lineHeight: 21,
  },
  modalFooterBold: {
    fontFamily: Fonts.bodySemiBold,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  modalGetStarted: {
    width: '100%' as const,
    height: 54,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  modalGetStartedText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 15,
    color: '#0B1A2E',
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
});
