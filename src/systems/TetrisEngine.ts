import { TETROMINOES, TetrominoType, RotationState } from '../constants/tetrominos';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants/gameConfig';

export type Piece = {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  rotation: RotationState;
  color: string;
};

export type GhostPiece = Piece & {
  opacity: number;
};

export type CellValue = {
  color: string;
  skinId: string;
} | null;

export type Board = CellValue[][];

// SRS Wall Kick Data for J, L, S, T, Z pieces
const WALL_KICKS = {
  '0->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1->0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1->2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2->1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3->2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3->0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0->3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};

// SRS Wall Kick Data for I piece
const WALL_KICKS_I = {
  '0->1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1->0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1->2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2->1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2->3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3->2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3->0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0->3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

export class TetrisEngine {
  static createEmptyBoard(): Board {
    return Array.from({ length: BOARD_HEIGHT }, () =>
      Array.from({ length: BOARD_WIDTH }, () => null)
    );
  }

  static shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  static getNextBag(): TetrominoType[] {
    const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    return this.shuffle(types);
  }

  static getInitialPiece(type: TetrominoType): Piece {
    const definition = TETROMINOES[type];
    return {
      type,
      shape: definition.shape,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(definition.shape[0].length / 2),
      y: type === 'I' ? -1 : 0,
      rotation: 0,
      color: definition.color,
    };
  }

  static isValidMove(board: Board, piece: Piece, offsetX: number, offsetY: number, newShape?: number[][]): boolean {
    const shape = newShape || piece.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = piece.x + x + offsetX;
          const newY = piece.y + y + offsetY;

          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && board[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  static rotateShape(shape: number[][], direction: 'CW' | 'CCW'): number[][] {
    const rows = shape.length;
    const cols = shape[0].length;

    if (direction === 'CW') {
      return Array.from({ length: cols }, (_, newRow) =>
        Array.from({ length: rows }, (_, newCol) =>
          shape[rows - 1 - newCol][newRow]
        )
      );
    } else {
      return Array.from({ length: cols }, (_, newRow) =>
        Array.from({ length: rows }, (_, newCol) =>
          shape[newCol][cols - 1 - newRow]
        )
      );
    }
  }

  static rotatePiece(board: Board, piece: Piece, direction: 'CW' | 'CCW'): Piece | null {
    if (piece.type === 'O') return piece;

    const newRotation = (direction === 'CW' ? (piece.rotation + 1) % 4 : (piece.rotation + 3) % 4) as RotationState;
    const newShape = this.rotateShape(piece.shape, direction);
    const key = `${piece.rotation}->${newRotation}` as keyof typeof WALL_KICKS;
    
    const kicks = piece.type === 'I' ? WALL_KICKS_I[key] : (WALL_KICKS[key] || [[0, 0]]);

    for (const [kx, ky] of kicks) {
      if (this.isValidMove(board, piece, kx, -ky, newShape)) {
        return {
          ...piece,
          shape: newShape,
          x: piece.x + kx,
          y: piece.y - ky,
          rotation: newRotation,
        };
      }
    }

    return null;
  }

  static getGhostPosition(board: Board, piece: Piece): number {
    let offsetY = 0;
    while (this.isValidMove(board, piece, 0, offsetY + 1)) {
      offsetY++;
    }
    return piece.y + offsetY;
  }

  static lockPiece(
    board: Board,
    piece: Piece,
    skinId: string
  ): { newBoard: Board; isTopOut: boolean } {
    const newBoard = board.map(row => [...row]);
    let isTopOut = false;

    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (!value) return;
        const boardY = piece.y + y;
        const boardX = piece.x + x;
        // Cell is above the visible board — game over condition
        if (boardY < 0) {
          isTopOut = true;
          return;
        }
        // Only write cells that are strictly inside the board bounds
        if (boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = { color: piece.color, skinId };
        }
      });
    });

    return { newBoard, isTopOut };
  }

  static clearFullRows(board: Board): { newBoard: Board; clearedRows: number[] } {
    const clearedRows: number[] = [];
    const newBoard = board.filter((row, index) => {
      const isFull = row.every(cell => cell !== null);
      if (isFull) clearedRows.push(index);
      return !isFull;
    });

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
    }

    return { newBoard, clearedRows };
  }

  static isTSpin(board: Board, piece: Piece): boolean {
    if (piece.type !== 'T') return false;

    const corners = [
      [0, 0], [2, 0],
      [0, 2], [2, 2]
    ];
    let blockedCount = 0;

    corners.forEach(([cx, cy]) => {
      const bx = piece.x + cx;
      const by = piece.y + cy;

      const isOutOfBounds = bx < 0 || bx >= BOARD_WIDTH || by >= BOARD_HEIGHT;
      const isOccupied = !isOutOfBounds && by >= 0 && board[by][bx] !== null;

      if (isOutOfBounds || isOccupied) {
        blockedCount++;
      }
    });

    return blockedCount >= 3;
  }
}
