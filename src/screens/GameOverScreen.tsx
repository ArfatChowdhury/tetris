import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Share } from 'react-native';
import { SkinEngine } from '../components/skins/SkinEngine';
import { useSkinStore } from '../hooks/useSkinStore';

const { width } = Dimensions.get('window');

interface GameOverScreenProps {
  stats: {
    score: number;
    level: number;
    lines: number;
  };
  onRestart: () => void;
  onExit: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ stats, onRestart, onExit }) => {
  const { activeSkinId } = useSkinStore();

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just scored ${stats.score.toLocaleString()} points in Ultimate Tetris! Can you beat my level ${stats.level}?`,
      });
    } catch (error) {
      console.log('Error sharing', error);
    }
  };

  return (
    <View style={styles.container}>
      <SkinEngine skinId={activeSkinId} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.gameOverText}>GAME OVER</Text>
          <View style={styles.underline} />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>FINAL SCORE</Text>
            <Text style={styles.statValue}>{stats.score.toLocaleString()}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>LEVEL REACHED</Text>
            <Text style={styles.statValue}>{stats.level}</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>LINES CLEARED</Text>
            <Text style={styles.statValue}>{stats.lines}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={onRestart}>
            <Text style={styles.primaryBtnText}>PLAY AGAIN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare}>
            <Text style={styles.secondaryBtnText}>SHARE SCORE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
            <Text style={styles.exitBtnText}>MAIN MENU</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  gameOverText: {
    color: '#ff0055',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 2,
  },
  underline: {
    width: 200,
    height: 4,
    backgroundColor: '#ff0055',
    marginTop: 10,
    borderRadius: 2,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 80,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
  },
  actions: {
    width: '100%',
    gap: 15,
  },
  primaryBtn: {
    width: '100%',
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
  },
  secondaryBtn: {
    width: '100%',
    height: 60,
    backgroundColor: 'rgba(0, 240, 240, 0.2)',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#00f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#00f0f0',
    fontSize: 16,
    fontWeight: 'bold',
  },
  exitBtn: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  exitBtnText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
