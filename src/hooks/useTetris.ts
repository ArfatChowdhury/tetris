import { useState, useEffect, useRef, useCallback } from 'react';
import { Board, Piece, TetrisEngine } from '../systems/TetrisEngine';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  LEVEL_SPEEDS,
  LINES_PER_LEVEL,
  SCORING,
  LOCK_DELAY,
  MAX_LOCK_RESETS,
} from '../constants/gameConfig';
import { audio } from '../utils/audio';
import { TetrominoType } from '../constants/tetrominos';

export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';

/**
 * useTetris — Refactored with useRef state mirrors to eliminate stale closures
 * in the game loop. The key insight: setInterval callbacks capture a stale
 * snapshot of all variables. By storing game state in refs and using setState
 * callbacks (prev => ...), we always operate on fresh data.
 */
export const useTetris = (activeSkinId: string) => {
  const [board, setBoard] = useState<Board>(TetrisEngine.createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPieceType, setNextPieceType] = useState<TetrominoType | null>(null);
  const [holdPieceType, setHoldPieceType] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [isSoftDropping, setIsSoftDropping] = useState(false);
  const [ghostY, setGhostY] = useState(0);
  // Persistent reveal mask — only ever gains cells, never loses them
  const [revealMask, setRevealMask] = useState<boolean[][]>(
    () => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(false))
  );

  // --- Mutable refs that always hold the latest value ---
  // These break the stale closure problem in setInterval
  const boardRef = useRef<Board>(TetrisEngine.createEmptyBoard());
  const currentPieceRef = useRef<Piece | null>(null);
  const nextPieceTypeRef = useRef<TetrominoType | null>(null);
  const holdPieceTypeRef = useRef<TetrominoType | null>(null);
  const canHoldRef = useRef(true);
  const levelRef = useRef(1);
  const linesRef = useRef(0);
  const gameStateRef = useRef<GameState>('idle');
  const isSoftDroppingRef = useRef(false);
  const activeSkinIdRef = useRef(activeSkinId);
  const revealMaskRef = useRef<boolean[][]>(
    Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(false))
  );

  // Keep refs in sync with state
  useEffect(() => { boardRef.current = board; }, [board]);
  useEffect(() => { currentPieceRef.current = currentPiece; }, [currentPiece]);
  useEffect(() => { nextPieceTypeRef.current = nextPieceType; }, [nextPieceType]);
  useEffect(() => { holdPieceTypeRef.current = holdPieceType; }, [holdPieceType]);
  useEffect(() => { canHoldRef.current = canHold; }, [canHold]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { linesRef.current = lines; }, [lines]);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
  useEffect(() => { isSoftDroppingRef.current = isSoftDropping; }, [isSoftDropping]);
  useEffect(() => { activeSkinIdRef.current = activeSkinId; }, [activeSkinId]);
  useEffect(() => { revealMaskRef.current = revealMask; }, [revealMask]);

  // Helper: permanently mark a piece's cells as revealed (never cleared)
  const addPieceToRevealMask = (piece: Piece) => {
    const next = revealMaskRef.current.map(row => [...row]);
    piece.shape.forEach((row, dy) => {
      row.forEach((cell, dx) => {
        if (cell !== 0) {
          const px = piece.x + dx;
          const py = piece.y + dy;
          if (py >= 0 && py < BOARD_HEIGHT && px >= 0 && px < BOARD_WIDTH) {
            next[py][px] = true;
          }
        }
      });
    });
    revealMaskRef.current = next;
    setRevealMask(next);
  };

  // --- Timers ---
  const bagRef = useRef<TetrominoType[]>([]);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lockResetsRef = useRef(0);

  // --- Internal helpers, all reading from refs, not state/closures ---

  const getNextPieceType = (): TetrominoType => {
    if (bagRef.current.length === 0) {
      bagRef.current = TetrisEngine.getNextBag() as TetrominoType[];
    }
    return bagRef.current.pop() as TetrominoType;
  };

  const spawnPieceInternal = (board: Board, typeOverride?: TetrominoType) => {
    const type = typeOverride ?? nextPieceTypeRef.current ?? getNextPieceType();
    const newNext = getNextPieceType();

    setNextPieceType(newNext);
    nextPieceTypeRef.current = newNext;

    const piece = TetrisEngine.getInitialPiece(type);

    if (!TetrisEngine.isValidMove(board, piece, 0, 0)) {
      setGameState('gameover');
      gameStateRef.current = 'gameover';
      audio.play('game_over');
      return;
    }

    setCurrentPiece(piece);
    currentPieceRef.current = piece;
    setGhostY(TetrisEngine.getGhostPosition(board, piece));
    setCanHold(true);
    canHoldRef.current = true;
  };

  const lockPieceInternal = () => {
    const piece = currentPieceRef.current;
    const board = boardRef.current;
    const currentLevel = levelRef.current;
    const currentLines = linesRef.current;

    if (!piece) return;

    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }

    audio.play('piece_land');
    // Permanently reveal the piece's cells BEFORE locking (so cleared rows keep their reveal)
    addPieceToRevealMask(piece);
    const { newBoard: lockedBoard, isTopOut } = TetrisEngine.lockPiece(board, piece, activeSkinIdRef.current);

    if (isTopOut) {
      setGameState('gameover');
      gameStateRef.current = 'gameover';
      audio.play('game_over');
      return;
    }

    const { newBoard, clearedRows } = TetrisEngine.clearFullRows(lockedBoard);

    if (clearedRows.length > 0) {
      const lineScore = [0, SCORING.SINGLE, SCORING.DOUBLE, SCORING.TRIPLE, SCORING.TETRIS][clearedRows.length] || 0;
      const tspin = TetrisEngine.isTSpin(board, piece);
      let finalScore = lineScore * currentLevel;
      if (tspin) finalScore += (SCORING.TSPIN ?? 400) * currentLevel;

      setScore(s => s + finalScore);

      const nextLines = currentLines + clearedRows.length;
      setLines(nextLines);
      linesRef.current = nextLines;

      if (Math.floor(nextLines / LINES_PER_LEVEL) > Math.floor(currentLines / LINES_PER_LEVEL)) {
        const newLevel = Math.min(currentLevel + 1, 20);
        setLevel(newLevel);
        levelRef.current = newLevel;
        audio.play('level_up');
      }

      audio.play(clearedRows.length === 4 ? 'line_clear_4' : 'line_clear_1');
    }

    setBoard(newBoard);
    boardRef.current = newBoard;
    setCurrentPiece(null);
    currentPieceRef.current = null;
    lockResetsRef.current = 0;

    // Spawn next piece using the fresh board
    spawnPieceInternal(newBoard);
  };

  const startLockTimer = () => {
    if (lockTimerRef.current) return;
    lockTimerRef.current = setTimeout(() => {
      lockTimerRef.current = null;
      lockPieceInternal();
    }, LOCK_DELAY);
  };

  const resetLockTimer = () => {
    if (lockTimerRef.current && lockResetsRef.current < MAX_LOCK_RESETS) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
      lockResetsRef.current++;
      startLockTimer();
    }
  };

  // --- Public game actions (stable refs, safe to use in gesture handlers) ---

  const movePiece = useCallback((dx: number, dy: number): boolean => {
    const piece = currentPieceRef.current;
    const board = boardRef.current;

    if (!piece || gameStateRef.current !== 'playing') return false;

    if (TetrisEngine.isValidMove(board, piece, dx, dy)) {
      const next = { ...piece, x: piece.x + dx, y: piece.y + dy };
      setCurrentPiece(next);
      currentPieceRef.current = next;
      setGhostY(TetrisEngine.getGhostPosition(board, next));

      if (dy > 0) {
        // Just moved down — check if now resting on floor
        if (!TetrisEngine.isValidMove(board, next, 0, 1)) {
          startLockTimer();
        }
      } else {
        resetLockTimer();
      }

      if (dx !== 0) audio.play('piece_move');
      return true;
    }

    // Move failed downward = piece is resting
    if (dy > 0 && !lockTimerRef.current) {
      startLockTimer();
    }
    return false;
  }, []); // stable — reads only from refs

  const rotatePiece = useCallback((direction: 'CW' | 'CCW') => {
    const piece = currentPieceRef.current;
    const board = boardRef.current;

    if (!piece || gameStateRef.current !== 'playing') return;

    const rotated = TetrisEngine.rotatePiece(board, piece, direction);
    if (rotated) {
      setCurrentPiece(rotated);
      currentPieceRef.current = rotated;
      setGhostY(TetrisEngine.getGhostPosition(board, rotated));
      resetLockTimer();
      audio.play('piece_rotate');
    }
  }, []); // stable

  const hardDrop = useCallback(() => {
    const piece = currentPieceRef.current;
    const board = boardRef.current;

    if (!piece || gameStateRef.current !== 'playing') return;

    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }

    const finalY = TetrisEngine.getGhostPosition(board, piece);
    const dropDist = finalY - piece.y;
    setScore(s => s + dropDist * SCORING.HARD_DROP);

    const droppedPiece = { ...piece, y: finalY };
    // Permanently reveal the dropped piece's cells
    addPieceToRevealMask(droppedPiece);
    const { newBoard: lockedBoard, isTopOut } = TetrisEngine.lockPiece(board, droppedPiece, activeSkinIdRef.current);

    if (isTopOut) {
      setGameState('gameover');
      gameStateRef.current = 'gameover';
      audio.play('game_over');
      return;
    }

    const { newBoard, clearedRows } = TetrisEngine.clearFullRows(lockedBoard);

    setBoard(newBoard);
    boardRef.current = newBoard;
    setCurrentPiece(null);
    currentPieceRef.current = null;
    lockResetsRef.current = 0;

    const currentLevel = levelRef.current;
    const currentLines = linesRef.current;

    if (clearedRows.length > 0) {
      audio.play(clearedRows.length === 4 ? 'line_clear_4' : 'line_clear_1');
      const nextLines = currentLines + clearedRows.length;
      setLines(nextLines);
      linesRef.current = nextLines;
      if (Math.floor(nextLines / LINES_PER_LEVEL) > Math.floor(currentLines / LINES_PER_LEVEL)) {
        const newLevel = Math.min(currentLevel + 1, 20);
        setLevel(newLevel);
        levelRef.current = newLevel;
      }
      setScore(s => s + (([0, 100, 300, 500, 800][clearedRows.length] || 0) * currentLevel));
    } else {
      audio.play('piece_land');
    }

    spawnPieceInternal(newBoard);
  }, []); // stable

  const holdPiece = useCallback(() => {
    const piece = currentPieceRef.current;
    if (!piece || !canHoldRef.current || gameStateRef.current !== 'playing') return;

    const typeToHold = piece.type;
    const typeToSpawn = holdPieceTypeRef.current;

    setHoldPieceType(typeToHold);
    holdPieceTypeRef.current = typeToHold;
    setCanHold(false);
    canHoldRef.current = false;

    setCurrentPiece(null);
    currentPieceRef.current = null;

    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }

    spawnPieceInternal(boardRef.current, typeToSpawn ?? undefined);
  }, []); // stable

  const startSoftDrop = useCallback(() => {
    if (gameStateRef.current === 'playing') {
      setIsSoftDropping(true);
      isSoftDroppingRef.current = true;
    }
  }, []);

  const stopSoftDrop = useCallback(() => {
    setIsSoftDropping(false);
    isSoftDroppingRef.current = false;
  }, []);

  // --- Game Loop: reads from ref, always fresh ---
  const tick = useRef(() => {
    if (gameStateRef.current === 'playing') {
      movePiece(0, 1);
    }
  });
  // Keep the tick ref current if movePiece ever changes (it won't, but for safety)
  useEffect(() => {
    tick.current = () => {
      if (gameStateRef.current === 'playing') {
        movePiece(0, 1);
      }
    };
  }, [movePiece]);

  useEffect(() => {
    if (gameState === 'playing') {
      const normalSpeed = LEVEL_SPEEDS[level - 1] ?? 800;
      const speed = isSoftDropping ? 50 : normalSpeed;
      gameLoopRef.current = setInterval(() => tick.current(), speed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, [gameState, level, isSoftDropping]);

  const startGame = useCallback(() => {
    const emptyBoard = TetrisEngine.createEmptyBoard();
    setBoard(emptyBoard);
    boardRef.current = emptyBoard;
    setScore(0);
    setLevel(1);
    levelRef.current = 1;
    setLines(0);
    linesRef.current = 0;
    setCurrentPiece(null);
    currentPieceRef.current = null;
    setHoldPieceType(null);
    holdPieceTypeRef.current = null;
    setCanHold(true);
    canHoldRef.current = true;
    bagRef.current = [];
    lockResetsRef.current = 0;
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    lockTimerRef.current = null;

    // Reset the reveal mask on new game
    const emptyRevealMask = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(false));
    setRevealMask(emptyRevealMask);
    revealMaskRef.current = emptyRevealMask;

    setGameState('playing');
    gameStateRef.current = 'playing';

    spawnPieceInternal(emptyBoard);
  }, []); // stable

  const pauseGame = useCallback(() => {
    setGameState(prev => {
      const next = prev === 'playing' ? 'paused' : (prev === 'paused' ? 'playing' : prev);
      gameStateRef.current = next;
      return next;
    });
  }, []);

  return {
    board,
    currentPiece,
    ghostY,
    nextPieceType,
    holdPieceType,
    revealMask,
    score,
    level,
    lines,
    gameState,
    onMoveLeft: useCallback(() => movePiece(-1, 0), [movePiece]),
    onMoveRight: useCallback(() => movePiece(1, 0), [movePiece]),
    onMoveDown: useCallback(() => movePiece(0, 1), [movePiece]),
    onHardDrop: hardDrop,
    onRotateCW: useCallback(() => rotatePiece('CW'), [rotatePiece]),
    onRotateCCW: useCallback(() => rotatePiece('CCW'), [rotatePiece]),
    onHold: holdPiece,
    onSoftDropStart: startSoftDrop,
    onSoftDropEnd: stopSoftDrop,
    onStart: startGame,
    onPause: pauseGame,
  };
};
