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
  {
    id: 'vegeta_mosaic',
    name: 'Cosmic Vegeta',
    price: 199,
    preview: '🌌',
    image: require('../assets/images/vegeta_mosaic_bg.png'),
    blockStyle: {
      glow: true,
      glass: true,
      borderColor: 'rgba(120, 0, 255, 0.4)',
    },
    particleColor: '#8a2be2',
    lineClearEffect: 'shatter',
  },
  {
    id: 'villain_minion',
    name: 'Villain Minion',
    price: 149,
    preview: '🦹',
    image: require('../assets/images/villain_minion_bg.png'),
    blockStyle: {
      glow: true,
      glass: true,
      borderColor: 'rgba(255, 0, 0, 0.4)',
    },
    particleColor: '#ff0000',
    lineClearEffect: 'dissolve',
  },
];
