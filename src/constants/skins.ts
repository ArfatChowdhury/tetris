import React from 'react';

export type LineClearEffect = 'flash' | 'explode' | 'dissolve' | 'shatter';

export interface BlockStyle {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  opacity?: number;
  glow?: boolean;
  glass?: boolean;
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
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    particleColor: '#00ffff',
    lineClearEffect: 'shatter',
  },
  {
    id: 'minion_mosaic',
    name: 'Master Minion',
    price: 99,
    preview: '🔬',
    image: require('../assets/images/minion_mosaic_bg.png'),
    blockStyle: {
      glow: true,
      glass: true,
      borderColor: 'rgba(0, 255, 0, 0.4)',
    },
    particleColor: '#90ee90',
    lineClearEffect: 'explode',
  },
];
