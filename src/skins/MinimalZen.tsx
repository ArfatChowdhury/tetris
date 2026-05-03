import React from 'react';
import { 
  Skia, 
  Rect, 
  useImage, 
  Image,
  Group
} from '@shopify/react-native-skia';
import { canvasSize } from './SharedSkia';
import { SkinDefinition } from './types';

const ZenBackground: React.FC = () => {
  const image = useImage(require('../assets/images/imagine-art-feed-item.png'));
  
  return (
    <Group>
      <Rect rect={canvasSize} color="#f0f0f0" />
      {image && (
        <Image 
          image={image} 
          x={canvasSize.width - 120} 
          y={canvasSize.height - 80} 
          width={100} 
          height={60} 
          opacity={0.1}
          fit="contain"
        />
      )}
    </Group>
  );
};

export const MinimalZen: SkinDefinition = {
  name: 'Minimal Zen',
  background: ZenBackground,
  blockPaint: () => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color('#6c757d'));
    paint.setStyle(Skia.PaintStyle.Fill);
    paint.setAntiAlias(true);
    return paint;
  },
  hudStyle: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    textColor: '#333',
  },
};
