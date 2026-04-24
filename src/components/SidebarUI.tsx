import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SkinDefinition } from '../constants/skins';
import { TetrisBlock, BLOCK_SIZE as BASE_BLOCK_SIZE } from './TetrisBlock';
import { TetrominoType, TETROMINOES } from '../constants/tetrominos';
import { Canvas, Image, useImage, Group } from '@shopify/react-native-skia';
import { SharedValue } from 'react-native-reanimated';

const { height } = Dimensions.get('window');

interface SidebarUIProps {
  score: number;
  level: number;
  lines: number;
  revealPercentage: number;
  nextPiece: TetrominoType | null;
  skin: SkinDefinition;
  width?: number;
  flashOpacity?: SharedValue<number>;
}

export const SidebarUI: React.FC<SidebarUIProps> = ({ score, level, lines, revealPercentage, nextPiece, skin, width, flashOpacity }) => {
  const lightningImage = useImage(require('../assets/images/dbz_lightning_strike.png'));

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
      
      {/* ── CINEMATIC LIGHTNING FLASH ── */}
      {flashOpacity && lightningImage && (
        <View style={[StyleSheet.absoluteFill, { zIndex: -1 }]} pointerEvents="none">
          <Canvas style={{ flex: 1 }}>
            <Group opacity={flashOpacity} blendMode="screen">
              <Image
                image={lightningImage}
                x={0}
                y={0}
                width={width || 120}
                height={height}
                fit="cover"
              />
            </Group>
          </Canvas>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>NEXT</Text>
      </View>
      <View style={styles.previewBox}>
        {renderNextPiece()}
      </View>

      <View style={styles.statBox}>
        <Text style={styles.statLabel}>SCORE</Text>
        <View style={styles.glassCard}>
          <Text style={styles.statValue}>{score.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.statBox}>
        <Text style={styles.statLabel}>LEVEL</Text>
        <View style={styles.glassCard}>
          <Text style={styles.statValue}>{level}</Text>
        </View>
      </View>

      <View style={styles.meterContainer}>
        <Text style={styles.meterLabel}>REVEAL</Text>
        <View style={styles.meterGauge}>
          {/* 10% Tick Marks */}
          {Array.from({ length: 9 }).map((_, i) => (
            <View 
              key={`tick-${i}`} 
              style={[styles.meterTick, { bottom: `${(i + 1) * 10}%` }]} 
            />
          ))}
          <LinearGradient
            colors={['#004E92', '#00E5FF']}
            style={[styles.meterFill, { height: `${revealPercentage}%` }]}
          />
          {/* Top liquid gleam */}
          <View style={[styles.meterGleam, { bottom: `${revealPercentage}%` }]} />
        </View>
        <Text style={styles.meterPercent}>{revealPercentage}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingVertical: 30,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#00BEFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textShadowColor: '#00BEFF80',
    textShadowRadius: 4,
  },
  previewBox: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff22',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  previewContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBox: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#ffffff22',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  statLabel: {
    color: '#ffffff80',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  meterContainer: {
    marginTop: 'auto',
    alignItems: 'center',
    height: height * 0.35, 
    width: '100%',
  },
  meterLabel: {
    color: '#00BEFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 10,
  },
  meterPercent: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8,
  },
  meterGauge: {
    width: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: '#ffffff22',
    borderRadius: 2,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#0A0F1E',
  },
  meterTick: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#ffffff15',
    zIndex: 1,
  },
  meterFill: {
    width: '100%',
  },
  meterGleam: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#00E5FF',
    zIndex: 2,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
});
