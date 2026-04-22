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
import Svg, { Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const RAIN_COUNT = 25;

const RainDrop = () => {
  const translateY = useSharedValue(-20);
  const translateX = Math.random() * width;

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(height + 20, {
        duration: 600 + Math.random() * 400,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0,
    left: translateX,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Svg width={1} height={20}>
        <Rect width={1} height={20} fill="rgba(0, 255, 255, 0.4)" />
      </Svg>
    </Animated.View>
  );
};

const BuildingLine = ({ x, color }: { x: number; color: string }) => {
  const h = 100 + Math.random() * 300;
  return (
    <View style={[styles.building, { left: x, width: 40, height: h, borderColor: color, bottom: 0 }]} />
  );
};

export const NeonCitySkin: React.FC = () => {
  const scanlineY = useSharedValue(-10);

  useEffect(() => {
    scanlineY.value = withRepeat(
      withTiming(height + 10, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const scanlineStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: scanlineY.value,
    left: 0,
    width,
    height: 2,
    backgroundColor: 'rgba(255, 0, 255, 0.3)',
  }));

  return (
    <View style={styles.container}>
      {/* Background Buildings */}
      <BuildingLine x={20} color="#ff00ff" />
      <BuildingLine x={100} color="#00ffff" />
      <BuildingLine x={180} color="#ffff00" />
      <BuildingLine x={260} color="#ff00ff" />
      <BuildingLine x={340} color="#00ffff" />

      {/* Rain */}
      {Array.from({ length: RAIN_COUNT }).map((_, i) => (
        <RainDrop key={i} />
      ))}

      {/* Scanline */}
      <Animated.View style={scanlineStyle} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050510',
  },
  building: {
    position: 'absolute',
    borderWidth: 1,
    borderBottomWidth: 0,
    opacity: 0.3,
  },
});
