import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { DefaultSkin } from './DefaultSkin';
import { CherryBlossomSkin } from './CherryBlossomSkin';
import { GalaxySkin } from './GalaxySkin';
import { AnimeFlowerSkin } from './AnimeFlowerSkin';
import { NeonCitySkin } from './NeonCitySkin';
import { OceanSkin } from './OceanSkin';

const { width, height } = Dimensions.get('window');

interface SkinEngineProps {
  skinId: string;
}

export const SkinEngine: React.FC<SkinEngineProps> = ({ skinId }) => {
  const renderBackground = () => {
    switch (skinId) {
      case 'cherry_blossom':
        return <CherryBlossomSkin />;
      case 'galaxy':
        return <GalaxySkin />;
      case 'anime_flower':
        return <AnimeFlowerSkin />;
      case 'neon_city':
        return <NeonCitySkin />;
      case 'ocean':
        return <OceanSkin />;
      default:
        return <DefaultSkin />;
    }
  };

  return (
    <View style={styles.container}>
      {renderBackground()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    zIndex: -1,
  },
});
