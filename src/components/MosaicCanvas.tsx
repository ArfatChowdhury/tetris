import React, { useMemo } from 'react';
import {
  Canvas,
  Image,
  useImage,
  Mask,
  Group,
  RoundedRect,
  LinearGradient,
  Paint,
  BlurMask,
  vec,
  Path,
  Skia,
} from '@shopify/react-native-skia';
import { Board, Piece } from '../systems/TetrisEngine';
import { SkinDefinition } from '../constants/skins';
import { BLOCK_SIZE } from './TetrisBlock';

interface MosaicCanvasProps {
  board: Board;
  currentPiece: Piece | null;
  ghostY: number;
  revealMask: boolean[][];
  skin: SkinDefinition;
}

const CORNER_RADIUS = 4;

export const MosaicCanvas: React.FC<MosaicCanvasProps> = React.memo(
  ({ board, currentPiece, ghostY, skin }) => {
    const COLS = board[0].length;
    const ROWS = board.length;
    const canvasW = COLS * BLOCK_SIZE;
    const canvasH = ROWS * BLOCK_SIZE;

    const backgroundImage = useImage(skin.image);

    // --- Mask path: ONLY settled board cells (not active piece) ---
    // This drives Layer 1 (full-vivid image reveal)
    const settledMaskPath = useMemo(() => {
      const path = Skia.Path.Make();
      board.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell !== null) {
            path.addRRect({
              rect: {
                x: x * BLOCK_SIZE,
                y: y * BLOCK_SIZE,
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
              },
              rx: CORNER_RADIUS,
              ry: CORNER_RADIUS,
            });
          }
        });
      });
      return path;
    }, [board]);

    // --- Settled glass blocks list ---
    const settledBlocks = useMemo(() => {
      const blocks: Array<{ x: number; y: number }> = [];
      board.forEach((row, y) => {
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

        {/* ── LAYER 0: Dim base image — always visible across whole board ── */}
        {backgroundImage && (
          <Image
            image={backgroundImage}
            x={0}
            y={0}
            width={canvasW}
            height={canvasH}
            fit="cover"
            opacity={0.18}
          />
        )}

        {/* ── LAYER 1: Vivid image — revealed only through settled blocks ── */}
        {backgroundImage && settledBlocks.length > 0 && (
          <Mask
            mask={
              <Group>
                <Path path={settledMaskPath} color="white" />
              </Group>
            }
          >
            <Image
              image={backgroundImage}
              x={0}
              y={0}
              width={canvasW}
              height={canvasH}
              fit="cover"
            />
          </Mask>
        )}

        {/* ── LAYER 2: Glass crystal overlays on settled blocks ── */}
        {settledBlocks.map(({ x, y }) => {
          const bx = x * BLOCK_SIZE;
          const by = y * BLOCK_SIZE;
          return (
            <Group key={`glass-${x}-${y}`}>
              {/* Frosted glass base — very subtle dark wash to darken edge pixels */}
              <RoundedRect
                x={bx + 1} y={by + 1}
                width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                r={CORNER_RADIUS}
                color="rgba(10, 15, 30, 0.22)"
              />

              {/* Top specular highlight */}
              <RoundedRect
                x={bx + 2} y={by + 2}
                width={BLOCK_SIZE - 4} height={(BLOCK_SIZE - 4) * 0.4}
                r={CORNER_RADIUS - 1}
              >
                <LinearGradient
                  start={vec(bx + 2, by + 2)}
                  end={vec(bx + 2, by + (BLOCK_SIZE - 4) * 0.4)}
                  colors={['rgba(255,255,255,0.60)', 'rgba(255,255,255,0)']}
                />
              </RoundedRect>

              {/* Bottom subtle shine */}
              <RoundedRect
                x={bx + 2} y={by + BLOCK_SIZE * 0.68}
                width={BLOCK_SIZE - 4} height={BLOCK_SIZE * 0.28}
                r={CORNER_RADIUS - 1}
              >
                <LinearGradient
                  start={vec(bx + 2, by + BLOCK_SIZE * 0.68)}
                  end={vec(bx + 2, by + BLOCK_SIZE)}
                  colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.18)']}
                />
              </RoundedRect>

              {/* Prismatic iridescent border */}
              <RoundedRect
                x={bx + 1} y={by + 1}
                width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                r={CORNER_RADIUS}
              >
                <Paint style="stroke" strokeWidth={1.5}>
                  <LinearGradient
                    start={vec(bx, by)}
                    end={vec(bx + BLOCK_SIZE, by + BLOCK_SIZE)}
                    colors={[
                      'rgba(220, 240, 255, 0.90)',
                      'rgba(160, 210, 255, 0.60)',
                      'rgba(200, 160, 255, 0.50)',
                      'rgba(255, 200, 140, 0.35)',
                    ]}
                  />
                </Paint>
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
            >
              <Paint style="stroke" strokeWidth={0.5} color="rgba(255,255,255,0.10)" />
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
              <Paint style="stroke" strokeWidth={1.2} color="rgba(120, 210, 255, 0.38)" />
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
                color="rgba(0, 190, 255, 0.50)"
              >
                <BlurMask blur={9} style="outer" respectCTM={false} />
              </RoundedRect>

              {/* Crystal body — near-transparent */}
              <RoundedRect
                x={bx + 2} y={by + 2}
                width={BLOCK_SIZE - 4} height={BLOCK_SIZE - 4}
                r={CORNER_RADIUS - 1}
                color="rgba(130, 225, 255, 0.18)"
              />

              {/* Top specular shine */}
              <RoundedRect
                x={bx + 3} y={by + 3}
                width={BLOCK_SIZE - 6} height={(BLOCK_SIZE - 6) * 0.38}
                r={CORNER_RADIUS - 2}
              >
                <LinearGradient
                  start={vec(bx + 3, by + 3)}
                  end={vec(bx + 3, by + BLOCK_SIZE * 0.38)}
                  colors={['rgba(255,255,255,0.75)', 'rgba(255,255,255,0)']}
                />
              </RoundedRect>

              {/* Crystal border */}
              <RoundedRect
                x={bx + 1} y={by + 1}
                width={BLOCK_SIZE - 2} height={BLOCK_SIZE - 2}
                r={CORNER_RADIUS}
              >
                <Paint style="stroke" strokeWidth={1.5} color="rgba(100, 225, 255, 0.92)" />
              </RoundedRect>
            </Group>
          );
        })}

      </Canvas>
    );
  }
);
