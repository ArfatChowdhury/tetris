import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import { TetrisBoard } from '../components/TetrisBoard';
import { NextPiecePreview } from '../components/NextPiecePreview';
import { HoldPieceBox } from '../components/HoldPieceBox';
import { GameHUD } from '../components/GameHUD';
import { SkinEngine } from '../components/skins/SkinEngine';
import { useTetris } from '../hooks/useTetris';
import { useSkinStore } from '../hooks/useSkinStore';
import { TetrominoType } from '../constants/tetrominos';

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
    score, level, lines, gameState,
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

  // Gestures
  const tapLeft = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(() => {
      onRotateCCW();
    });

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      // Logic for movement based on velocity/distance if needed
    })
    .onUpdate((e) => {
        // Simplified gesture handling for now
    })
    .onEnd((e) => {
      if (Math.abs(e.velocityX) > Math.abs(e.velocityY)) {
        if (e.translationX > 50) onMoveRight();
        else if (e.translationX < -50) onMoveLeft();
      } else {
        if (e.translationY > 50) onMoveDown();
        else if (e.translationY < -50) onHardDrop();
      }
    });

  const longPress = Gesture.LongPress()
    .onStart(() => {
      onHold();
    });

  return (
    <GestureHandlerRootView style={styles.container}>
      <SkinEngine skinId={activeSkinId} />
      
      <View style={styles.overlay}>
        <GameHUD score={score} level={level} lines={lines} />

        <View style={styles.gameArea}>
          <View style={styles.sideBar}>
            <HoldPieceBox type={holdPieceType as TetrominoType} skin={activeSkin} />
            <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
              <Text style={styles.pauseText}>{gameState === 'paused' ? '▶' : 'II'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.boardContainer}>
            <GestureDetector gesture={Gesture.Race(panGesture, tapLeft, longPress)}>
              <View style={styles.gestureArea}>
                <TetrisBoard
                  board={board}
                  currentPiece={currentPiece}
                  ghostY={ghostY}
                  skin={activeSkin}
                />
              </View>
            </GestureDetector>
          </View>

          <View style={styles.sideBar}>
            <NextPiecePreview type={nextPieceType as TetrominoType} skin={activeSkin} />
          </View>
        </View>

        {/* On-screen Buttons for players who prefer them */}
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
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  gameArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 10,
  },
  sideBar: {
    paddingHorizontal: 5,
    alignItems: 'center',
    width: 90,
  },
  boardContainer: {
    flex: 1,
    alignItems: 'center',
  },
  gestureArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  pauseText: {
    color: '#fff',
    fontSize: 20,
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
    //
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
});
