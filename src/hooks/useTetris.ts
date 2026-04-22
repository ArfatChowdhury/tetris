import { useState, useEffect, useCallback, useRef } from 'react';
import { Board, Piece, CellValue, TetrisEngine } from '../systems/TetrisEngine';
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

export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';

export const useTetris = (activeSkinId: string) => {
  const [board, setBoard] = useState<Board>(TetrisEngine.createEmptyBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null);
  const [nextPieceType, setNextPieceType] = useState<string | null>(null);
  const [holdPieceType, setHoldPieceType] = useState<string | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [ghostY, setGhostY] = useState(0);

  const bagRef = useRef<string[]>([]);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lockResetsRef = useRef(0);
  const lastTickTimeRef = useRef(0);

  const getNextPieceType = useCallback(() => {
    if (bagRef.current.length === 0) {
      bagRef.current = TetrisEngine.getNextBag();
    }
    return bagRef.current.pop() as any;
  }, []);

  const spawnPiece = useCallback((typeOverride?: any) => {
    const type = typeOverride || (nextPieceType as any) || getNextPieceType();
    const newNext = getNextPieceType();
    setNextPieceType(newNext);

    const piece = TetrisEngine.getInitialPiece(type);
    
    if (!TetrisEngine.isValidMove(board, piece, 0, 0)) {
      setGameState('gameover');
      audio.play('game_over');
      return;
    }

    setCurrentPiece(piece);
    setGhostY(TetrisEngine.getGhostPosition(board, piece));
    setCanHold(true);
  }, [board, nextPieceType, getNextPieceType]);

  const lockPiece = useCallback(() => {
    if (!currentPiece) return;

    audio.play('piece_land');
    const lockedBoard = TetrisEngine.lockPiece(board, currentPiece, activeSkinId);
    const { newBoard, clearedRows } = TetrisEngine.clearFullRows(lockedBoard);
    
    if (clearedRows.length > 0) {
      const lineScore = [0, SCORING.SINGLE, SCORING.DOUBLE, SCORING.TRIPLE, SCORING.TETRIS][clearedRows.length] || 0;
      const multiplier = level;
      const tspin = TetrisEngine.isTSpin(board, currentPiece);
      
      let finalScore = lineScore * multiplier;
      if (tspin) {
        finalScore += SCORING.TSPIN * multiplier;
      }
      
      setScore(s => s + finalScore);
      setLines(l => {
        const nextLines = l + clearedRows.length;
        if (Math.floor(nextLines / LINES_PER_LEVEL) > Math.floor(l / LINES_PER_LEVEL)) {
          setLevel(lev => Math.min(lev + 1, 20));
          audio.play('level_up');
        }
        return nextLines;
      });
      
      audio.play(clearedRows.length === 4 ? 'line_clear_4' : 'line_clear_1');
    }

    setBoard(newBoard);
    setCurrentPiece(null);
    lockResetsRef.current = 0;
    spawnPiece();
  }, [board, currentPiece, activeSkinId, level, spawnPiece]);

  const startLockTimer = useCallback(() => {
    if (lockTimerRef.current) return;
    lockTimerRef.current = setTimeout(() => {
      lockPiece();
      lockTimerRef.current = null;
    }, LOCK_DELAY);
  }, [lockPiece]);

  const resetLockTimer = useCallback(() => {
    if (lockTimerRef.current && lockResetsRef.current < MAX_LOCK_RESETS) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
      lockResetsRef.current++;
      startLockTimer();
    }
  }, [startLockTimer]);

  const movePiece = useCallback((dx: number, dy: number) => {
    if (!currentPiece || gameState !== 'playing') return false;

    if (TetrisEngine.isValidMove(board, currentPiece, dx, dy)) {
      setCurrentPiece(prev => {
        if (!prev) return null;
        const next = { ...prev, x: prev.x + dx, y: prev.y + dy };
        setGhostY(TetrisEngine.getGhostPosition(board, next));
        return next;
      });
      
      if (dy > 0) {
        // Reset lock timer on downward move if we were already touching
        if (!TetrisEngine.isValidMove(board, { ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy }, 0, 1)) {
          startLockTimer();
        }
      } else {
        resetLockTimer();
      }
      
      if (dx !== 0) audio.play('piece_move');
      return true;
    }

    if (dy > 0 && !lockTimerRef.current) {
      startLockTimer();
    }
    return false;
  }, [board, currentPiece, gameState, startLockTimer, resetLockTimer]);

  const rotatePiece = useCallback((direction: 'CW' | 'CCW') => {
    if (!currentPiece || gameState !== 'playing') return;

    const rotated = TetrisEngine.rotatePiece(board, currentPiece, direction);
    if (rotated) {
      setCurrentPiece(rotated);
      setGhostY(TetrisEngine.getGhostPosition(board, rotated));
      resetLockTimer();
      audio.play('piece_rotate');
    }
  }, [board, currentPiece, gameState, resetLockTimer]);

  const hardDrop = useCallback(() => {
    if (!currentPiece || gameState !== 'playing') return;

    const finalY = TetrisEngine.getGhostPosition(board, currentPiece);
    const dropDist = finalY - currentPiece.y;
    setScore(s => s + dropDist * SCORING.HARD_DROP);
    
    const droppedPiece = { ...currentPiece, y: finalY };
    const lockedBoard = TetrisEngine.lockPiece(board, droppedPiece, activeSkinId);
    const { newBoard, clearedRows } = TetrisEngine.clearFullRows(lockedBoard);
    
    // Simple version of lock logic to avoid double-processing
    setBoard(newBoard);
    setCurrentPiece(null);
    lockResetsRef.current = 0;
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    
    // Handle scoring and lines... (Refactor common logic later if needed)
    if (clearedRows.length > 0) {
        audio.play(clearedRows.length === 4 ? 'line_clear_4' : 'line_clear_1');
        setLines(l => l + clearedRows.length);
        setScore(s => s + (([0, 100, 300, 500, 800][clearedRows.length] || 0) * level));
    } else {
        audio.play('piece_land');
    }
    
    spawnPiece();
  }, [board, currentPiece, gameState, activeSkinId, level, spawnPiece]);

  const holdPiece = useCallback(() => {
    if (!currentPiece || !canHold || gameState !== 'playing') return;

    const typeToHold = currentPiece.type;
    const typeToSpawn = holdPieceType;

    setHoldPieceType(typeToHold);
    setCanHold(false);
    
    if (typeToSpawn) {
      spawnPiece(typeToSpawn);
    } else {
      spawnPiece();
    }
  }, [currentPiece, canHold, gameState, holdPieceType, spawnPiece]);

  const tick = useCallback(() => {
    if (gameState === 'playing') {
      movePiece(0, 1);
    }
  }, [gameState, movePiece]);

  useEffect(() => {
    if (gameState === 'playing') {
      const speed = LEVEL_SPEEDS[level - 1] || 33;
      gameLoopRef.current = setInterval(tick, speed);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current);
    };
  }, [gameState, level, tick]);

  const startGame = useCallback(() => {
    setBoard(TetrisEngine.createEmptyBoard());
    setScore(0);
    setLevel(1);
    setLines(0);
    setGameState('playing');
    bagRef.current = [];
    spawnPiece();
  }, [spawnPiece]);

  const pauseGame = useCallback(() => {
    setGameState(prev => prev === 'playing' ? 'paused' : (prev === 'paused' ? 'playing' : prev));
  }, []);

  return {
    board,
    currentPiece,
    ghostY,
    nextPieceType,
    holdPieceType,
    score,
    level,
    lines,
    gameState,
    onMoveLeft: () => movePiece(-1, 0),
    onMoveRight: () => movePiece(1, 0),
    onMoveDown: () => movePiece(0, 1),
    onHardDrop: hardDrop,
    onRotateCW: () => rotatePiece('CW'),
    onRotateCCW: () => rotatePiece('CCW'),
    onHold: holdPiece,
    onStart: startGame,
    onPause: pauseGame,
  };
};
