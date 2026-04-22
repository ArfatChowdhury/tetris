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
  price: number; // 0 = free, 99 = $0.99, 299 = $2.99
  preview: string; // emoji or preview color
  blockStyle: BlockStyle;
  particleColor: string;
  lineClearEffect: LineClearEffect;
}

export const SKINS: SkinDefinition[] = [
  {
    id: 'default',
    name: 'Default',
    price: 0,
    preview: '🔳',
    blockStyle: {
      borderRadius: 0,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.8)',
    },
    particleColor: '#ffffff',
    lineClearEffect: 'flash',
  },
  {
    id: 'cherry_blossom',
    name: 'Cherry Blossom',
    price: 0,
    preview: '🌸',
    blockStyle: {
      borderRadius: 4,
      opacity: 0.9,
    },
    particleColor: '#ffb6c1',
    lineClearEffect: 'dissolve',
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    price: 99,
    preview: '🌌',
    blockStyle: {
      glow: true,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    particleColor: '#ffffff',
    lineClearEffect: 'explode',
  },
  {
    id: 'anime_flower',
    name: 'Anime Flower',
    price: 99,
    preview: '🌼',
    blockStyle: {
      borderRadius: 8,
      opacity: 0.8,
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    particleColor: '#f5e6d5',
    lineClearEffect: 'shatter',
  },
  {
    id: 'neon_city',
    name: 'Neon City',
    price: 99,
    preview: '🌃',
    blockStyle: {
      borderWidth: 3,
      glow: true,
    },
    particleColor: '#00ffff',
    lineClearEffect: 'flash',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    price: 99,
    preview: '🌊',
    blockStyle: {
      glass: true,
      opacity: 0.7,
      borderRadius: 2,
    },
    particleColor: '#a0dcff',
    lineClearEffect: 'dissolve',
  },
];
