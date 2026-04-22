import AsyncStorage from '@react-native-async-storage/async-storage';

export const Storage = {
  async set(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      console.error('Error saving data', e);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error('Error reading data', e);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing data', e);
    }
  },
};

export const KEYS = {
  OWNED_SKINS: 'tetris_owned_skins',
  ACTIVE_SKIN: 'tetris_active_skin',
  HIGH_SCORE: 'tetris_high_score',
  SETTINGS: 'tetris_settings',
};
