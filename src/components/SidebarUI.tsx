import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SkinDefinition } from '../constants/skins';
import { TetrisBlock, BLOCK_SIZE as BASE_BLOCK_SIZE } from './TetrisBlock';
import { TetrominoType, TETROMINOES } from '../constants/tetrominos';
import { Canvas, Image, useImage, Group, Circle, BlurMask } from '@shopify/react-native-skia';
import { SharedValue, useSharedValue, withRepeat, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';

const { height } = Dimensions.get('window');

interface SmokeParticleProps {
  x: number;
  y: number;
  size: number;
  speed: number;
  wobble: number;
  time: SharedValue<number>;
}

const SmokeParticle: React.FC<SmokeParticleProps> = ({ x, y, size, speed, wobble, time }) => {
  const cx = useDerivedValue(() => x + Math.sin(time.value * 0.002 + wobble) * 10);
  const cy = useDerivedValue(() => {
    const currentY = y - time.value * speed;
    return ((currentY % height) + height) % height;
  });

  return (
    <Circle cx={cx} cy={cy} r={size} color="rgba(255, 69, 0, 0.4)">
      <BlurMask blur={8} style="normal" />
    </Circle>
  );
};

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

  // --- Smoke Engine for Samurai ---
  const smokeTime = useSharedValue(0);
  useEffect(() => {
    if (skin.id === 'samurai_embers') {
      smokeTime.value = withRepeat(
        withTiming(10000, { duration: 120000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [skin.id, smokeTime]);

  const smokeParticles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * (width || 120),
      y: Math.random() * height,
      size: Math.random() * 15 + 10,
      speed: Math.random() * 0.2 + 0.1,
      wobble: Math.random() * Math.PI * 2,
    }));
  }, [width]);

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
      
      {/* ── CINEMATIC LIGHTNING FLASH (Goku Only) ── */}
      {flashOpacity && lightningImage && skin.id === 'goku_mosaic' && (
        <View style={[StyleSheet.absoluteFill, { zIndex: -1 }]} pointerEvents="none">
          <Canvas style={{ flex: 1 }}>
            <Group 
              opacity={flashOpacity} 
              blendMode="screen"
              transform={[{ translateY: height / 2 }, { scaleY: -1 }, { translateY: -height / 2 }]}
            >
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

      {/* ── AMBIENT SMOKE (Samurai Only) ── */}
      {skin.id === 'samurai_embers' && (
        <View style={[StyleSheet.absoluteFill, { zIndex: -1 }]} pointerEvents="none">
          <Canvas style={{ flex: 1 }}>
            {smokeParticles.map((p) => (
              <SmokeParticle
                key={p.id}
                x={p.x}
                y={p.y}
                size={p.size}
                speed={p.speed}
                wobble={p.wobble}
                time={smokeTime}
              />
            ))}
          </Canvas>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: skin.colors?.primary || '#00BEFF', textShadowColor: (skin.colors?.primary || '#00BEFF') + '80' }]}>NEXT</Text>
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
        <Text style={[styles.meterLabel, { color: skin.colors?.primary || '#00BEFF' }]}>REVEAL</Text>
        <View style={styles.meterGauge}>
          {/* 10% Tick Marks */}
          {Array.from({ length: 9 }).map((_, i) => (
            <View 
              key={`tick-${i}`} 
              style={[styles.meterTick, { bottom: `${(i + 1) * 10}%` }]} 
            />
          ))}
          <LinearGradient
            colors={skin.colors ? [skin.colors.secondary, skin.colors.primary] : ['#004E92', '#00E5FF']}
            style={[styles.meterFill, { height: `${revealPercentage}%` }]}
          />
          {/* Top liquid gleam */}
          <View style={[styles.meterGleam, { bottom: `${revealPercentage}%`, backgroundColor: skin.colors?.accent || '#00E5FF', shadowColor: skin.colors?.accent || '#00E5FF' }]} />
        </View>
        <Text style={[styles.meterPercent, { color: skin.colors?.accent || '#00E5FF' }]}>{revealPercentage}%</Text>
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
