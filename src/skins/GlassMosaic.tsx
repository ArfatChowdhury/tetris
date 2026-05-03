import React from 'react';
import { 
  Skia, 
  Rect, 
  useImage, 
  ImageShader, 
  TileMode,
  BlurMask
} from '@shopify/react-native-skia';
import { canvasSize } from './SharedSkia';
import { SkinDefinition } from './types';

const GlassBackground: React.FC = () => {
  const image = useImage(require('../assets/images/imagine-art-feed-item (5).png'));
  
  if (!image) return <Rect rect={canvasSize} color="#333" />;

  return (
    <Rect rect={canvasSize}>
      <ImageShader 
        image={image} 
        tx={TileMode.Repeat} 
        ty={TileMode.Repeat} 
        fit="cover"
      />
    </Rect>
  );
};

export const GlassMosaic: SkinDefinition = {
  name: 'Glass Mosaic',
  background: GlassBackground,
  blockPaint: () => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color('rgba(255, 255, 255, 0.2)'));
    paint.setStyle(Skia.PaintStyle.Fill);
    paint.setMaskFilter(Skia.MaskFilter.MakeBlur(Skia.BlurStyle.Normal, 6, true));
    return paint;
  },
  hudStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    textColor: '#fff',
    blur: 15,
  },
};
