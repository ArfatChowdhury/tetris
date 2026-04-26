import React from 'react';

export type LineClearEffect = 'flash' | 'explode' | 'dissolve' | 'shatter';

export interface BlockStyle {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  opacity?: number;
  glow?: boolean;
  led?: boolean;
  magnifier?: boolean;
  magnifierScale?: number;
  breathing?: boolean;
}

export interface SkinColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string[];
}

export interface SkinDefinition {
  id: string;
  name: string;
  price: number;
  preview: string;
  image?: any; // require() image source for Mosaic
  blockStyle: BlockStyle;
  particleColor: string;
  lineClearEffect: LineClearEffect;
  colors?: SkinColors;
}

export const SKINS: SkinDefinition[] = [
  {
    id: 'goku_mosaic',
    name: 'Ultra Instinct',
    price: 0,
    preview: '⚡',
    image: require('../assets/images/goku_mosaic_bg.png'),
    blockStyle: {
      glow: true,
      glass: true,
      magnifier: true,
      magnifierScale: 3.0,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    particleColor: '#00ffff',
    lineClearEffect: 'shatter',
  },
  {
    id: 'samurai_embers',
    name: 'Crimson Samurai',
    price: 699,
    preview: '🔥',
    image: require('../assets/images/samurai_embers_bg.png'),
    blockStyle: {
      glow: true,
      glass: true,
      breathing: true,
      magnifier: true,
      magnifierScale: 2.0,
      borderColor: 'rgba(255, 50, 0, 0.4)',
    },
    particleColor: '#ff4500',
    lineClearEffect: 'dissolve',
    colors: {
      primary: '#FF4500',
      secondary: '#8B0000',
      accent: '#FFD700',
      background: ['#0A0000', '#2A0505', '#0A0000'],
    },
  },
];
