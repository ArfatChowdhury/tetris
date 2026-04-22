import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TETROMINOES, TetrominoType } from '../constants/tetrominos';
import { TetrisBlock, BLOCK_SIZE } from './TetrisBlock';
import { SkinDefinition } from '../constants/skins';

interface NextPiecePreviewProps {
  type: TetrominoType | null;
  skin: SkinDefinition;
}

const PREVIEW_BLOCK_SIZE = BLOCK_SIZE * 0.7;

export const NextPiecePreview: React.FC<NextPiecePreviewProps> = React.memo(({ type, skin }) => {
  if (!type) return null;

  const definition = TETROMINOES[type];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NEXT</Text>
      <View style={styles.previewBox}>
        {definition.shape.map((row, y) => (
          <View key={`next-row-${y}`} style={styles.row}>
            {row.map((value, x) => (
              <View key={`next-cell-${x}-${y}`} style={[styles.cellWrapper, { width: PREVIEW_BLOCK_SIZE, height: PREVIEW_BLOCK_SIZE }]}>
                {value !== 0 && (
                  <TetrisBlock color={definition.color} skin={skin} />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  previewBox: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    minWidth: 80,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cellWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
