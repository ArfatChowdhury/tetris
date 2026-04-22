/**
 * Audio Stub
 *
 * react-native-sound is not compatible with React Native 0.73.6 on the New Architecture.
 * All audio calls are no-ops until a compatible audio library is integrated.
 * Replace the bodies below with actual sound logic when needed.
 */

let isMuted = false;

export const AudioManager = {
  playMove: () => {},
  playRotate: () => {},
  playDrop: () => {},
  playClear: () => {},
  playTetris: () => {},
  playGameOver: () => {},
  playLevelUp: () => {},

  toggleMute: () => {
    isMuted = !isMuted;
    return isMuted;
  },

  isMuted: () => isMuted,

  init: () => {
    console.log('[Audio] Audio stub initialized. No sound will play.');
  },
};
