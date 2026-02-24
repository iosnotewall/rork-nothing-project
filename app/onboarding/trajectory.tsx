import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
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
  const { missedDoses } = useAppState();

  const daysPerWeek = missedDoses ?? 3;
  const consistencyPct = Math.round((daysPerWeek / 7) * 100);

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

                <Path
                  d={downPath}
                  stroke={RED_COLOR}
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${downDash.length}, ${downLength}`}
                  opacity={0.7}
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
                  <Circle
                    cx={endPointUp.x}
                    cy={endPointUp.y}
                    r={5}
                    fill={ACCENT_COLOR}
                  />
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
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton title="How it works" onPress={() => router.push('/onboarding/placeholder' as any)} variant="white" />
      </Animated.View>
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
    fontSize: 34,
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
    right: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(74,144,217,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  labelDown: {
    position: 'absolute' as const,
    top: 48,
    left: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,59,59,0.12)',
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
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
