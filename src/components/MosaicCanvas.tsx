import React, { useMemo, useEffect } from 'react';
import { useSharedValue, withRepeat, withTiming, Easing, useDerivedValue, SharedValue } from 'react-native-reanimated';
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
  FractalNoise,
  Shadow,
  FillType,
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
    const carrotImage = useImage(require('../assets/images/bunny/carrot.png'));
    const heartImage = useImage(require('../assets/images/bunny/heart.png'));
    const { parallaxX, parallaxY } = useParallax();

    // --- Parallax Overscan Padding ---
    // We render the image slightly larger than the canvas so tilting doesn't reveal black borders
    const PARALLAX_PADDING = 25;
    const scale = skin.imageScale || 1.0;
    const baseW = canvasW + PARALLAX_PADDING * 2;
    const baseH = canvasH + PARALLAX_PADDING * 2;
    const imgWidth = baseW * scale;
    const imgHeight = baseH * scale;
    
    const offsetX = (baseW - imgWidth) / 2;
    const offsetY = (baseH - imgHeight) / 2;
    
    // Disable parallax for Kawaii theme since blocks are solid and background sliding is distracting
    const enableParallax = skin.uiStyle !== 'kawaii';
    
    const imgX = useDerivedValue(() => (enableParallax ? parallaxX.value : 0) - PARALLAX_PADDING + offsetX);
    const imgY = useDerivedValue(() => (enableParallax ? parallaxY.value : 0) - PARALLAX_PADDING + offsetY);
    
    // The magnifier needs an additional offset to stay centered while zoomed
    const magScale = skin.blockStyle.magnifierScale || 2.0;
    const magX = useDerivedValue(() => (enableParallax ? parallaxX.value : 0) - PARALLAX_PADDING - canvasW * ((magScale - 1) / 2));
    const magY = useDerivedValue(() => (enableParallax ? parallaxY.value : 0) - PARALLAX_PADDING - canvasH * ((magScale - 1) / 2));

    // Explicit clip path (Rounded Rectangle) to prevent Android rendering bleed
    const boardClipPath = useMemo(() => {
      const path = Skia.Path.Make();
      path.addRRect({
        rect: { x: 0, y: 0, width: canvasW, height: canvasH },
        rx: 8,
        ry: 8,
      });
      return path;
    }, [canvasW, canvasH]);

    // Neumorphic Inset Frame Path (EvenOdd window)
    const insetFramePath = useMemo(() => {
      const p = Skia.Path.Make();
      p.setFillType(FillType.EvenOdd);
      // Outer rect far outside the canvas bounds
      p.addRect({ x: -50, y: -50, width: canvasW + 100, height: canvasH + 100 });
      // Inner hole exactly matching the board
      p.addRRect({
        rect: { x: 0, y: 0, width: canvasW, height: canvasH },
        rx: 8,
        ry: 8,
      });
      return p;
    }, [canvasW, canvasH]);

    // --- Breathing Embers Engine ---
    const emberBreath = useSharedValue(0.1);
    const cyberBreath = useSharedValue(0.1);
    const bgTime = useSharedValue(0);
    
    useEffect(() => {
      if (skin.id === 'cyber_void') {
        bgTime.value = withRepeat(
          withTiming(1, { duration: 10000, easing: Easing.linear }),
          -1,
          false
        );
      }
    }, [skin.id, bgTime]);

    useEffect(() => {
      if (skin.blockStyle.breathing || skin.blockStyle.cyber) {
        // Slow, 3-second inhale/exhale physics loop
        emberBreath.value = withRepeat(
          withTiming(0.85, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          -1, // Infinite loops
          true // Reverse (ping-pong)
        );
        
        // Fast, 0.8s cyber pulse
        cyberBreath.value = withRepeat(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
      } else {
        emberBreath.value = 0;
        cyberBreath.value = 0.2;
      }
    }, [skin.blockStyle.breathing, skin.blockStyle.cyber, emberBreath, cyberBreath]);



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
      const blocks: Array<{ x: number; y: number; color?: string }> = [];
      board.forEach((row, y) => {
        if (!row) return;
        row.forEach((cell, x) => {
          if (cell !== null) blocks.push({ x, y, color: cell.color });
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
        {/* ── MASTER CLIP GROUP ── */}
        {/* Everything inside the Canvas is strictly clipped to this 8px rounded rectangle */}
        <Group clip={boardClipPath}>

          {/* ── ATMOSPHERIC BASE: The "Glass Plinth" OR "Clay Cartoon" ── */}
          {skin.blockStyle.marshmallow ? (
            <RoundedRect x={0} y={0} width={canvasW} height={canvasH} color={skin.colors?.background?.[0] || '#FFE4E1'} r={8} />
          ) : (
            <Group>
              <Rect x={0} y={0} width={canvasW} height={canvasH} color="#050810" />
            </Group>
          )}

          {/* ── CYBER-VOID PROCEDURAL BACKGROUND ── */}
          {skin.id === 'cyber_void' && (
            <Group>
              {/* Deep Nebula Glow */}
              <Rect x={0} y={0} width={canvasW} height={canvasH}>
                <FractalNoise freqX={0.01} freqY={0.01} octaves={2} />
                <ColorMatrix
                  matrix={[
                    0, 0, 0, 0, 0.05, // R
                    0, 0, 0, 0, 0,    // G
                    0, 0, 0, 0, 0.15, // B
                    0, 0, 0, 1, 0,    // A
                  ]}
                />
              </Rect>
              {/* Scrolling Grid Lines */}
              {Array.from({ length: 15 }).map((_, i) => (
                <Rect
                  key={`h-grid-${i}`}
                  x={0}
                  y={(i * (canvasH / 15))}
                  width={canvasW}
                  height={1}
                  color="rgba(0, 255, 255, 0.05)"
                />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <Rect
                  key={`v-grid-${i}`}
                  x={(i * (canvasW / 10))}
                  y={0}
                  width={1}
                  height={canvasH}
                  color="rgba(0, 255, 255, 0.05)"
                />
              ))}
              {/* Digital Rain / Data Drops */}
              {Array.from({ length: 8 }).map((_, i) => (
                <DigitalRainDrop 
                  key={`rain-${i}`} 
                  i={i} 
                  canvasH={canvasH} 
                  canvasW={canvasW} 
                  bgTime={bgTime} 
                />
              ))}
            </Group>
          )}

          {/* ── DIAGNOSTIC FALLBACK ── */}
          {!backgroundImage && skin.id !== 'cyber_void' && (
            <Rect x={0} y={0} width={canvasW} height={canvasH} color="#FF003222" />
          )}


          {/* ── LAYER 0: Faint, Bleak Black & White Background (Skipped for Cartoon) ── */}
          {backgroundImage && !skin.blockStyle.marshmallow && (
            <Group opacity={0.15}>
              <ColorMatrix matrix={BLACK_AND_WHITE} />
              <Image
                image={backgroundImage}
                x={imgX}
                y={imgY}
                width={imgWidth}
                height={imgHeight}
                fit="cover"
              />
            </Group>
          )}

          {/* ── LAYER 0.5: Cinematic Room Flash (Synchronized with Sidebar Lightning) ── */}
          {backgroundImage && flashOpacity && (
            <Group opacity={flashOpacity} blendMode="screen">
              <Image
                image={backgroundImage}
                x={imgX}
                y={imgY}
                width={imgWidth}
                height={imgHeight}
                fit="cover"
              />
            </Group>
          )}

          {/* ── LAYER 0.75: Breathing Embers (Continuous Heat Pulse) ── */}
          {backgroundImage && skin.blockStyle.breathing && (
            <Group opacity={emberBreath} blendMode="screen">
              <Image
                image={backgroundImage}
                x={imgX}
                y={imgY}
                width={imgWidth}
                height={imgHeight}
                fit="cover"
              />
            </Group>
          )}



        {/* ── LAYER 1: Vivid image — revealed only through the permanent revealMask OR FULLY for Cartoon ── */}
        {backgroundImage && (
          <Group clip={skin.blockStyle.marshmallow ? boardClipPath : settledMaskPath}>
            <Image
              image={backgroundImage}
              x={imgX}
              y={imgY}
              width={imgWidth}
              height={imgHeight}
              fit={skin.blockStyle.marshmallow ? "contain" : "cover"}
            />
          </Group>
        )}

        {/* ── LAYER 1.5: Magnifier Effect (Zoomed background through blocks) ── */}
        {backgroundImage && skin.blockStyle.magnifier && !skin.blockStyle.marshmallow && (
          <Group clip={settledMaskPath}>
            {/* Base Darkened Magnifier */}
            <Group transform={[{ scale: skin.blockStyle.magnifierScale || 2.0 }]} opacity={0.3}>
              <Image
                image={backgroundImage}
                x={magX} 
                y={magY}
                width={imgWidth}
                height={imgHeight}
                fit="cover"
              />
            </Group>
            {/* Pulsing Heat Magnifier */}
            {skin.blockStyle.breathing && (
              <Group transform={[{ scale: skin.blockStyle.magnifierScale || 2.0 }]} opacity={emberBreath} blendMode="screen">
                <Image
                  image={backgroundImage}
                  x={magX} 
                  y={magY}
                  width={imgWidth}
                  height={imgHeight}
                  fit="cover"
                />
              </Group>
            )}
          </Group>
        )}


        {/* ── LAYER 2: Block Rendering (Lava / Marshmallow / Glass) ── */}
        {settledBlocks.map(({ x, y, color }) => {
          const bx = x * BLOCK_SIZE;
          const by = y * BLOCK_SIZE;
          const blockColor = skin.blockStyle.uniformColor || color || '#fff';
          return (
            <Group key={`glass-${x}-${y}`}>
              {skin.blockStyle.lava ? (
                /* ── MOLTEN OBSIDIAN BLOCK ── */
                <Group>
                  {/* Base: Deep obsidian — near-black with subtle dark red centre */}
                  <Rect x={bx} y={by} width={BLOCK_SIZE} height={BLOCK_SIZE} color="#0A0000" />
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2}>
                    <LinearGradient
                      start={vec(bx + 1, by + 1)}
                      end={vec(bx + BLOCK_SIZE - 1, by + BLOCK_SIZE - 1)}
                      colors={['#1A0500', '#0D0000']}
                    />
                  </RoundedRect>

                  {/* Lava Crack Bevels — sharp, glowing, no blur — breathing tint */}
                  {/* Top crack */}
                  <Path
                    path={`M ${bx+1} ${by+1} L ${bx+BLOCK_SIZE-1} ${by+1} L ${bx+BLOCK_SIZE-3} ${by+3} L ${bx+3} ${by+3} Z`}
                    opacity={emberBreath}
                    color="#FF4500"
                  />
                  {/* Left crack */}
                  <Path
                    path={`M ${bx+1} ${by+1} L ${bx+3} ${by+3} L ${bx+3} ${by+BLOCK_SIZE-3} L ${bx+1} ${by+BLOCK_SIZE-1} Z`}
                    opacity={emberBreath}
                    color="#CC2200"
                  />
                  {/* Bottom shadow crack */}
                  <Path
                    path={`M ${bx+1} ${by+BLOCK_SIZE-1} L ${bx+3} ${by+BLOCK_SIZE-3} L ${bx+BLOCK_SIZE-3} ${by+BLOCK_SIZE-3} L ${bx+BLOCK_SIZE-1} ${by+BLOCK_SIZE-1} Z`}
                    color="#FF2200"
                    opacity={emberBreath}
                  />
                  {/* Right shadow crack */}
                  <Path
                    path={`M ${bx+BLOCK_SIZE-1} ${by+1} L ${bx+BLOCK_SIZE-3} ${by+3} L ${bx+BLOCK_SIZE-3} ${by+BLOCK_SIZE-3} L ${bx+BLOCK_SIZE-1} ${by+BLOCK_SIZE-1} Z`}
                    color="#991100"
                    opacity={emberBreath}
                  />

                  {/* Inner ember glow line — 1px hot line at the top edge */}
                  <Rect x={bx + 3} y={by + 3} width={BLOCK_SIZE - 6} height={1} color="#FF6600" opacity={emberBreath} />

                  {/* Specular — single sharp white line on top edge only */}
                  <Rect x={bx + 2} y={by + 1} width={BLOCK_SIZE - 4} height={1} color="rgba(255,200,150,0.6)" />

                  {/* Subtle ash texture */}
                  <RoundedRect x={bx + 2} y={by + 2} width={BLOCK_SIZE - 4} height={BLOCK_SIZE - 4} r={1} blendMode="multiply">
                    <Paint>
                      <FractalNoise freqX={0.15} freqY={0.15} octaves={3} />
                    </Paint>
                  </RoundedRect>
                </Group>
              ) : skin.blockStyle.cyber ? (
                /* ── CYBER-VOID DATA BLOCK ── */
                <Group>
                  {/* Body: Deep Translucent Violet */}
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2} color="rgba(15, 0, 43, 0.85)" />
                  
                  {/* Neon Glow Border - Pulses with cyberBreath */}
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2} color="transparent">
                    <Paint style="stroke" strokeWidth={1.5} color="#00FFFF">
                      <BlurMask blur={cyberBreath} style="outer" />
                    </Paint>
                  </RoundedRect>
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2} color="transparent">
                    <Paint style="stroke" strokeWidth={1} color="#00FFFFCC" />
                  </RoundedRect>

                  {/* Internal "Circuitry" Pattern */}
                  <Group opacity={cyberBreath.value * 0.5 + 0.2}>
                    <Rect x={bx + 4} y={by + 6} width={BLOCK_SIZE - 8} height={1} color="#00FFFF66" />
                    <Rect x={bx + 6} y={by + 4} width={1} height={BLOCK_SIZE - 8} color="#FF00FF66" />
                    <Rect x={bx + 4} y={by + BLOCK_SIZE - 6} width={BLOCK_SIZE - 10} height={1} color="#00FFFF44" />
                    
                    {/* Data "Node" */}
                    <Circle cx={bx + BLOCK_SIZE - 6} cy={by + BLOCK_SIZE - 6} r={1.5} color="#00FFFF" />
                  </Group>

                  {/* Corner Brackets */}
                  <Path path={`M ${bx+4} ${by+8} L ${bx+4} ${by+4} L ${bx+8} ${by+4}`} color="#00FFFF" strokeWidth={1} style="stroke" />
                  <Path path={`M ${bx+BLOCK_SIZE-8} ${by+BLOCK_SIZE-4} L ${bx+BLOCK_SIZE-4} ${by+BLOCK_SIZE-4} L ${bx+BLOCK_SIZE-4} ${by+BLOCK_SIZE-8}`} color="#00FFFF" strokeWidth={1} style="stroke" />
                  
                  {/* Top Specular */}
                  <Rect x={bx + 2} y={by + 2} width={BLOCK_SIZE - 4} height={1} color="rgba(255,255,255,0.2)" />
                </Group>
              ) : skin.blockStyle.marshmallow ? (
                <Group>
                  <RoundedRect
                    x={bx + 1} y={by + 1}
                    width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                    r={8}
                    color={blockColor}
                  />
                  {skin.blockStyle.fluffy && (
                    <RoundedRect
                      x={bx + 1} y={by + 1}
                      width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                      r={8}
                      blendMode="softLight"
                    >
                      <Paint>
                        <FractalNoise freqX={0.08} freqY={0.08} octaves={2} />
                      </Paint>
                    </RoundedRect>
                  )}
                  <RoundedRect
                    x={bx + 3} y={by + 3}
                    width={BLOCK_SIZE - 6} height={(BLOCK_SIZE - 6) * 0.4}
                    r={4}
                    color="rgba(255,255,255,0.4)"
                  />
                </Group>
              ) : (
                <Group>
                  {/* High-Clarity Center — Almost fully transparent to see the parallax image clearly */}
                  <RoundedRect
                    x={bx + 1} y={by + 1}
                    width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                    r={0}
                    color="#00000008"
                  />
    
                  {/* ── 3D BEVELS ── */}
                  <Path path={`M ${bx+1} ${by+1} L ${bx+BLOCK_SIZE-1} ${by+1} L ${bx+BLOCK_SIZE-4} ${by+4} L ${bx+4} ${by+4} Z`} color="#FFFFFFCC" />
                  <Path path={`M ${bx+1} ${by+1} L ${bx+4} ${by+4} L ${bx+4} ${by+BLOCK_SIZE-4} L ${bx+1} ${by+BLOCK_SIZE-1} Z`} color="#FFFFFF66" />
                  <Path path={`M ${bx+1} ${by+BLOCK_SIZE-1} L ${bx+4} ${by+BLOCK_SIZE-4} L ${bx+BLOCK_SIZE-4} ${by+BLOCK_SIZE-4} L ${bx+BLOCK_SIZE-1} ${by+BLOCK_SIZE-1} Z`} color="#000000B3" />
                  <Path path={`M ${bx+BLOCK_SIZE-1} ${by+1} L ${bx+BLOCK_SIZE-4} ${by+4} L ${bx+BLOCK_SIZE-4} ${by+BLOCK_SIZE-4} L ${bx+BLOCK_SIZE-1} ${by+BLOCK_SIZE-1} Z`} color="#00000066" />
    
                  {/* ── DYNAMIC GLARE ── */}
                  <RoundedRect x={bx + 4} y={by + 4} width={BLOCK_SIZE - 8} height={(BLOCK_SIZE - 8) * 0.4} r={0} blendMode="screen">
                    <LinearGradient start={vec(bx + 4, by + 4)} end={vec(bx + 4, by + (BLOCK_SIZE - 8) * 0.4)} colors={['#FFFFFF99', '#FFFFFF00']} />
                  </RoundedRect>
    
                  {/* ── LED TV STYLE ── */}
                  {skin.blockStyle.led && (
                    <Group>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Rect key={`scanline-${i}`} x={bx + 2} y={by + 4 + i * (BLOCK_SIZE / 4)} width={BLOCK_SIZE - 4} height={0.8} color="rgba(0, 255, 0, 0.15)" />
                      ))}
                      <Rect x={bx + BLOCK_SIZE / 2 - 1} y={by + BLOCK_SIZE / 2 - 1} width={2} height={2} color="rgba(255, 255, 255, 0.4)" />
                    </Group>
                  )}
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

        {/* ── LAYER 4: Holographic Ghost Piece ("The Plan") ── */}
        {ghostCells.map(({ x, y }) => {
          const bx = x * BLOCK_SIZE;
          const by = y * BLOCK_SIZE;
          return (
            <Group key={`ghost-${x}-${y}`}>
              {skin.id === 'cyber_void' ? (
                /* ── DIGITAL BLUEPRINT GHOST ── */
                <Group>
                  <RoundedRect x={bx + 2} y={by + 2} width={BLOCK_SIZE - 4} height={BLOCK_SIZE - 4} r={0} color="transparent">
                    <Paint style="stroke" strokeWidth={1} color="#00FFFF44" strokeJoin="miter" />
                  </RoundedRect>
                  <Path path={`M ${bx+1} ${by+1} L ${bx+5} ${by+1} M ${bx+1} ${by+1} L ${bx+1} ${by+5}`} color="#00FFFF88" strokeWidth={1} style="stroke" />
                </Group>
              ) : (
                /* ── STANDARD GHOST ── */
                <Group>
                  {/* Glowing Holographic Core */}
                  <RoundedRect
                    x={bx + 1} y={by + 1}
                    width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                    r={CORNER_RADIUS}
                    color={skin.colors?.primary ? `${skin.colors.primary}4D` : '#78D2FF4D'}
                  >
                    <BlurMask blur={4} style="normal" />
                  </RoundedRect>
                  {/* Sharp Holographic Border */}
                  <RoundedRect
                    x={bx + 1} y={by + 1}
                    width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                    r={CORNER_RADIUS}
                    color="transparent"
                  >
                    <Paint style="stroke" strokeWidth={2} color={skin.colors?.primary ? `${skin.colors.primary}CC` : '#78D2FFCC'} />
                  </RoundedRect>
                </Group>
              )}
            </Group>
          );
        })}

        {/* ── LAYER 5: Active falling piece ── */}
        {activeCells.map(({ x, y }) => {
          const bx = x * BLOCK_SIZE;
          const by = y * BLOCK_SIZE;
          const blockColor = skin.blockStyle.uniformColor || (currentPiece ? currentPiece.color : '#fff');
          return (
            <Group key={`active-${x}-${y}`}>
              {skin.blockStyle.marshmallow && currentPiece ? (
                <Group>
                  <RoundedRect
                    x={bx + 1} y={by + 1}
                    width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                    r={8}
                    color={blockColor}
                  />
                  {skin.blockStyle.fluffy && (
                    <RoundedRect
                      x={bx + 1} y={by + 1}
                      width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                      r={8}
                      blendMode="softLight"
                    >
                      <Paint>
                        <FractalNoise freqX={0.08} freqY={0.08} octaves={2} />
                      </Paint>
                    </RoundedRect>
                  )}
                  <RoundedRect
                    x={bx + 3} y={by + 3}
                    width={BLOCK_SIZE - 6} height={(BLOCK_SIZE - 6) * 0.4}
                    r={4}
                    color="rgba(255,255,255,0.4)"
                  />
                </Group>
              ) : skin.blockStyle.cyber && currentPiece ? (
                /* ── ACTIVE CYBER BLOCK ── */
                <Group>
                   {/* Intense Outer Neon Glow */}
                   <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2} color="#00FFFF">
                    <BlurMask blur={8} style="outer" />
                  </RoundedRect>
                  
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2} color="rgba(0, 255, 255, 0.2)" />
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2} color="transparent">
                    <Paint style="stroke" strokeWidth={2} color="#00FFFF" />
                  </RoundedRect>

                  {/* Glitch lines */}
                  <Rect x={bx + 2} y={by + BLOCK_SIZE/2} width={BLOCK_SIZE - 4} height={1} color="#FF00FF" opacity={cyberBreath} />
                </Group>
              ) : (
                <Group>
                  {/* Outer glow */}
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={CORNER_RADIUS} color="#00BEFF80">
                    <BlurMask blur={9} style="outer" respectCTM={false} />
                  </RoundedRect>
    
                  {/* Crystal body — pulsing energy feel */}
                  <RoundedRect x={bx + 2} y={by + 2} width={BLOCK_SIZE - 4} height={BLOCK_SIZE - 4} r={CORNER_RADIUS - 1} color="#00E5FF4D">
                    <BlurMask blur={2} style="normal" />
                  </RoundedRect>
    
                  {/* Top specular shine */}
                  <RoundedRect x={bx + 3} y={by + 3} width={BLOCK_SIZE - 6} height={(BLOCK_SIZE - 6) * 0.38} r={CORNER_RADIUS - 2} blendMode="screen">
                    <LinearGradient start={vec(bx + 3, by + 3)} end={vec(bx + 3, by + BLOCK_SIZE * 0.38)} colors={['#FFFFFFBF', '#FFFFFF00']} />
                  </RoundedRect>
    
                  {/* Crystal border / Minecraft White Outline */}
                  {skin.blockStyle.magnifier ? (
                    <Rect x={bx} y={by} width={BLOCK_SIZE} height={BLOCK_SIZE} color="transparent">
                      <Paint style="stroke" strokeWidth={1} color="rgba(255, 255, 255, 0.8)" />
                    </Rect>
                  ) : (
                    <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={CORNER_RADIUS} color="transparent">
                      <Paint style="stroke" strokeWidth={1.5} color="#64E1FFEB" blendMode="screen" />
                    </RoundedRect>
                  )}
                </Group>
              )}
            </Group>
          );
        })}

        {/* ── LAYER 6: Neumorphic Inset Frame (Rendered OVER everything, outside the board clip) ── */}
        </Group>

        {(skin.uiStyle === 'neumorphic' || skin.uiStyle === 'kawaii') && (
          <Group>
            <Path path={insetFramePath} color={skin.colors?.background?.[0] || '#FFE4E1'}>
              {/* Dark top-left inner shadow - sharp for paper cut-out */}
              <Shadow dx={6} dy={6} blur={2} color="rgba(0,0,0,0.15)" />
              {/* Bright bottom-right inner shadow - sharp for paper cut-out */}
              <Shadow dx={-4} dy={-4} blur={2} color="rgba(255,255,255,1)" />
            </Path>
          </Group>
        )}
      </Canvas>
    );
  }
);
