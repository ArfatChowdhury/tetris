import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

export const ThunderOverlay: React.FC = () => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    let isActive = true;

    const triggerLightning = () => {
      if (!isActive) return;

      // Random wait before the next thunder strike (1 to 5 seconds)
      const nextStrikeIn = Math.random() * 4000 + 1000;
      
      const flash = () => {
        if (!isActive) return;
        // The classic lightning strobe effect:
        // 1. Instant bright spike
        // 2. Quick dip
        // 3. Second massive bright spike
        // 4. Slow, atmospheric fade out
        opacity.value = withSequence(
          withTiming(0.8, { duration: 40, easing: Easing.out(Easing.ease) }),
          withTiming(0.1, { duration: 60 }),
          withTiming(1.0, { duration: 50 }),
          withTiming(0, { duration: 500, easing: Easing.in(Easing.ease) })
        );
        
        // Queue the next random strike
        setTimeout(triggerLightning, nextStrikeIn);
      };

      setTimeout(flash, nextStrikeIn);
    };

    triggerLightning();

    return () => {
      isActive = false;
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
      {/* Subtle global ambient flash */}
      <View style={styles.ambientGlow} />

      {/* Intense Edge Flashes */}
      <View style={[styles.flashBorder, styles.topBorder]} />
      <View style={[styles.flashBorder, styles.bottomBorder]} />
      <View style={[styles.flashBorder, styles.leftBorder]} />
      <View style={[styles.flashBorder, styles.rightBorder]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100, // Stay above the game board but under pause menus
  },
  ambientGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 229, 255, 0.08)', // Cyan ambient light
  },
  flashBorder: {
    position: 'absolute',
    backgroundColor: '#FFFFFF', // Core of the lightning is pure white
    shadowColor: '#00E5FF', // The halo is cyan
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 20,
  },
  topBorder: {
    top: 0, left: 0, right: 0, height: 4,
    shadowOffset: { width: 0, height: 15 },
  },
  bottomBorder: {
    bottom: 0, left: 0, right: 0, height: 4,
    shadowOffset: { width: 0, height: -15 },
  },
  leftBorder: {
    top: 0, bottom: 0, left: 0, width: 4,
    shadowOffset: { width: 15, height: 0 },
  },
  rightBorder: {
    top: 0, bottom: 0, right: 0, width: 4,
    shadowOffset: { width: -15, height: 0 },
  },
});
