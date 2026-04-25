import React, { useMemo, useEffect } from 'react';
import { useSharedValue, withRepeat, withTiming, Easing, useDerivedValue } from 'react-native-reanimated';
import {
  Canvas,
  Image,
  useImage,
  Group,
  RoundedRect,
  LinearGradient,
  Paint,
  Rect,
  BlurMask,
  vec,
  Path,
  ColorMatrix,
  Skia,
  Circle,
} from '@shopify/react-native-skia';
import { Board, Piece } from '../systems/TetrisEngine';
import { SkinDefinition } from '../constants/skins';
import { BLOCK_SIZE } from './TetrisBlock';
import { useParallax } from '../hooks/useParallax';

interface MosaicCanvasProps {
  board: Board;
  currentPiece: Piece | null;
  ghostY: number;
  revealMask: boolean[][];
  skin: SkinDefinition;
  flashOpacity?: SharedValue<number>;
}

const CORNER_RADIUS = 4;

const BLACK_AND_WHITE = [
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0,      0,      0,      1, 0,
];

interface AshParticleProps {
  x: number;
  y: number;
  size: number;
  speed: number;
  wobble: number;
  time: Animated.SharedValue<number>;
  canvasH: number;
}

const AshParticle: React.FC<AshParticleProps> = ({ x, y, size, speed, wobble, time, canvasH }) => {
  const cx = useDerivedValue(() => {
    return x + Math.sin(time.value * 0.005 + wobble) * 15;
  });
  const cy = useDerivedValue(() => {
    const currentY = y - time.value * speed;
    return ((currentY % canvasH) + canvasH) % canvasH;
  });

  return (
    <Circle cx={cx} cy={cy} r={size} color="#FF6600">
      <BlurMask blur={3} style="normal" />
    </Circle>
  );
};

export const MosaicCanvas: React.FC<MosaicCanvasProps> = React.memo(
  ({ board, currentPiece, ghostY, revealMask, skin, flashOpacity }) => {
    // Super safety check for all critical props
    if (!board || !board[0] || !revealMask || !revealMask[0]) {
      return null;
    }

    const COLS = board[0].length;
    const ROWS = board.length;
    const canvasW = COLS * BLOCK_SIZE;
    const canvasH = ROWS * BLOCK_SIZE;

    const backgroundImage = useImage(skin.image);
    const { parallaxX, parallaxY } = useParallax();

    // --- Breathing Embers Engine ---
    const emberBreath = useSharedValue(0.1);
    
    useEffect(() => {
      if (skin.blockStyle.breathing) {
        // Slow, 3-second inhale/exhale physics loop
        emberBreath.value = withRepeat(
          withTiming(0.85, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          -1, // Infinite loops
          true // Reverse (ping-pong)
        );
      } else {
        emberBreath.value = 0;
      }
    }, [skin.blockStyle.breathing, emberBreath]);

    // --- Ash Particle Engine ---
    const ashTime = useSharedValue(0);
    useEffect(() => {
      if (skin.blockStyle.breathing) {
        ashTime.value = withRepeat(
          withTiming(5000, { duration: 60000, easing: Easing.linear }),
          -1,
          false
        );
      }
    }, [skin.blockStyle.breathing, ashTime]);

    const ashParticles = useMemo(() => {
      return Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        x: Math.random() * canvasW,
        y: Math.random() * canvasH,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.4 + 0.2,
        wobble: Math.random() * Math.PI * 2,
      }));
    }, [canvasW, canvasH]);

    // --- Dynamic Mask path: Derived from CURRENT board state + currentPiece ---
    // The image ONLY shows where blocks exist. When a row clears, the image clears.
    const settledMaskPath = useMemo(() => {
      const path = Skia.Path.Make();
      
      // 1. Add settled blocks from board
      board.forEach((row, y) => {
        if (!row) return;
        row.forEach((cell, x) => {
          if (cell !== null) {
            if (skin.blockStyle.magnifier) {
              path.addRect({
                x: x * BLOCK_SIZE,
                y: y * BLOCK_SIZE,
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
              });
            } else {
              path.addRRect({
                rect: {
                  x: x * BLOCK_SIZE + 1,
                  y: y * BLOCK_SIZE + 1,
                  width: BLOCK_SIZE - 2,
                  height: BLOCK_SIZE - 2,
                },
                rx: CORNER_RADIUS,
                ry: CORNER_RADIUS,
              });
            }
          }
        });
      });

      // 2. Add active falling piece to mask (Optional: helps see what you are placing)
      if (currentPiece) {
        currentPiece.shape.forEach((row, dy) => {
          row.forEach((cell, dx) => {
            if (cell !== 0) {
              const px = currentPiece.x + dx;
              const py = currentPiece.y + dy;
              if (py >= 0) {
                if (skin.blockStyle.magnifier) {
                  path.addRect({
                    x: px * BLOCK_SIZE,
                    y: py * BLOCK_SIZE,
                    width: BLOCK_SIZE,
                    height: BLOCK_SIZE,
                  });
                } else {
                  path.addRRect({
                    rect: {
                      x: px * BLOCK_SIZE + 1,
                      y: py * BLOCK_SIZE + 1,
                      width: BLOCK_SIZE - 2,
                      height: BLOCK_SIZE - 2,
                    },
                    rx: CORNER_RADIUS,
                    ry: CORNER_RADIUS,
                  });
                }
              }
            }
          });
        });
      }

      return path;
    }, [board, currentPiece]);

    // --- Settled glass blocks list ---
    const settledBlocks = useMemo(() => {
      const blocks: Array<{ x: number; y: number }> = [];
      board.forEach((row, y) => {
        if (!row) return;
        row.forEach((cell, x) => {
          if (cell !== null) blocks.push({ x, y });
        });
      });
      return blocks;
    }, [board]);


    // --- Active piece cells ---
    const activeCells = useMemo(() => {
      if (!currentPiece) return [];
      const cells: Array<{ x: number; y: number }> = [];
      currentPiece.shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
          if (cell !== 0) {
            const px = currentPiece.x + dx;
            const py = currentPiece.y + dy;
            if (py >= 0) cells.push({ x: px, y: py });
          }
        });
      });
      return cells;
    }, [currentPiece]);

    // --- Ghost piece cells (exclude rows occupied by actual piece) ---
    const ghostCells = useMemo(() => {
      if (!currentPiece) return [];
      const cells: Array<{ x: number; y: number }> = [];
      currentPiece.shape.forEach((row, dy) => {
        row.forEach((cell, dx) => {
          if (cell !== 0) {
            const px = currentPiece.x + dx;
            const py = ghostY + dy;
            const actualPy = currentPiece.y + dy;
            if (py >= 0 && py !== actualPy) {
              cells.push({ x: px, y: py });
            }
          }
        });
      });
      return cells;
    }, [currentPiece, ghostY]);

    return (
      <Canvas style={{ width: canvasW, height: canvasH }}>
        {/* ── ATMOSPHERIC BASE: The "Glass Plinth" — Gives the board a heavy, premium feel ── */}
        <Rect x={0} y={0} width={canvasW} height={canvasH} color="#050810" />
        <Rect x={0} y={0} width={canvasW} height={canvasH}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(canvasW, canvasH)}
            colors={['#0A1020', '#050810']}
          />
        </Rect>

        {/* ── DIAGNOSTIC FALLBACK: If image fails to load, show red background ── */}
        {!backgroundImage && (
          <Rect x={0} y={0} width={canvasW} height={canvasH} color="#FF00324D" />
        )}

        {/* ── LAYER 0: Faint, Bleak Black & White Background ── */}
        {backgroundImage && (
          <Group opacity={0.15}>
            <ColorMatrix matrix={BLACK_AND_WHITE} />
            <Image
              image={backgroundImage}
              x={parallaxX}
              y={parallaxY}
              width={canvasW}
              height={canvasH}
              fit="cover"
            />
          </Group>
        )}

        {/* ── LAYER 0.5: Cinematic Room Flash (Synchronized with Sidebar Lightning) ── */}
        {backgroundImage && flashOpacity && (
          <Group opacity={flashOpacity} blendMode="screen">
            <Image
              image={backgroundImage}
              x={parallaxX}
              y={parallaxY}
              width={canvasW}
              height={canvasH}
              fit="cover"
            />
          </Group>
        )}

        {/* ── LAYER 0.75: Breathing Embers (Continuous Heat Pulse) ── */}
        {backgroundImage && skin.blockStyle.breathing && (
          <Group opacity={emberBreath} blendMode="screen">
            <Image
              image={backgroundImage}
              x={parallaxX}
              y={parallaxY}
              width={canvasW}
              height={canvasH}
              fit="cover"
            />
          </Group>
        )}

        {/* ── LAYER 0.8: Ash Particles ── */}
        {skin.blockStyle.breathing && ashParticles.map((p) => (
          <AshParticle
            key={p.id}
            x={p.x}
            y={p.y}
            size={p.size}
            speed={p.speed}
            wobble={p.wobble}
            time={ashTime}
            canvasH={canvasH}
          />
        ))}

        {/* ── LAYER 1: Vivid image — revealed only through the permanent revealMask ── */}
        {backgroundImage && (
          <Group clip={settledMaskPath}>
            <Image
              image={backgroundImage}
              x={parallaxX}
              y={parallaxY}
              width={canvasW}
              height={canvasH}
              fit="cover"
            />
          </Group>
        )}

        {/* ── LAYER 1.5: Magnifier Effect (Zoomed background through blocks) ── */}
        {backgroundImage && skin.blockStyle.magnifier && (
          <Group clip={settledMaskPath}>
            {/* Base Darkened Magnifier */}
            <Group transform={[{ scale: 2.0 }]} opacity={0.3}>
              <Image
                image={backgroundImage}
                x={parallaxX - (canvasW * 0.5)} 
                y={parallaxY - (canvasH * 0.5)}
                width={canvasW}
                height={canvasH}
                fit="cover"
              />
            </Group>
            {/* Pulsing Heat Magnifier */}
            {skin.blockStyle.breathing && (
              <Group transform={[{ scale: 2.0 }]} opacity={emberBreath} blendMode="screen">
                <Image
                  image={backgroundImage}
                  x={parallaxX - (canvasW * 0.5)} 
                  y={parallaxY - (canvasH * 0.5)}
                  width={canvasW}
                  height={canvasH}
                  fit="cover"
                />
              </Group>
            )}
          </Group>
        )}


        {/* ── LAYER 2: Glass crystal overlays on settled blocks (MINECRAFT 3D EXTRUDED STYLE) ── */}
        {settledBlocks.map(({ x, y }) => {
          const bx = x * BLOCK_SIZE;
          const by = y * BLOCK_SIZE;
          return (
            <Group key={`glass-${x}-${y}`}>
              {/* High-Clarity Center — Almost fully transparent to see the parallax image clearly */}
              <RoundedRect
                x={bx + 1} y={by + 1}
                width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                r={0}
                color="#00000008"
              />

              {/* ── 3D BEVELS ── */}
              {/* Top bevel (Strong light) */}
              <Path 
                path={`M ${bx+1} ${by+1} L ${bx+BLOCK_SIZE-1} ${by+1} L ${bx+BLOCK_SIZE-4} ${by+4} L ${bx+4} ${by+4} Z`} 
                color="#FFFFFFCC" 
              />
              {/* Left bevel (Medium light) */}
              <Path 
                path={`M ${bx+1} ${by+1} L ${bx+4} ${by+4} L ${bx+4} ${by+BLOCK_SIZE-4} L ${bx+1} ${by+BLOCK_SIZE-1} Z`} 
                color="#FFFFFF66" 
              />
              {/* Bottom bevel (Deep shadow) */}
              <Path 
                path={`M ${bx+1} ${by+BLOCK_SIZE-1} L ${bx+4} ${by+BLOCK_SIZE-4} L ${bx+BLOCK_SIZE-4} ${by+BLOCK_SIZE-4} L ${bx+BLOCK_SIZE-1} ${by+BLOCK_SIZE-1} Z`} 
                color="#000000B3" 
              />
              {/* Right bevel (Medium shadow) */}
              <Path 
                path={`M ${bx+BLOCK_SIZE-1} ${by+1} L ${bx+BLOCK_SIZE-4} ${by+4} L ${bx+BLOCK_SIZE-4} ${by+BLOCK_SIZE-4} L ${bx+BLOCK_SIZE-1} ${by+BLOCK_SIZE-1} Z`} 
                color="#00000066" 
              />

              {/* ── DYNAMIC GLARE (Moves slightly based on accelerometer parallax) ── */}
              {/* We map the specular start/end points using parallax for physical glare */}
              <RoundedRect
                x={bx + 4} y={by + 4}
                width={BLOCK_SIZE - 8} height={(BLOCK_SIZE - 8) * 0.4}
                r={0}
                blendMode="screen"
              >
                <LinearGradient
                  start={vec(bx + 4, by + 4)}
                  end={vec(bx + 4, by + (BLOCK_SIZE - 8) * 0.4)}
                  colors={['#FFFFFF99', '#FFFFFF00']}
                />
              </RoundedRect>

              {/* ── LED TV STYLE (Exclusive to LED skins) ── */}
              {skin.blockStyle.led && (
                <Group>
                  {/* Subtle Scanlines */}
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Rect
                      key={`scanline-${i}`}
                      x={bx + 2}
                      y={by + 4 + i * (BLOCK_SIZE / 4)}
                      width={BLOCK_SIZE - 4}
                      height={0.8}
                      color="rgba(0, 255, 0, 0.15)"
                    />
                  ))}
                  {/* RGB Subpixel "Dots" */}
                  <Rect
                    x={bx + BLOCK_SIZE / 2 - 1}
                    y={by + BLOCK_SIZE / 2 - 1}
                    width={2}
                    height={2}
                    color="rgba(255, 255, 255, 0.4)"
                  />
                </Group>
              )}
            </Group>
          );
        })}





        {/* ── LAYER 3: Subtle grid over entire board ── */}
        {Array.from({ length: ROWS }).map((_, y) =>
          Array.from({ length: COLS }).map((__, x) => (
            <RoundedRect
              key={`grid-${x}-${y}`}
              x={x * BLOCK_SIZE + 0.5}
              y={y * BLOCK_SIZE + 0.5}
              width={BLOCK_SIZE - 1}
              height={BLOCK_SIZE - 1}
              r={0}
              color="transparent"
            >
              <Paint style="stroke" strokeWidth={0.5} color="#FFFFFF0A" blendMode="screen" />
            </RoundedRect>
          ))
        )}

        {/* ── LAYER 4: Ghost piece — hollow crystal outline ── */}
        {ghostCells.map(({ x, y }) => {
          const bx = x * BLOCK_SIZE;
          const by = y * BLOCK_SIZE;
          return (
            <RoundedRect
              key={`ghost-${x}-${y}`}
              x={bx + 2} y={by + 2}
              width={BLOCK_SIZE - 4} height={BLOCK_SIZE - 4}
              r={CORNER_RADIUS}
              color="transparent"
            >
              <Paint style="stroke" strokeWidth={1.2} color="#78D2FF61" />
            </RoundedRect>
          );
        })}

        {/* ── LAYER 5: Active falling piece — pure crystal + blue energy glow ── */}
        {activeCells.map(({ x, y }) => {
          const bx = x * BLOCK_SIZE;
          const by = y * BLOCK_SIZE;
          return (
            <Group key={`active-${x}-${y}`}>
              {/* Outer glow */}
              <RoundedRect
                x={bx + 1} y={by + 1}
                width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                r={CORNER_RADIUS}
                color="#00BEFF80"
              >
                <BlurMask blur={9} style="outer" respectCTM={false} />
              </RoundedRect>

              {/* Crystal body — pulsing energy feel */}
              <RoundedRect
                x={bx + 2} y={by + 2}
                width={BLOCK_SIZE - 4} height={BLOCK_SIZE - 4}
                r={CORNER_RADIUS - 1}
                color="#00E5FF4D"
              >
                <BlurMask blur={2} style="normal" />
              </RoundedRect>

              {/* Top specular shine */}
              <RoundedRect
                x={bx + 3} y={by + 3}
                width={BLOCK_SIZE - 6} height={(BLOCK_SIZE - 6) * 0.38}
                r={CORNER_RADIUS - 2}
                blendMode="screen"
              >
                <LinearGradient
                  start={vec(bx + 3, by + 3)}
                  end={vec(bx + 3, by + BLOCK_SIZE * 0.38)}
                  colors={['#FFFFFFBF', '#FFFFFF00']}
                />
              </RoundedRect>

              {/* Crystal border / Minecraft White Outline */}
              {skin.blockStyle.magnifier ? (
                <Rect
                  x={bx} y={by}
                  width={BLOCK_SIZE} height={BLOCK_SIZE}
                  color="transparent"
                >
                  <Paint style="stroke" strokeWidth={1} color="rgba(255, 255, 255, 0.8)" />
                </Rect>
              ) : (
                <RoundedRect
                  x={bx + 1} y={by + 1}
                  width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                  r={CORNER_RADIUS}
                  color="transparent"
                >
                  <Paint style="stroke" strokeWidth={1.5} color="#64E1FFEB" blendMode="screen" />
                </RoundedRect>
              )}
            </Group>
          );
        })}

      </Canvas>
    );
  }
);
