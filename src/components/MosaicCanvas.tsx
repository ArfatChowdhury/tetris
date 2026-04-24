import React, { useMemo } from 'react';
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
}

const CORNER_RADIUS = 4;

const BLACK_AND_WHITE = [
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0.2126, 0.7152, 0.0722, 0, 0,
  0,      0,      0,      1, 0,
];

export const MosaicCanvas: React.FC<MosaicCanvasProps> = React.memo(
  ({ board, currentPiece, ghostY, revealMask, skin }) => {
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

    // --- Dynamic Mask path: Derived from CURRENT board state + currentPiece ---
    // The image ONLY shows where blocks exist. When a row clears, the image clears.
    const settledMaskPath = useMemo(() => {
      const path = Skia.Path.Make();
      
      // 1. Add settled blocks from board
      board.forEach((row, y) => {
        if (!row) return;
        row.forEach((cell, x) => {
          if (cell !== null) {
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

              {/* Crystal border */}
              <RoundedRect
                x={bx + 1} y={by + 1}
                width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                r={CORNER_RADIUS}
                color="transparent"
              >
                <Paint style="stroke" strokeWidth={1.5} color="#64E1FFEB" blendMode="screen" />
              </RoundedRect>
            </Group>
          );
        })}

      </Canvas>
    );
  }
);
