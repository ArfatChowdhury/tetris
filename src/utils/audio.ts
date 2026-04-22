import Sound from 'react-native-sound';
import { Storage, KEYS } from './storage';

// Enable playback in silence mode
Sound.setCategory('Playback');

const SOUND_FILES = {
  piece_move: 'piece_move.mp3',
  piece_rotate: 'piece_rotate.mp3',
  piece_land: 'piece_land.mp3',
  line_clear_1: 'line_clear_1.mp3',
  line_clear_4: 'line_clear_4.mp3',
  level_up: 'level_up.mp3',
  game_over: 'game_over.mp3',
  skin_unlock: 'skin_unlock.mp3',
};

class AudioSystem {
  private sounds: Map<string, Sound> = new Map();
  private muted: boolean = false;

  constructor() {
    this.loadSettings();
    this.preloadSounds();
  }

  private async loadSettings() {
    const settings = await Storage.get<{ muted: boolean }>(KEYS.SETTINGS);
    if (settings) {
      this.muted = settings.muted;
    }
  }

  private preloadSounds() {
    // Note: In a real app, you would load sound files here.
    // For now, we set up placeholders.
    Object.keys(SOUND_FILES).forEach(key => {
      // Mock sound object for demonstration if files are missing
      // const sound = new Sound(SOUND_FILES[key as keyof typeof SOUND_FILES], Sound.MAIN_BUNDLE, (error) => {
      //   if (error) console.log('failed to load sound', key, error);
      // });
      // this.sounds.set(key, sound);
    });
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    Storage.set(KEYS.SETTINGS, { muted });
  }

  public isMuted() {
    return this.muted;
  }

  public play(key: keyof typeof SOUND_FILES) {
    if (this.muted) return;
    
    // For now, just log until files are provided
    // const sound = this.sounds.get(key);
    // if (sound) {
    //   sound.stop(() => {
    //     sound.play();
    //   });
    // }
    console.log(`Audio play: ${key}`);
  }
}

export const audio = new AudioSystem();
