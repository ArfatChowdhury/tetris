import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GameHUDProps {
  score: number;
  level: number;
  lines: number;
}

export const GameHUD: React.FC<GameHUDProps> = React.memo(({ score, level, lines }) => {
  return (
    <View style={styles.container}>
      <View style={styles.statBox}>
        <Text style={styles.label}>SCORE</Text>
        <Text style={styles.value}>{score.toLocaleString()}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.label}>LEVEL</Text>
        <Text style={styles.value}>{level}</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.label}>LINES</Text>
        <Text style={styles.value}>{lines}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  statBox: {
    alignItems: 'center',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  value: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },
});
