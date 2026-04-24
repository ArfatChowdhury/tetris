import React, { useEffect, useState } from 'react';
import { StyleSheet, View, LayoutChangeEvent } from 'react-native';
import Animated, { 
  useSharedValue, 
  withRepeat,
  withTiming, 
  Easing,
  useDerivedValue
} from 'react-native-reanimated';
import { Canvas, Image, useImage, Group } from '@shopify/react-native-skia';

export const ContinuousAuraOverlay: React.FC = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const frame1 = useImage(require('../assets/images/aura_frame_1.png'));
  const frame2 = useImage(require('../assets/images/aura_frame_2.png'));

  // Toggle drives the animation loop from 0 to 1 and back endlessly
  const toggle = useSharedValue(0);

  useEffect(() => {
    // 80ms duration ping-pong creates a ~12fps violent strobe effect
    toggle.value = withRepeat(
      withTiming(1, { duration: 80, easing: Easing.linear }),
      -1, // Infinite loops
      true // Reverse on each loop
    );
  }, [toggle]);

  // Derive opacities so when frame1 fades out, frame2 fades in
  const opacity1 = useDerivedValue(() => 1 - toggle.value);
  const opacity2 = useDerivedValue(() => toggle.value);

  const handleLayout = (e: LayoutChangeEvent) => {
    setSize({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    });
  };

  return (
    <View style={styles.container} pointerEvents="none" onLayout={handleLayout}>
      {size.width > 0 && frame1 && frame2 && (
        <Canvas style={{ flex: 1 }}>
          {/* SCREEN blend mode makes the black background disappear and creates additive glow */}
          <Group blendMode="screen">
            
            {/* ── FRAME 1 ── */}
            <Group opacity={opacity1}>
              <Image image={frame1} x={0} y={-10} width={size.width} height={50} fit="fill" />
              <Image image={frame1} x={0} y={size.height - 40} width={size.width} height={50} fit="fill" />
              <Image image={frame1} x={-20} y={0} width={60} height={size.height} fit="fill" />
              <Image image={frame1} x={size.width - 40} y={0} width={60} height={size.height} fit="fill" />
            </Group>

            {/* ── FRAME 2 ── */}
            <Group opacity={opacity2}>
              {/* To make the frames look even more chaotic, we flip frame2 vertically using negative heights */}
              {/* Actually, the AI generated distinctly different frames so we just draw them normally! */}
              <Image image={frame2} x={0} y={-10} width={size.width} height={50} fit="fill" />
              <Image image={frame2} x={0} y={size.height - 40} width={size.width} height={50} fit="fill" />
              <Image image={frame2} x={-20} y={0} width={60} height={size.height} fit="fill" />
              <Image image={frame2} x={size.width - 40} y={0} width={60} height={size.height} fit="fill" />
            </Group>

          </Group>
        </Canvas>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    // Negative margin to bleed the lightning slightly outside the game board
    margin: -10,
    zIndex: 10,
  },
});
