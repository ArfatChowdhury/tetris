import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { MosaicCanvas } from '../components/MosaicCanvas';
import { HoldPieceBox } from '../components/HoldPieceBox';
import { SidebarUI } from '../components/SidebarUI';
import { SIDEBAR_WIDTH } from '../components/TetrisBlock';
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
    onHold, onPause, onStart
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

  // Gestures
  const tapLeft = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(() => {
      runOnJS(onRotateCCW)();
    });

  const panGesture = Gesture.Pan()
    .onStart((e) => {})
    .onUpdate((e) => {})
    .onEnd((e) => {
      if (Math.abs(e.velocityX) > Math.abs(e.velocityY)) {
        if (e.translationX > 50) runOnJS(onMoveRight)();
        else if (e.translationX < -50) runOnJS(onMoveLeft)();
      } else {
        if (e.translationY > 50) runOnJS(onMoveDown)();
        else if (e.translationY < -50) runOnJS(onHardDrop)();
      }
    });

  const longPress = Gesture.LongPress()
    .onStart(() => {
      runOnJS(onHold)();
    });

  return (
    <GestureHandlerRootView style={styles.container}>
      <LinearGradient
        colors={['#020408', '#050a18', '#0a1025']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Soft Ambient Glow behind the board */}
      <View style={styles.ambientGlow} />

      <View style={styles.overlay}>
        {/* Top Header - Optional, for pause/hold */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <HoldPieceBox type={holdPieceType as TetrominoType} skin={activeSkin} />
          <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
            <Text style={styles.pauseText}>{gameState === 'paused' ? '▶' : 'II'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gameArea}>
          <View style={styles.boardContainer}>
            <GestureDetector gesture={Gesture.Race(panGesture, tapLeft, longPress)}>
              <View style={styles.gestureArea}>
                <MosaicCanvas
                  board={board}
                  currentPiece={currentPiece}
                  ghostY={ghostY}
                  revealMask={revealMask}
                  skin={activeSkin}
                  flashOpacity={flashOpacity}
                />
              </View>
            </GestureDetector>

            {/* ── EXCLUSIVE SKIN OVERLAYS ── */}
            {activeSkinId === 'goku_aura' && <ContinuousAuraOverlay />}
          </View>

          {/* Right Sidebar — fixed width so board doesn't overflow */}
          <SidebarUI
            score={score}
            level={level}
            lines={lines}
            revealPercentage={revealPercentage}
            nextPiece={nextPieceType as TetrominoType}
            skin={activeSkin}
            width={SIDEBAR_WIDTH}
            flashOpacity={flashOpacity}
          />
        </View>

        {/* On-screen Buttons */}
        <View style={styles.controls}>
          <View style={styles.leftControls}>
            <TouchableOpacity style={styles.controlBtn} onPress={onMoveLeft}>
              <Text style={styles.btnText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlBtn} onPress={onMoveRight}>
              <Text style={styles.btnText}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.centerControls}>
            <TouchableOpacity style={styles.hardDropBtn} onPress={onHardDrop}>
              <Text style={styles.hardDropText}>DROP</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rightControls}>
            <TouchableOpacity style={[styles.controlBtn, styles.rotateBtn]} onPress={onRotateCW}>
              <Text style={styles.btnText}>↻</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {gameState === 'paused' && (
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>PAUSED</Text>
          <TouchableOpacity style={styles.resumeBtn} onPress={onPause}>
            <Text style={styles.resumeText}>RESUME</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quitBtn} onPress={onBack}>
            <Text style={styles.quitText}>QUIT GAME</Text>
          </TouchableOpacity>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  gameArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  boardContainer: {
    width: '72%',
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
  gestureArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 40,
  },
  leftControls: {
    flexDirection: 'row',
    gap: 10,
  },
  rightControls: {
    // Empty
  },
  centerControls: {
    justifyContent: 'center',
  },
  controlBtn: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rotateBtn: {
    backgroundColor: 'rgba(0, 240, 240, 0.3)',
    borderColor: '#00f0f0',
    borderWidth: 1,
  },
  hardDropBtn: {
    paddingHorizontal: 20,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hardDropText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  btnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  modal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '900',
    marginBottom: 40,
  },
  resumeBtn: {
    width: 200,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeText: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
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
    marginTop: 20,
    width: 200,
    height: 50,
    backgroundColor: 'rgba(255, 50, 50, 0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 50, 50, 0.5)',
  },
  quitText: {
    color: '#ff5555',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
