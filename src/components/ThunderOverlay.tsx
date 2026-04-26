import React, { useState } from 'react';
import { StyleSheet, View, LayoutChangeEvent } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useAnimatedReaction,
  useSharedValue,
  useDerivedValue,
} from 'react-native-reanimated';
import { Canvas, Image, useImage, Group } from '@shopify/react-native-skia';

interface ThunderOverlayProps {
  flashOpacity: Animated.SharedValue<number>;
}

export const ThunderOverlay: React.FC<ThunderOverlayProps> = ({ flashOpacity }) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const lightningImage = useImage(require('../assets/images/lightning_strike.png'));

  // Skia shared values for transformation
  const tX = useSharedValue(0);
  const tY = useSharedValue(0);
  const rot = useSharedValue(0);
  const scl = useSharedValue(1);

  const transformArray = useDerivedValue(() => {
    return [
      { translateX: tX.value },
      { translateY: tY.value },
      { rotate: rot.value },
      { scale: scl.value }
    ];
  });

  useAnimatedReaction(
    () => flashOpacity.value,
    (current, previous) => {
      // Trigger randomizer when flash strikes (opacity jumps from 0 to 1)
      if (current > 0.5 && (previous === null || previous < 0.5)) {
        tX.value = (Math.random() - 0.5) * 200;
        tY.value = (Math.random() - 0.5) * 200;
        rot.value = Math.random() * Math.PI * 2;
        scl.value = Math.random() * 1.5 + 1.5; // Scale between 1.5 and 3.0
      }
    }
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: flashOpacity.value * 0.6, // Cap between 50-70%
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
          <Group 
            blendMode="screen"
            origin={{ x: size.width / 2, y: size.height / 2 }}
            transform={transformArray}
          >
            <Image 
              image={lightningImage} 
              x={-size.width} y={-size.height} 
              width={size.width * 3} height={size.height * 3} 
              fit="contain" 
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
  },
});
