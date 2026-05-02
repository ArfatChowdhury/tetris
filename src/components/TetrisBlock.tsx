import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { SkinDefinition } from '../constants/skins';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
// Fixed sidebar width budget. Board gets remaining 70%.
export const SIDEBAR_WIDTH = Math.floor(width * 0.30);
export const BLOCK_SIZE = Math.floor((width * 0.70 - 4) / 10);

interface TetrisBlockProps {
  color: string;
  isGhost?: boolean;
  isActive?: boolean;
  skin: SkinDefinition;
}

export const TetrisBlock: React.FC<TetrisBlockProps> = React.memo(({ color, isGhost, isActive, skin }) => {
  const { blockStyle, id: skinId } = skin;

  const isCyber = blockStyle.cyber;
  const isLava = blockStyle.lava;
  const isMarshmallow = blockStyle.marshmallow;

  const style = useMemo(() => {
    const baseStyle: any = {
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      backgroundColor: isGhost ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
      borderRadius: blockStyle.borderRadius || (isMarshmallow ? 8 : 2),
    };

    if (isGhost) {
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = isCyber ? '#00FFFF88' : color;
      baseStyle.opacity = 0.5;
    } else if (isCyber) {
      baseStyle.backgroundColor = 'rgba(15, 0, 43, 0.9)';
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = '#00FFFF';
    } else if (isLava) {
      baseStyle.backgroundColor = '#0A0000';
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = '#FF450033';
    } else if (isMarshmallow) {
      baseStyle.backgroundColor = blockStyle.uniformColor || color;
      baseStyle.borderWidth = 0;
    } else {
      baseStyle.borderWidth = 1;
      baseStyle.borderTopColor = 'rgba(255, 255, 255, 0.6)';
      baseStyle.borderLeftColor = 'rgba(255, 255, 255, 0.4)';
      baseStyle.borderBottomColor = 'rgba(0, 0, 0, 0.6)';
      baseStyle.borderRightColor = 'rgba(0, 0, 0, 0.4)';
    }

    if (isActive && blockStyle.glow) {
      baseStyle.shadowColor = isCyber ? '#00FFFF' : (isLava ? '#FF4500' : color);
      baseStyle.shadowOffset = { width: 0, height: 0 };
      baseStyle.shadowOpacity = 1;
      baseStyle.shadowRadius = 15;
      baseStyle.elevation = 20;
    }

    return baseStyle;
  }, [color, isGhost, isActive, blockStyle]);

  return (
    <View style={[styles.block, style]}>
      {/* Lava Interior Glow */}
      {isLava && !isGhost && (
        <LinearGradient
          colors={['#1A0500', '#0D0000']}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* Cyber Interior Pattern */}
      {isCyber && !isGhost && (
        <View style={StyleSheet.absoluteFill}>
           <View style={[styles.cyberLine, { top: '20%', height: 1, backgroundColor: '#FF00FF44' }]} />
           <View style={[styles.cyberLine, { right: 4, width: 1, height: '60%', backgroundColor: '#00FFFF22' }]} />
        </View>
      )}

      {!isGhost && !isMarshmallow && !isCyber && !isLava && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.3)', 'transparent', 'rgba(0, 0, 0, 0.3)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* Marshmallow Highlight */}
      {isMarshmallow && !isGhost && (
        <View style={styles.marshmallowHighlight} />
      )}

      {/* LED Pixel Grid Overlay */}
      {skin.blockStyle.led && !isGhost && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.ledGrid} />
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  block: {
    margin: 0,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ledGrid: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 255, 0, 0.1)',
    opacity: 0.5,
  },
  cyberLine: {
    position: 'absolute',
    width: '100%',
  },
  marshmallowHighlight: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: '70%',
    height: '35%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 4,
  },
});
