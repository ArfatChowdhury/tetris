import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SkinDefinition } from '../constants/skins';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
// Reduce block size to 65% of screen width to leave room for the right sidebar
export const BLOCK_SIZE = Math.floor((width * 0.65) / 10);

interface TetrisBlockProps {
  color: string;
  isGhost?: boolean;
  isActive?: boolean;
  skin: SkinDefinition;
}

export const TetrisBlock: React.FC<TetrisBlockProps> = React.memo(({ color, isGhost, isActive, skin }) => {
  const { blockStyle } = skin;

  const style = useMemo(() => {
    const baseStyle: any = {
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      // For the mosaic effect, settled pieces are entirely driven by the underlying SVG image.
      // Ghost is just an outline. Default background is transparent so the image shows through.
      backgroundColor: isGhost ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
      borderRadius: blockStyle.borderRadius || 2,
    };

    if (isGhost) {
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = color;
      baseStyle.opacity = 0.5;
    } else {
      // Claymorphic / Glass effect borders
      baseStyle.borderWidth = 1;
      baseStyle.borderTopColor = 'rgba(255, 255, 255, 0.6)';
      baseStyle.borderLeftColor = 'rgba(255, 255, 255, 0.4)';
      baseStyle.borderBottomColor = 'rgba(0, 0, 0, 0.6)';
      baseStyle.borderRightColor = 'rgba(0, 0, 0, 0.4)';
    }

    if (isActive && blockStyle.glow) {
      baseStyle.shadowColor = color;
      baseStyle.shadowOffset = { width: 0, height: 0 };
      baseStyle.shadowOpacity = 1;
      baseStyle.shadowRadius = 15;
      baseStyle.elevation = 20;
      baseStyle.backgroundColor = 'rgba(255, 255, 255, 0.15)';
    }

    return baseStyle;
  }, [color, isGhost, isActive, blockStyle]);

  return (
    <View style={[styles.block, style]}>
      {!isGhost && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.3)', 'transparent', 'rgba(0, 0, 0, 0.3)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  block: {
    margin: 0,
  },
});
