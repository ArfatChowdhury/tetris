import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

export const DefaultSkin: React.FC = () => {
  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.background}
    >
      <View style={styles.gridOverlay} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    width,
    height,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    borderWidth: 0.5,
    borderColor: '#ffffff',
    // This is just a simple grid pattern
    backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
    backgroundSize: '20px 20px',
  },
});
