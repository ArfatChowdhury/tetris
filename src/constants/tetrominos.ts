export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface TetrominoDefinition {
  shape: number[][];
  color: string;
}

export const TETROMINOES: Record<TetrominoType, TetrominoDefinition> = {
  I: { shape: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], color: '#00F0F0' },
  O: { shape: [[1,1], [1,1]], color: '#F0F000' },
  T: { shape: [[0,1,0], [1,1,1], [0,0,0]], color: '#A000F0' },
  S: { shape: [[0,1,1], [1,1,0], [0,0,0]], color: '#00F000' },
  Z: { shape: [[1,1,0], [0,1,1], [0,0,0]], color: '#F00000' },
  J: { shape: [[1,0,0], [1,1,1], [0,0,0]], color: '#0000F0' },
  L: { shape: [[0,0,1], [1,1,1], [0,0,0]], color: '#F0A000' },
};

// SRS rotation states: 0 (default), 1 (90deg CW), 2 (180deg), 3 (90deg CCW)
export type RotationState = 0 | 1 | 2 | 3;
