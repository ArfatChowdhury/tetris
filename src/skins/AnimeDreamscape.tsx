import React, { useState, useEffect } from 'react';
import { 
  Skia, 
  Rect, 
  useImage, 
  Image,
  Group,
  LinearGradient,
  vec
} from '@shopify/react-native-skia';
import { canvasSize } from './SharedSkia';
import { SkinDefinition } from './types';

// We need to require all images upfront for useImage or Image component
const frames = [
  require('../assets/anime-girl/ezgif-frame-001.jpg'),
  require('../assets/anime-girl/ezgif-frame-002.jpg'),
  require('../assets/anime-girl/ezgif-frame-003.jpg'),
  require('../assets/anime-girl/ezgif-frame-004.jpg'),
  require('../assets/anime-girl/ezgif-frame-005.jpg'),
  require('../assets/anime-girl/ezgif-frame-006.jpg'),
  require('../assets/anime-girl/ezgif-frame-007.jpg'),
  require('../assets/anime-girl/ezgif-frame-008.jpg'),
  require('../assets/anime-girl/ezgif-frame-009.jpg'),
  require('../assets/anime-girl/ezgif-frame-010.jpg'),
  require('../assets/anime-girl/ezgif-frame-011.jpg'),
  require('../assets/anime-girl/ezgif-frame-012.jpg'),
  require('../assets/anime-girl/ezgif-frame-013.jpg'),
  require('../assets/anime-girl/ezgif-frame-014.jpg'),
  require('../assets/anime-girl/ezgif-frame-015.jpg'),
  require('../assets/anime-girl/ezgif-frame-016.jpg'),
  require('../assets/anime-girl/ezgif-frame-017.jpg'),
  require('../assets/anime-girl/ezgif-frame-018.jpg'),
  require('../assets/anime-girl/ezgif-frame-019.jpg'),
  require('../assets/anime-girl/ezgif-frame-020.jpg'),
  require('../assets/anime-girl/ezgif-frame-021.jpg'),
  require('../assets/anime-girl/ezgif-frame-022.jpg'),
  require('../assets/anime-girl/ezgif-frame-023.jpg'),
  require('../assets/anime-girl/ezgif-frame-024.jpg'),
  require('../assets/anime-girl/ezgif-frame-025.jpg'),
];

const AnimeBackground: React.FC = () => {
  const [index, setIndex] = useState(0);
  
  // Note: loading all images with useImage might be heavy.
  // For a video loop, it's better to use a single component and update the source.
  // But Skia Image component needs an SkImage.
  
  const currentImage = useImage(frames[index]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % frames.length);
    }, 100); // 10fps
    return () => clearInterval(interval);
  }, []);

  if (!currentImage) return <Rect rect={canvasSize} color="#ffc0cb" />;

  return (
    <Group>
      <Image 
        image={currentImage} 
        x={0} 
        y={0} 
        width={canvasSize.width} 
        height={canvasSize.height} 
        fit="cover" 
      />
      <Rect rect={canvasSize}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, canvasSize.height)}
          colors={['rgba(255,182,193,0.3)', 'rgba(147,112,219,0.3)']}
        />
      </Rect>
    </Group>
  );
};

export const AnimeDreamscape: SkinDefinition = {
  name: 'Anime Dreamscape',
  background: AnimeBackground,
  blockPaint: () => {
    const paint = Skia.Paint();
    paint.setColor(Skia.Color('#ffffff'));
    paint.setAlphaf(0.8);
    paint.setStyle(Skia.PaintStyle.Fill);
    return paint;
  },
  hudStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderColor: '#ffb6c1',
    textColor: '#fff',
  },
};
