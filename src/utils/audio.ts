/**
 * Audio Stub - Bridge for the Tetris Engine
 */

let isMuted = false;

export const audio = {
  play: (soundName: string) => {
    // console.log(`[Audio Stub] Playing: ${soundName}`);
  },
  toggleMute: () => {
    isMuted = !isMuted;
    return isMuted;
  },
  isMuted: () => isMuted,
  init: () => {
    console.log('[Audio] Audio stub initialized.');
  },
};

// Also export as AudioManager for consistency if needed
export const AudioManager = audio;
