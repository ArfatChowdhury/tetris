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
import { AmbientParticleSystem } from '../components/AmbientParticleSystem';

const { width } = Dimensions.get('window');

interface GameScreenProps {
  onBack: () => void;
  onGameOver: (stats: any) => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onBack, onGameOver }) => {
  const { activeSkin, activeSkinId, isLoaded } = useSkinStore();
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

  if (!isLoaded) {
    return <View style={styles.container} />; // Show nothing while loading skin from storage
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <LinearGradient
        colors={
          activeSkin.colors?.background || 
          (activeSkin.uiStyle === 'neumorphic' ? ['#FFF0F5', '#FFC0CB', '#FFF0F5'] : ['#020408', '#050a18', '#0a1025'])
        }
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Soft Ambient Glow behind the board */}
      <View style={styles.ambientGlow} />

      {/* ── GLOBAL LIGHTNING STRIKE (BEHIND THE BOARD) ── */}
      {activeSkinId === 'goku_mosaic' && <ThunderOverlay flashOpacity={flashOpacity} />}

      <View style={styles.overlay}>
        <GestureDetector gesture={Gesture.Race(panGesture, tap, longPress)}>
          <View style={styles.gestureAreaFullScreen}>
            
              <View style={styles.headerHud}>
                {activeSkin.uiStyle !== 'neumorphic' && activeSkin.uiStyle !== 'kawaii' && (
                  <LinearGradient
                    colors={['rgba(0,0,0,0.9)', 'transparent']}
                    style={StyleSheet.absoluteFillObject}
                  />
                )}
                <View style={styles.headerTopRow}>
                  <TouchableOpacity style={[
                    styles.iconBtn, 
                    activeSkin.uiStyle === 'neumorphic' && styles.iconBtnNeumorphic,
                    activeSkin.uiStyle === 'kawaii' && styles.iconBtnKawaii
                  ]} onPress={onBack}>
                    <Text style={[
                      styles.iconText, 
                      activeSkin.uiStyle === 'neumorphic' && styles.iconTextNeumorphic,
                      activeSkin.uiStyle === 'kawaii' && styles.iconTextKawaii
                    ]}>◁</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.statsCenter}>
                    <Text style={[
                      styles.scoreText, 
                      activeSkin.uiStyle === 'neumorphic' && styles.scoreTextNeumorphic,
                      activeSkin.uiStyle === 'kawaii' && styles.scoreTextKawaii,
                      activeSkin.colors && { color: activeSkin.colors.accent, textShadowColor: activeSkin.uiStyle === 'neumorphic' || activeSkin.uiStyle === 'kawaii' ? 'transparent' : activeSkin.colors.primary }
                    ]}>
                      {score.toLocaleString()}
                    </Text>
                    <Text style={[
                      styles.levelText, 
                      activeSkin.uiStyle === 'neumorphic' && styles.levelTextNeumorphic,
                      activeSkin.uiStyle === 'kawaii' && styles.levelTextKawaii,
                      activeSkin.colors && { color: activeSkin.colors.primary }
                    ]}>
                    LEVEL {level}
                  </Text>
                </View>

                <TouchableOpacity style={[
                  styles.iconBtn, 
                  activeSkin.uiStyle === 'neumorphic' && styles.iconBtnNeumorphic,
                  activeSkin.uiStyle === 'kawaii' && styles.iconBtnKawaii
                ]} onPress={onPause}>
                  <Text style={[
                    styles.iconText, 
                    activeSkin.uiStyle === 'neumorphic' && styles.iconTextNeumorphic,
                    activeSkin.uiStyle === 'kawaii' && styles.iconTextKawaii
                  ]}>{gameState === 'paused' ? '▶' : 'II'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.headerBottomRow}>
                <View style={[
                  styles.hudBox, 
                  activeSkin.uiStyle === 'neumorphic' && [styles.hudBoxNeumorphic, { shadowColor: activeSkin.colors?.primary || '#ffc0cb' }],
                  activeSkin.uiStyle === 'kawaii' && styles.hudBoxKawaii,
                  activeSkin.colors && activeSkin.uiStyle !== 'neumorphic' && activeSkin.uiStyle !== 'kawaii' && { borderColor: `${activeSkin.colors.primary}40`, backgroundColor: `${activeSkin.colors.primary}0D` }
                ]}>
                  <HoldPieceBox type={holdPieceType as TetrominoType} skin={activeSkin} />
                </View>
                <View style={[
                  styles.hudBox, 
                  activeSkin.uiStyle === 'neumorphic' && [styles.hudBoxNeumorphic, { shadowColor: activeSkin.colors?.primary || '#ffc0cb' }],
                  activeSkin.uiStyle === 'kawaii' && styles.hudBoxKawaii,
                  activeSkin.colors && activeSkin.uiStyle !== 'neumorphic' && activeSkin.uiStyle !== 'kawaii' && { borderColor: `${activeSkin.colors.primary}40`, backgroundColor: `${activeSkin.colors.primary}0D` }
                ]}>
                  <NextPiecePreview type={nextPieceType as TetrominoType} skin={activeSkin} />
                </View>
              </View>
            </View>

            {/* ── FULL SCREEN CENTERED GAME BOARD ── */}
            <View style={styles.gameAreaCentered}>
              <View style={[
                styles.boardContainer, 
                { borderColor: activeSkin.colors?.secondary || 'rgba(255, 255, 255, 0.05)' },
                (activeSkinId === 'samurai_embers' || activeSkin.uiStyle === 'neumorphic' || activeSkin.uiStyle === 'kawaii') && { borderWidth: 0 },
                (activeSkin.uiStyle === 'neumorphic' || activeSkin.uiStyle === 'kawaii') && { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 }
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

            {/* ── FULL SCREEN PHYSICS PARTICLES ── */}
            <AmbientParticleSystem skin={activeSkin} />

          </View>
        </GestureDetector>
      </View>

      {gameState === 'paused' && (
        <View style={styles.modal}>
          <LinearGradient
            colors={activeSkin.uiStyle === 'neumorphic' ? ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.8)'] : ['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[
            styles.modalCard, 
            activeSkin.uiStyle === 'neumorphic' && [styles.modalCardNeumorphic, { shadowColor: activeSkin.colors?.primary || '#ffc0cb' }],
            activeSkin.uiStyle === 'kawaii' && styles.modalCardKawaii,
            activeSkin.colors && activeSkin.uiStyle !== 'neumorphic' && activeSkin.uiStyle !== 'kawaii' && { borderColor: `${activeSkin.colors.primary}66` }
          ]}>
            <Text style={[
              styles.modalTitle, 
              activeSkin.uiStyle === 'neumorphic' && styles.modalTitleNeumorphic,
              activeSkin.uiStyle === 'kawaii' && styles.modalTitleKawaii,
              activeSkin.colors && activeSkin.uiStyle !== 'neumorphic' && activeSkin.uiStyle !== 'kawaii' && { textShadowColor: activeSkin.colors.primary }
            ]}>PAUSED</Text>
            <TouchableOpacity style={[
              styles.resumeBtn, 
              activeSkin.uiStyle === 'neumorphic' && [styles.resumeBtnNeumorphic, { shadowColor: activeSkin.colors?.primary || '#ffc0cb' }],
              activeSkin.uiStyle === 'kawaii' && styles.resumeBtnKawaii,
              activeSkin.colors && activeSkin.uiStyle !== 'neumorphic' && activeSkin.uiStyle !== 'kawaii' && { backgroundColor: activeSkin.colors.primary }
            ]} onPress={onPause}>
              <Text style={[
                styles.resumeText, 
                activeSkin.uiStyle === 'neumorphic' && { color: activeSkin.colors?.primary || '#ff8c00' },
                activeSkin.uiStyle === 'kawaii' && { color: '#FF8C00' }
              ]}>RESUME</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[
              styles.quitBtn, 
              activeSkin.uiStyle === 'neumorphic' && styles.quitBtnNeumorphic,
              activeSkin.uiStyle === 'kawaii' && styles.quitBtnKawaii,
              activeSkin.colors && activeSkin.uiStyle !== 'neumorphic' && activeSkin.uiStyle !== 'kawaii' && { backgroundColor: `${activeSkin.colors.primary}1A`, borderColor: activeSkin.colors.primary }
            ]} onPress={onBack}>
              <Text style={[
                styles.quitText, 
                activeSkin.colors && activeSkin.uiStyle !== 'kawaii' && { color: activeSkin.colors.primary },
                activeSkin.uiStyle === 'kawaii' && { color: '#FF8C00' }
              ]}>ABORT MISSION</Text>
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

  // --- PAPER CUT-OUT NEUMORPHIC STYLES ---
  iconBtnNeumorphic: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 0,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 3,
  },
  iconTextNeumorphic: {
    color: '#ff8c00',
  },
  scoreTextNeumorphic: {
    fontWeight: '900',
    textShadowRadius: 0,
    textShadowOffset: { width: 0, height: 0 },
  },
  levelTextNeumorphic: {
    fontWeight: 'bold',
  },
  hudBoxNeumorphic: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 0,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 4,
  },
  modalCardNeumorphic: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderWidth: 0,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 8,
  },
  modalTitleNeumorphic: {
    color: '#ff8c00',
    textShadowRadius: 0,
    textShadowOffset: { width: 0, height: 0 },
  },
  resumeBtnNeumorphic: {
    backgroundColor: '#fff',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 4,
  },
  quitBtnNeumorphic: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  // --- KAWAII STICKER STYLES ---
  iconBtnKawaii: {
    backgroundColor: '#FFE4E1',
    borderWidth: 3,
    borderColor: '#FF8C00',
    borderStyle: 'dashed',
    borderRadius: 25,
    elevation: 0,
    shadowOpacity: 0,
  },
  iconTextKawaii: {
    color: '#FF8C00',
    fontWeight: '900',
  },
  scoreTextKawaii: {
    fontWeight: '900',
    textShadowRadius: 0,
    color: '#FF8C00',
  },
  levelTextKawaii: {
    fontWeight: 'bold',
    color: '#FF69B4',
  },
  hudBoxKawaii: {
    backgroundColor: '#FFE4E1',
    borderWidth: 3,
    borderColor: '#FF8C00',
    borderStyle: 'dashed',
    borderRadius: 20,
    elevation: 0,
    shadowOpacity: 0,
  },
  hudTitleKawaii: {
    color: '#FF8C00',
    fontWeight: '900',
    marginBottom: 2,
  },
  modalCardKawaii: {
    backgroundColor: '#FFE4E1',
    borderWidth: 4,
    borderStyle: 'dashed',
    borderColor: '#FF8C00',
    borderRadius: 30,
    elevation: 0,
    shadowOpacity: 0,
  },
  modalTitleKawaii: {
    color: '#FF8C00',
    textShadowRadius: 0,
    fontWeight: '900',
  },
  resumeBtnKawaii: {
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#FF8C00',
    borderRadius: 50,
    elevation: 0,
    shadowOpacity: 0,
  },
  quitBtnKawaii: {
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#FF8C00',
    borderRadius: 50,
  },
});
