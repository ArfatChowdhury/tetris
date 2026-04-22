export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const INITIAL_LEVEL = 1;
export const LINES_PER_LEVEL = 10;

export const LEVEL_SPEEDS = [
  800, 717, 633, 550, 467, 383, 300, 217, 133, 100, // levels 1-10
  83, 83, 83, 67, 67, 67, 50, 50, 50, 33,           // levels 11-20
];

export const SCORING = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  TSPIN_MINI: 100,
  TSPIN: 400,
  SOFT_DROP: 1,
  HARD_DROP: 2, // per cell
};

export const LOCK_DELAY = 500; // ms
export const MAX_LOCK_RESETS = 15;

export const DAS_DELAY = 170; // ms
export const DAS_INTERVAL = 50; // ms
