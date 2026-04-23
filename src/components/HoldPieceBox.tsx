import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TETROMINOES, TetrominoType } from '../constants/tetrominos';
import { TetrisBlock, BLOCK_SIZE } from './TetrisBlock';
import { SkinDefinition } from '../constants/skins';

interface HoldPieceBoxProps {
  type: TetrominoType | null;
  skin: SkinDefinition;
}

const PREVIEW_BLOCK_SIZE = BLOCK_SIZE * 0.7;

export const HoldPieceBox: React.FC<HoldPieceBoxProps> = React.memo(({ type, skin }) => {
  const definition = type ? TETROMINOES[type] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HOLD</Text>
      <View style={styles.previewBox}>
        {definition ? (
          definition.shape.map((row, y) => (
            <View key={`hold-row-${y}`} style={styles.row}>
              {row.map((value, x) => (
                <View key={`hold-cell-${x}-${y}`} style={[styles.cellWrapper, { width: PREVIEW_BLOCK_SIZE, height: PREVIEW_BLOCK_SIZE }]}>
                  {value !== 0 && (
                    <TetrisBlock color={definition.color} skin={skin} />
                  )}
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={{ width: 60, height: 60 }} />
        )}
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
    color: '#deb887', // Match Sidebar header color
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 5,
  },
  previewBox: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
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
