import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Ellipse } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const PETAL_COUNT = 15;

const Petal = ({ delay }: { delay: number }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(Math.random() * width);
  const rotate = useSharedValue(0);
  const horizontalSway = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(height + 50, {
          duration: 6000 + Math.random() * 4000,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );

    rotate.value = withRepeat(
      withTiming(360, { duration: 4000 + Math.random() * 2000, easing: Easing.linear }),
      -1,
      false
    );

    horizontalSway.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 2000, easing: Easing.inOut(Easing.sine) }),
        withTiming(-40, { duration: 2000, easing: Easing.inOut(Easing.sine) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: translateX.value + horizontalSway.value,
    transform: [
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={20} height={28}>
        <Ellipse
          cx={10}
          cy={14}
          rx={8}
          ry={12}
          fill="rgba(255,182,193,0.8)"
          stroke="rgba(255,105,135,0.5)"
          strokeWidth={1}
        />
      </Svg>
    </Animated.View>
  );
};

export const CherryBlossomSkin: React.FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a0a2e', '#2d1b4e', '#1a0a2e']}
        style={styles.gradient}
      />
      {Array.from({ length: PETAL_COUNT }).map((_, i) => (
        <Petal key={i} delay={i * 800} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});
