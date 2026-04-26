import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { GestureHandlerRootView, GestureDetector, Gesture, TouchableOpacity } from 'react-native-gesture-handler';
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

  const revealPercentage = useMemo(() => {
    let revealed = 0;
    for (let y = 0; y < revealMask.length; y++) {
      for (let x = 0; x < revealMask[y].length; x++) {
        if (revealMask[y][x]) revealed++;
      }
    }
    return Math.floor((revealed / (BOARD_WIDTH * BOARD_HEIGHT)) * 100);
  }, [revealMask]);

  // ── GESTURES ──
  const tap = Gesture.Tap()
    .numberOfTaps(1)
    .onStart(() => { runOnJS(onRotateCW)(); });

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
    .onStart(() => { runOnJS(onSoftDropStart)(); })
    .onEnd(() => { runOnJS(onSoftDropEnd)(); })
    .onFinalize(() => { runOnJS(onSoftDropEnd)(); });

  if (!isLoaded) return <View style={styles.container} />;

  const isNeumorphic = activeSkin.uiStyle === 'neumorphic';
  const isKawaii    = activeSkin.uiStyle === 'kawaii';
  const isSoft      = isNeumorphic || isKawaii;
  const primaryColor   = activeSkin.colors?.primary   || '#fff';
  const secondaryColor = activeSkin.colors?.secondary || '#aaa';
  const accentColor    = activeSkin.colors?.accent    || '#fff';
  const statColor  = isSoft ? primaryColor : accentColor;
  const labelColor = isSoft ? secondaryColor : 'rgba(255,255,255,0.45)';
  const dividerColor = isSoft ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)';

  return (
    <GestureHandlerRootView style={styles.container}>

      {/* ── BACKGROUND ── */}
      <LinearGradient
        colors={
          activeSkin.colors?.background ||
          (isSoft ? ['#FFF0F5', '#FFC0CB', '#FFF0F5'] : ['#020408', '#050a18', '#0a1025'])
        }
        style={StyleSheet.absoluteFillObject}
      />

      {activeSkinId === 'goku_mosaic' && <ThunderOverlay flashOpacity={flashOpacity} />}

      {/* ── GESTURE AREA WRAPPING FULL SCREEN ── */}
      <GestureDetector gesture={Gesture.Race(panGesture, tap, longPress)}>
        <View style={styles.gestureAreaFullScreen}>
          
          {/* ── HEADER HUD ─────────────────────────────────────
               [ HOLD ]  SCORE | LVL | LINES  [ NEXT ]  [⏸]
          ──────────────────────────────────────────────────── */}
          <View style={[
            styles.hud,
            !isSoft && activeSkinId !== 'samurai_embers' && { backgroundColor: 'rgba(0,0,0,0.55)' },
            activeSkinId === 'samurai_embers' && { backgroundColor: 'rgba(255,69,0,0.1)' },
            isSoft && isKawaii && styles.hudKawaii,
          ]}>
            {/* HOLD */}
            <View style={styles.hudPiece}>
              <Text style={[styles.hudLabel, { color: labelColor }]}>HOLD</Text>
              <HoldPieceBox type={holdPieceType as TetrominoType} skin={activeSkin} />
            </View>

            {/* CENTER STATS */}
            <View style={styles.hudStats}>
              <View style={styles.hudStatRow}>
                <View style={styles.hudStatCell}>
                  <Text style={[styles.hudStatLabel, { color: labelColor }]}>SCORE</Text>
                  <Text
                    style={[styles.hudStatValue, { color: statColor }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {score.toLocaleString()}
                  </Text>
                </View>
                <View style={[styles.hudDivider, { backgroundColor: dividerColor }]} />
                <View style={styles.hudStatCell}>
                  <Text style={[styles.hudStatLabel, { color: labelColor }]}>LVL</Text>
                  <Text style={[styles.hudStatValue, { color: statColor }]}>{level}</Text>
                </View>
                <View style={[styles.hudDivider, { backgroundColor: dividerColor }]} />
                <View style={styles.hudStatCell}>
                  <Text style={[styles.hudStatLabel, { color: labelColor }]}>LINES</Text>
                  <Text style={[styles.hudStatValue, { color: statColor }]}>{lines}</Text>
                </View>
              </View>
            </View>

            {/* NEXT */}
            <View style={styles.hudPiece}>
              <Text style={[styles.hudLabel, { color: labelColor }]}>NEXT</Text>
              <NextPiecePreview type={nextPieceType as TetrominoType} skin={activeSkin} />
            </View>

            {/* PAUSE — only visible control during play. Back is in the pause modal. */}
            <TouchableOpacity
              style={[
                styles.pauseBtn,
                isSoft && styles.pauseBtnSoft,
                isKawaii && styles.pauseBtnKawaii,
              ]}
              onPress={onPause}
            >
              <Text style={[styles.pauseBtnText, isSoft && { color: primaryColor }]}>
                {gameState === 'paused' ? '▶' : '⏸'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── BOARD ── */}
          <View style={styles.boardArea}>
            <View style={[
              styles.boardContainer,
              (activeSkinId === 'samurai_embers' || isSoft) && { borderWidth: 0 },
              isSoft && { backgroundColor: 'transparent', shadowOpacity: 0, elevation: 0 },
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
          
          {/* ── PARTICLES (must be inside GestureDetector child) ── */}
          <AmbientParticleSystem skin={activeSkin} />
          
        </View>
      </GestureDetector>

      {/* ── PAUSE MODAL ── */}
      {gameState === 'paused' && (
        <View style={styles.modal}>
          <LinearGradient
            colors={isSoft
              ? ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.9)']
              : ['rgba(5,5,15,0.8)', 'rgba(5,5,20,0.98)']
            }
            style={StyleSheet.absoluteFillObject}
          />
          <View style={[
            styles.modalCard,
            isSoft && isNeumorphic && [styles.modalCardNeumorphic, { shadowColor: primaryColor }],
            isSoft && isKawaii    && styles.modalCardKawaii,
            !isSoft && activeSkin.colors && { borderColor: `${primaryColor}66` },
          ]}>
            <Text style={[
              styles.modalTitle,
              isSoft && isNeumorphic && styles.modalTitleNeumorphic,
              isSoft && isKawaii    && styles.modalTitleKawaii,
              !isSoft && activeSkin.colors && { textShadowColor: primaryColor },
            ]}>PAUSED</Text>

            <TouchableOpacity
              style={[
                styles.resumeBtn,
                isSoft && isNeumorphic && [styles.resumeBtnNeumorphic, { shadowColor: primaryColor }],
                isSoft && isKawaii    && styles.resumeBtnKawaii,
                !isSoft && activeSkin.colors && { backgroundColor: primaryColor },
              ]}
              onPress={onPause}
            >
              <Text style={[
                styles.resumeText,
                isSoft && { color: isNeumorphic ? primaryColor : '#FF8C00' },
              ]}>RESUME</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.menuBtn,
                isSoft && isNeumorphic && styles.menuBtnNeumorphic,
                isSoft && isKawaii    && styles.menuBtnKawaii,
                !isSoft && activeSkin.colors && { borderColor: primaryColor },
              ]}
              onPress={onBack}
            >
              <Text style={[
                styles.menuText,
                isSoft && isKawaii && { color: '#FF8C00' },
                !isSoft && activeSkin.colors && { color: primaryColor },
              ]}>↩ MAIN MENU</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gestureAreaFullScreen: {
    flex: 1,
    width: '100%',
  },

  // ── HEADER HUD ──
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 8,
    paddingHorizontal: 10,
    gap: 6,
  },
  hudKawaii: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#FF8C00',
    borderStyle: 'dashed',
  },
  hudPiece: {
    alignItems: 'center',
    width: 62,
  },
  hudLabel: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 2,
  },
  hudStats: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hudStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hudStatCell: {
    alignItems: 'center',
    paddingHorizontal: 8,
    minWidth: 44,
  },
  hudDivider: {
    width: 1,
    height: 26,
  },
  hudStatLabel: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 1,
  },
  hudStatValue: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
    textAlign: 'center',
  },
  pauseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtnSoft: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 3,
  },
  pauseBtnKawaii: {
    backgroundColor: '#FFE4E1',
    borderWidth: 2.5,
    borderColor: '#FF8C00',
    borderStyle: 'dashed',
  },
  pauseBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── BOARD ──
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    width: '100%',
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },

  // ── PAUSE MODAL ──
  modal: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  modalCard: {
    width: '78%',
    backgroundColor: 'rgba(8,8,18,0.84)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 36,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 8,
    marginBottom: 32,
    textShadowColor: 'rgba(255,255,255,0.4)',
    textShadowRadius: 12,
  },
  resumeBtn: {
    width: '100%',
    height: 54,
    backgroundColor: '#fff',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  resumeText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 4,
  },
  menuBtn: {
    width: '100%',
    height: 46,
    backgroundColor: 'transparent',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  menuText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },

  // ── NEUMORPHIC OVERRIDES ──
  modalCardNeumorphic: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 0,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 10,
  },
  modalTitleNeumorphic: {
    color: '#ff8c00',
    textShadowRadius: 0,
    textShadowOffset: { width: 0, height: 0 },
  },
  resumeBtnNeumorphic: {
    backgroundColor: '#fff',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 1,
    elevation: 4,
  },
  menuBtnNeumorphic: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },

  // ── KAWAII OVERRIDES ──
  modalCardKawaii: {
    backgroundColor: '#FFE4E1',
    borderWidth: 3.5,
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
  menuBtnKawaii: {
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: '#FF8C00',
    borderRadius: 50,
    backgroundColor: 'transparent',
  },
});
