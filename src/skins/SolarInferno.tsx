import React from 'react';
import { 
  Skia, 
  Rect, 
  useImage, 
  ImageShader, 
  TileMode,
  ColorFilter,
  RadialGradient,
  vec
} from '@shopify/react-native-skia';
import { canvasSize } from './SharedSkia';
import { SkinDefinition } from './types';

const SolarBackground: React.FC = () => {
  const image = useImage(require('../assets/images/1777444483521.jpeg'));
  
  if (!image) return <Rect rect={canvasSize} color="#200" />;

  return (
    <Rect rect={canvasSize}>
      <ImageShader 
        image={image} 
        tx={TileMode.Repeat} 
        ty={TileMode.Repeat} 
        fit="cover"
      />
      <ColorFilter matrix={[
        1, 0, 0, 0, 0,
        0, 0.4, 0, 0, 0,
        0, 0, 0.1, 0, 0,
        0, 0, 0, 1, 0,
      ]} />
    </Rect>
  );
};

export const SolarInferno: SkinDefinition = {
  name: 'Solar Inferno',
  background: SolarBackground,
  blockPaint: () => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color('#ff4500'));
    // We can't easily return a paint with a shader from here if it needs to be dynamic per block position
    // But we can set a simple color or a fixed shader.
    return paint;
  },
  hudStyle: {
    backgroundColor: 'rgba(50, 0, 0, 0.8)',
    borderColor: '#ff4500',
    textColor: '#ffb400',
  },
};
