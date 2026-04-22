import React, { useMemo } from 'react';
import { View, StyleSheet, ImageSourcePropType } from 'react-native';
import Svg, { Defs, Mask, Rect, Image } from 'react-native-svg';
import { Board, Piece } from '../systems/TetrisEngine';
import { TetrisBlock, BLOCK_SIZE } from './TetrisBlock';
import { SkinDefinition } from '../constants/skins';

interface TetrisBoardProps {
  board: Board;
  currentPiece: Piece | null;
  ghostY: number;
  skin: SkinDefinition;
}

export const TetrisBoard: React.FC<TetrisBoardProps> = React.memo(({ board, currentPiece, ghostY, skin }) => {
  const boardWidthPixels = board[0].length * BLOCK_SIZE;
  const boardHeightPixels = board.length * BLOCK_SIZE;

  // Derive mask rectangles to improve render performance
  const maskRects = useMemo(() => {
    const rects = [];
    
    // Add board blocks to mask
    board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell !== 0) {
          rects.push(<Rect key={`m-board-${x}-${y}`} x={x * BLOCK_SIZE} y={y * BLOCK_SIZE} width={BLOCK_SIZE} height={BLOCK_SIZE} fill="white" />);
        }
      });
    });

    // Add active piece to mask
    if (currentPiece) {
      currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell !== 0) {
            rects.push(<Rect key={`m-active-${x}-${y}`} x={(currentPiece.x + x) * BLOCK_SIZE} y={(currentPiece.y + y) * BLOCK_SIZE} width={BLOCK_SIZE} height={BLOCK_SIZE} fill="white" />);
          }
        });
      });
    }
    
    return rects;
  }, [board, currentPiece]);

  return (
    <View style={[styles.container, { width: boardWidthPixels, height: boardHeightPixels }]}>
      {/* Background SVG Mosaic */}
      {skin.image && (
        <Svg width={boardWidthPixels} height={boardHeightPixels} style={StyleSheet.absoluteFillObject}>
          <Defs>
            <Mask id="mosaic-mask">
              {maskRects}
            </Mask>
          </Defs>
          <Image
            href={skin.image as ImageSourcePropType}
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            mask="url(#mosaic-mask)"
          />
        </Svg>
      )}

      {/* Grid Lines behind the blocks (optional, very subtle) */}
      <View style={[StyleSheet.absoluteFillObject, styles.gridOverlay]}>
        {board.map((row, y) => (
          <View key={`grid-row-${y}`} style={styles.row}>
            {row.map((_, x) => (
              <View key={`grid-cell-${x}-${y}`} style={styles.gridCell} />
            ))}
          </View>
        ))}
      </View>

      {/* Settled overlays */}
      <View style={StyleSheet.absoluteFillObject}>
        {board.map((row, y) => (
          <View key={`row-${y}`} style={styles.row}>
            {row.map((cell, x) => (
              <View key={`cell-${x}-${y}`} style={styles.cellWrapper}>
                {cell !== 0 && (
                  <TetrisBlock color={cell.color} skin={skin} />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Ghost Piece (Sleek Outline) */}
      {currentPiece && (
        <View style={[styles.pieceContainer, { top: ghostY * BLOCK_SIZE, left: currentPiece.x * BLOCK_SIZE }]}>
          {currentPiece.shape.map((row, y) => (
            <View key={`ghost-row-${y}`} style={styles.row}>
              {row.map((value, x) => (
                <View key={`ghost-cell-${x}-${y}`} style={styles.cellWrapper}>
                  {value !== 0 && (
                    <TetrisBlock color={currentPiece.color} skin={skin} isGhost={true} />
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Active Piece overlay (Glow) */}
      {currentPiece && (
        <View style={[styles.pieceContainer, { top: currentPiece.y * BLOCK_SIZE, left: currentPiece.x * BLOCK_SIZE }]}>
          {currentPiece.shape.map((row, y) => (
            <View key={`active-row-${y}`} style={styles.row}>
              {row.map((value, x) => (
                <View key={`active-cell-${x}-${y}`} style={styles.cellWrapper}>
                  {value !== 0 && (
                    <TetrisBlock color={currentPiece.color} skin={skin} isActive={true} />
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gridOverlay: {
    opacity: 0.1,
  },
  row: {
    flexDirection: 'row',
  },
  gridCell: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cellWrapper: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
  },
  pieceContainer: {
    position: 'absolute',
  },
});
