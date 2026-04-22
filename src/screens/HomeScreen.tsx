import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSkinStore } from '../hooks/useSkinStore';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onPlay: () => void;
  onOpenShop: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onPlay, onOpenShop }) => {

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#050510', '#0a0a1a', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.titlePrefix}>CRYSTAL</Text>
          <Text style={styles.title}>MOSAIC</Text>
          <Text style={styles.titleSuffix}>TETRIS</Text>
          <View style={styles.titleUnderline} />
        </View>

        <View style={styles.menu}>
          <TouchableOpacity style={styles.playButton} onPress={onPlay}>
            <Text style={styles.playButtonText}>PLAY</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shopButton} onPress={onOpenShop}>
            <Text style={styles.shopButtonText}>SKINS SHOP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.highScoreLabel}>HIGH SCORE</Text>
          <Text style={styles.highScoreValue}>254,120</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 100,
  },
  titleContainer: {
    alignItems: 'center',
  },
  titlePrefix: {
    color: '#00ffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 8,
    textShadowColor: 'rgba(0, 255, 255, 0.8)',
    textShadowRadius: 15,
  },
  title: {
    color: '#fff',
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -2,
    marginTop: -10,
  },
  titleSuffix: {
    color: '#deb887',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 12,
    marginTop: -10,
    textShadowColor: '#deb887',
    textShadowRadius: 10,
  },
  titleUnderline: {
    width: 200,
    height: 2,
    backgroundColor: 'rgba(222, 184, 135, 0.5)',
    marginTop: 15,
  },
  menu: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  playButton: {
    width: width * 0.7,
    height: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 255, 255, 0.6)',
    textShadowRadius: 15,
  },
  shopButton: {
    width: width * 0.7,
    height: 55,
    backgroundColor: 'rgba(222, 184, 135, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(222, 184, 135, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  shopButtonText: {
    color: '#deb887',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  footer: {
    alignItems: 'center',
  },
  highScoreLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  highScoreValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 5,
    textShadowColor: '#deb887',
    textShadowRadius: 10,
  },
});
