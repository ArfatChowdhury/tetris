import React, { useEffect, useState } from 'react';
import { StyleSheet, View, LayoutChangeEvent } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';
import { Canvas, Image, useImage, Group } from '@shopify/react-native-skia';

export const ThunderOverlay: React.FC = () => {
  const opacity = useSharedValue(0);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const lightningImage = useImage(require('../assets/images/dbz_lightning_strike.png'));

  useEffect(() => {
    let isActive = true;

    const triggerLightning = () => {
      if (!isActive) return;

      const nextStrikeIn = Math.random() * 4000 + 1000;
      
      const flash = () => {
        if (!isActive) return;
        // Violent aura strobe
        opacity.value = withSequence(
          withTiming(1.0, { duration: 40, easing: Easing.out(Easing.ease) }),
          withTiming(0.2, { duration: 60 }),
          withTiming(1.0, { duration: 50 }),
          withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) })
        );
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

  const handleLayout = (e: LayoutChangeEvent) => {
    setSize({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none" onLayout={handleLayout}>
      {size.width > 0 && lightningImage && (
        <Canvas style={{ flex: 1 }}>
          {/* Use SCREEN blend mode to delete the black background and make it glow intensely */}
          <Group blendMode="screen">
            
            {/* Top Border Aura */}
            <Image 
              image={lightningImage} 
              x={0} y={-10} 
              width={size.width} height={50} 
              fit="fill" 
            />
            
            {/* Bottom Border Aura */}
            <Image 
              image={lightningImage} 
              x={0} y={size.height - 40} 
              width={size.width} height={50} 
              fit="fill" 
            />
            
            {/* Left Border Aura */}
            <Image 
              image={lightningImage} 
              x={-20} y={0} 
              width={60} height={size.height} 
              fit="fill" 
            />
            
            {/* Right Border Aura */}
            <Image 
              image={lightningImage} 
              x={size.width - 40} y={0} 
              width={60} height={size.height} 
              fit="fill" 
            />
            
          </Group>
        </Canvas>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    // Negative margin to allow the lightning to bleed slightly outside the strict board bounds if needed
    margin: -10,
    zIndex: 10,
  },
});
