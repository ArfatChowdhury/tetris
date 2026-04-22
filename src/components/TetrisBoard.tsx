import React from 'react';
import { View, StyleSheet } from 'react-native';
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
  return (
    <View style={styles.container}>
      {/* Render the settled pieces */}
      {board.map((row, y) => (
        <View key={`row-${y}`} style={styles.row}>
          {row.map((cell, x) => (
            <View key={`cell-${x}-${y}`} style={styles.cellWrapper}>
              {cell && (
                <TetrisBlock color={cell.color} skin={skin} />
              )}
            </View>
          ))}
        </View>
      ))}

      {/* Render the ghost piece */}
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

      {/* Render the current falling piece */}
      {currentPiece && (
        <View style={[styles.pieceContainer, { top: currentPiece.y * BLOCK_SIZE, left: currentPiece.x * BLOCK_SIZE }]}>
          {currentPiece.shape.map((row, y) => (
            <View key={`active-row-${y}`} style={styles.row}>
              {row.map((value, x) => (
                <View key={`active-cell-${x}-${y}`} style={styles.cellWrapper}>
                  {value !== 0 && (
                    <TetrisBlock color={currentPiece.color} skin={skin} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignSelf: 'center',
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
  },
  cellWrapper: {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
  },
  pieceContainer: {
    position: 'absolute',
  },
});
