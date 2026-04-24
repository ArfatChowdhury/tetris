import { useEffect } from 'react';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
import { useSharedValue, withSpring, SharedValue } from 'react-native-reanimated';

// Limit accelerometer updates to 60fps (16ms)
setUpdateIntervalForType(SensorTypes.accelerometer, 16);

// Maximum pixel shift for the parallax effect
const MAX_SHIFT_X = 25;
const MAX_SHIFT_Y = 25;

export const useParallax = (): { parallaxX: SharedValue<number>; parallaxY: SharedValue<number> } => {
  const parallaxX = useSharedValue(0);
  const parallaxY = useSharedValue(0);

  useEffect(() => {
    const subscription = accelerometer.subscribe(({ x, y }) => {
      // Map hardware accelerometer gravity vector to pixel offsets.
      // Phone resting face up on a desk: x=0, y=0.
      // Holding phone vertically: y=9.8
      
      // We invert X and Y to create a "looking through a window" parallax effect.
      // When phone tilts left (x > 0), the image underneath should shift right.
      let targetX = (x / 5) * MAX_SHIFT_X;
      
      // For Y, people usually hold their phones tilted at ~45 degrees (y ≈ 5).
      // We subtract 5 to treat that holding angle as "center zero".
      let targetY = ((y - 5) / 5) * MAX_SHIFT_Y;

      // Clamp targets
      targetX = Math.max(-MAX_SHIFT_X, Math.min(MAX_SHIFT_X, targetX));
      targetY = Math.max(-MAX_SHIFT_Y, Math.min(MAX_SHIFT_Y, targetY));

      // Apply smooth spring physics so the image glides fluidly and doesn't jitter
      parallaxX.value = withSpring(-targetX, {
        damping: 15,
        stiffness: 90,
        mass: 1,
      });
      
      parallaxY.value = withSpring(targetY, {
        damping: 15,
        stiffness: 90,
        mass: 1,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { parallaxX, parallaxY };
};
