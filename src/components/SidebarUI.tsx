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
  width?: number;
}

export const SidebarUI: React.FC<SidebarUIProps> = ({ score, level, lines, revealPercentage, nextPiece, skin, width }) => {
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
    <View style={[styles.container, width ? { width } : undefined]}>
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
        <Text style={styles.meterLabel}>REVEAL</Text>
        <Text style={styles.meterPercent}>{revealPercentage}%</Text>
        <View style={styles.meterGauge}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.05)', 'rgba(0, 0, 0, 0.2)']}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={['#00ffff', '#0099ff', '#0044ff']}
            style={[styles.meterFill, { height: `${revealPercentage}%` }]}
          />
          {/* Top liquid gleam */}
          <View style={[styles.meterGleam, { bottom: `${revealPercentage}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingVertical: 40,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.05)',
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
    width: 65,
    height: 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
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
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  meterContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    height: height * 0.28, 
  },
  meterLabel: {
    color: '#deb887',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 2,
  },
  meterPercent: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 8,
  },
  meterGauge: {
    width: 14,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(222, 184, 135, 0.3)',
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  meterFill: {
    width: '100%',
    borderRadius: 7,
  },
  meterGleam: {
    position: 'absolute',
    width: '100%',
    height: 4,
    backgroundColor: '#fff',
    opacity: 0.8,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
});
