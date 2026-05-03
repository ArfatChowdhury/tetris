import React from 'react';
import { 
  Skia, 
  Rect, 
  useImage, 
  ImageShader, 
  TileMode,
  Group
} from '@shopify/react-native-skia';
import { canvasSize } from './SharedSkia';
import { SkinDefinition } from './types';

const PixelBackground: React.FC = () => {
  const image = useImage(require('../assets/images/imagine-art-feed-item (2).png'));
  
  if (!image) return <Rect rect={canvasSize} color="#111" />;

  const scanlines = [];
  for (let i = 0; i < canvasSize.height; i += 4) {
    scanlines.push(
      <Rect 
        key={i} 
        x={0} 
        y={i} 
        width={canvasSize.width} 
        height={1} 
        color="rgba(0,0,0,0.2)" 
      />
    );
  }

  return (
    <Group>
      <Rect rect={canvasSize}>
        <ImageShader 
          image={image} 
          tx={TileMode.Repeat} 
          ty={TileMode.Repeat} 
          fit="cover"
        />
      </Rect>
      {scanlines}
    </Group>
  );
};

export const PixelRetro: SkinDefinition = {
  name: 'Pixel Retro',
  background: PixelBackground,
  blockPaint: (row, col) => {
    const palette = ['#ff3b30', '#ff9500', '#ffcc00', '#4cd964', '#5ac8fa', '#007aff', '#5856d6'];
    const paint = Skia.Paint();
    paint.setColor(Skia.Color(palette[(row + col) % palette.length]));
    paint.setStyle(Skia.PaintStyle.Fill);
    return paint;
  },
  hudStyle: {
    backgroundColor: '#000',
    borderColor: '#fff',
    textColor: '#fff',
    fontFamily: 'monospace',
  },
};
