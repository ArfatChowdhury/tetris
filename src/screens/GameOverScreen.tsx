import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Share } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay, 
  withTiming,
  FadeInDown,
  FadeInUp
} from 'react-native-reanimated';
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
  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just scored ${stats.score.toLocaleString()} points in Mosaic Tetris! Can you beat my level ${stats.level}?`,
      });
    } catch (error) {
      console.log('Error sharing', error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a0505', '#0a0a0a', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
          <Text style={styles.gameOverText}>GAME OVER</Text>
          <View style={styles.underline} />
        </Animated.View>

        <View style={styles.statsContainer}>
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.statRow}>
            <Text style={styles.statLabel}>FINAL SCORE</Text>
            <Text style={styles.statValue}>{stats.score.toLocaleString()}</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.statRow}>
            <Text style={styles.statLabel}>LEVEL REACHED</Text>
            <Text style={styles.statValue}>{stats.level}</Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.statRow}>
            <Text style={styles.statLabel}>LINES CLEARED</Text>
            <Text style={styles.statValue}>{stats.lines}</Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(800).springify()} style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={onRestart}>
            <Text style={styles.primaryBtnText}>PLAY AGAIN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleShare}>
            <Text style={styles.secondaryBtnText}>SHARE SCORE</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
            <Text style={styles.exitBtnText}>MAIN MENU</Text>
          </TouchableOpacity>
        </Animated.View>
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
    color: '#fff',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: '#ff0055',
    textShadowRadius: 20,
  },
  underline: {
    width: 200,
    height: 2,
    backgroundColor: 'rgba(255, 0, 85, 0.5)',
    marginTop: 10,
  },
  statsContainer: {
    width: '100%',
    marginBottom: 80,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 10,
  },
  statLabel: {
    color: '#deb887',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  statValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textShadowColor: 'rgba(255, 0, 85, 0.4)',
    textShadowRadius: 10,
  },
  actions: {
    width: '100%',
    gap: 15,
  },
  primaryBtn: {
    width: '100%',
    height: 65,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  secondaryBtn: {
    width: '100%',
    height: 55,
    backgroundColor: 'rgba(0, 240, 240, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 240, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#00f0f0',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
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
