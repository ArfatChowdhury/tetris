import React from 'react';

export type LineClearEffect = 'flash' | 'explode' | 'dissolve' | 'shatter';

export interface BlockStyle {
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  opacity?: number;
  glow?: boolean;
  glass?: boolean;
  led?: boolean;
  magnifier?: boolean;
  magnifierScale?: number;
  breathing?: boolean;
  marshmallow?: boolean;
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
  uiStyle: 'glass' | 'cartoon';
  particles?: 'ash' | 'hearts';
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
    uiStyle: 'glass',
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
    uiStyle: 'glass',
    particles: 'ash',
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
  {
    id: 'kawaii_crunch',
    name: 'Kawaii Carrot Crunch',
    price: 0,
    preview: '🐰',
    image: require('../assets/images/bunny/rabbit.png'),
    uiStyle: 'cartoon',
    particles: 'hearts',
    blockStyle: {
      marshmallow: true,
      borderColor: 'rgba(255, 182, 193, 0.4)', // Soft pink border
    },
    particleColor: '#FF69B4',
    lineClearEffect: 'dissolve',
    colors: {
      primary: '#FFB6C1', // Light pink
      secondary: '#FF8C00', // Carrot orange
      accent: '#FFFFFF',
      background: ['#FFF0F5', '#FFC0CB', '#FFF0F5'], // Soft pink gradient
    },
  },
];
