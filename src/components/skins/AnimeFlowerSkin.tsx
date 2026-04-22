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
import Svg, { Path } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const PETAL_COUNT = 8;
const SPARKLE_COUNT = 10;

const FlowerPetal = ({ delay }: { delay: number }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(Math.random() * width);
  const rotate = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(height + 50, {
          duration: 8000 + Math.random() * 4000,
          easing: Easing.linear,
        }),
        -1,
        false
      )
    );
    rotate.value = withRepeat(
      withTiming(360, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: translateX.value,
    transform: [{ translateY: translateY.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={30} height={40} viewBox="0 0 30 40">
        <Path
          d="M15 2 C20 8, 28 15, 25 25 C22 35, 8 35, 5 25 C2 15, 10 8, 15 2Z"
          fill="rgba(255,182,193,0.7)"
          stroke="rgba(255,150,170,0.5)"
          strokeWidth={1}
        />
      </Svg>
    </Animated.View>
  );
};

const Sparkle = () => {
  const opacity = useSharedValue(0);
  const x = Math.random() * width;
  const y = Math.random() * height;

  useEffect(() => {
    const trigger = () => {
      opacity.value = withSequence(
        withTiming(1, { duration: 500 }),
        withTiming(0, { duration: 500 })
      );
      setTimeout(trigger, 2000 + Math.random() * 3000);
    };
    trigger();
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: y,
    left: x,
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={20} height={20}>
        <Path d="M10 2 L11 9 L18 10 L11 11 L10 18 L9 11 L2 10 L9 9Z" fill="white" />
      </Svg>
    </Animated.View>
  );
};

export const AnimeFlowerSkin: React.FC = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#e8d5f5', '#f5e6d5', '#d5e8f5']}
        style={styles.gradient}
      />
      {Array.from({ length: PETAL_COUNT }).map((_, i) => (
        <FlowerPetal key={i} delay={i * 1500} />
      ))}
      {Array.from({ length: SPARKLE_COUNT }).map((_, i) => (
        <Sparkle key={i} />
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
