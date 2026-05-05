import React, { useMemo, useEffect } from 'react';
import { useSharedValue, withRepeat, withTiming, Easing, useDerivedValue, SharedValue, withSequence } from 'react-native-reanimated';
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
  Text,
  matchFont,
  RuntimeShader,
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
  playerName?: string;
  lastClearedRows?: number[];
}

const DigitalRainDrop: React.FC<{ i: number; canvasH: number; canvasW: number; bgTime: SharedValue<number> }> = ({ i, canvasH, canvasW, bgTime }) => {
  const transform = useDerivedValue(() => [
    { translateY: (bgTime.value * canvasH + (i * 80)) % canvasH }
  ]);
  
  return (
    <Group transform={transform}>
      <Rect
        x={(i * (canvasW / 8)) + 10}
        y={0}
        width={1}
        height={30}
      >
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, 30)}
          colors={['rgba(0, 255, 255, 0)', 'rgba(0, 255, 255, 0.6)']}
        />
      </Rect>
    </Group>
  );
};

const DreamSparkle: React.FC<{ i: number; canvasH: number; canvasW: number; bgTime: SharedValue<number> }> = ({ i, canvasH, canvasW, bgTime }) => {
  const opacity = useDerivedValue(() => {
    return Math.sin(bgTime.value * Math.PI * 2 + i) * 0.5 + 0.5;
  });
  
  const x = (i * 137.5) % canvasW;
  const y = (i * 242.1) % canvasH;

  return (
    <Circle cx={x} cy={y} r={1.5} color="white" opacity={opacity}>
      <BlurMask blur={2} style="normal" />
    </Circle>
  );
};

const CORNER_RADIUS = 4;

const BLACK_AND_WHITE = [
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0,      0,      0,      1, 0,
];

const HALFTONE_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 iResolution;
  uniform shader iImage;

  half4 main(float2 fragCoord) {
      half4 color = iImage.eval(fragCoord);
      
      // Halftone dots
      float size = 8.0;
      float2 grid = floor(fragCoord / size) * size + size * 0.5;
      float dist = distance(fragCoord, grid);
      
      // Brightness determines dot radius
      float brightness = (color.r + color.g + color.b) / 3.0;
      float radius = (1.0 - brightness) * (size * 0.45);
      
      if (dist < radius) {
          return half4(0.0, 0.0, 0.0, 1.0); // Black dots
      }
      
      return color;
  }
`)!;

const COMIC_WAKE_SHADER = Skia.RuntimeEffect.Make(`
  uniform float2 iResolution;
  uniform shader iImage;
  uniform float2 piecePos;
  uniform float warpStrength;

  half4 main(float2 fragCoord) {
      float2 uv = fragCoord / iResolution.xy;
      
      // Displacement / Warp logic around piecePos
      float distToPiece = distance(fragCoord, piecePos);
      float warp = exp(-distToPiece * 0.03) * warpStrength;
      float2 offset = normalize(fragCoord - piecePos) * warp;
      
      return iImage.eval(fragCoord + offset);
  }
`)!;



const PreloadedFrame = React.memo(({ source, isActive, x, y, width, height, fit }: any) => {
  const image = useImage(source);
  if (!image || !isActive) return null;
  
  return (
    <Group>
      {fit === 'contain' && (
        <Group>
          <Image image={image} x={x} y={y} width={width} height={height} fit="cover" opacity={0.3} />
          <Rect x={x} y={y} width={width} height={height} color="rgba(20, 5, 25, 0.4)" />
        </Group>
      )}
      <Image image={image} x={x} y={y} width={width} height={height} fit={fit} />
    </Group>
  );
});

const AnimatedSkiaImage: React.FC<{ frames: any[]; x: any; y: any; width: number; height: number; fit: any }> = React.memo(({ frames, x, y, width, height, fit }) => {
  const [frameIndex, setFrameIndex] = React.useState(0);
  
  React.useEffect(() => {
    if (frames && frames.length > 0) {
      const interval = setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % frames.length);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [frames]);

  if (!frames || frames.length === 0) return null;

  return (
    <Group>
      {frames.map((frame, index) => (
        <PreloadedFrame
          key={index}
          source={frame}
          isActive={index === frameIndex}
          x={x}
          y={y}
          width={width}
          height={height}
          fit={fit}
        />
      ))}
    </Group>
  );
});

const ComicSplash: React.FC<{ rows: number[]; canvasW: number }> = ({ rows, canvasW }) => {
  const splashProgress = useSharedValue(0);
  
  useEffect(() => {
    if (rows.length > 0) {
      splashProgress.value = 0;
      splashProgress.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.exp) });
    }
  }, [rows]);

  return (
    <Group>
      {rows.map((ry) => (
        Array.from({ length: 12 }).map((_, i) => {
          const startX = (i / 12) * canvasW + (Math.random() * 20 - 10);
          const startY = ry * BLOCK_SIZE + (BLOCK_SIZE / 2);
          
          const cx = useDerivedValue(() => startX + Math.sin(i + splashProgress.value * 5) * 20 * splashProgress.value);
          const cy = useDerivedValue(() => startY - 150 * splashProgress.value + (splashProgress.value * splashProgress.value * 50));
          const opacity = useDerivedValue(() => Math.max(0, 1 - splashProgress.value));
          const r = useDerivedValue(() => (Math.random() * 5 + 3) * (1 + splashProgress.value));

          return (
            <Circle key={`foam-${ry}-${i}`} cx={cx} cy={cy} r={r} color="white" opacity={opacity}>
              <BlurMask blur={4} style="normal" />
            </Circle>
          );
        })
      ))}
    </Group>
  );
};

export const MosaicCanvas: React.FC<MosaicCanvasProps> = React.memo(
  ({ board, currentPiece, ghostY, revealMask, skin, flashOpacity, playerName = 'Arfat', lastClearedRows = [] }) => {
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

    // --- Breathing Embers Engine & Time loops ---
    const emberBreath = useSharedValue(0.1);
    const cyberBreath = useSharedValue(0.1);
    const bgTime = useSharedValue(0);
    const packetTime = useSharedValue(0);
    
    useEffect(() => {
      // Always run bgTime, useful for many background effects (like bobbing)
      bgTime.value = withRepeat(
        withTiming(1, { duration: 10000, easing: Easing.linear }),
        -1,
        false
      );

      if (skin.id === 'cyber_void') {
        packetTime.value = withRepeat(
          withTiming(1, { duration: 4000, easing: Easing.linear }),
          -1,
          false
        );
      }
    }, [skin.id, bgTime, packetTime]);

    useEffect(() => {
      if (skin.blockStyle.breathing || skin.blockStyle.cyber || skin.blockStyle.glow) {
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
    }, [skin.blockStyle.breathing, skin.blockStyle.cyber, skin.blockStyle.glow, emberBreath, cyberBreath]);

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
    const imgY = useDerivedValue(() => {
      let y = (enableParallax ? parallaxY.value : 0) - PARALLAX_PADDING + offsetY;
      if (skin.bobbingAnimation) {
        y += Math.sin(bgTime.value * Math.PI * 2) * 15; // Smooth 15px bobbing
      }
      return y;
    });

    const imageCenter = { x: canvasW / 2, y: canvasH / 2 };
    
    const bobbingTransform = useDerivedValue(() => {
      if (!skin.bobbingAnimation) return [];
      const wave = bgTime.value * Math.PI * 2;
      // Cosine gives us a tilt that is 90 degrees out of phase with the sine bobbing
      // creating a very realistic "surfing" or "floating" motion
      const rotation = Math.cos(wave) * 0.04; 
      return [{ rotate: rotation }];
    });
    
    const magScale = skin.blockStyle.magnifierScale || 2.0;
    const magX = useDerivedValue(() => (enableParallax ? parallaxX.value : 0) - PARALLAX_PADDING - canvasW * ((magScale - 1) / 2));
    const magY = useDerivedValue(() => (enableParallax ? parallaxY.value : 0) - PARALLAX_PADDING - canvasH * ((magScale - 1) / 2));

    // --- Surfer's Comic Rush: Wake & Water Logic ---
    const isComic = skin.uiStyle === 'comic';
    const warpStrength = useSharedValue(0);
    const piecePos = useDerivedValue(() => {
      if (!currentPiece) return [0, 0];
      return [currentPiece.x * BLOCK_SIZE + BLOCK_SIZE, currentPiece.y * BLOCK_SIZE + BLOCK_SIZE];
    });

    const wakeUniforms = useDerivedValue(() => ({
      iResolution: [canvasW, canvasH],
      piecePos: piecePos.value,
      warpStrength: warpStrength.value,
    }));

    const halftoneUniforms = useMemo(() => ({
      iResolution: [canvasW, canvasH],
    }), [canvasW, canvasH]);

    // The comic warp strength used to trigger on every block move, causing annoying shaking.
    // We removed the continuous shaking effect on piece drop!

    const stackHeight = useMemo(() => {
      for (let y = 0; y < ROWS; y++) {
        if (!board[y]) continue;
        for (let x = 0; x < COLS; x++) {
          if (board[y][x] !== null) return ROWS - y;
        }
      }
      return 0;
    }, [board, ROWS, COLS]);

    const surferImgY = useDerivedValue(() => {
      const basePos = imgY.value;
      if (!isComic) return basePos;
      // Surfer "rises" with the stack height (10 pixels per block)
      return basePos - stackHeight * 5;
    });


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

          {/* ── CYBER-VOID & NEON SIGNATURE PROCEDURAL BACKGROUND ── */}
          {(skin.id === 'cyber_void') && (
            <Group>
              {/* Deep Nebula Glow */}
              <Rect x={0} y={0} width={canvasW} height={canvasH}>
                <FractalNoise freqX={0.01} freqY={0.01} octaves={2} />
                <ColorMatrix
                  matrix={[
                    0.05, 0, 0, 0, 0.05, // R
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

          {/* ── DREAM SPARKLES ── */}
          {skin.uiStyle === 'dream' && (
            <Group>
              {Array.from({ length: 20 }).map((_, i) => (
                <DreamSparkle
                  key={`sparkle-${i}`}
                  i={i}
                  canvasH={canvasH}
                  canvasW={canvasW}
                  bgTime={bgTime}
                />
              ))}
            </Group>
          )}

          {/* ── ELDRITCH RESONANCE BACKGROUND ── */}
          {(skin.id === 'eldritch_resonance') && (
            <Group>
              <Rect x={0} y={0} width={canvasW} height={canvasH}>
                <FractalNoise freqX={0.02} freqY={0.02} octaves={3} />
                <ColorMatrix
                  matrix={[
                    0.1, 0, 0, 0, 0.05, // R
                    0, 0.05, 0, 0, 0,    // G
                    0, 0, 0.1, 0, 0.1, // B
                    0, 0, 0, 1, 0,    // A
                  ]}
                />
              </Rect>
              <Rect x={0} y={0} width={canvasW} height={canvasH} color="#2e004f" opacity={emberBreath} blendMode="overlay" />
            </Group>
          )}

          {/* ── CRYSTALLINE VOID BACKGROUND ── */}
          {(skin.id === 'crystalline_void') && (
            <Group>
              <Rect x={0} y={0} width={canvasW} height={canvasH}>
                <FractalNoise freqX={0.005} freqY={0.005} octaves={4} />
                <ColorMatrix
                  matrix={[
                    0, 0, 0, 0, 0, // R
                    0, 0.2, 0, 0, 0.1,    // G
                    0, 0, 0.3, 0, 0.2, // B
                    0, 0, 0, 1, 0,    // A
                  ]}
                />
              </Rect>
            </Group>
          )}

          {/* ── DIAGNOSTIC FALLBACK ── */}
          {!backgroundImage && skin.id !== 'cyber_void' && skin.id !== 'pixel_retro' && skin.id !== 'crystalline_void' && skin.id !== 'eldritch_resonance' && (
            <Rect x={0} y={0} width={canvasW} height={canvasH} color="#FF003222" />
          )}

          {/* ── PIXEL RETRO SCANLINES ── */}
          {skin.id === 'pixel_retro' && (
            <Group>
               <Rect x={0} y={0} width={canvasW} height={canvasH} color="#000000" />
               {Array.from({ length: Math.ceil(canvasH / 4) }).map((_, i) => (
                 <Rect
                   key={`scanline-${i}`}
                   x={0}
                   y={i * 4}
                   width={canvasW}
                   height={1.5}
                   color="rgba(255,255,255,0.05)"
                 />
               ))}
            </Group>
          )}


          {/* ── LAYER 0: Faint, Bleak Black & White Background (Skipped for Cartoon) ── */}
          {backgroundImage && !skin.blockStyle.marshmallow && skin.uiStyle !== 'anime' && (
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



        {/* ── LAYER 1: Vivid image — revealed only through the permanent revealMask OR FULLY for Cartoon/Dream/Anime ── */}
        {(backgroundImage || (skin.frames && skin.frames.length > 0)) && (
          <Group clip={skin.uiStyle === 'glass' ? settledMaskPath : boardClipPath}>
            {skin.frames && skin.frames.length > 0 ? (
              <AnimatedSkiaImage
                frames={skin.frames}
                x={imgX}
                y={imgY}
                width={imgWidth}
                height={imgHeight}
                fit={skin.uiStyle === 'anime' ? "contain" : "cover"}
              />
            ) : backgroundImage ? (
              <Group>
                {isComic ? (
                  <Group>
                    <RuntimeShader
                      source={HALFTONE_SHADER}
                      uniforms={halftoneUniforms}
                    >
                      <RuntimeShader
                        source={COMIC_WAKE_SHADER}
                        uniforms={wakeUniforms}
                      >
                        <Image
                          image={backgroundImage}
                          x={imgX}
                          y={surferImgY}
                          width={imgWidth}
                          height={imgHeight}
                          fit="cover"
                          transform={bobbingTransform}
                          origin={imageCenter}
                        />
                      </RuntimeShader>
                    </RuntimeShader>
                  </Group>
                ) : (
                  <Image
                    image={backgroundImage}
                    x={imgX}
                    y={imgY}
                    width={imgWidth}
                    height={imgHeight}
                    fit={skin.imageFit || ((skin.blockStyle.marshmallow && skin.uiStyle !== 'dream') ? "contain" : "cover")}
                    transform={bobbingTransform}
                    origin={imageCenter}
                  />
                )}
              </Group>
            ) : null}
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
                transform={bobbingTransform}
                origin={imageCenter}
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
                  transform={bobbingTransform}
                  origin={imageCenter}
                />
              </Group>
            )}
          </Group>
        )}

        {/* ── LAYER 1.7: Comic Splash (Sea Spray) ── */}
        {isComic && lastClearedRows.length > 0 && (
          <ComicSplash rows={lastClearedRows} canvasW={canvasW} />
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
                  {/* Body: High-Contrast Translucent Violet */}
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2}>
                    <LinearGradient
                      start={vec(bx, by)}
                      end={vec(bx + BLOCK_SIZE, by + BLOCK_SIZE)}
                      colors={['#2E005C', '#1A0033']}
                    />
                  </RoundedRect>
                  
                  {/* Neon Glow Border - Pulses with cyberBreath */}
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2} color="transparent">
                    <Paint style="stroke" strokeWidth={2} color="#00FFFF">
                      <BlurMask blur={cyberBreath} style="outer" />
                    </Paint>
                  </RoundedRect>
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2} color="transparent">
                    <Paint style="stroke" strokeWidth={1} color="#00FFFFCC" />
                  </RoundedRect>

                  {/* Internal "Circuitry" Pattern */}
                  <Group opacity={0.6}>
                    <Rect x={bx + 4} y={by + 6} width={BLOCK_SIZE - 8} height={1} color="#00FFFF99" />
                    <Rect x={bx + 6} y={by + 4} width={1} height={BLOCK_SIZE - 8} color="#FF00FF99" />
                    <Rect x={bx + 4} y={by + BLOCK_SIZE - 6} width={BLOCK_SIZE - 10} height={1} color="#00FFFF88" />
                    
                    {/* Data "Node" */}
                    <Circle cx={bx + BLOCK_SIZE - 6} cy={by + BLOCK_SIZE - 6} r={1.5} color="#00FFFF" />
                  </Group>

                  {/* Corner Brackets */}
                  <Path path={`M ${bx+4} ${by+8} L ${bx+4} ${by+4} L ${bx+8} ${by+4}`} color="#00FFFF" strokeWidth={1} style="stroke" />
                  <Path path={`M ${bx+BLOCK_SIZE-8} ${by+BLOCK_SIZE-4} L ${bx+BLOCK_SIZE-4} ${by+BLOCK_SIZE-4} L ${bx+BLOCK_SIZE-4} ${by+BLOCK_SIZE-8}`} color="#00FFFF" strokeWidth={1} style="stroke" />
                  
                  {/* Top Specular */}
                  <Rect x={bx + 2} y={by + 2} width={BLOCK_SIZE - 4} height={1} color="rgba(255,255,255,0.4)" />
                </Group>
              ) : skin.blockStyle.inkStroke ? (
                /* ── PHANTOM RONIN INK STROKE BLOCK ── */
                <Group>
                  <Path path={`M ${bx+1} ${by+1} Q ${bx+BLOCK_SIZE/2} ${by+3} ${bx+BLOCK_SIZE-1} ${by+2} Q ${bx+BLOCK_SIZE-3} ${by+BLOCK_SIZE/2} ${bx+BLOCK_SIZE-2} ${by+BLOCK_SIZE-2} Q ${bx+BLOCK_SIZE/2} ${by+BLOCK_SIZE-4} ${bx+2} ${by+BLOCK_SIZE-1} Q ${bx+4} ${by+BLOCK_SIZE/2} ${bx+1} ${by+1} Z`} color="#000000" />
                  
                  {/* Dynamic Neon Pulse Glow */}
                  <Group opacity={cyberBreath}>
                    <Path path={`M ${bx+1} ${by+1} Q ${bx+BLOCK_SIZE/2} ${by+3} ${bx+BLOCK_SIZE-1} ${by+2} Q ${bx+BLOCK_SIZE-3} ${by+BLOCK_SIZE/2} ${bx+BLOCK_SIZE-2} ${by+BLOCK_SIZE-2} Q ${bx+BLOCK_SIZE/2} ${by+BLOCK_SIZE-4} ${bx+2} ${by+BLOCK_SIZE-1} Q ${bx+4} ${by+BLOCK_SIZE/2} ${bx+1} ${by+1} Z`} style="stroke" strokeWidth={3} color="#ff00ff">
                      <BlurMask blur={8} style="outer" />
                    </Path>
                  </Group>

                  {/* Core Neon Border */}
                  <Path path={`M ${bx+1} ${by+1} Q ${bx+BLOCK_SIZE/2} ${by+3} ${bx+BLOCK_SIZE-1} ${by+2} Q ${bx+BLOCK_SIZE-3} ${by+BLOCK_SIZE/2} ${bx+BLOCK_SIZE-2} ${by+BLOCK_SIZE-2} Q ${bx+BLOCK_SIZE/2} ${by+BLOCK_SIZE-4} ${bx+2} ${by+BLOCK_SIZE-1} Q ${bx+4} ${by+BLOCK_SIZE/2} ${bx+1} ${by+1} Z`} style="stroke" strokeWidth={1.5} color="#ff00ff">
                    <BlurMask blur={2} style="outer" />
                  </Path>
                  
                  <Path path={`M ${bx+1} ${by+1} Q ${bx+BLOCK_SIZE/2} ${by+3} ${bx+BLOCK_SIZE-1} ${by+2} Q ${bx+BLOCK_SIZE-3} ${by+BLOCK_SIZE/2} ${bx+BLOCK_SIZE-2} ${by+BLOCK_SIZE-2} Q ${bx+BLOCK_SIZE/2} ${by+BLOCK_SIZE-4} ${bx+2} ${by+BLOCK_SIZE-1} Q ${bx+4} ${by+BLOCK_SIZE/2} ${bx+1} ${by+1} Z`} style="stroke" strokeWidth={0.5} color="rgba(255,255,255,0.8)" />
                </Group>
              ) : skin.blockStyle.refractiveGlass ? (
                /* ── CRYSTALLINE VOID REFRACTIVE GLASS BLOCK ── */
                <Group>
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2} color="rgba(255,255,255,0.05)" />
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2} color="transparent">
                    <Paint style="stroke" strokeWidth={1} color="rgba(0, 255, 255, 0.4)" />
                  </RoundedRect>
                  <Path path={`M ${bx+2} ${by+2} L ${bx+BLOCK_SIZE/2} ${by+BLOCK_SIZE/2} L ${bx+BLOCK_SIZE-2} ${by+2}`} style="stroke" strokeWidth={0.5} color="rgba(255,255,255,0.3)" />
                  <Path path={`M ${bx+2} ${by+BLOCK_SIZE-2} L ${bx+BLOCK_SIZE/2} ${by+BLOCK_SIZE/2} L ${bx+BLOCK_SIZE-2} ${by+BLOCK_SIZE-2}`} style="stroke" strokeWidth={0.5} color="rgba(255,255,255,0.1)" />
                  <RoundedRect x={bx + 4} y={by + 4} width={BLOCK_SIZE - 8} height={4} r={2} color="rgba(255,255,255,0.2)" />
                </Group>
              ) : skin.blockStyle.eldritchRune ? (
                /* ── ELDRITCH RESONANCE OBSIDIAN RUNE BLOCK ── */
                <Group>
                  <RoundedRect x={bx + 2} y={by + 2} width={BLOCK_SIZE - 4} height={BLOCK_SIZE - 4} r={4} color="#1a001a" />
                  <Circle cx={bx + BLOCK_SIZE / 2} cy={by + BLOCK_SIZE / 2} r={3} color="#00ff00" opacity={emberBreath}>
                    <BlurMask blur={2} style="normal" />
                  </Circle>
                  <Path path={`M ${bx+BLOCK_SIZE/2} ${by+4} L ${bx+BLOCK_SIZE/2} ${by+BLOCK_SIZE-4} M ${bx+4} ${by+BLOCK_SIZE/2} L ${bx+BLOCK_SIZE-4} ${by+BLOCK_SIZE/2}`} style="stroke" strokeWidth={1} color="#00ff00" opacity={emberBreath} />
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
              ) : skin.uiStyle === 'dream' ? (
                /* ── ETERNAL DREAM IRIDESCENT BLOCK ── */
                <Group>
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={8}>
                    <LinearGradient
                      start={vec(bx, by)}
                      end={vec(bx + BLOCK_SIZE, by + BLOCK_SIZE)}
                      colors={['#ffffff', '#ffb6c1', '#dda0dd']}
                    />
                  </RoundedRect>
                  {/* Soft Heart Overlay */}
                  {heartImage && (
                    <Image
                      image={heartImage}
                      x={bx + BLOCK_SIZE / 4}
                      y={by + BLOCK_SIZE / 4}
                      width={BLOCK_SIZE / 2}
                      height={BLOCK_SIZE / 2}
                      opacity={0.6}
                    />
                  )}
                  {/* Iridescent Shine */}
                  <RoundedRect x={bx + 3} y={by + 3} width={BLOCK_SIZE - 6} height={4} r={2} color="rgba(255,255,255,0.8)" />
                </Group>
              ) : skin.uiStyle === 'anime' ? (
                /* ── ANIME GLASS GLOW BLOCK ── */
                <Group>
                  {/* Deep glowing background (matches the neon anime vibe) */}
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={6}>
                    <LinearGradient
                      start={vec(bx, by)}
                      end={vec(bx + BLOCK_SIZE, by + BLOCK_SIZE)}
                      colors={['rgba(255,105,180,0.5)', 'rgba(148,0,211,0.3)']}
                    />
                  </RoundedRect>
                  
                  {/* Intense Neon Border */}
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={6} color="transparent">
                    <Paint style="stroke" strokeWidth={1} color="rgba(255, 255, 255, 0.8)">
                      <BlurMask blur={2} style="outer" />
                    </Paint>
                  </RoundedRect>
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={6} color="transparent">
                    <Paint style="stroke" strokeWidth={0.5} color="#FF69B4" />
                  </RoundedRect>

                  {/* Star/Sparkle accent in the corner */}
                  <Path 
                    path={`M ${bx+BLOCK_SIZE-8} ${by+6} Q ${bx+BLOCK_SIZE-6} ${by+6} ${bx+BLOCK_SIZE-6} ${by+4} Q ${bx+BLOCK_SIZE-6} ${by+6} ${bx+BLOCK_SIZE-4} ${by+6} Q ${bx+BLOCK_SIZE-6} ${by+6} ${bx+BLOCK_SIZE-6} ${by+8} Q ${bx+BLOCK_SIZE-6} ${by+6} ${bx+BLOCK_SIZE-8} ${by+6} Z`} 
                    color="#FFF" 
                    opacity={0.9} 
                  />

                  {/* Diagonal Glass Slash / Reflection */}
                  <Path 
                    path={`M ${bx+2} ${by+10} L ${bx+10} ${by+2} L ${bx+14} ${by+2} L ${bx+2} ${by+14} Z`} 
                    color="rgba(255,255,255,0.4)" 
                  />

                  {/* Base Gloss / Highlight */}
                  <RoundedRect x={bx + 3} y={by + 3} width={BLOCK_SIZE - 6} height={6} r={3}>
                    <LinearGradient
                      start={vec(bx + 3, by + 3)}
                      end={vec(bx + 3, by + 9)}
                      colors={['rgba(255,255,255,0.8)', 'rgba(255,255,255,0)']}
                    />
                  </RoundedRect>
                </Group>
              ) : skin.uiStyle === 'comic' ? (
                /* ── COMIC BOOK BOLD BLOCK ── */
                <Group>
                   <RoundedRect
                    x={bx + 1} y={by + 1}
                    width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                    r={2}
                    color="rgba(255,255,255,0.1)"
                  />
                  <RoundedRect
                    x={bx + 1} y={by + 1}
                    width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                    r={2}
                  >
                    <Paint style="stroke" strokeWidth={2.5} color="black" />
                  </RoundedRect>
                  {/* Subtle Comic Dot inside block */}
                  <Circle cx={bx + BLOCK_SIZE/2} cy={by + BLOCK_SIZE/2} r={BLOCK_SIZE/3} color="rgba(0,0,0,0.05)" />
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
                /* ── HOLOGRAPHIC SCANNER GHOST ── */
                <Group>
                  {/* Dashed Border */}
                  <RoundedRect x={bx + 2} y={by + 2} width={BLOCK_SIZE - 4} height={BLOCK_SIZE - 4} r={4} color="transparent">
                    <Paint style="stroke" strokeWidth={1} color="#00FFFFCC" />
                  </RoundedRect>
                  
                  {/* Technical Crosshair */}
                  <Rect x={bx + BLOCK_SIZE/2 - 4} y={by + BLOCK_SIZE/2} width={8} height={0.5} color="#00FFFFCC" />
                  <Rect x={bx + BLOCK_SIZE/2} y={by + BLOCK_SIZE/2 - 4} width={0.5} height={8} color="#00FFFFCC" />
                  
                  {/* Corner Highlighters */}
                  <Circle cx={bx + 4} cy={by + 4} r={1.5} color="#00FFFF" />
                  <Circle cx={bx + BLOCK_SIZE - 4} cy={by + BLOCK_SIZE - 4} r={1.5} color="#00FFFF" />
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
              ) : skin.uiStyle === 'dream' && currentPiece ? (
                <Group>
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={12}>
                    <LinearGradient
                      start={vec(bx, by)}
                      end={vec(bx + BLOCK_SIZE, by + BLOCK_SIZE)}
                      colors={['#ffffff', '#ff1493']}
                    />
                  </RoundedRect>
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={12} color="transparent">
                    <Paint style="stroke" strokeWidth={3} color="#ffffff">
                      <BlurMask blur={8} style="outer" />
                    </Paint>
                  </RoundedRect>
                </Group>
              ) : skin.uiStyle === 'anime' && currentPiece ? (
                /* ── ANIME ACTIVE GLOW BLOCK ── */
                <Group>
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={6}>
                    <LinearGradient
                      start={vec(bx, by)}
                      end={vec(bx + BLOCK_SIZE, by + BLOCK_SIZE)}
                      colors={['rgba(255,20,147,0.8)', 'rgba(148,0,211,0.6)']}
                    />
                  </RoundedRect>
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={6} color="transparent">
                    <Paint style="stroke" strokeWidth={2} color="#FFF">
                      <BlurMask blur={4} style="outer" />
                    </Paint>
                  </RoundedRect>
                  <Path 
                    path={`M ${bx+BLOCK_SIZE-8} ${by+6} Q ${bx+BLOCK_SIZE-6} ${by+6} ${bx+BLOCK_SIZE-6} ${by+4} Q ${bx+BLOCK_SIZE-6} ${by+6} ${bx+BLOCK_SIZE-4} ${by+6} Q ${bx+BLOCK_SIZE-6} ${by+6} ${bx+BLOCK_SIZE-6} ${by+8} Q ${bx+BLOCK_SIZE-6} ${by+6} ${bx+BLOCK_SIZE-8} ${by+6} Z`} 
                    color="#FFF" 
                  />
                </Group>
              ) : skin.blockStyle.cyber && currentPiece ? (
                /* ── ACTIVE CYBER BLOCK ── */
                <Group>
                   {/* Intense Outer Neon Glow */}
                   <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2} color="#00FFFF">
                    <BlurMask blur={12} style="outer" />
                  </RoundedRect>
                  
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2} color="rgba(0, 255, 255, 0.4)" />
                  <RoundedRect x={bx + 1} y={by + 1} width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2} r={2} color="transparent">
                    <Paint style="stroke" strokeWidth={2.5} color="#00FFFF" />
                  </RoundedRect>

                  {/* Glitch lines */}
                  <Rect x={bx + 2} y={by + BLOCK_SIZE/2} width={BLOCK_SIZE - 4} height={1.5} color="#FF00FF" opacity={cyberBreath} />
                </Group>
              ) : skin.uiStyle === 'comic' ? (
                /* ── COMIC PIECE ── */
                <Group>
                  <RoundedRect
                    x={bx + 1} y={by + 1}
                    width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                    r={2}
                    color="white"
                  />
                  <RoundedRect
                    x={bx + 1} y={by + 1}
                    width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                    r={2}
                  >
                    <Paint style="stroke" strokeWidth={3} color="black" />
                  </RoundedRect>
                   <Circle cx={bx + BLOCK_SIZE/3} cy={by + BLOCK_SIZE/3} r={2} color="black" opacity={0.3} />
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

        {/* ── LAYER 7: Neural Pulse (Rendered ON TOP of blocks) ── */}
        {skin.id === 'cyber_void' && (
          <Group transform={useDerivedValue(() => {
            const progress = packetTime.value;
            const perimeter = (canvasW + canvasH) * 2;
            const currentPos = progress * perimeter;
            
            let x = 0;
            let y = 0;
            
            if (currentPos < canvasW) {
              x = currentPos; y = 0;
            } else if (currentPos < canvasW + canvasH) {
              x = canvasW; y = currentPos - canvasW;
            } else if (currentPos < canvasW * 2 + canvasH) {
              x = canvasW - (currentPos - (canvasW + canvasH)); y = canvasH;
            } else {
              x = 0; y = canvasH - (currentPos - (canvasW * 2 + canvasH));
            }
            
            return [{ translateX: x }, { translateY: y }];
          })}>
            <Circle r={5} color="#00FFFF">
              <BlurMask blur={8} style="normal" />
            </Circle>
            <Circle r={2} color="#FFFFFF" />
          </Group>
        )}

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

        {(skin.uiStyle === 'dream' || skin.uiStyle === 'anime') && (
          <Group>
            {/* Ethereal Glowing Frame */}
            <Path path={boardClipPath} color="transparent">
              <Paint style="stroke" strokeWidth={4} color={skin.uiStyle === 'anime' ? "rgba(148, 0, 211, 0.5)" : "rgba(255, 105, 180, 0.4)"}>
                <BlurMask blur={8} style="normal" />
              </Paint>
            </Path>
            <Path path={boardClipPath} color="transparent">
              <Paint style="stroke" strokeWidth={1.5} color="rgba(255, 255, 255, 0.6)" />
            </Path>
          </Group>
        )}
      </Canvas>
    );
  }
);
