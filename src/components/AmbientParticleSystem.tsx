import React, { useMemo, useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import {
  Canvas,
  Circle,
  Group,
  Image,
  Paint,
  Path,
  BlurMask,
  useImage,
} from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { SkinDefinition } from '../constants/skins';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

interface AshParticleProps {
  x: number;
  y: number;
  size: number;
  speed: number;
  wobble: number;
  time: SharedValue<number>;
  canvasH: number;
  canvasW: number;
  particleType?: 'ash' | 'hearts' | 'bubbles';
  image?: any; // For hearts
  simulateBunnyCollision?: boolean;
}

const AshParticle: React.FC<AshParticleProps> = ({ x, y, size, speed, wobble, time, canvasH, canvasW, particleType, image, simulateBunnyCollision }) => {
  const isFalling = particleType === 'hearts';

  // The invisible "Bunny Hitbox" exactly in the center of the screen
  const bunnyCenterX = canvasW / 2;
  const bunnyCenterY = canvasH / 2;
  const bunnyRadiusX = canvasW * 0.35;
  const bunnyRadiusY = canvasH * 0.2;

  const cy = useDerivedValue(() => {
    let currentY = isFalling ? y + time.value * speed : y - time.value * speed;
    return ((currentY % canvasH) + canvasH) % canvasH;
  });

  const cx = useDerivedValue(() => {
    let baseWobble = Math.sin(time.value * 0.005 + wobble) * 15;
    return x + baseWobble;
  });

  const imgSize = size * 6;
  const transform = useDerivedValue(() => {
    return [
      { translateX: cx.value - imgSize / 2 },
      { translateY: cy.value - imgSize / 2 }
    ];
  });

  if (particleType === 'hearts' && image) {
    return (
      <Group transform={transform}>
        <Image image={image} x={0} y={0} width={imgSize} height={imgSize} fit="contain" />
      </Group>
    );
  }

  if (particleType === 'bubbles') {
    const bubbleTransform = useDerivedValue(() => [
      { translateX: cx.value },
      { translateY: cy.value }
    ]);
    const bubbleSize = size * 3;
    return (
      <Group transform={bubbleTransform}>
        <Circle cx={0} cy={0} r={bubbleSize} color="rgba(255,255,255,0.1)">
          <Paint style="stroke" strokeWidth={1.5} color="rgba(255,255,255,0.7)" />
        </Circle>
        <Path path={`M ${-bubbleSize * 0.6} ${-bubbleSize * 0.4} Q ${-bubbleSize * 0.2} ${-bubbleSize * 0.7} ${bubbleSize * 0.2} ${-bubbleSize * 0.6}`} color="rgba(255,255,255,0.9)" style="stroke" strokeWidth={2} strokeCap="round" />
      </Group>
    );
  }

  return (
    <Circle cx={cx} cy={cy} r={size} color="#FF6600">
      <BlurMask blur={3} style="normal" />
    </Circle>
  );
};

interface AmbientParticleSystemProps {
  skin: SkinDefinition;
}

export const AmbientParticleSystem: React.FC<AmbientParticleSystemProps> = ({ skin }) => {
  const heartImage = useImage(require('../assets/images/bunny/heart.png'));
  
  const time = useSharedValue(0);
  
  useEffect(() => {
    if (skin.particles) {
      time.value = withRepeat(
        withTiming(5000, { duration: 60000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [skin.particles, time]);

  const particles = useMemo(() => {
    const isSpecial = skin.particles === 'hearts' || skin.particles === 'bubbles';
    // More particles since it's full screen
    const count = isSpecial ? 25 : 40;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * windowWidth,
      y: Math.random() * windowHeight,
      size: isSpecial ? Math.random() * 2 + 1.5 : Math.random() * 2 + 1,
      speed: isSpecial ? Math.random() * 0.15 + 0.05 : Math.random() * 0.4 + 0.2,
      wobble: Math.random() * Math.PI * 2,
    }));
  }, [skin.particles]);

  if (!skin.particles) return null;

  return (
    <Canvas style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((p) => (
        <AshParticle
          key={p.id}
          x={p.x}
          y={p.y}
          size={p.size}
          speed={p.speed}
          wobble={p.wobble}
          time={time}
          canvasH={windowHeight}
          canvasW={windowWidth}
          particleType={skin.particles}
          image={skin.particles === 'hearts' ? heartImage : undefined}
          simulateBunnyCollision={skin.id === 'kawaii_crunch'} // Enable hitboxes for Kawaii Crunch!
        />
      ))}
    </Canvas>
  );
};
