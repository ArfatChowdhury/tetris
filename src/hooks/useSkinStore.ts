import { useState, useEffect, useCallback } from 'react';
import { Storage, KEYS } from '../utils/storage';
import { SKINS, SkinDefinition } from '../constants/skins';

export const useSkinStore = () => {
  const [ownedSkins, setOwnedSkins] = useState<string[]>(['goku_mosaic', 'samurai_embers', 'kawaii_crunch', 'cyber_void', 'anime_dreamscape']);
  const [activeSkinId, setActiveSkinId] = useState<string>('goku_mosaic');
  const [playerName, setPlayerName] = useState<string>('Arfat');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSkins = async () => {
      const owned = await Storage.get<string[]>(KEYS.OWNED_SKINS);
      if (owned) setOwnedSkins(owned);
      
      const active = await Storage.get<string>(KEYS.ACTIVE_SKIN);
      if (active) setActiveSkinId(active);

      const name = await Storage.get<string>('player_name');
      if (name) setPlayerName(name);

      setIsLoaded(true);
    };
    loadSkins();
  }, []);

  const updatePlayerName = useCallback(async (name: string) => {
    setPlayerName(name);
    await Storage.set('player_name', name);
  }, []);

  const unlockSkin = useCallback(async (skinId: string) => {
    setOwnedSkins(prev => {
      if (prev.includes(skinId)) return prev;
      const next = [...prev, skinId];
      Storage.set(KEYS.OWNED_SKINS, next);
      return next;
    });
  }, []);

  const applySkin = useCallback(async (skinId: string) => {
    if (!ownedSkins.includes(skinId)) return;
    setActiveSkinId(skinId);
    await Storage.set(KEYS.ACTIVE_SKIN, skinId);
  }, [ownedSkins]);

  const activeSkin = SKINS.find(s => s.id === activeSkinId) || SKINS[0];

  return {
    ownedSkins,
    activeSkin,
    activeSkinId,
    playerName,
    isLoaded,
    updatePlayerName,
    unlockSkin,
    applySkin,
    allSkins: SKINS,
  };
};
