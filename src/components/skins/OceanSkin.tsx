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
import Svg, { Circle, Path } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const BUBBLE_COUNT = 15;

const Bubble = () => {
  const translateY = useSharedValue(height + 20);
  const translateX = useSharedValue(Math.random() * width);
  const size = 5 + Math.random() * 10;
  const sway = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-20, {
        duration: 4000 + Math.random() * 3000,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    sway.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-15, { duration: 1000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: translateX.value + sway.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 1}
          fill="transparent"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth={1}
        />
      </Svg>
    </Animated.View>
  );
};

const Fish = ({ y, delay }: { y: number; delay: number }) => {
  const translateX = useSharedValue(-50);

  useEffect(() => {
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(width + 50, { duration: 10000, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: y,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={30} height={20} viewBox="0 0 30 20">
        <Path
          d="M5 10 C5 5, 20 2, 25 10 C20 18, 5 15, 5 10 M25 10 L30 5 L30 15 Z"
          fill="rgba(100, 200, 255, 0.6)"
        />
      </Svg>
    </Animated.View>
  );
};

export const OceanSkin: React.FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#001428', '#002850', '#001428']}
        style={styles.gradient}
      />
      {Array.from({ length: BUBBLE_COUNT }).map((_, i) => (
        <Bubble key={i} />
      ))}
      <Fish y={150} delay={0} />
      <Fish y={400} delay={3000} />
      <Fish y={600} delay={1500} />
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
