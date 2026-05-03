import React from 'react';
import { 
  Skia, 
  Rect, 
  useImage, 
  ColorFilter, 
  ImageShader, 
  TileMode,
  Blur
} from '@shopify/react-native-skia';
import { canvasSize } from './SharedSkia';
import { SkinDefinition } from './types';

const NeonBackground: React.FC = () => {
  const image = useImage(require('../assets/images/1777444483521.jpeg'));
  
  if (!image) return <Rect rect={canvasSize} color="#000" />;

  return (
    <Rect rect={canvasSize}>
      <ImageShader 
        image={image} 
        tx={TileMode.Repeat} 
        ty={TileMode.Repeat} 
        fit="cover"
      />
      <ColorFilter matrix={[
        0.2, 0, 0, 0, 0,
        0, 0.8, 0, 0, 0,
        0, 0, 1.0, 0, 0,
        0, 0, 0, 1, 0,
      ]} />
    </Rect>
  );
};

export const NeonCyberVoid: SkinDefinition = {
  name: 'Neon Cyber-Void',
  background: NeonBackground,
  blockPaint: () => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color('#00ffea'));
    paint.setStyle(Skia.PaintStyle.Stroke);
    paint.setStrokeWidth(2);
    // Note: MaskFilter/Blur in imperative API is set via setMaskFilter
    paint.setMaskFilter(Skia.MaskFilter.MakeBlur(Skia.BlurStyle.Normal, 4, true));
    return paint;
  },
  hudStyle: {
    backgroundColor: 'rgba(0, 20, 20, 0.8)',
    borderColor: '#00ffea',
    textColor: '#00ffea',
  },
};
