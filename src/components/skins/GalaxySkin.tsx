import React, { useEffect } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolateColor,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const STAR_COUNT = 40;

const Star = () => {
  const opacity = useSharedValue(Math.random());
  const x = Math.random() * width;
  const y = Math.random() * height;
  const size = 1 + Math.random() * 2;

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 + Math.random() * 1000 }),
        withTiming(0.2, { duration: 1000 + Math.random() * 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: y,
    left: x,
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={4} height={4}>
        <Circle cx={2} cy={2} r={size / 2} fill="white" />
      </Svg>
    </Animated.View>
  );
};

export const GalaxySkin: React.FC = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.linear }),
      -1,
      true
    );
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a1a', '#1a0a3e', '#0a1a3e']}
        style={styles.gradient}
      />
      {Array.from({ length: STAR_COUNT }).map((_, i) => (
        <Star key={i} />
      ))}
      <View style={[styles.nebula, { top: 100, left: 50, backgroundColor: 'rgba(128, 0, 255, 0.1)' }]} />
      <View style={[styles.nebula, { top: 400, left: 200, backgroundColor: 'rgba(0, 128, 255, 0.1)' }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  nebula: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.5,
    // Note: Blur isn't easily supported in default RN View, so we use opacity and semi-transparent colors
  },
});
