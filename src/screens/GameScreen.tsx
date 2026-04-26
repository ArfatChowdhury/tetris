import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { MosaicCanvas } from '../components/MosaicCanvas';
import { HoldPieceBox } from '../components/HoldPieceBox';
import { NextPiecePreview } from '../components/NextPiecePreview';
import { useTetris } from '../hooks/useTetris';
import { useSkinStore } from '../hooks/useSkinStore';
import { TetrominoType } from '../constants/tetrominos';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants/gameConfig';
import { ThunderOverlay } from '../components/ThunderOverlay';
import { ContinuousAuraOverlay } from '../components/ContinuousAuraOverlay';

const { width } = Dimensions.get('window');

interface GameScreenProps {
  onBack: () => void;
  onGameOver: (stats: any) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onBack, onGameOver }) => {
  const { activeSkin, activeSkinId } = useSkinStore();
  const game = useTetris(activeSkinId);

  const {
    board, currentPiece, ghostY, nextPieceType, holdPieceType,
    revealMask, score, level, lines, gameState,
    onMoveLeft, onMoveRight, onMoveDown,
    onHardDrop, onRotateCW, onRotateCCW,
    onHold, onSoftDropStart, onSoftDropEnd, onPause, onStart
  } = game;

  useEffect(() => {
    if (gameState === 'idle') {
      onStart();
    }
  }, [gameState, onStart]);

  useEffect(() => {
    if (gameState === 'gameover') {
      onGameOver({ score, level, lines });
    }
  }, [gameState, score, level, lines, onGameOver]);

  // --- Cinematic Lightning Strobe Engine ---
  const flashOpacity = useSharedValue(0);

  useEffect(() => {
    let isActive = true;
    let timeoutId: NodeJS.Timeout;

    if (activeSkinId !== 'goku_mosaic') {
      flashOpacity.value = 0;
      return;
    }

    const triggerLightning = () => {
      if (!isActive) return;

      const nextStrikeIn = Math.random() * 4000 + 1000;
      
      const flash = () => {
        if (!isActive) return;
        // The classic lightning strobe effect: spike -> dip -> spike -> fade
        flashOpacity.value = withSequence(
          withTiming(1.0, { duration: 40, easing: Easing.out(Easing.ease) }),
          withTiming(0.2, { duration: 60 }),
          withTiming(0.8, { duration: 50 }),
          withTiming(0, { duration: 600, easing: Easing.in(Easing.ease) })
        );
        timeoutId = setTimeout(triggerLightning, nextStrikeIn);
      };

      timeoutId = setTimeout(flash, nextStrikeIn);
    };

    triggerLightning();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      flashOpacity.value = 0;
    };
  }, [activeSkinId, flashOpacity]);

  // revealPercentage based on PERMANENT reveals — only goes up, never back down
  const revealPercentage = useMemo(() => {
    let revealed = 0;
    for (let y = 0; y < revealMask.length; y++) {
      for (let x = 0; x < revealMask[y].length; x++) {
        if (revealMask[y][x]) revealed++;
      }
    }
    const maxBlocks = BOARD_WIDTH * BOARD_HEIGHT;
    return Math.floor((revealed / maxBlocks) * 100);
  }, [revealMask]);

  // Full-Screen Gestures
  const tap = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(() => {
      runOnJS(onRotateCW)();
    });

  const panGesture = Gesture.Pan()
    .onEnd((e) => {
      if (Math.abs(e.translationX) > Math.abs(e.translationY)) {
        if (e.translationX > 30) runOnJS(onMoveRight)();
        else if (e.translationX < -30) runOnJS(onMoveLeft)();
      } else {
        if (e.translationY > 50) runOnJS(onHardDrop)();
        else if (e.translationY < -50) runOnJS(onHold)();
      }
    });

  const longPress = Gesture.LongPress()
    .minDuration(150)
    .onStart(() => {
      runOnJS(onSoftDropStart)();
    })
    .onEnd(() => {
      runOnJS(onSoftDropEnd)();
    })
    .onFinalize(() => {
      runOnJS(onSoftDropEnd)();
    });

  return (
    <GestureHandlerRootView style={styles.container}>
      <LinearGradient
        colors={activeSkin.colors?.background || ['#020408', '#050a18', '#0a1025']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Soft Ambient Glow behind the board */}
      <View style={styles.ambientGlow} />

      {/* ── GLOBAL LIGHTNING STRIKE (BEHIND THE BOARD) ── */}
      {activeSkinId === 'goku_mosaic' && <ThunderOverlay flashOpacity={flashOpacity} />}

      <View style={styles.overlay}>
        <GestureDetector gesture={Gesture.Race(panGesture, tap, longPress)}>
          <View style={styles.gestureAreaFullScreen}>
            
            {/* ── CONSOLIDATED HEADER HUD ── */}
            <View style={styles.headerHud}>
              <LinearGradient
                colors={['rgba(0,0,0,0.9)', 'transparent']}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.headerTopRow}>
                <TouchableOpacity style={styles.iconBtn} onPress={onBack}>
                  <Text style={styles.iconText}>◁</Text>
                </TouchableOpacity>
                
                <View style={styles.statsCenter}>
                  <Text style={[styles.scoreText, activeSkin.colors && { color: activeSkin.colors.accent, textShadowColor: activeSkin.colors.primary }]}>
                    {score.toLocaleString()}
                  </Text>
                  <Text style={[styles.levelText, activeSkin.colors && { color: activeSkin.colors.primary }]}>
                    LEVEL {level}
                  </Text>
                </View>

                <TouchableOpacity style={styles.iconBtn} onPress={onPause}>
                  <Text style={styles.iconText}>{gameState === 'paused' ? '▶' : 'II'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.headerBottomRow}>
                <View style={[styles.hudBox, activeSkin.colors && { borderColor: `${activeSkin.colors.primary}40`, backgroundColor: `${activeSkin.colors.primary}0D` }]}>
                  <HoldPieceBox type={holdPieceType as TetrominoType} skin={activeSkin} />
                </View>
                <View style={[styles.hudBox, activeSkin.colors && { borderColor: `${activeSkin.colors.primary}40`, backgroundColor: `${activeSkin.colors.primary}0D` }]}>
                  <NextPiecePreview type={nextPieceType as TetrominoType} skin={activeSkin} />
                </View>
              </View>
            </View>

            {/* ── FULL SCREEN CENTERED GAME BOARD ── */}
            <View style={styles.gameAreaCentered}>
              <View style={[
                styles.boardContainer, 
                { borderColor: activeSkin.colors?.secondary || 'rgba(255, 255, 255, 0.05)' },
                activeSkinId === 'samurai_embers' && { borderWidth: 0 }
              ]}>
                <MosaicCanvas
                  board={board}
                  currentPiece={currentPiece}
                  ghostY={ghostY}
                  revealMask={revealMask}
                  skin={activeSkin}
                  flashOpacity={flashOpacity}
                />
                {activeSkinId === 'goku_aura' && <ContinuousAuraOverlay />}
              </View>
            </View>

            {/* ── RESERVED SPACE FOR FUTURE BANNER AD ── */}
            <View style={styles.adBannerSpace} />

          </View>
        </GestureDetector>
      </View>

      {gameState === 'paused' && (
        <View style={styles.modal}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[styles.modalCard, activeSkin.colors && { borderColor: `${activeSkin.colors.primary}66` }]}>
            <Text style={[styles.modalTitle, activeSkin.colors && { textShadowColor: activeSkin.colors.primary }]}>PAUSED</Text>
            <TouchableOpacity style={[styles.resumeBtn, activeSkin.colors && { backgroundColor: activeSkin.colors.primary }]} onPress={onPause}>
              <Text style={styles.resumeText}>RESUME</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quitBtn, activeSkin.colors && { backgroundColor: `${activeSkin.colors.primary}1A`, borderColor: activeSkin.colors.primary }]} onPress={onBack}>
              <Text style={[styles.quitText, activeSkin.colors && { color: activeSkin.colors.primary }]}>ABORT MISSION</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ambientGlow: {
    position: 'absolute',
    top: '25%',
    left: '15%',
    width: '50%',
    height: '50%',
    backgroundColor: 'rgba(0, 150, 255, 0.05)',
    borderRadius: 200,
    transform: [{ scaleX: 1.5 }],
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  gestureAreaFullScreen: {
    flex: 1,
    width: '100%',
  },
  
  // --- HEADER HUD ---
  headerHud: {
    paddingTop: 40, // safe area padding
    paddingBottom: 10,
    width: '100%',
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statsCenter: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowRadius: 5,
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#aaa',
    letterSpacing: 1,
    marginTop: -2,
  },
  iconBtn: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  iconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginTop: 5,
  },
  hudBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 5,
    transform: [{ scale: 0.8 }], // Shrink the boxes natively
  },

  // --- GAME BOARD AREA ---
  gameAreaCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  adBannerSpace: {
    width: '100%',
    height: 60, // Standard mobile banner height
  },

  // --- PAUSE MODAL ---
  modal: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalCard: {
    width: '80%',
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 20 },
    elevation: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 8,
    marginBottom: 40,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowRadius: 15,
  },
  resumeBtn: {
    width: '100%',
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  resumeText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 4,
  },
  backButton: {
    width: 45,
    height: 45,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quitBtn: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 50, 50, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 50, 50, 0.4)',
  },
  quitText: {
    color: '#ff5555',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
