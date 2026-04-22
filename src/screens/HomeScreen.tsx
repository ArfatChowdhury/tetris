import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SkinEngine } from '../components/skins/SkinEngine';
import { useSkinStore } from '../hooks/useSkinStore';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  onPlay: () => void;
  onOpenShop: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onPlay, onOpenShop }) => {
  const { activeSkinId } = useSkinStore();

  return (
    <View style={styles.container}>
      <SkinEngine skinId={activeSkinId} />
      
      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.titlePrefix}>ULTIMATE</Text>
          <Text style={styles.title}>TETRIS</Text>
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
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  title: {
    color: '#fff',
    fontSize: 60,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  titleUnderline: {
    width: 150,
    height: 4,
    backgroundColor: '#00f0f0',
    marginTop: 10,
    borderRadius: 2,
  },
  menu: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  playButton: {
    width: width * 0.6,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  playButtonText: {
    color: '#1a1a2e',
    fontSize: 24,
    fontWeight: '900',
  },
  shopButton: {
    width: width * 0.6,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
    color: '#ffb6c1', // Using a soft color for high score
    fontSize: 24,
    fontWeight: '900',
    marginTop: 5,
  },
});
