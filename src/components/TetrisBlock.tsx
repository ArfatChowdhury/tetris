import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SkinDefinition } from '../constants/skins';

const { width } = Dimensions.get('window');
export const BLOCK_SIZE = Math.floor((width * 0.9) / 10);

interface TetrisBlockProps {
  color: string;
  isGhost?: boolean;
  skin: SkinDefinition;
}

export const TetrisBlock: React.FC<TetrisBlockProps> = React.memo(({ color, isGhost, skin }) => {
  const { blockStyle } = skin;

  const style = useMemo(() => {
    const baseStyle: any = {
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      backgroundColor: isGhost ? 'transparent' : color,
      opacity: isGhost ? 0.3 : (blockStyle.opacity || 1),
      borderRadius: blockStyle.borderRadius || 0,
      borderWidth: blockStyle.borderWidth || (isGhost ? 1 : 0),
      borderColor: isGhost ? color : (blockStyle.borderColor || 'rgba(0,0,0,0.1)'),
    };

    if (blockStyle.glow && !isGhost) {
      baseStyle.shadowColor = color;
      baseStyle.shadowOffset = { width: 0, height: 0 };
      baseStyle.shadowOpacity = 0.9;
      baseStyle.shadowRadius: 8;
      baseStyle.elevation = 8;
    }

    if (blockStyle.glass && !isGhost) {
      baseStyle.backgroundColor = `${color}BB`; // semi-transparent
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = 'rgba(255, 255, 255, 0.4)';
    }

    return baseStyle;
  }, [color, isGhost, blockStyle]);

  return <View style={[styles.block, style]} />;
});

const styles = StyleSheet.create({
  block: {
    margin: 0,
  },
});
