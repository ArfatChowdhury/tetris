import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SkinDefinition } from '../constants/skins';
import { TetrisBlock, BLOCK_SIZE as BASE_BLOCK_SIZE } from './TetrisBlock';
import { TetrominoType, TETROMINOES } from '../constants/tetrominos';

const { height } = Dimensions.get('window');

interface SidebarUIProps {
  score: number;
  level: number;
  lines: number;
  revealPercentage: number;
  nextPiece: TetrominoType | null;
  skin: SkinDefinition;
}

export const SidebarUI: React.FC<SidebarUIProps> = ({ score, level, lines, revealPercentage, nextPiece, skin }) => {
  const renderNextPiece = () => {
    if (!nextPiece) return null;
    const shape = TETROMINOES[nextPiece].shape;
    const color = TETROMINOES[nextPiece].color;
    
    // Scale down blocks for the sidebar preview
    const PREVIEW_BLOCK_SIZE = BASE_BLOCK_SIZE * 0.6;
    
    return (
      <View style={styles.previewContainer}>
        {shape.map((row, y) => (
          <View key={`next-row-${y}`} style={{ flexDirection: 'row' }}>
            {row.map((cell, x) => (
              <View key={`next-cell-${x}-${y}`} style={{ width: PREVIEW_BLOCK_SIZE, height: PREVIEW_BLOCK_SIZE }}>
                {cell !== 0 && (
                   <View style={[{ width: PREVIEW_BLOCK_SIZE, height: PREVIEW_BLOCK_SIZE, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)' }]} />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>NEXT</Text>
      </View>
      <View style={styles.previewBox}>
        {renderNextPiece()}
      </View>

      <View style={styles.statBox}>
        <Text style={styles.statLabel}>SCORE</Text>
        <Text style={styles.statValue}>{score.toLocaleString()}</Text>
      </View>

      <View style={styles.statBox}>
        <Text style={styles.statLabel}>ROWS CLEARED</Text>
        <Text style={styles.statValue}>{lines}</Text>
      </View>

      <View style={styles.statBox}>
        <Text style={styles.statLabel}>LEVEL</Text>
        <Text style={styles.statValue}>{level}</Text>
      </View>

      <View style={styles.meterContainer}>
        <Text style={styles.meterTitle}>REVEAL: {revealPercentage}%</Text>
        <View style={styles.meterGauge}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={['#00ffff', '#0044ff']}
            style={[styles.meterFill, { height: `${revealPercentage}%` }]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
    paddingVertical: 40,
    paddingHorizontal: 15,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
  sectionHeader: {
    marginBottom: 5,
  },
  sectionTitle: {
    color: '#deb887', // Golden hue matching premium UI concept
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  previewBox: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(222, 184, 135, 0.5)',
    borderRadius: 4,
    marginBottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  previewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    marginBottom: 15,
  },
  statLabel: {
    color: '#deb887',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'monospace',
    fontWeight: '800',
  },
  meterContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    height: height * 0.3, // Liquid fill meter height
  },
  meterTitle: {
    color: '#00ffff',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  meterGauge: {
    width: 15,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  meterFill: {
    width: '100%',
  },
});
