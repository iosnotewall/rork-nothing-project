import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Colors from '@/constants/colors';
import { Fonts } from '@/constants/fonts';
import PrimaryButton from '@/components/PrimaryButton';
import { useAppState } from '@/hooks/useAppState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRAPH_HORIZONTAL_PADDING = 24;
const GRAPH_WIDTH = SCREEN_WIDTH - GRAPH_HORIZONTAL_PADDING * 2 - 32;
const GRAPH_CURVES_HEIGHT = 200;

const ACCENT_COLOR = Colors.blue;
const RED_COLOR = '#FF3B3B';

function generateUpwardPath(w: number, h: number): string {
  const sx = 20;
  const sy = h - 30;
  const ex = w - 20;
  const ey = 30;
  const c1x = w * 0.3;
  const c1y = h - 20;
  const c2x = w * 0.6;
  const c2y = 50;
  return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`;
}

function generateDownwardPath(w: number, h: number): string {
  const sx = 20;
  const sy = h - 30;
  const ex = w - 20;
  const ey = h - 10;
  const c1x = w * 0.35;
  const c1y = h * 0.4;
  const c2x = w * 0.65;
  const c2y = h - 5;
  return `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`;
}

function getPathLength(pathData: string): number {
  const parts = pathData.replace(/[MCc]/g, '').trim().split(/[\s,]+/).map(Number);
  const sx = parts[0], sy = parts[1];
  const c1x = parts[2], c1y = parts[3];
  const c2x = parts[4], c2y = parts[5];
  const ex = parts[6], ey = parts[7];

  let length = 0;
  let prevX = sx, prevY = sy;
  const steps = 100;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const x = mt * mt * mt * sx + 3 * mt * mt * t * c1x + 3 * mt * t * t * c2x + t * t * t * ex;
    const y = mt * mt * mt * sy + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * ey;
    const dx = x - prevX;
    const dy = y - prevY;
    length += Math.sqrt(dx * dx + dy * dy);
    prevX = x;
    prevY = y;
  }
  return length;
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
  const dotPulse = useRef(new Animated.Value(0)).current;

  const [upDash, setUpDash] = useState<{ length: number; offset: number }>({ length: 0, offset: 0 });
  const [downDash, setDownDash] = useState<{ length: number; offset: number }>({ length: 0, offset: 0 });

  const upPath = generateUpwardPath(GRAPH_WIDTH, GRAPH_CURVES_HEIGHT);
  const downPath = generateDownwardPath(GRAPH_WIDTH, GRAPH_CURVES_HEIGHT);

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
          Animated.timing(downCurveAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
        ]),
      ]),
      Animated.delay(200),
      Animated.timing(labelsAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(bottomAnim, { toValue: 1, duration: 600, useNativeDriver: useNative }),
      Animated.delay(200),
      Animated.timing(btnAnim, { toValue: 1, duration: 500, useNativeDriver: useNative }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, { toValue: 1, duration: 1200, useNativeDriver: useNative }),
        Animated.timing(dotPulse, { toValue: 0.4, duration: 1200, useNativeDriver: useNative }),
      ])
    ).start();

    return () => {
      upCurveAnim.removeListener(upListener);
      downCurveAnim.removeListener(downListener);
    };
  }, []);

  const fadeSlide = (anim: Animated.Value, distance = 20) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
  });

  const endPointUp = { x: GRAPH_WIDTH - 20, y: 30 };

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
              <Svg width={GRAPH_WIDTH} height={GRAPH_CURVES_HEIGHT}>
                <Defs>
                  <RadialGradient id="blueGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={ACCENT_COLOR} stopOpacity="0.4" />
                    <Stop offset="100%" stopColor={ACCENT_COLOR} stopOpacity="0" />
                  </RadialGradient>
                  <RadialGradient id="redGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%" stopColor={RED_COLOR} stopOpacity="0.3" />
                    <Stop offset="100%" stopColor={RED_COLOR} stopOpacity="0" />
                  </RadialGradient>
                </Defs>

                <Rect
                  x={endPointUp.x - 30}
                  y={endPointUp.y - 30}
                  width={60}
                  height={60}
                  fill="url(#blueGlow)"
                />

                <Path
                  d={downPath}
                  stroke={RED_COLOR}
                  strokeWidth={3.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${downDash.length}, ${downLength}`}
                  opacity={0.85}
                />

                <Path
                  d={upPath}
                  stroke={ACCENT_COLOR}
                  strokeWidth={3.5}
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
          <Text style={styles.bottomTitle}>Consistency changes everything.</Text>
          <Text style={styles.bottomBody}>
            Volera turns missed doses into daily wins — so your supplements finally deliver what you paid for.
          </Text>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: btnAnim, paddingBottom: Math.max(insets.bottom, 20) }]}>
        <PrimaryButton title="Let's build my plan" onPress={() => router.push('/onboarding/goal' as any)} variant="white" />
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
    height: GRAPH_CURVES_HEIGHT,
    paddingHorizontal: 16,
    position: 'relative' as const,
  },
  labelUp: {
    position: 'absolute' as const,
    top: 12,
    left: 20,
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
    bottom: 28,
    right: 20,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(255,59,59,0.15)',
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
    fontSize: 24,
    color: Colors.white,
    textAlign: 'center' as const,
    marginBottom: 12,
  },
  bottomBody: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
});
