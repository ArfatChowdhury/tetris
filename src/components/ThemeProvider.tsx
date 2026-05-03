import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as Skins from '../skins';
import { SkinDefinition } from '../skins/types';

type SkinContextType = {
  current: SkinDefinition;
  setSkin: (name: string) => void;
  available: string[];
};

const SkinContext = createContext<SkinContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const skinList = Object.values(Skins).filter(
    (s): s is SkinDefinition => typeof s === 'object' && 'name' in s && 'background' in s
  );
  
  const [current, setCurrent] = useState<SkinDefinition>(skinList[0]);

  const setSkin = (name: string) => {
    const found = skinList.find((s) => s.name === name);
    if (found) setCurrent(found);
  };

  return (
    <SkinContext.Provider value={{ current, setSkin, available: skinList.map((s) => s.name) }}>
      {children}
    </SkinContext.Provider>
  );
};

export const useSkin = () => {
  const ctx = useContext(SkinContext);
  if (!ctx) throw new Error('useSkin must be used within ThemeProvider');
  return ctx;
};
